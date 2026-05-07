import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content fade-in">
        <h1 className="home-title">Welcome to Cafe 007</h1>
        <p className="home-subtitle">Choose your interface to continue</p>
        <div className="home-buttons">
          <button 
            className="home-btn owner-btn" 
            onClick={() => navigate('/owner-auth')}
          >
            <span>Owner</span>
          </button>
          <button 
            className="home-btn user-btn" 
            onClick={() => navigate('/user-auth')}
          >
            <span>User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

