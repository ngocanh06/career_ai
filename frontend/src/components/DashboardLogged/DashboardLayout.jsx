import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardFooter from './DashboardFooter';
import './DashboardLayout.css';

export default function DashboardLayout({ children, user }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Khối nội dung chính bên phải */}
      <div className="dashboard-main">
        {/* Topbar ĐƯỢC GỌI DUY NHẤT Ở ĐÂY, nhận data user từ các trang truyền vào */}
        <Topbar user={user} />
        
        <div className="dashboard-content">
          {children}
        </div>
        
        <DashboardFooter />
      </div>
    </div>
  );
}