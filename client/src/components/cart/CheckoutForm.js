import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography
} from '@mui/material';
import axios from 'axios';

const CheckoutForm = ({ total, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    paymentDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/orders',
        {
          ...formData,
          total
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Checkout</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Shipping Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="shippingAddress.street"
                value={formData.shippingAddress.street}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="shippingAddress.city"
                value={formData.shippingAddress.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="shippingAddress.state"
                value={formData.shippingAddress.state}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="shippingAddress.zipCode"
                value={formData.shippingAddress.zipCode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Payment Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                name="paymentDetails.cardNumber"
                value={formData.paymentDetails.cardNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="paymentDetails.expiryDate"
                value={formData.paymentDetails.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CVV"
                name="paymentDetails.cvv"
                value={formData.paymentDetails.cvv}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4 }}>
            Total: ${total.toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Place Order
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CheckoutForm;
