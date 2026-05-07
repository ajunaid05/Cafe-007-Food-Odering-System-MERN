import React from 'react';
import './MenuItemCard.css';

const MenuItemCard = ({ item, onAddToCart }) => {
  return (
    <div className="menu-item-card-user">
      <div className="card-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="placeholder-image">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{item.name}</h3>
        <p className="card-description">{item.description}</p>
        <div className="card-footer">
          <span className="card-price">Rs. {item.price.toFixed(2)}</span>
          <button className="btn-add-cart" onClick={() => onAddToCart(item)}>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;

