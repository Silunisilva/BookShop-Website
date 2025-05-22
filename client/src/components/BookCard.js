import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate a random price between 10 and 50
  const price = book.price || Math.floor(Math.random() * 41) + 10;

  const handleAddToCart = async () => {
    setLoading(true);
    setError('');

    if (!isAuthenticated) {
      setError('Please log in to add items to cart');
      setTimeout(() => navigate('/login'), 1500);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Adding to cart:', {
        bookId: book.key,
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        coverId: book.cover_i || book.cover_id,
        price: price,
        token: token ? 'present' : 'missing'
      });

      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: book.key,
          title: book.title,
          author: book.author_name?.[0] || 'Unknown Author',
          coverId: book.cover_i || book.cover_id,
          price: price
        })
      });

      const data = await response.json();
      console.log('Cart response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      // Show success message
      alert('Book added to cart!');
      
      // Always navigate to cart page after successful addition
      navigate('/cart');
      
    } catch (err) {
      console.error('Add to cart error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-card">
      {error && <div className="error-message">{error}</div>}
      <div className="book-cover">
        {(book.cover_i || book.cover_id) ? (
          <img 
            src={`https://covers.openlibrary.org/b/id/${book.cover_i || book.cover_id}-M.jpg`} 
            alt={book.title}
          />
        ) : (
          <div className="no-cover">No Cover Available</div>
        )}
      </div>
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="author">
          {book.author_name?.[0] || 'Unknown Author'}
        </p>
        <p className="price">${price.toFixed(2)}</p>
        <button 
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default BookCard; 