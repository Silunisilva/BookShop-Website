import { useState, useEffect } from 'react';
import { Container, Grid, CircularProgress, Alert } from '@mui/material';
import BookCard from '../components/books/BookCard';
import BookSearch from '../components/books/BookSearch';
import { searchBooks, getBookDetails } from '../services/books';
import axios from 'axios';

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    category: 'all'
  });

  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      const response = await searchBooks(query);
      const booksWithDetails = await Promise.all(
        response.slice(0, 20).map(async (book) => {
          // Generate random price and available copies for demo
          const price = Math.floor(Math.random() * 50) + 10;
          const availableCopies = Math.floor(Math.random() * 10) + 1;
          
          return {
            _id: book.key,
            title: book.title,
            author: book.author_name?.[0] || 'Unknown Author',
            coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
            price,
            availableCopies
          };
        })
      );
      setBooks(booksWithDetails);
    } catch (err) {
      setError('Error fetching books');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (query) => {
    fetchBooks(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAddToCart = async (book) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart/add',
        { bookId: book._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Show success message or update cart count
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <BookSearch onSearch={handleSearch} onFilterChange={handleFilterChange} />
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
            <BookCard book={book} onAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Shop;
