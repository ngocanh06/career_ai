import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  return (
    <div className="auth-layout">
      {/* ===== LEFT PANEL ===== */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="auth-brand-name">CareerAI</span>
          </div>
          <p className="auth-left-desc">
            Nền tảng trí tuệ nhân tạo đồng hành cùng hành trình phát triển sự nghiệp của bạn. Định hướng lộ trình, phân tích CV và kết nối tương lai.
          </p>
        </div>

        <div className="auth-insight-card">
          <div className="auth-insight-header">
            <span className="auth-insight-icon">✦</span>
            <span className="auth-insight-label">AI INSIGHT</span>
          </div>
          <p className="auth-insight-text">
            "AI của chúng tôi đã phân tích hơn 10.000 lộ trình sự nghiệp để giúp bạn tìm thấy con đường ngắn nhất đến với công việc mơ ước."
          </p>
        </div>

        <div className="auth-left-footer">
          <span>© 2024 AICPG AI-Powered Platform</span>
          <span className="auth-left-footer-dot">•</span>
          <span>Precision • Pathfinding</span>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-logo">
            <div className="auth-form-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB"/>
                <path d="M2 17L12 22L22 17" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="auth-form-logo-text">CareerAI</span>
          </div>

          <h1 className="auth-form-title">Quên mật khẩu?</h1>
          <p className="auth-form-subtitle">Nhập email của bạn để nhận link đặt lại mật khẩu</p>

          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="auth-field">
              <label className="auth-label">Email đăng ký</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input id="forgot-email" type="email" className="auth-input" placeholder="abc123@gmail.com" autoComplete="email"/>
              </div>
            </div>

            <button id="forgot-submit" type="submit" className="auth-submit-btn">
              Gửi link đặt lại &nbsp;→
            </button>
          </form>

          <p className="auth-register-link" style={{ marginTop: '24px' }}>
            <Link to="/login" className="auth-register-link-anchor">← Quay lại đăng nhập</Link>
          </p>

          <p className="auth-security-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Kết nối được mã hóa 256-bit AES
          </p>
        </div>
      </div>
    </div>
  );
}
