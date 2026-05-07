import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import MenuManagement from './MenuManagement';
import OrdersManagement from './OrdersManagement';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  return (
    <div className="owner-dashboard">
      <header className="owner-header">
        <div className="header-content">
          <h1 className="header-title"> Owner Dashboard</h1>
          <NavLink to="/" className="home-link">Logout</NavLink>
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

