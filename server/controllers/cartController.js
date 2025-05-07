const Cart = require('../models/Cart');
const Book = require('../models/Book');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.book');
    
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    
    // Check if book exists and has enough copies
    const book = await Book.findOne({ openLibraryId: bookId });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    if (book.availableCopies < quantity) {
      return res.status(400).json({ message: 'Not enough copies available' });
    }

    let cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Check if book already in cart
    const existingItem = cart.items.find(item => item.book.toString() === book._id.toString());
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ book: book._id, quantity });
    }

    // Update total
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);

    await cart.save();
    await cart.populate('items.book');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = cart.items.find(item => item.book.toString() === bookId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check if enough copies available
    const book = await Book.findOne({ _id: bookId });
    if (book.availableCopies < quantity) {
      return res.status(400).json({ message: 'Not enough copies available' });
    }

    cartItem.quantity = quantity;
    
    // Update total
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);

    await cart.save();
    await cart.populate('items.book');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.book.toString() !== bookId);
    
    // Update total
    cart.total = cart.items.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);

    await cart.save();
    await cart.populate('items.book');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart' });
  }
};
