import React, { useState, useEffect, useRef } from 'react';
import './Auth.css';

export default function OtpVerification({ email, onVerify, onResend, onBack, isSubmitting }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    if (timeLeft <= 0) {
      setError('Mã OTP đã hết hạn, vui lòng gửi lại mã.');
      return;
    }
    onVerify(otpCode, setError);
  };

  const handleResend = () => {
    setTimeLeft(300);
    setOtp(['', '', '', '', '', '']);
    setError('');
    onResend(setError);
  };

  return (
    <div className="auth-form-card otp-card">
      <div className="auth-form-logo">
        <img src="/logo.png" alt="CareerAI" className="auth-form-logo-img" />
        <span className="auth-form-logo-text">CareerAI</span>
      </div>

      <h1 className="auth-form-title">Xác thực Email</h1>
      <p className="auth-form-subtitle">
        Chúng tôi đã gửi mã xác thực 6 số đến email <br/>
        <strong>{email}</strong>
      </p>

      {error && (
        <div className="auth-error-msg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="otp-inputs-container">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className={`otp-input ${error ? 'error' : ''}`}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button 
          type="submit" 
          className="auth-submit-btn" 
          disabled={isSubmitting || otp.join('').length < 6}
          style={{ marginTop: '24px' }}
        >
          {isSubmitting ? (
            <div className="auth-loader"></div>
          ) : (
            'Xác nhận mã'
          )}
        </button>
      </form>

      <div className="otp-footer">
        <div className="otp-timer">
          {timeLeft > 0 ? (
            <span>Mã hết hạn sau: <strong>{formatTime(timeLeft)}</strong></span>
          ) : (
            <span style={{ color: '#ef4444' }}>Mã OTP đã hết hạn</span>
          )}
        </div>

        <button 
          className={`otp-resend-btn ${timeLeft > 0 ? 'disabled' : ''}`} 
          onClick={handleResend}
          disabled={timeLeft > 0 || isSubmitting}
        >
          Gửi lại mã
        </button>
      </div>

      {onBack && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" onClick={onBack} className="fp-back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
