import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSuccess(true);
  };

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

        {!isSuccess ? (
        <form className="auth-form" onSubmit={handleSubmit}>
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
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="example@career.com"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
              />
            </div>
            {errors.email && <p className="auth-error-msg">{errors.email}</p>}
          </div>

          <button id="forgot-submit" type="submit" className="auth-submit-btn" style={{ marginTop: '8px' }}>
            Gửi yêu cầu &nbsp;→
          </button>
        </form>
        ) : (
          <div className="auth-success-msg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 style={{ color: '#111827', fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Yêu cầu thành công</h3>
            <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
              Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
            </p>
          </div>
        )}

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
