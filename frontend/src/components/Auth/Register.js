import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = chọn vai trò, 2 = điền thông tin
  const [role, setRole] = useState(''); // 'student' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const LeftPanel = () => (
    <div className="auth-left">
      <div className="auth-left-inner">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  );

  /* ── STEP 1: Chọn vai trò ── */
  if (step === 1) {
    return (
      <div className="auth-layout">
        <LeftPanel />
        <div className="auth-right">
          <div className="auth-form-card reg-role-card">
            {/* Step indicator */}
            <div className="reg-steps">
              <span className="reg-step active" />
              <span className="reg-step" />
              <span className="reg-step" />
            </div>

            <h1 className="auth-form-title reg-role-title">Bắt đầu hành trình của bạn</h1>
            <p className="auth-form-subtitle reg-role-subtitle">Chọn vai trò phù hợp nhất với mục tiêu của bạn.</p>

            {/* Role cards */}
            <div className="reg-roles">
              <button
                type="button"
                id="role-student"
                className={`reg-role-btn ${role === 'student' ? 'selected' : ''}`}
                onClick={() => setRole('student')}
              >
                <div className="reg-role-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="reg-role-info">
                  <span className="reg-role-name">Sinh viên / Người tìm việc</span>
                  <span className="reg-role-desc">Tôi muốn xây dựng CV và tìm lộ trình sự nghiệp.</span>
                </div>
              </button>

              <button
                type="button"
                id="role-admin"
                className={`reg-role-btn ${role === 'admin' ? 'selected' : ''}`}
                onClick={() => setRole('admin')}
              >
                <div className="reg-role-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                  </svg>
                </div>
                <div className="reg-role-info">
                  <span className="reg-role-name">Nhà tuyển dụng</span>
                  <span className="reg-role-desc">Tôi muốn quản lý nhân sự và tìm kiếm ứng viên.</span>
                </div>
              </button>
            </div>

            <button
              id="reg-next-btn"
              type="button"
              className="auth-submit-btn"
              disabled={!role}
              onClick={() => setStep(2)}
            >
              Tiếp theo &nbsp;→
            </button>

            <div className="reg-divider-simple" />

            <p className="auth-register-link">
              Bạn đã có tài khoản?<br />
              <Link to="/login" className="auth-register-link-anchor">Đăng nhập ngay &nbsp;→</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP 2: Điền thông tin ── */
  return (
    <div className="auth-layout">
      <LeftPanel />
      <div className="auth-right">
        <div className="auth-form-card">
          {/* Step indicator */}
          <div className="reg-steps">
            <span className="reg-step done" />
            <span className="reg-step active" />
            <span className="reg-step" />
          </div>

          <div className="auth-form-logo">
            <div className="auth-form-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB" />
                <path d="M2 17L12 22L22 17" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="auth-form-logo-text">CareerAI</span>
          </div>

          <h1 className="auth-form-title">Tạo tài khoản mới</h1>
          <p className="auth-form-subtitle">Bắt đầu hành trình phát triển sự nghiệp của bạn</p>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label className="auth-label">Họ và tên</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input id="fullname" type="text" className="auth-input" placeholder="Nguyễn Văn A" autoComplete="name" />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input id="reg-email" type="email" className="auth-input" placeholder="abc123@gmail.com" autoComplete="email" />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Mật khẩu</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="auth-input" placeholder="••••••••" autoComplete="new-password" />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Xác nhận mật khẩu</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} className="auth-input" placeholder="••••••••" autoComplete="new-password" />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="reg-step-nav">
              <button type="button" className="reg-back-btn" onClick={() => setStep(1)}>← Quay lại</button>
              <button id="register-submit" type="submit" className="auth-submit-btn reg-submit-inline">
                Đăng ký &nbsp;→
              </button>
            </div>
          </form>

          <p className="auth-register-link">
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-register-link-anchor">Đăng nhập ngay</Link>
          </p>

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
