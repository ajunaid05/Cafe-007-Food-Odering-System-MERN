import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI, orderAPI } from '../../services/api';
import './Payment.css';

// Check if publishable key is set
if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  console.error('❌ ERROR: REACT_APP_STRIPE_PUBLISHABLE_KEY is not set!');
  console.error('Please add REACT_APP_STRIPE_PUBLISHABLE_KEY to your .env file');
}

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ amount, cart, onSuccess, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        console.log('Creating payment intent for amount:', amount);
        const response = await paymentAPI.createPaymentIntent({ amount });
        setClientSecret(response.data.clientSecret);
        console.log('✅ Payment intent created successfully');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to initialize payment. Please try again.';
        setError(errorMessage);
        console.error('❌ Payment intent error:', err.response?.data || err.message);
      }
    };

    if (amount > 0) {
      createIntent();
    }
  }, [amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please wait...');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      console.log('Processing payment...');

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        console.error('❌ Stripe error:', stripeError);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);

        try {
          if (orderId) {
            // Update existing order status to 'paid'
            await orderAPI.updateStatus(orderId, 'paid');
            console.log('✅ Order status updated to paid');
          } else {
            // Legacy: Create new order if no orderId
            const orderData = {
              items: cart.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price
              })),
              totalAmount: amount
            };
            const orderResponse = await orderAPI.create(orderData);
            console.log('✅ Order created:', orderResponse.data);
            localStorage.removeItem('cart');
          }

          // Call success callback
          if (onSuccess) {
            onSuccess();
          }

          // Show success message and navigate
          alert('Payment successful!');
          navigate('/user/orders');
        } catch (orderError) {
          setError('Payment successful but failed to update order status. Please contact support.');
          console.error('❌ Order update error:', orderError.response?.data || orderError.message);
        }
      }
    } catch (err) {
      setError('An error occurred during payment. Please try again.');
      console.error('❌ Payment error:', err);
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

      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}

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
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Check if coming from "Pay Now" button with existing order
    if (location.state && location.state.orderId) {
      const { orderId, amount, items } = location.state;
      console.log('Payment for existing order:', orderId, amount);
      setOrderId(orderId);
      setTotalAmount(amount);
      setCart(items || []); // Just for display
      return;
    }

    // Fallback: Get cart from localStorage (Legacy)
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);

        // Calculate total
        const total = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalAmount(total);
        console.log('Cart loaded:', parsedCart.length, 'items, Total:', total);
      } catch (error) {
        console.error('Error parsing cart:', error);
        navigate('/user/cart');
      }
    } else {
      // No cart found, redirect to cart
      console.log('No cart found, redirecting...');
      // navigate('/user/cart');
    }
  }, [navigate, location]);

  if ((cart.length === 0 && !orderId) || totalAmount === 0) {
    return (
      <div className="payment-container">
        <div className="payment-loading">Loading...</div>
      </div>
    );
  }

  const handlePaymentSuccess = () => {
    // Navigation handled in PaymentForm
    console.log('Payment successful');
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Payment {orderId ? `#${orderId.slice(-6)}` : ''}</h2>

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
            cart={cart}
            onSuccess={handlePaymentSuccess}
            orderId={orderId}
          />
        </Elements>

        <button
          className="btn-cancel"
          onClick={() => navigate('/user/orders')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Payment;