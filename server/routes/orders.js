const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const {
      shippingDetails,
      paymentMethod,
      cardDetails,
      items,
      total
    } = req.body;

    console.log('Creating new order:', {
      userId: req.user._id,
      itemsCount: items.length,
      total,
      paymentMethod
    });

    // Create the order
    const order = new Order({
      userId: req.user._id,
      items,
      total,
      shippingDetails,
      paymentMethod,
      ...(paymentMethod !== 'cod' && { cardDetails: {
        last4: cardDetails.cardNumber.slice(-4),
        cardName: cardDetails.cardName,
        bank: cardDetails.bank
      }}),
      status: 'pending'
    });

    await order.save();
    console.log('Order created successfully:', {
      orderId: order._id,
      userId: order.userId
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

// Get a specific order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
});

module.exports = router; 