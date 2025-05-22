import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from './BookCard';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!(token && userData));

    const fetchFeaturedBooks = async () => {
      try {
        // Fetch books from multiple genres for variety
        const genres = ['fantasy', 'science_fiction', 'mystery'];
        const allBooks = await Promise.all(
          genres.map(genre => 
            fetch(`http://localhost:5000/api/books?genre=${genre}&limit=3`)
              .then(res => res.json())
              .then(data => data.books)
          )
        );

        // Flatten and shuffle the books
        const books = allBooks.flat().sort(() => Math.random() - 0.5).slice(0, 6);
        setFeaturedBooks(books);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured books');
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to BookShop</h1>
          <p>Discover your next favorite book from our vast collection</p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/shop" className="primary-button">
                Browse Books
              </Link>
            ) : (
              <>
                <Link to="/login" className="primary-button">
                  Login
                </Link>
                <Link to="/register" className="secondary-button">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Books</h2>
        {loading ? (
          <div className="loading">Loading featured books...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="featured-books">
            {featuredBooks.map(book => (
              <BookCard 
                key={book.key} 
                book={book} 
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
        {isAuthenticated && (
          <div className="view-more">
            <Link to="/shop" className="view-more-button">
              View All Books
            </Link>
          </div>
        )}
      </section>

      <section className="features-section">
        <div className="feature">
          <h3>Wide Selection</h3>
          <p>Browse through thousands of books across various genres</p>
        </div>
        <div className="feature">
          <h3>Easy Shopping</h3>
          <p>Simple and secure checkout process</p>
        </div>
        <div className="feature">
          <h3>Fast Delivery</h3>
          <p>Get your books delivered to your doorstep</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 