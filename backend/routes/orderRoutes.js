const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { authenticate, requireRole } = require('../middleware/auth');

const OWNER_ALLOWED_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

// Get all orders (Owner only)
router.get('/', authenticate, requireRole('owner'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.menuItemId', 'name image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get orders for logged-in user
router.get('/user/orders', authenticate, requireRole('user'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.menuItemId', 'name image price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get single order (owner or owning user)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItemId', 'name image price');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'user' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// Create order (User)
router.post('/', authenticate, requireRole('user'), async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      if (!menuItem.available) {
        return res.status(400).json({ message: `${menuItem.name} is not available` });
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemTotal = menuItem.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
        image: menuItem.image,
      });
    }

    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: 'pending',
    });

    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.menuItemId', 'name image');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create order' });
  }
});

// Update order status (Owner only — cannot set paid)
router.put('/:id/status', authenticate, requireRole('owner'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!OWNER_ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('items.menuItemId', 'name image');

    res.json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update order status' });
  }
});

module.exports = router;
