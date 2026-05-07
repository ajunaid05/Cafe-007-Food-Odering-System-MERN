import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import OwnerDashboard from './components/owner/OwnerDashboard';
import UserMenu from './components/user/UserMenu';
import ScrollToTop from './components/ScrollToTop';
import UserAuth from './components/auth/UserAuth';
import OwnerLogin from './components/auth/OwnerLogin';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import './App.css';

// Disable browser's scroll restoration
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/owner/*" element={<OwnerDashboard />} />
          <Route path="/user/*" element={<UserMenu />} />

          {/* Auth routes */}
          <Route path="/user-auth" element={<UserAuth />} />
          <Route path="/owner-auth" element={<OwnerLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

