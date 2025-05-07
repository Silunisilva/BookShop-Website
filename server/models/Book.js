const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  openLibraryId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  coverImage: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  description: String
});

module.exports = mongoose.model('Book', bookSchema);
