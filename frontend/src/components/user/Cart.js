import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!auth || auth.role !== 'user') {
      alert('Please login to place an order.');
      navigate('/user-auth');
      return;
    }

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
        totalAmount: cartTotal
      };

      const response = await orderAPI.create(orderData);
      console.log('Order placed:', response.data);

      // Clear cart via context — this also wipes localStorage correctly
      clearCart();

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
            clearCart();
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
                onClick={() => removeFromCart(item.menuItemId)}
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
          <span>Rs. {cartTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>Rs. {cartTotal.toFixed(2)}</span>
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