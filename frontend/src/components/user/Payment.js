import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './Payment.css';

if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  console.warn('REACT_APP_STRIPE_PUBLISHABLE_KEY is not set — payments will not work.');
}

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const PaymentForm = ({ amount, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      if (!orderId || amount <= 0) return;
      try {
        const response = await paymentAPI.createPaymentIntent({ amount, orderId });
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to initialize payment. Please try again.';
        setError(errorMessage);
      }
    };

    createIntent();
  }, [amount, orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret || !orderId) {
      setError('Payment system not ready. Please wait...');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await paymentAPI.verifyPayment({
          paymentIntentId: paymentIntent.id || paymentIntentId,
          orderId,
        });

        if (onSuccess) {
          onSuccess();
        }

        alert('Payment successful!');
        navigate('/user/orders');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'An error occurred during payment. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Raleway, sans-serif',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      invalid: {
        color: '#e57373',
        iconColor: '#e57373',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <h3>Total Amount</h3>
        <p className="amount-display">Rs. {amount.toFixed(2)}</p>
      </div>

      <div className="card-element-container">
        <label>Card Details</label>
        <div className="card-element-wrapper">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="payment-error">{error}</div>}

      <button
        type="submit"
        className="btn-pay"
        disabled={!stripe || loading || !clientSecret}
      >
        {loading ? 'Processing...' : `Pay Rs. ${amount.toFixed(2)}`}
      </button>

      <div className="payment-info">
        <p>Use test card: <strong>4242 4242 4242 4242</strong></p>
        <p>Any future expiry date, any CVC</p>
      </div>
    </form>
  );
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (location.state?.orderId) {
      const { orderId: id, amount, items } = location.state;
      setOrderId(id);
      setTotalAmount(amount);
      setCart(items || []);
      return;
    }

    navigate('/user/orders', { replace: true });
  }, [navigate, location]);

  const handlePaymentSuccess = () => {
    clearCart();
  };

  if (!orderId || totalAmount <= 0) {
    return (
      <div className="payment-container">
        <div className="payment-loading">Loading...</div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="payment-container">
        <div className="payment-error">
          Payment is not configured. Set REACT_APP_STRIPE_PUBLISHABLE_KEY in frontend/.env
        </div>
        <button type="button" className="btn-cancel" onClick={() => navigate('/user/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Payment #{orderId.slice(-6)}</h2>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map((item, index) => (
            <div key={item.menuItemId || index} className="summary-item">
              <span>{item.name} x {item.quantity}</span>
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total:</span>
            <span>Rs. {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={totalAmount}
            orderId={orderId}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>

        <button type="button" className="btn-cancel" onClick={() => navigate('/user/orders')}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Payment;
