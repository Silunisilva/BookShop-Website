const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, phone, paymentDetails } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.userId }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order
    const order = new Order({
      user: req.userId,
      items: cart.items.map(item => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.book.price
      })),
      total: cart.total,
      shippingAddress,
      phone,
      status: 'pending'
    });

    // Update book quantities
    for (const item of cart.items) {
      await Book.findByIdAndUpdate(item.book._id, {
        $inc: { availableCopies: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    cart.total = 0;
    await cart.save();
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.book')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.userId
    }).populate('items.book');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};
