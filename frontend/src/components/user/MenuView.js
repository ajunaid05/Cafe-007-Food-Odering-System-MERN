import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../../services/api';
import MenuItemCard from './MenuItemCard';
import './MenuView.css';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const MenuView = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { auth } = useContext(AuthContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const categories = ['all', 'fast food', 'desi', 'desert', 'cold drinks', 'hot drinks', 'snacks'];

  const fetchMenuItems = useCallback(async () => {
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
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchMenuItems();
    const interval = setInterval(fetchMenuItems, 10000);
    return () => clearInterval(interval);
  }, [fetchMenuItems]);

  const handleAddToCart = (item) => {
    // Require login to add to cart
    if (!auth || auth.role !== 'user') {
      alert('Please login or signup to add items to cart.');
      navigate('/user-auth');
      return;
    }

    addToCart(item);

    // Show brief notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = `${item.name} added to cart!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
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
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MenuView;
