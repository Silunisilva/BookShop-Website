const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  coverId: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const shippingDetailsSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  }
});

const cardDetailsSchema = new mongoose.Schema({
  last4: {
    type: String,
    required: true
  },
  cardName: {
    type: String,
    required: true
  },
  bank: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  shippingDetails: {
    type: shippingDetailsSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'debit', 'credit'],
    required: true
  },
  cardDetails: {
    type: cardDetailsSchema,
    required: function() {
      return this.paymentMethod !== 'cod';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 