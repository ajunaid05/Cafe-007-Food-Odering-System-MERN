import React from 'react';
import './MenuItemCard.css';

const MenuItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="menu-item-card">
      <div className="card-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="placeholder-image">
            <span>No Image</span>
          </div>
        )}
        {!item.available && (
          <div className="unavailable-badge">Unavailable</div>
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{item.name}</h3>
        <p className="card-description">{item.description}</p>
        <div className="card-footer">
          <div className="card-info">
            <span className="card-price">Rs. {item.price.toFixed(2)}</span>
            <span className="card-category">{item.category}</span>
          </div>
          <div className="card-actions">
            <button className="btn-edit" onClick={() => onEdit(item)}>
              <span>Edit</span>
            </button>
            <button className="btn-delete" onClick={() => onDelete(item._id)}>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;

