import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = ['all', 'pending', 'confirmed', 'paid', 'delivered', 'cancelled'];

  useEffect(() => {
    fetchOrders(); // This runs on mount (shows spinner)

    // Background update every 5 seconds
    const interval = setInterval(() => fetchOrders(true), 5000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);

      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await orderAPI.getAll(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!isBackground) alert('Failed to load orders');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      fetchOrders(true); // Refresh silently
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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

  return (
    <div className="orders-management">
      <div className="orders-header">
        <h2>Orders Management</h2>
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
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3 className="order-number">Order #{order.orderNumber}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleString()}
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
                          Qty: {item.quantity} × Rs. {item.price.toFixed(2)}
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
                    <strong>Total: Rs. {order.totalAmount.toFixed(2)}</strong>
                  </div>
                  <div className="order-actions">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        {order.status === 'pending' && (
                          <button
                            className="status-btn"
                            onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                            style={{ borderColor: getStatusColor('confirmed') }}
                          >
                            Confirm Order
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <span
                            className="status-info"
                            style={{ color: '#0066cc', fontWeight: 'bold' }}
                          >
                            Waiting for User Payment...
                          </span>
                        )}
                        {order.status === 'paid' && (
                          <button
                            className="status-btn"
                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                            style={{ borderColor: getStatusColor('delivered') }}
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button
                          className="status-btn cancel-btn"
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          style={{ borderColor: getStatusColor('cancelled') }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
