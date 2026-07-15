import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

import Landing from './components/Landing/Landing';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Logged-in Dashboard Layout
import DashboardLogged from './components/DashboardLogged/DashboardHome';
import AiCvAnalysis from './components/Features/AiCvAnalysis';
import PortfolioBuilder from './components/Features/PortfolioBuilder';
import CareerOrientation from './components/Features/CareerOrientation';
import LearningPath from './components/Features/LearningPath';
import Settings from './components/Features/Settings';
import MyProfile from './components/Features/MyProfile';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminUsers from './components/Admin/AdminUsers';

// Tiện ích: reset scroll về đầu trang khi navigate
import ScrollToTop from './components/DashboardLogged/ScrollToTop';

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
    <GoogleOAuthProvider clientId="300432678489-9qimf9qv0f1hv6u5v1q8jjs31b92f8s4.apps.googleusercontent.com">
      <Router>
        {/* ScrollToTop phải nằm bên trong <Router> để dùng được useLocation() */}
        <ScrollToTop />
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Logged-in Routes – yêu cầu đăng nhập */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardLogged /></PrivateRoute>} />
            <Route path="/ai-cv" element={<PrivateRoute><AiCvAnalysis /></PrivateRoute>} />
            <Route path="/portfolio" element={<PrivateRoute><PortfolioBuilder /></PrivateRoute>} />
            <Route path="/career" element={<PrivateRoute><CareerOrientation /></PrivateRoute>} />
            <Route path="/learning-path" element={<PrivateRoute><LearningPath /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
