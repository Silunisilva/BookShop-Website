import React, { useState, useEffect } from 'react';
import BookCard from './BookCard';
import './Shop.css';

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Simplified filter states
  const [filters, setFilters] = useState({
    searchTerm: '', // for book title
    author: '',
    year: ''
  });

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!(token && userData));
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        limit: 20
      });

      const url = `http://localhost:5000/api/books?${queryParams}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch books');
      }

      const data = await response.json();
      let filteredBooks = data.books;

      // Apply filters locally
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
          book.title.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.author) {
        const authorTerm = filters.author.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
          book.authors.some(author => 
            author.name.toLowerCase().includes(authorTerm)
          )
        );
      }

      if (filters.year) {
        const year = parseInt(filters.year);
        filteredBooks = filteredBooks.filter(book => 
          book.first_publish_year === year
        );
      }

      setBooks(filteredBooks);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []); // Only fetch once on component mount

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      author: '',
      year: ''
    });
    fetchBooks(); // Reset to show all books
  };

  return (
    <div className="shop-container">
      <div className="filters-section">
        <h1>Book Shop</h1>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="searchTerm">Book Title:</label>
            <input
              type="text"
              id="searchTerm"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search by book title"
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="author">Author:</label>
            <input
              type="text"
              id="author"
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              placeholder="Search by author name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="year">Publication Year:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              placeholder="Enter year"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button 
            className="clear-filters"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
          <div className="results-info">
            Showing {books.length} books
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchBooks}>Try Again</button>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map(book => (
              <BookCard
                key={book.key}
                book={book}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
          {books.length === 0 && (
            <div className="no-books">
              No books found matching your criteria
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Shop; 