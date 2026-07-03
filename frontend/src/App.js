import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Logged-in Dashboard Layout
import DashboardLogged from './components/DashboardLogged';
import AiCvAnalysis from './components/Features/AiCvAnalysis';
import PortfolioBuilder from './components/Features/PortfolioBuilder';
import CareerOrientation from './components/Features/CareerOrientation';
import LearningPath from './components/Features/LearningPath';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Logged-in Routes */}
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
