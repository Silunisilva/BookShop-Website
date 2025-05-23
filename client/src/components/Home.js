import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from './BookCard';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const observerRef = useRef(null);
  const sliderRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsAuthenticated(!!(token && userData));

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    // Observe elements
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observerRef.current.observe(el));

    // Fetch featured books
    const fetchFeaturedBooks = async () => {
      try {
        const genres = ['fantasy', 'science_fiction', 'mystery'];
        const allBooks = await Promise.all(
          genres.map(genre =>
            fetch(`http://localhost:5000/api/books?genre=${genre}&limit=5`)
              .then(res => res.json())
              .then(data => data.books)
          )
        );

        const books = allBooks.flat().sort(() => Math.random() - 0.5).slice(0, 6);
        setFeaturedBooks(books);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured books');
        setLoading(false);
      }
    };

    fetchFeaturedBooks();

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollPrev(scrollLeft > 0);
      setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      checkScroll();
      sliderRef.current.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (sliderRef.current) {
        sliderRef.current.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, [featuredBooks]);

  const handleMouseMove = (e) => {
    const cards = document.querySelectorAll('.feature');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const cardWidth = 200; // Width of card
      const gap = 24; // Gap between cards
      const scrollAmount = cardWidth + gap;
      const currentScroll = sliderRef.current.scrollLeft;
      const maxScroll = sliderRef.current.scrollWidth - sliderRef.current.clientWidth;

      let newScroll;
      if (direction === 'next') {
        newScroll = Math.min(currentScroll + scrollAmount, maxScroll);
      } else {
        newScroll = Math.max(currentScroll - scrollAmount, 0);
      }

      sliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '-50px' // Start animation slightly before element comes into view
      }
    );

    // Observe the about section and locations section
    const aboutSection = document.getElementById('about-section');
    const locationsSection = document.getElementById('locations-section');
    
    if (aboutSection) observer.observe(aboutSection);
    if (locationsSection) observer.observe(locationsSection);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container" onMouseMove={handleMouseMove}>
      <section className="hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-image animate-on-scroll" id="hero-image">
            <img
              src="/hero-bg.jpg"
              alt="Collection of books"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
              }}
            />
          </div>
          <div className="hero-content animate-on-scroll" id="hero-content">
            <h1>Welcome to <span className="highlight">BookNook</span></h1>
            <p>Discover your next favorite book from our vast collection of carefully curated titles.
               From timeless classics to contemporary bestsellers, find the perfect read for every moment.</p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link
                  to="/shop"
                  className="primary-button"
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Browse Books
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="primary-button"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="secondary-button"
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section 
        className={`about-section ${isVisible['about-section'] ? 'fade-in' : ''}`} 
        id="about-section"
      >
        <div className="about-content">
          <div className="about-text">
            <h2>About BookNook</h2>
            <p className="about-subtitle">"Your Literary Journey Begins Here"</p>
            <div className="about-description">
              <p>At BookNook, we believe that every book has the power to transform lives. Founded in 2024, we've created a haven for book lovers where stories come alive and imaginations flourish.</p>
              <p>Our carefully curated collection spans across genres, from timeless classics to contemporary bestsellers, ensuring there's something special for every reader.</p>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Books Available</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Customer Support</span>
              </div>
            </div>
          </div>
          <div className="about-image-grid">
            <div className="grid-item main-image">
              <img
                src="/about-main.jpg"
                alt="BookNook main store"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
                }}
              />
            </div>
            <div className="grid-item">
              <img
                src="/about-reading.jpg"
                alt="Reading corner"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
                }}
              />
            </div>
            <div className="grid-item">
              <img
                src="/about-cafe.jpg"
                alt="BookNook cafe"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
                }}
              />
            </div>
          </div>
        </div>

        <div 
          className={`locations-section ${isVisible['locations-section'] ? 'fade-in' : ''}`} 
          id="locations-section"
        >
          <h3>Visit Our Stores</h3>
          <div className="locations-grid">
            <div className="location-card">
              <div className="location-image">
                <img
                  src="/location-nyc.jpg"
                  alt="New York City Store"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
                  }}
                />
              </div>
              <div className="location-info">
                <h4>New York City</h4>
                <p className="location-address">123 Literary Lane, Manhattan</p>
                <p className="location-hours">Mon-Sat: 9AM - 9PM<br/>Sun: 10AM - 7PM</p>
                <a href="tel:+12125551234" className="location-phone">(212) 555-1234</a>
              </div>
            </div>

            <div className="location-card">
              <div className="location-image">
                <img
                  src="/location-sf.jpg"
                  alt="San Francisco Store"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
                  }}
                />
              </div>
              <div className="location-info">
                <h4>San Francisco</h4>
                <p className="location-address">456 Book Street, Mission District</p>
                <p className="location-hours">Mon-Sat: 8AM - 8PM<br/>Sun: 9AM - 6PM</p>
                <a href="tel:+14155551234" className="location-phone">(415) 555-1234</a>
              </div>
            </div>

            <div className="location-card">
              <div className="location-image">
                <img
                  src="/location-chicago.jpg"
                  alt="Chicago Store"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1513642781451-7fceb723a73e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
                  }}
                />
              </div>
              <div className="location-info">
                <h4>Chicago</h4>
                <p className="location-address">789 Reading Road, River North</p>
                <p className="location-hours">Mon-Sat: 9AM - 8PM<br/>Sun: 10AM - 6PM</p>
                <a href="tel:+13125551234" className="location-phone">(312) 555-1234</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <h2 className="animate-on-scroll" id="featured-title">Featured Books</h2>
        <div className="featured-books-container">
          <button
            className="slider-button prev"
            onClick={() => scrollSlider('prev')}
            disabled={!canScrollPrev}
            aria-label="Previous books"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#2c3e50">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <button
            className="slider-button next"
            onClick={() => scrollSlider('next')}
            disabled={!canScrollNext}
            aria-label="Next books"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#2c3e50">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
          {loading ? (
            <div className="loading animate-on-scroll" id="loading">Loading featured books...</div>
          ) : error ? (
            <div className="error animate-on-scroll" id="error">{error}</div>
          ) : (
            <div
              className="featured-books animate-on-scroll"
              id="featured-books"
              ref={sliderRef}
            >
              {featuredBooks.map((book, index) => (
                <div
                  key={book.key}
                  className="animate-on-scroll"
                  id={`book-${index}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <BookCard
                    book={book}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        {isAuthenticated && (
          <div className="view-more animate-on-scroll" id="view-more">
            <Link
              to="/shop"
              className="view-more-button"
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View All Books
            </Link>
          </div>
        )}
      </section>

      <section className="features-section">
        {[
          {
            title: 'Wide Selection',
            description: 'Browse through thousands of books across various genres'
          },
          {
            title: 'Easy Shopping',
            description: 'Simple and secure checkout process'
          },
          {
            title: 'Fast Delivery',
            description: 'Get your books delivered to your doorstep'
          }
        ].map((feature, index) => (
          <div
            key={feature.title}
            className="feature animate-on-scroll"
            id={`feature-${index}`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
