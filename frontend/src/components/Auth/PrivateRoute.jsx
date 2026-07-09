import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute – bảo vệ các route yêu cầu đăng nhập.
 * Nếu chưa đăng nhập (không có career_user trong localStorage),
 * người dùng sẽ bị chuyển hướng về trang chủ (dashboard_unlogged).
 */
export default function PrivateRoute({ children }) {
  const user = localStorage.getItem('career_user');

  if (!user) {
    // Chưa đăng nhập → về trang chủ (Landing = dashboard_unlogged)
    return <Navigate to="/" replace />;
  }

  return children;
}
