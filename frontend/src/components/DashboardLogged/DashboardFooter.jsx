import React from 'react';

export default function DashboardFooter() {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer-inner">
        {/* Brand */}
        <div className="dashboard-footer-brand">
          <div className="dashboard-footer-logo">
            <div className="dashboard-footer-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 12 15 2 8.5 12 2"/>
                <polyline points="2 15.5 12 22 22 15.5"/>
                <polyline points="2 12 12 18.5 22 12"/>
              </svg>
            </div>
            <span className="dashboard-footer-logo-text">CareerAI</span>
          </div>
          <p className="dashboard-footer-desc">
            Nền tảng phát triển sự nghiệp được hỗ trợ bởi AI<br />
            hàng đầu Việt Nam.
          </p>
        </div>

        {/* Links */}
        <div className="dashboard-footer-links">
          <a href="/status" className="dashboard-footer-link">Trạng thái hệ thống</a>
          <a href="/privacy" className="dashboard-footer-link">Chính sách bảo mật</a>
          <a href="/terms" className="dashboard-footer-link">Điều khoản dịch vụ</a>
          <a href="/support" className="dashboard-footer-link">Trang tìm hỗ trợ</a>
        </div>
      </div>

      <div className="dashboard-footer-bottom">
        <span>© 2025 CareerAI. All rights reserved.</span>
      </div>
    </footer>
  );
}