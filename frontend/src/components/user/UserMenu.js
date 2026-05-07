import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import MenuView from './MenuView';
import Cart from './Cart';
import MyOrders from './MyOrders';
import Payment from './Payment';
import './UserMenu.css';

const UserMenu = () => {
  return (
    <div className="user-menu">
      <header className="user-header">
        <div className="header-content">
          <h1 className="header-title">Food Menu</h1>
          <NavLink to="/" className="home-link">Logout</NavLink>
        </div>
      </header>
      
      <nav className="user-nav">
        <NavLink 
          to="/user" 
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Menu
        </NavLink>
        <NavLink 
          to="/user/cart" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Cart
        </NavLink>
        <NavLink 
          to="/user/orders" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          My Orders
        </NavLink>
      </nav>

      <main className="user-main">
        <Routes>
          <Route index element={<MenuView />} />
          <Route path="cart" element={<Cart />} />
          <Route path="payment" element={<Payment />} />
          <Route path="orders" element={<MyOrders />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserMenu;

