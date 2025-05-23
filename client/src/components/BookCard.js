import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book, isAuthenticated }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId: book.key,
          title: book.title,
          author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
          coverId: book.cover_i || book.cover_id,
          price: (Math.random() * 20 + 10).toFixed(2) // Using the same random price as displayed
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      // Show success message
      alert('Book added to cart successfully!');
    } catch (err) {
      console.error('Add to cart error:', err);
      setError(err.message);
      alert('Failed to add book to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Function to get the correct cover URL
  const getCoverUrl = (book) => {
    // Try different cover ID properties
    const coverId = book.cover_i || book.cover_id || book.cover;
    
    if (coverId) {
      return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    }
    
    // If no cover ID, try using the work ID
    if (book.key) {
      const workId = book.key.split('/').pop();
      return `https://covers.openlibrary.org/b/olid/${workId}-M.jpg`;
    }
    
    // Fallback to placeholder
    return '/book-placeholder.jpg';
  };

  return (
    <div className="book-card">
      {error && <div className="error-message">{error}</div>}
      <div className="book-cover">
        <img 
          src={getCoverUrl(book)} 
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/book-placeholder.jpg';
          }}
        />
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">
          {book.author_name ? book.author_name.join(', ') : 'Unknown Author'}
        </p>
        <div className="book-price">
          ${(Math.random() * 20 + 10).toFixed(2)}
        </div>
        <div className="book-actions">
          {isAuthenticated ? (
            <>
              <button 
                className="book-button add-to-cart"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <Link 
                to={`/book/${book.key.split('/').pop()}`}
                className="book-button view-details"
              >
                View Details
              </Link>
            </>
          ) : (
            <Link 
              to="/login"
              className="book-button view-details"
              style={{ flex: 1 }}
            >
              Login to Purchase
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard; 