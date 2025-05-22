// controllers/bookController.js
const axios = require('axios');

// Common genres from Open Library
const COMMON_GENRES = [
  'fantasy',
  'science_fiction',
  'mystery',
  'romance',
  'horror',
  'adventure',
  'fiction',
  'biography',
  'history',
  'poetry',
  'drama',
  'children',
  'young_adult',
  'comics',
  'crime',
  'thriller',
  'philosophy',
  'religion',
  'science',
  'technology'
];

const SORT_OPTIONS = {
  TITLE_ASC: 'title_asc',
  TITLE_DESC: 'title_desc',
  YEAR_ASC: 'year_asc',
  YEAR_DESC: 'year_desc',
  RATING_ASC: 'rating_asc',
  RATING_DESC: 'rating_desc'
};

const getGenres = async (req, res) => {
  try {
    // For now, return our predefined list of common genres
    // In the future, we could fetch this from Open Library API
    res.json({
      genres: COMMON_GENRES.map(genre => ({
        id: genre,
        name: genre.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
    });
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch genres',
      details: error.message
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const { 
      genre = 'fantasy', 
      limit = 20,
      minYear,
      maxYear,
      minRating,
      author,
      sort = SORT_OPTIONS.TITLE_ASC
    } = req.query;
    
    // Validate genre
    if (!COMMON_GENRES.includes(genre)) {
      return res.status(400).json({ 
        error: 'Invalid genre',
        details: `Please use one of the following genres: ${COMMON_GENRES.join(', ')}`
      });
    }

    // Validate limit
    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({ 
        error: 'Invalid limit. Please provide a number between 1 and 50.' 
      });
    }

    // Validate year range
    const parsedMinYear = minYear ? parseInt(minYear) : null;
    const parsedMaxYear = maxYear ? parseInt(maxYear) : null;
    if ((parsedMinYear && isNaN(parsedMinYear)) || (parsedMaxYear && isNaN(parsedMaxYear))) {
      return res.status(400).json({ 
        error: 'Invalid year range. Please provide valid years.' 
      });
    }

    // Validate rating
    const parsedMinRating = minRating ? parseFloat(minRating) : null;
    if (parsedMinRating && (isNaN(parsedMinRating) || parsedMinRating < 0 || parsedMinRating > 5)) {
      return res.status(400).json({ 
        error: 'Invalid rating. Please provide a number between 0 and 5.' 
      });
    }

    // Validate sort option
    if (!Object.values(SORT_OPTIONS).includes(sort)) {
      return res.status(400).json({ 
        error: 'Invalid sort option',
        details: `Please use one of the following sort options: ${Object.values(SORT_OPTIONS).join(', ')}`
      });
    }

    // Fetch books from Open Library API
    const { data } = await axios.get(
      `https://openlibrary.org/subjects/${genre}.json?limit=${parsedLimit}`
    );

    if (!data.works || !Array.isArray(data.works)) {
      return res.status(404).json({ 
        error: `No books found for genre: ${genre}` 
      });
    }

    // Process and filter the books
    let processedBooks = data.works.map(book => ({
      key: book.key,
      title: book.title,
      authors: book.authors || [],
      cover_id: book.cover_id,
      cover_i: book.cover_i,
      first_publish_year: book.first_publish_year,
      subject: genre,
      rating: book.rating ? {
        average: book.rating.average,
        count: book.rating.count
      } : null
    }));

    // Apply filters
    if (parsedMinYear) {
      processedBooks = processedBooks.filter(book => 
        book.first_publish_year >= parsedMinYear
      );
    }
    if (parsedMaxYear) {
      processedBooks = processedBooks.filter(book => 
        book.first_publish_year <= parsedMaxYear
      );
    }
    if (parsedMinRating) {
      processedBooks = processedBooks.filter(book => 
        book.rating && book.rating.average >= parsedMinRating
      );
    }
    if (author) {
      const searchAuthor = author.toLowerCase();
      processedBooks = processedBooks.filter(book => 
        book.authors.some(a => 
          a.name.toLowerCase().includes(searchAuthor)
        )
      );
    }

    // Apply sorting
    switch (sort) {
      case SORT_OPTIONS.TITLE_ASC:
        processedBooks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case SORT_OPTIONS.TITLE_DESC:
        processedBooks.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case SORT_OPTIONS.YEAR_ASC:
        processedBooks.sort((a, b) => (a.first_publish_year || 0) - (b.first_publish_year || 0));
        break;
      case SORT_OPTIONS.YEAR_DESC:
        processedBooks.sort((a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0));
        break;
      case SORT_OPTIONS.RATING_ASC:
        processedBooks.sort((a, b) => 
          ((a.rating?.average || 0) - (b.rating?.average || 0))
        );
        break;
      case SORT_OPTIONS.RATING_DESC:
        processedBooks.sort((a, b) => 
          ((b.rating?.average || 0) - (a.rating?.average || 0))
        );
        break;
    }

    res.json({
      books: processedBooks,
      total: processedBooks.length,
      genre: genre,
      filters: {
        minYear: parsedMinYear,
        maxYear: parsedMaxYear,
        minRating: parsedMinRating,
        author: author,
        sort: sort
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error.message);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({ 
        error: 'Error fetching books from Open Library API',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({ 
        error: 'No response from Open Library API',
        details: 'The service might be temporarily unavailable'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ 
        error: 'Failed to fetch books',
        details: error.message
      });
    }
  }
};

module.exports = { getBooks, getGenres, SORT_OPTIONS };
