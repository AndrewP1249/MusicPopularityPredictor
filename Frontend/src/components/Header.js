import React from 'react';
import { Music, TrendingUp } from 'lucide-react';

const Header = ({ onHomeClick }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
          <Music className="logo-icon" />
          <h1>Music Popularity Predictor</h1>
        </div>
        <div className="tagline">
          <TrendingUp className="tagline-icon" />
          <span>Predict your song's popularity using Machine Learning</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 