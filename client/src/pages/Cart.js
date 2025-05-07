import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Button,
  Box,
  Paper,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckoutForm from '../components/cart/CheckoutForm';
import axios from 'axios';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (bookId, change) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/cart/update',
        { bookId, quantity: change },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/remove/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      
      {cartItems.length === 0 ? (
        <Typography>Your cart is empty</Typography>
      ) : (
        <>
          <List>
            {cartItems.map((item) => (
              <Paper key={item.book._id} sx={{ mb: 2, p: 2 }}>
                <ListItem>
                  <img 
                    src={item.book.coverImage} 
                    alt={item.book.title}
                    style={{ width: 100, marginRight: 16 }}
                  />
                  <ListItemText
                    primary={item.book.title}
                    secondary={`$${item.book.price} x ${item.quantity}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleUpdateQuantity(item.book._id, -1)}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography component="span" sx={{ mx: 2 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton onClick={() => handleUpdateQuantity(item.book._id, 1)}>
                      <AddIcon />
                    </IconButton>
                    <IconButton onClick={() => handleRemoveItem(item.book._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
          </List>

          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Typography variant="h5" gutterBottom>
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setShowCheckout(true)}
            >
              Proceed to Checkout
            </Button>
          </Box>

          {showCheckout && (
            <CheckoutForm 
              total={calculateTotal()}
              onClose={() => setShowCheckout(false)}
              onSuccess={() => {
                setShowCheckout(false);
                fetchCart();
              }}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default Cart;
