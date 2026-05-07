const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items (for both owner and user)
router.get('/', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    // Filter by availability
    if (available !== undefined) {
      query.available = available === 'true';
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create menu item (Owner only)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    
    const menuItem = new MenuItem({
      name,
      description,
      price: parseFloat(price),
      category: category.toLowerCase(),
      image: image || '',
      available: available !== undefined ? available : true
    });

    const savedItem = await menuItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item (Owner only)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category, image, available } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.name = name || menuItem.name;
    menuItem.description = description || menuItem.description;
    menuItem.price = price !== undefined ? parseFloat(price) : menuItem.price;
    menuItem.category = category ? category.toLowerCase() : menuItem.category;
    menuItem.image = image !== undefined ? image : menuItem.image;
    menuItem.available = available !== undefined ? available : menuItem.available;

    const updatedItem = await menuItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete menu item (Owner only)
router.delete('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

