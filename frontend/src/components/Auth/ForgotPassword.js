import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  return (
    <div className="fp-layout">
      {/* Brand header */}
      <div className="fp-brand">
        <div className="fp-brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="fp-brand-name">CareerAI</p>
        <p className="fp-brand-tagline">NỀN TẢNG PHÁT TRIỂN SỰ NGHIỆP AI</p>
      </div>

      {/* Card */}
      <div className="fp-card">
        <h1 className="fp-title">Quên mật khẩu?</h1>
        <p className="fp-subtitle">
          Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu cho bạn.
        </p>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-field">
            <label className="auth-label">Địa chỉ Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                id="forgot-email"
                type="email"
                className="auth-input"
                placeholder="example@career.com"
                autoComplete="email"
              />
            </div>
          </div>

          <button id="forgot-submit" type="submit" className="auth-submit-btn" style={{ marginTop: '8px' }}>
            Gửi yêu cầu &nbsp;→
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" className="fp-back-link">← Quay lại trang đăng nhập</Link>
        </div>
      </div>

      {/* Footer */}
      <div className="fp-footer">
        <a href="#" className="fp-footer-link">Điều khoản</a>
        <a href="#" className="fp-footer-link">Chính sách bảo mật</a>
        <a href="#" className="fp-footer-link">Trung tâm hỗ trợ</a>
      </div>
    </div>
  );
}
