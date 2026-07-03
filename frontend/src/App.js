import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
import Landing from './components/Landing/Landing';
import DashboardGuest from './components/Dashboard';
import DashboardLogged from './components/DashboardLogged';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import AiCvAnalysis from './components/Features/AiCvAnalysis';
import PortfolioBuilder from './components/Features/PortfolioBuilder';
import CareerOrientation from './components/Features/CareerOrientation';
import LearningPath from './components/Features/LearningPath';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public / Guest Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard-guest" element={<DashboardGuest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Logged in / Feature Routes */}
          <Route path="/dashboard" element={<DashboardLogged />} />
          <Route path="/ai-cv" element={<AiCvAnalysis />} />
          <Route path="/portfolio" element={<PortfolioBuilder />} />
          <Route path="/career" element={<CareerOrientation />} />
          <Route path="/learning-path" element={<LearningPath />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
