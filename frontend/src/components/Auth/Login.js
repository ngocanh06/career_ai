import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      {/* ===== LEFT PANEL ===== */}
      <div className="auth-left">
        <div className="auth-left-inner">
          {/* Logo */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="auth-brand-name">CareerAI</span>
          </div>

          {/* Description */}
          <p className="auth-left-desc">
            Nền tảng trí tuệ nhân tạo đồng hành cùng hành trình phát triển sự nghiệp của bạn. Định hướng lộ trình, phân tích CV và kết nối tương lai.
          </p>
        </div>

        {/* AI Insight card */}
        <div className="auth-insight-card">
          <div className="auth-insight-header">
            <span className="auth-insight-icon">✦</span>
            <span className="auth-insight-label">AI INSIGHT</span>
          </div>
          <p className="auth-insight-text">
            "AI của chúng tôi đã phân tích hơn 10.000 lộ trình sự nghiệp để giúp bạn tìm thấy con đường ngắn nhất đến với công việc mơ ước."
          </p>
        </div>

        {/* Footer */}
        <div className="auth-left-footer">
          <span>© 2024 AICPG AI-Powered Platform</span>
          <span className="auth-left-footer-dot">•</span>
          <span>Precision • Pathfinding</span>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="auth-right">
        <div className="auth-form-card">
          {/* Logo */}
          <div className="auth-form-logo">
            <div className="auth-form-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB" />
                <path d="M2 17L12 22L22 17" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="auth-form-logo-text">CareerAI</span>
          </div>

          {/* Title */}
          <h1 className="auth-form-title">Chào mừng bạn trở lại</h1>
          <p className="auth-form-subtitle">Đăng nhập để tiếp tục lộ trình phát triển sự nghiệp</p>

          {/* Form */}
          <form className="auth-form" onSubmit={handleLogin}>
            {/* Email field */}
            <div className="auth-field">
              <label className="auth-label">Email/Tên đăng nhập</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="text"
                  className="auth-input"
                  placeholder="abc123@gmail.com"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Mật khẩu</label>
                <Link to="/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-checkbox"
              />
              <span className="auth-remember-text">Duy trì đăng nhập</span>
            </label>

            {/* Submit button */}
            <button id="login-submit" type="submit" className="auth-submit-btn">
              Đăng nhập &nbsp;→
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">HOẶC ĐĂNG NHẬP VỚI</span>
              <span className="auth-divider-line" />
            </div>

            {/* Social buttons */}
            <div className="auth-social-row">
              <button type="button" className="auth-social-btn" id="login-google" onClick={handleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button type="button" className="auth-social-btn" id="login-linkedin" onClick={handleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
            </div>
          </form>

          {/* Register link */}
          <p className="auth-register-link">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-register-link-anchor">Đăng ký ngay</Link>
          </p>

          {/* Security notice */}
          <p className="auth-security-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Kết nối được mã hóa 256-bit AES
          </p>
        </div>
      </div>
    </div>
  );
}
