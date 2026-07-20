import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute – Auth Guard bảo vệ các route yêu cầu đăng nhập.
 *
 * Kiểm tra 2 lớp:
 *  1. Tồn tại key 'career_user' trong localStorage
 *  2. Dữ liệu parse được thành JSON hợp lệ và có user_id
 *
 * Nếu không hợp lệ → xóa dữ liệu rác và chuyển hướng về /login.
 * Dùng `replace` để ngăn người dùng nhấn Back quay lại sau khi logout.
 */
export default function PrivateRoute({ children }) {
  let isAuthenticated = false;

  try {
    const raw = localStorage.getItem('career_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Yêu cầu tối thiểu: phải có user_id (do backend trả về)
      isAuthenticated = !!(parsed && parsed.user_id);
    }
  } catch {
    // JSON lỗi → dọn dẹp dữ liệu rác
    localStorage.removeItem('career_user');
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
