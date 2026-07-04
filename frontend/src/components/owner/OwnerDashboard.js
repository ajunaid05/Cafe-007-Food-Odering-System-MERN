import React, { useContext } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import MenuManagement from './MenuManagement';
import OrdersManagement from './OrdersManagement';
import { AuthContext } from '../../context/AuthContext';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="owner-dashboard">
      <header className="owner-header">
        <div className="header-content">
          <h1 className="header-title"> Owner Dashboard</h1>
          <button type="button" className="home-link" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <nav className="owner-nav">
        <NavLink 
          to="/owner" 
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Menu Management
        </NavLink>
        <NavLink 
          to="/owner/orders" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Orders Management
        </NavLink>
      </nav>

      <main className="owner-main">
        <Routes>
          <Route index element={<MenuManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default OwnerDashboard;

