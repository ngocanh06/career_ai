import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OtpVerification from './OtpVerification';
import './Auth.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Reset Password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // 1. Gửi yêu cầu OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Xác thực OTP
  const handleVerifyOtp = async (code, setOtpError) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await res.json();
      if (data.success) {
        setOtpCode(code);
        setStep(3);
      } else {
        setOtpError(data.message || 'Mã OTP không đúng.');
      }
    } catch (err) {
      setOtpError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, new_password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/login');
      } else {
        setError(data.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async (setOtpError) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!data.success) {
        setOtpError(data.message || 'Có lỗi khi gửi lại OTP.');
      }
    } catch (err) {
      setOtpError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // === RENDER STEP 2: OTP ===
  if (step === 2) {
    return (
      <div className="fp-layout">
        <OtpVerification 
          email={email}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          onBack={() => setStep(1)}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

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
        {step === 1 ? (
          <>
            <h1 className="fp-title">Quên mật khẩu?</h1>
            <p className="fp-subtitle">
              Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi mã xác thực (OTP) cho bạn.
            </p>

            {error && (
              <div className="auth-error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleRequestOtp}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button id="forgot-submit" type="submit" className="auth-submit-btn" style={{ marginTop: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? <div className="auth-loader"></div> : 'Gửi yêu cầu \u00a0\u2192'}
              </button>
            </form>
          </>
        ) : (
          /* STEP 3: RESET PASSWORD */
          <>
            <h1 className="fp-title">Đặt lại mật khẩu</h1>
            <p className="fp-subtitle">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            {error && (
              <div className="auth-error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="auth-field">
                <label className="auth-label">Mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input type={showPassword ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Xác nhận mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input type={showConfirm ? 'text' : 'password'} className="auth-input" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" style={{ marginTop: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? <div className="auth-loader"></div> : 'Xác nhận đổi mật khẩu \u00a0\u2192'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" className="fp-back-link">← Quay lại trang đăng nhập</Link>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#6b7280',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#3b5bdb'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Quay lại trang chủ
          </Link>
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
