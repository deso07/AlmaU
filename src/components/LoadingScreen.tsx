import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="animated-logo" />
      </div>
      <div className="progress-container">
        <div className="progress-bar" />
      </div>
    </div>
  );
};

export default LoadingScreen; 