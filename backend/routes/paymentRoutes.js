const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate, requireRole } = require('../middleware/auth');

let stripe = null;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  if (!stripe) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Convert PKR (Rs.) display amount to Stripe smallest currency unit
const toStripeAmount = (amountPkr) => {
  const currency = (process.env.STRIPE_CURRENCY || 'pkr').toLowerCase();
  if (currency === 'usd') {
    const rate = parseFloat(process.env.STRIPE_PKR_TO_USD_RATE || '0.0036');
    return Math.max(50, Math.round(amountPkr * rate * 100));
  }
  return Math.max(100, Math.round(amountPkr * 100));
};

const getStripeCurrency = () => (process.env.STRIPE_CURRENCY || 'pkr').toLowerCase();

// Create payment intent (User only)
router.post('/create-payment-intent', authenticate, requireRole('user'), async (req, res) => {
  try {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(503).json({ message: 'Payment service is not configured' });
    }

    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (order.status !== 'confirmed') {
        return res.status(400).json({ message: 'Order is not ready for payment' });
      }
      if (Math.abs(order.totalAmount - amount) > 0.01) {
        return res.status(400).json({ message: 'Amount does not match order total' });
      }
    }

    const amountInSmallestUnit = toStripeAmount(amount);
    const currency = getStripeCurrency();

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency,
      payment_method_types: ['card'],
      metadata: {
        description: 'Food Order Payment',
        orderId: orderId || '',
        userId: req.user.id,
        originalCurrency: 'PKR',
        originalAmount: amount.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      currency,
    });
  } catch (error) {
    console.error('Payment intent error:', error.message);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Verify payment and mark order as paid (User only)
router.post('/verify-payment', authenticate, requireRole('user'), async (req, res) => {
  try {
    const stripeClient = getStripe();
    if (!stripeClient) {
      return res.status(503).json({ message: 'Payment service is not configured' });
    }

    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (order.status !== 'confirmed') {
      return res.status(400).json({ message: 'Order is not ready for payment' });
    }

    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed', status: paymentIntent.status });
    }

    if (paymentIntent.metadata.userId !== req.user.id) {
      return res.status(403).json({ message: 'Payment does not belong to this user' });
    }
    if (paymentIntent.metadata.orderId && paymentIntent.metadata.orderId !== orderId) {
      return res.status(400).json({ message: 'Payment does not match this order' });
    }

    const expectedAmount = toStripeAmount(order.totalAmount);
    if (paymentIntent.amount !== expectedAmount) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    order.status = 'paid';
    await order.save();

    res.json({
      status: paymentIntent.status,
      orderId: order._id,
      orderStatus: order.status,
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

module.exports = router;
module.exports.getStripe = getStripe;
module.exports.getStripeCurrency = getStripeCurrency;
