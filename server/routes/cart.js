const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { bookId, title, author, coverId, price } = req.body;
    
    // Extract just the ID part from the bookId if it contains a path
    const cleanBookId = bookId.split('/').pop();
    console.log('Adding to cart:', { 
      originalBookId: bookId, 
      cleanBookId,
      userId: req.user._id 
    });
    
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if item already exists in cart using cleanBookId
    const existingItem = cart.items.find(item => item.bookId === cleanBookId);
    if (existingItem) {
      console.log('Updating existing item quantity:', {
        bookId: cleanBookId,
        currentQuantity: existingItem.quantity,
        newQuantity: existingItem.quantity + 1
      });
      existingItem.quantity += 1;
    } else {
      console.log('Adding new item to cart:', {
        bookId: cleanBookId,
        title,
        price
      });
      cart.items.push({ 
        bookId: cleanBookId, // Store the clean bookId
        title, 
        author, 
        coverId, 
        price, 
        quantity: 1 
      });
    }

    await cart.save();
    console.log('Cart saved:', {
      userId: req.user._id,
      items: cart.items.map(item => ({
        bookId: item.bookId,
        title: item.title,
        quantity: item.quantity
      }))
    });
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Error adding item to cart' });
  }
});

// Update item quantity
router.put('/update/:bookId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { bookId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(item => item.bookId === bookId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Error updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:bookId', auth, async (req, res) => {
  try {
    const { bookId } = req.params;
    // Clean the bookId to ensure consistent format
    const cleanBookId = bookId.split('/').pop();
    console.log('Remove request received:', { 
      originalBookId: bookId,
      cleanBookId,
      userId: req.user._id
    });
    
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      console.log('Cart not found for user:', req.user._id);
      return res.status(404).json({ error: 'Cart not found' });
    }

    console.log('Current cart items:', cart.items.map(item => ({
      bookId: item.bookId,
      cleanBookId: item.bookId.split('/').pop(),
      title: item.title,
      quantity: item.quantity
    })));

    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => {
      // Compare both the full path and clean versions of the bookId
      const itemCleanBookId = item.bookId.split('/').pop();
      const matches = item.bookId !== bookId && itemCleanBookId !== cleanBookId;
      console.log('Filtering item:', {
        itemBookId: item.bookId,
        itemCleanBookId,
        requestBookId: bookId,
        requestCleanBookId: cleanBookId,
        matches
      });
      return matches;
    });

    if (cart.items.length === initialItemCount) {
      console.log('Item not found in cart:', {
        requestedBookId: bookId,
        requestedCleanBookId: cleanBookId,
        availableBookIds: cart.items.map(item => ({
          full: item.bookId,
          clean: item.bookId.split('/').pop()
        }))
      });
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Clean up any remaining items that have full paths
    cart.items = cart.items.map(item => {
      if (item.bookId.includes('/')) {
        console.log('Cleaning up bookId for item:', {
          old: item.bookId,
          new: item.bookId.split('/').pop()
        });
        item.bookId = item.bookId.split('/').pop();
      }
      return item;
    });

    await cart.save();
    console.log('Cart updated after removal:', {
      removedBookId: cleanBookId,
      remainingItems: cart.items.length,
      newTotal: cart.total,
      items: cart.items.map(item => ({
        bookId: item.bookId,
        title: item.title,
        quantity: item.quantity
      }))
    });

    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Error clearing cart' });
  }
});

module.exports = router; 