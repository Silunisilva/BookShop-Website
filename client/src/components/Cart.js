import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutModal from './CheckoutModal';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const fetchCart = useCallback(async (token) => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching cart with token:', {
        tokenPreview: `${token.substring(0, 10)}...`,
        tokenLength: token.length
      });

      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Cart fetch response:', {
        status: response.status,
        ok: response.ok,
        error: data.error,
        hasData: !!data,
        items: data.items?.map(item => ({
          bookId: item.bookId,
          title: item.title,
          quantity: item.quantity
        }))
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cart');
      }

      setCart(data);
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError(err.message);
      if (err.message === 'Invalid token') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Cart component mounted, token status:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    });
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    fetchCart(token);
  }, [navigate, fetchCart]);

  const updateQuantity = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      // Clean the bookId by removing any path components
      const cleanBookId = bookId.split('/').pop();
      console.log('Updating quantity:', { originalBookId: bookId, cleanBookId, newQuantity });
      
      const response = await fetch(`http://localhost:5000/api/cart/update/${cleanBookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update quantity');
      }

      const updatedCart = await response.json();
      console.log('Cart updated:', { bookId: cleanBookId, newQuantity, total: updatedCart.total });
      setCart(updatedCart);
    } catch (err) {
      console.error('Update quantity error:', err);
      setError(err.message);
    }
  };

  const removeItem = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      // Clean the bookId by removing any path components
      const cleanBookId = bookId.split('/').pop();
      console.log('Removing item:', { 
        originalBookId: bookId, 
        cleanBookId,
        currentCartItems: cart.items.map(item => ({
          bookId: item.bookId,
          title: item.title
        }))
      });
      
      const response = await fetch(`http://localhost:5000/api/cart/remove/${cleanBookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      console.log('Remove response:', {
        status: response.status,
        ok: response.ok,
        data: responseData,
        error: responseData.error
      });

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to remove item');
      }

      console.log('Item removed successfully:', { 
        bookId: cleanBookId, 
        newTotal: responseData.total,
        remainingItems: responseData.items.map(item => ({
          bookId: item.bookId,
          title: item.title
        }))
      });
      
      setCart(responseData);
    } catch (err) {
      console.error('Remove item error:', err);
      setError(err.message);
    }
  };

  const handleCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutModalOpen(false);
  };

  const handleConfirmOrder = async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting order:', {
        items: orderData.items.length,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod
      });

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Order submission response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear the cart after successful order
      await fetch('http://localhost:5000/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Close modal and show success message
      setIsCheckoutModalOpen(false);
      alert('Order placed successfully! Thank you for your purchase.');
      navigate('/orders'); // Redirect to orders page
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err.message);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => fetchCart(localStorage.getItem('token'))} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart && cart.items && cart.items.length > 0 ? (
        <>
          <div className="cart-items">
            {cart.items.map(item => {
              console.log('Rendering cart item:', {
                bookId: item.bookId,
                title: item.title,
                quantity: item.quantity
              });
              return (
                <div key={`${item.bookId}-${item.title}`} className="cart-item">
                  <div className="item-image">
                    {item.coverId ? (
                      <img 
                        src={`https://covers.openlibrary.org/b/id/${item.coverId}-M.jpg`} 
                        alt={item.title}
                      />
                    ) : (
                      <div className="no-cover">No Cover</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="author">{item.author}</p>
                    <p className="price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <button 
                      onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => removeItem(item.bookId)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
          <div className="cart-summary">
            <div className="total">
              <span>Total:</span>
              <span>${cart.total.toFixed(2)}</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/shop')} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      )}

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseCheckout}
        cart={cart}
        onConfirmOrder={handleConfirmOrder}
      />
    </div>
  );
};

export default Cart; 