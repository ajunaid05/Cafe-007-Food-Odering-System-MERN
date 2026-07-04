import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import './MyOrders.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = ['all', 'pending', 'confirmed', 'paid', 'delivered', 'cancelled'];

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await orderAPI.getUserOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!isBackground) alert('Failed to load orders');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#666666',
      confirmed: '#0066cc',
      paid: '#00cc66',
      delivered: '#00aa00',
      cancelled: '#cc0000'
    };
    return colors[status] || '#000000';
  };

  const handlePay = (order) => {
    navigate('/user/payment', {
      state: {
        orderId: order._id,
        amount: order.totalAmount,
        items: order.items
      }
    });
  };

  return (
    <div className="my-orders">
      <div className="orders-header">
        <h2>My Orders</h2>
        <div className="status-filters">
          {statuses.map(status => (
            <button
              key={status}
              className={`status-filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
              style={statusFilter === status && status !== 'all' ? { borderColor: getStatusColor(status) } : {}}
            >
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading your orders...</div>
      ) : (
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
              <p className="empty-subtitle">Start ordering to see your orders here!</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3 className="order-number">Order #{order.orderNumber}</h3>
                    <p className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className="order-status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="order-item-image" />
                      )}
                      <div className="order-item-info">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-details">
                          Quantity: {item.quantity} × Rs. {item.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="order-item-total">
                        Rs. {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total Amount: Rs. {order.totalAmount.toFixed(2)}</strong>
                  </div>
                  {order.status === 'confirmed' && (
                    <button
                      className="btn-pay-now"
                      onClick={() => handlePay(order)}
                      style={{
                        marginLeft: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#00cc66',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

