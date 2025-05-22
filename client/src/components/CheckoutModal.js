import React, { useState } from 'react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cart, onConfirmOrder }) => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [shippingDetails, setShippingDetails] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    bank: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  const validateShippingDetails = () => {
    const newErrors = {};
    if (!shippingDetails.address) newErrors.address = 'Address is required';
    if (!shippingDetails.city) newErrors.city = 'City is required';
    if (!shippingDetails.state) newErrors.state = 'State is required';
    if (!shippingDetails.zipCode) newErrors.zipCode = 'ZIP code is required';
    if (!shippingDetails.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (shippingDetails.phoneNumber && !/^\d{10}$/.test(shippingDetails.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCardDetails = () => {
    const newErrors = {};
    if (!cardDetails.cardNumber) newErrors.cardNumber = 'Card number is required';
    if (!cardDetails.cardName) newErrors.cardName = 'Name on card is required';
    if (!cardDetails.bank) newErrors.bank = 'Bank name is required';
    if (!cardDetails.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (!cardDetails.cvv) newErrors.cvv = 'CVV is required';
    if (cardDetails.cardNumber && !/^\d{16}$/.test(cardDetails.cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    if (cardDetails.cvv && !/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    if (cardDetails.expiryDate && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShippingDetails()) {
      setStep(2);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'cod' || validateCardDetails()) {
      setStep(3);
    }
  };

  const handleConfirmOrder = () => {
    const orderData = {
      shippingDetails,
      paymentMethod,
      ...(paymentMethod !== 'cod' && { cardDetails }),
      items: cart.items,
      total: cart.total
    };
    onConfirmOrder(orderData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        
        {step === 1 && (
          <div className="shipping-form">
            <h2>Shipping Details</h2>
            <form onSubmit={handleShippingSubmit}>
              <div className="form-group">
                <label>Address:</label>
                <input
                  type="text"
                  value={shippingDetails.address}
                  onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                  placeholder="Enter your address"
                />
                {errors.address && <span className="error">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>City:</label>
                <input
                  type="text"
                  value={shippingDetails.city}
                  onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                  placeholder="Enter your city"
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label>State:</label>
                <input
                  type="text"
                  value={shippingDetails.state}
                  onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                  placeholder="Enter your state"
                />
                {errors.state && <span className="error">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label>ZIP Code:</label>
                <input
                  type="text"
                  value={shippingDetails.zipCode}
                  onChange={(e) => setShippingDetails({...shippingDetails, zipCode: e.target.value})}
                  placeholder="Enter ZIP code"
                />
                {errors.zipCode && <span className="error">{errors.zipCode}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  value={shippingDetails.phoneNumber}
                  onChange={(e) => setShippingDetails({...shippingDetails, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
              </div>

              <button type="submit" className="next-button">Next: Payment</button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="payment-form">
            <h2>Payment Method</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="payment-methods">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash on Delivery
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit"
                    checked={paymentMethod === 'debit'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Debit Card
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit"
                    checked={paymentMethod === 'credit'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Credit Card
                </label>
              </div>

              {(paymentMethod === 'debit' || paymentMethod === 'credit') && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Card Number:</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                      placeholder="Enter card number"
                      maxLength="16"
                    />
                    {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label>Name on Card:</label>
                    <input
                      type="text"
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                      placeholder="Enter name on card"
                    />
                    {errors.cardName && <span className="error">{errors.cardName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Bank:</label>
                    <input
                      type="text"
                      value={cardDetails.bank}
                      onChange={(e) => setCardDetails({...cardDetails, bank: e.target.value})}
                      placeholder="Enter bank name"
                    />
                    {errors.bank && <span className="error">{errors.bank}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date:</label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
                    </div>

                    <div className="form-group">
                      <label>CVV:</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                        placeholder="CVV"
                        maxLength="4"
                      />
                      {errors.cvv && <span className="error">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="back-button">
                  Back
                </button>
                <button type="submit" className="next-button">
                  {paymentMethod === 'cod' ? 'Review Order' : 'Next: Review Order'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="order-confirmation">
            <h2>Order Confirmation</h2>
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="shipping-details">
                <h4>Shipping Details:</h4>
                <p>{shippingDetails.address}</p>
                <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zipCode}</p>
                <p>Phone: {shippingDetails.phoneNumber}</p>
              </div>
              
              <div className="payment-details">
                <h4>Payment Method:</h4>
                <p>{paymentMethod === 'cod' ? 'Cash on Delivery' : 
                    paymentMethod === 'debit' ? 'Debit Card' : 'Credit Card'}</p>
                {paymentMethod !== 'cod' && (
                  <p>Card ending in {cardDetails.cardNumber.slice(-4)}</p>
                )}
              </div>

              <div className="items-summary">
                <h4>Items:</h4>
                {cart.items.map(item => (
                  <div key={item.bookId} className="order-item">
                    <span>{item.title}</span>
                    <span>x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="total">
                <h4>Total:</h4>
                <p>${cart.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="button-group">
              <button onClick={() => setStep(2)} className="back-button">
                Back
              </button>
              <button onClick={handleConfirmOrder} className="confirm-button">
                Confirm Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal; 