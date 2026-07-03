import React from 'react';
import Sidebar from './Sidebar';
import DashboardFooter from './DashboardFooter';
import './DashboardLayout.css';

export default function DashboardLayout({ children, showTopbar = false, user }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Nội dung chính cuộn */}
      <div className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
        <DashboardFooter />
      </div>
    </div>
  );
}
