import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../../services/api';
import MenuItemCard from './MenuItemCard';
import './MenuView.css';
import { AuthContext } from '../../context/AuthContext';

const MenuView = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const categories = ['all', 'fast food', 'desi', 'desert', 'cold drinks', 'hot drinks', 'snacks'];

  useEffect(() => {
    fetchMenuItems();
    const interval = setInterval(fetchMenuItems, 10000);
    return () => clearInterval(interval);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    console.log('Saving cart to localStorage:', cart); // Debug log
    localStorage.setItem('cart', JSON.stringify(cart));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params = { available: 'true' };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;
      
      const response = await menuAPI.getAll(params);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    // Require login to add to cart
    if (!auth || !auth.user) {
      alert('Please login or signup to add items to cart.');
      navigate('/user-auth');
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.menuItemId === item._id
      );

      let newCart;
      if (existingItem) {
        newCart = prevCart.map((cartItem) =>
          cartItem.menuItemId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        newCart = [
          ...prevCart,
          {
            menuItemId: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
          },
        ];
      }

      return newCart;
    });

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = `${item.name} added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  return (
    <div className="menu-view">
      <div className="menu-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading menu...</div>
      ) : (
        <div className="menu-grid">
          {menuItems.length === 0 ? (
            <div className="empty-state">
              <p>No items available in this category</p>
            </div>
          ) : (
            menuItems.map(item => (
              <MenuItemCard
                key={item._id}
                item={item}
                onAddToCart={addToCart}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MenuView;