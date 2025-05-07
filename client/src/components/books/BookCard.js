import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookCard = ({ book, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Card 
      sx={{ 
        maxWidth: 280, 
        m: 2,
        transition: 'transform 0.2s',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardMedia
        component="img"
        height="300"
        image={book.coverImage || '/placeholder-book.jpg'}
        alt={book.title}
        onClick={() => navigate(`/book/${book._id}`)}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {book.author}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            ${book.price}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onAddToCart(book)}
            disabled={book.availableCopies === 0}
          >
            {book.availableCopies > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Available: {book.availableCopies}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BookCard;
