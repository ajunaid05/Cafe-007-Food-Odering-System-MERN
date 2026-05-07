import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Load cart from localStorage whenever component mounts or becomes visible
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      console.log('Loading cart from localStorage:', savedCart);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('Parsed cart:', parsedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart:', error);
          localStorage.removeItem('cart');
        }
      }
    };

    loadCart();
    window.addEventListener('storage', loadCart);
    window.addEventListener('cartUpdated', loadCart);

    return () => {
      window.removeEventListener('storage', loadCart);
      window.removeEventListener('cartUpdated', loadCart);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Saving cart to localStorage:', cart);
    }
  }, [cart]);

  const updateQuantity = (menuItemId, change) => {
    setCart(prevCart => {
      const item = prevCart.find(cartItem => cartItem.menuItemId === menuItemId);
      if (!item) return prevCart;

      const newQuantity = item.quantity + change;
      if (newQuantity <= 0) {
        return prevCart.filter(cartItem => cartItem.menuItemId !== menuItemId);
      }

      return prevCart.map(cartItem =>
        cartItem.menuItemId === menuItemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
    });
  };

  const removeItem = (menuItemId) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.menuItemId !== menuItemId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: calculateTotal()
      };

      const response = await orderAPI.create(orderData);
      console.log('Order placed:', response.data);

      // Clear cart
      setCart([]);
      localStorage.removeItem('cart');

      alert('Order placed successfully! Please wait for the owner to confirm.');
      navigate('/user/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-content">
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <button className="btn-primary" onClick={() => navigate('/user')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="btn-clear" onClick={() => {
          if (window.confirm('Are you sure you want to clear your cart?')) {
            setCart([]);
            localStorage.removeItem('cart');
          }
        }}>
          Clear Cart
        </button>
      </div>

      <div className="cart-items">
        {cart.map(item => (
          <div key={item.menuItemId} className="cart-item">
            <div className="cart-item-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="placeholder-image">No Image</div>
              )}
            </div>
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-price">Rs. {item.price.toFixed(2)} each</p>
            </div>
            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.menuItemId, -1)}
                >
                  −
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.menuItemId, 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-item-total">
                Rs. {(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                className="btn-remove"
                onClick={() => removeItem(item.menuItemId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>Rs. {calculateTotal().toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>Rs. {calculateTotal().toFixed(2)}</span>
        </div>
        <button
          className="btn-checkout"
          onClick={handleCheckout}
        >
          <span>Place Order</span>
        </button>
      </div>
    </div>
  );
};

export default Cart;