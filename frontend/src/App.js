import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Landing from './components/Landing/Landing';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';

// Logged-in Dashboard Layout
import DashboardLogged from './components/DashboardLogged/DashboardHome';
import AiCvAnalysis from './components/Features/AiCvAnalysis';
import PortfolioBuilder from './components/Features/PortfolioBuilder';
import CareerOrientation from './components/Features/CareerOrientation';
import LearningPath from './components/Features/LearningPath';
import Settings from './components/Features/Settings';
import MyProfile from './components/Features/MyProfile';

function App() {
  useEffect(() => {
    // Apply global appearance settings on load
    const color = localStorage.getItem('career_color') || 'var(--primary-color, #3b5bdb)';
    const theme = localStorage.getItem('career_theme') || 'light';
    const fontSize = localStorage.getItem('career_font_size') || 'medium';
    const compact = localStorage.getItem('career_compact') === 'true';

    document.documentElement.style.setProperty('--primary-color', color);
    
    if (theme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
    
    if (compact) document.body.classList.add('compact-mode');
    else document.body.classList.remove('compact-mode');
    
    if (fontSize === 'small') document.documentElement.style.fontSize = '14px';
    else if (fontSize === 'large') document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Logged-in Routes */}
          <Route path="/dashboard" element={<DashboardLogged />} />
          <Route path="/ai-cv" element={<AiCvAnalysis />} />
          <Route path="/portfolio" element={<PortfolioBuilder />} />
          <Route path="/career" element={<CareerOrientation />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<MyProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
