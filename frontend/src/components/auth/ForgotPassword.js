import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    
    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
      setMessage('A password reset link has been sent to your email. Please check your inbox (and spam folder).');
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage(msg);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
          </div>
          
          {message && (
            <div className={`auth-message ${success ? 'auth-message-success' : 'auth-message-error'}`}>
              <p>{message}</p>
            </div>
          )}
          
          <button type="submit" className="auth-submit" disabled={loading || success}>
            {loading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
          </button>
          
          <div className="auth-extra" style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link to="/user-auth">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;


