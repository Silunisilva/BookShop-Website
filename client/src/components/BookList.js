import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from './BookCard';
import './BookList.css';

const BookList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('fantasy');
  const [totalBooks, setTotalBooks] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    minYear: '',
    maxYear: '',
    minRating: '',
    author: '',
    sort: 'title_asc'
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const isAuth = !!(token && userData);
      console.log('Auth status:', isAuth); // Debug log
      setIsAuthenticated(isAuth);
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Log initial state
  useEffect(() => {
    console.log('Initial load with:', {
      genre: selectedGenre,
      filters: filters,
      limit: 20
    });
  }, []);

  // Fetch available genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        console.log('Fetching genres...');
        const response = await fetch('http://localhost:5000/api/books/genres');
        if (!response.ok) {
          throw new Error('Failed to fetch genres');
        }
        const data = await response.json();
        console.log('Available genres:', data.genres);
        setGenres(data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    fetchGenres();
  }, []);

  const fetchBooks = async (genre, currentFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        genre,
        limit: 20,
        ...currentFilters
      });

      const url = `http://localhost:5000/api/books?${queryParams}`;
      console.log('Fetching books from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch books');
      }
      const data = await response.json();
      console.log('Received books:', {
        total: data.total,
        genre: data.genre,
        filters: data.filters
      });
      
      setBooks(data.books);
      setTotalBooks(data.total);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(selectedGenre, filters);
  }, [selectedGenre, filters]);

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      minYear: '',
      maxYear: '',
      minRating: '',
      author: '',
      sort: 'title_asc'
    });
  };

  if (loading && books.length === 0) {
    return <div className="loading">Loading books...</div>;
  }

  if (error && books.length === 0) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => fetchBooks(selectedGenre, filters)}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="book-list-container">
      <div className="filters-section">
        <div className="genre-selector">
          <label htmlFor="genre">Genre: </label>
          <select 
            id="genre" 
            value={selectedGenre} 
            onChange={handleGenreChange}
            className="genre-select"
          >
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="minYear">Year Range:</label>
            <input
              type="number"
              id="minYear"
              name="minYear"
              value={filters.minYear}
              onChange={handleFilterChange}
              placeholder="From"
              min="1800"
              max={new Date().getFullYear()}
            />
            <input
              type="number"
              id="maxYear"
              name="maxYear"
              value={filters.maxYear}
              onChange={handleFilterChange}
              placeholder="To"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="minRating">Min Rating:</label>
            <input
              type="number"
              id="minRating"
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              placeholder="0-5"
              min="0"
              max="5"
              step="0.1"
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
              placeholder="Search by author"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort By:</label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="sort-select"
            >
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="year_asc">Year (Oldest First)</option>
              <option value="year_desc">Year (Newest First)</option>
              <option value="rating_asc">Rating (Low to High)</option>
              <option value="rating_desc">Rating (High to Low)</option>
            </select>
          </div>

          <button 
            className="clear-filters"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="results-info">
          Showing {totalBooks} books
        </div>
      </div>
      
      <div className="book-list">
        {books.map((book, index) => (
          <BookCard 
            key={`${book.key}-${book.cover_i || book.cover_id || 'no-cover'}-${book.title}-${index}`} 
            book={book}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
};

export default BookList; 