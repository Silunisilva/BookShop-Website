import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('Fetched orders:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        setOrders(data);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#17a2b8';
      case 'shipped':
        return '#007bff';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <h2>Your Orders</h2>
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/shop')} className="shop-now-button">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            <div className="order-details">
              <div className="shipping-info">
                <h4>Shipping Details</h4>
                <p>{order.shippingDetails.address}</p>
                <p>{order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.zipCode}</p>
                <p>Phone: {order.shippingDetails.phoneNumber}</p>
              </div>

              <div className="payment-info">
                <h4>Payment Method</h4>
                <p>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                   order.paymentMethod === 'debit' ? 'Debit Card' : 'Credit Card'}
                </p>
                {order.cardDetails && (
                  <p>Card ending in {order.cardDetails.last4}</p>
                )}
              </div>
            </div>

            <div className="order-items">
              <h4>Items</h4>
              {order.items.map(item => (
                <div key={item.bookId} className="order-item">
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
                    <h5>{item.title}</h5>
                    <p className="author">{item.author}</p>
                    <p className="quantity">Quantity: {item.quantity}</p>
                    <p className="price">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 