const Book = require('../models/Book');
const axios = require('axios');

exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`https://openlibrary.org/search.json?q=${query}`);
    
    const books = await Promise.all(
      response.data.docs.slice(0, 20).map(async (book) => {
        // Check if book already exists in our database
        let existingBook = await Book.findOne({ openLibraryId: book.key });
        
        if (!existingBook) {
          // Generate random price and available copies for new books
          const price = Math.floor(Math.random() * 50) + 10;
          const availableCopies = Math.floor(Math.random() * 10) + 1;
          
          existingBook = await Book.create({
            openLibraryId: book.key,
            title: book.title,
            author: book.author_name?.[0] || 'Unknown Author',
            coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
            price,
            availableCopies
          });
        }
        
        return existingBook;
      })
    );
    
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error searching books' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ openLibraryId: req.params.id });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book' });
  }
};
