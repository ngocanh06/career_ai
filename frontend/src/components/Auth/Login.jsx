import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import file logo PNG của bạn ở đây
import logoCareer from '../../assets/images/logo/logo-career.png';

import { 
  FaRegUser, 
  FaLock, 
  FaRegEye, 
  FaRegEyeSlash, 
  FaShieldHalved, 
  FaWandMagicSparkles 
} from "react-icons/fa6";
import './Auth.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email/Tên đăng nhập không được để trống';
    }
    
    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      {/* ===== LEFT PANEL ===== */}
      <div className="auth-left">
        <div className="auth-left-inner">
          {/* Thay thế SVG bằng thẻ img gọi logo của bạn */}
          <div className="auth-brand">
            <img 
              src={logoCareer} 
              alt="CareerAI Logo" 
              style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }} 
            />
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
            <span className="auth-insight-icon">
              <FaWandMagicSparkles style={{ fontSize: '14px', color: '#60a5fa' }} />
            </span>
            <span className="auth-insight-label">AI INSIGHT</span>
          </div>
          <p className="auth-insight-text">
            "AI của chúng tôi đã phân tích hơn 10.000 lộ trình sự nghiệp để giúp bạn tìm thấy con đường ngắn nhất đến với công việc mơ ước."
          </p>
        </div>

        {/* Footer */}
        <div className="auth-left-footer">
          <span>© 2026 AICPG AI-Powered Platform</span>
          <span className="auth-left-footer-dot">•</span>
          <span>Precision • Pathfinding</span>
        </div>
      </div>

      {/* ===== RIGHT PANEL ===== */}
      <div className="auth-right">
        <div className="auth-form-card">
          
          {/* Thay thế SVG bằng thẻ img gọi logo của bạn ở Panel bên phải */}
          <div className="auth-form-logo">
            <img 
              src={logoCareer} 
              alt="CareerAI Logo" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
            />
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
                  <FaRegUser style={{ color: '#9CA3AF' }} />
                </span>
                <input
                  id="email"
                  type="text"
                  className={`auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="abc123@gmail.com"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                />
              </div>
              {errors.email && <p className="auth-error-msg">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label">Mật khẩu</label>
                <Link to="/forgot-password" className="auth-forgot-link">Quên mật khẩu?</Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <FaLock style={{ color: '#9CA3AF' }} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaRegEye style={{ color: '#9CA3AF' }} /> : <FaRegEyeSlash style={{ color: '#9CA3AF' }} />}
                </button>
              </div>
              {errors.password && <p className="auth-error-msg">{errors.password}</p>}
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
            <FaShieldHalved style={{ marginRight: '6px' }} />
            Kết nối được mã hóa 256-bit AES
          </p>
        </div>
      </div>
    </div>
  );
}