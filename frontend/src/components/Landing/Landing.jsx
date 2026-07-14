import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Landing.css';
import rightImage from '../../assets/images/right.png';
import logoPinterest from '../../assets/images/logo/logo-pinterest.png';
import logoSpotify from '../../assets/images/logo/logo-spotify.png';
import logoLowe from '../../assets/images/logo/logo-lowe.png';
import logoAirbnb from '../../assets/images/logo/logo-airbnb.png';
import logoSlack from '../../assets/images/logo/logo-slack.png';
import logoLinkedin from '../../assets/images/logo/logo-linkedin.png';
import logoDropbox from '../../assets/images/logo/logo-dropbox.png';
import logoMacys from '../../assets/images/logo/logo-macys.png';
import logoWalmart from '../../assets/images/logo/logo-walmart.png';
import logoMain from '../../assets/images/logo/logo-career.png';

/* ── Modal yêu cầu đăng nhập ── */
function AuthRequiredModal({ featureName, onClose }) {
  const navigate = useNavigate();

  // Đóng modal khi click ra ngoài overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal-box">
        {/* Icon khóa */}
        <div className="auth-modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0458E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Nội dung */}
        <h2 className="auth-modal-title">Yêu cầu đăng nhập</h2>
        <p className="auth-modal-desc">
          Bạn cần đăng nhập để sử dụng chức năng
          {featureName ? <> <strong>"{featureName}"</strong></> : ''}.
          <br />
          Hãy đăng nhập hoặc tạo tài khoản miễn phí ngay!
        </p>

        {/* Buttons */}
        <div className="auth-modal-actions">
          <button
            className="auth-modal-btn-login"
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </button>
          <button
            className="auth-modal-btn-register"
            onClick={() => navigate('/register')}
          >
            Tạo tài khoản
          </button>
        </div>

        {/* Đóng */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Đóng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const companies = [
    { name: 'Pinterest', logo: logoPinterest, alt: 'Pinterest logo' },
    { name: 'Spotify', logo: logoSpotify, alt: 'Spotify logo' },
    { name: "Lowe's", logo: logoLowe, alt: "Lowe's logo" },
    { name: 'airbnb', logo: logoAirbnb, alt: 'Airbnb logo' },
    { name: 'slack', logo: logoSlack, alt: 'Slack logo' },
    { name: 'Dropbox', logo: logoDropbox, alt: 'Dropbox logo' },
    { name: 'LinkedIn', logo: logoLinkedin, alt: 'LinkedIn logo' },
    { name: "macy's", logo: logoMacys, alt: "Macy's logo" },
    { name: 'Walmart', logo: logoWalmart, alt: 'Walmart logo' },
    { name: 'Main', logo: logoMain, alt: 'Main logo' },
  ];

  // State quản lý modal yêu cầu đăng nhập
  const [modal, setModal] = useState(null); // null | { featureName: string }

  // State cho form validation
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    setSearchError('');
    // TODO: implement search logic
    console.log('Searching for:', searchQuery);
  };

  const handleSubscribe = () => {
    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email');
      setEmailSuccess('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Địa chỉ email không hợp lệ');
      setEmailSuccess('');
      return;
    }
    setEmailError('');
    setEmailSuccess('Đăng ký nhận bản tin thành công!');
    setEmail('');
  };

  const requireLogin = (featureName) => {
    let isLoggedIn = false;

    try {
      const raw = localStorage.getItem('career_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Kiểm tra nhất quán với PrivateRoute: phải có user_id
        isLoggedIn = !!(parsed && parsed.user_id);
      }
    } catch (e) {
      // JSON lỗi → dọn dẹp dữ liệu rác
      localStorage.removeItem('career_user');
    }

    if (isLoggedIn) {
      // Đã đăng nhập, điều hướng tương ứng
      if (featureName === 'Hồ sơ') navigate('/profile');
      else if (featureName === 'Nghề nghiệp') navigate('/career');
      else if (featureName === 'Công cụ') navigate('/dashboard');
      else if (featureName === 'Lộ trình học tập') navigate('/learning-path');
      return true;
    }

    // Chưa đăng nhập → hiện modal xác thực
    setModal({ featureName });
    return false;
  };

  // Xác định user đang đăng nhập để đổi nút header
  let loggedInUser = null;
  try {
    const raw = localStorage.getItem('career_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user_id) {
        loggedInUser = parsed;
      }
    }
  } catch (e) {}

  return (
    <div className="landing">
      {/* Modal yêu cầu đăng nhập */}
      {modal && (
        <AuthRequiredModal
          featureName={modal.featureName}
          onClose={() => setModal(null)}
        />
      )}
      {/* HEADER / NAVBAR */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <img src="/logo.png" alt="CareerAI" className="landing-logo-img" />
            <span>CareerAI</span>
          </div>
          <nav className="nav">
            <Link to="/" className="active">Trang chủ</Link>
            <button type="button" className="nav-btn-link" onClick={(e) => { e.preventDefault(); requireLogin('Hồ sơ'); }}>Hồ sơ</button>
            <button type="button" className="nav-btn-link" onClick={(e) => { e.preventDefault(); requireLogin('Nghề nghiệp'); }}>Nghề nghiệp</button>
            <button type="button" className="nav-btn-link" onClick={(e) => { e.preventDefault(); requireLogin('Công cụ'); }}>Công cụ</button>
            <button type="button" className="nav-btn-link" onClick={(e) => { e.preventDefault(); requireLogin('Lộ trình học tập'); }}>Lộ trình học tập</button>
          </nav>
          
          {/* Đã chuyển đổi từ <button> sang <Link> để kết nối sang Login/Register */}
          <div className="auth-buttons">
            <Link to="/register" className="btn-signup" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
              Đăng ký
            </Link>
            <Link to="/login" className="btn-login" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1>
              Giúp bạn tìm được <br />
              <span className="highlight">việc làm</span> và thực <br />
              hiện hóa <span className="highlight">ước mơ</span>
            </h1>
            <p className="hero-description">
              Không chỉ là công cụ, CareerAI là người bạn đồng hành ứng dụng trí tuệ nhân tạo để thấu hiểu năng lực và vạch ra lộ trình thăng tiến cá nhân dành riêng cho bạn.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn-primary" style={{ textDecoration: 'none' }}>Bắt đầu miễn phí →</Link>
              <button className="btn-secondary">Tìm hiểu thêm</button>
            </div>
            
            {/* Social Proof */}
            <div className="hero-stats">
              <div className="avatars">
                <div className="avatar pic-1"><i className="fa-regular fa-user"></i></div>
                <div className="avatar pic-2"><i className="fa-regular fa-user"></i></div>
                <div className="avatar pic-3"><i className="fa-regular fa-user"></i></div>
              </div>
              <div className="stat-text-wrapper">
                <span className="stat-text">
                  <strong className="stat-number">+10,000</strong> chuyên gia đã thăng tiến cùng CareerAI
                </span>
              </div>
            </div>
          </div>

          {/* Khối đồ họa bên phải */}
          <div className="hero-graphics">
            <div className="graphics-container">
              <img src={rightImage} alt="AI Robot Illustration" className="hero-right-image" />
            </div>
            
            {/* Skill Card */}
            <div className="skill-card">
              <div className="skill-header">
                <div className="badge-icon-box"><i className="fa-regular fa-file-lines"></i></div>
                <span className="skill-title-text">PHÂN TÍCH CV</span>
              </div>
              <h3 className="compat-score">Chỉ số tương thích: <span className="score-blue">85%</span></h3>
              <div className="skill-progress-group">
                <div className="skill-progress-item">
                  <div className="progress-info">
                    <span>Kỹ năng chuyên môn</span>
                    <span className="percent-blue">92%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill fill-blue" style={{width: '92%'}}></div>
                  </div>
                </div>
                <div className="skill-progress-item">
                  <div className="progress-info">
                    <span>Kỹ năng mềm</span>
                    <span className="percent-teal">78%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill fill-teal" style={{width: '78%'}}></div>
                  </div>
                </div>
              </div>
              <div className="skill-testimonial">
                <span className="testimonial-icon"><i className="fa-solid fa-star"></i></span>
                <p>
                  "Sở hữu chứng chỉ <strong>AWS Solutions Architect</strong> có thể tăng cơ hội thăng tiến của bạn lên <span className="highlight-amber">35%</span> trong năm nay."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANIES SECTION */}
      <section className="companies">
        <h2 className="companies-title">
          Hơn <span className="highlight-count">22,000</span> công ty hợp tác với chúng tôi để mang đến cơ hội nghề nghiệp!
        </h2>
        <div className="companies-grid">
          {companies.map((company, idx) => (
            <div key={idx} className="company-logo-item">
              {company.logo ? (
                <img src={company.logo} alt={company.alt || `${company.name} logo`} className="company-logo-image" />
              ) : (
                <i className={`${company.icon}`} style={{ color: company.color }}></i>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section className="solutions" id="solutions">
        <div className="solutions-header">
          <h2>Giải pháp toàn diện cho<br/>hành trình nghề nghiệp</h2>
          <p className="solutions-subtitle">CareerAI kết hợp dữ liệu thị trường thực tế với trí tuệ nhân tạo để đưa ra những chỉ dẫn chính xác nhất.</p>
        </div>
        <div className="solutions-top-grid">
          <div className="solution-card">
            <div className="solution-icon-wrapper blue-icon"><i className="fa-regular fa-file-lines"></i></div>
            <h3>Phân tích CV thông minh</h3>
            <p>Vượt qua các hệ thống lọc hồ sơ (ATS) khác nghiệt nhất. AI của chúng tôi phân tích từng câu chữ, gợi ý từ khóa và cấu trúc tối ưu để làm nổi bật thế mạnh của bạn.</p>
            <div className="card-tags">
              <span className="tag-link"><i className="fa-regular fa-eye"></i> Tối ưu ATS</span>
              <span className="tag-link"><i className="fa-regular fa-compass"></i> Có vấn kỹ năng</span>
            </div>
          </div>
          <div className="solution-card">
            <div className="solution-icon-wrapper blue-icon"><i className="fa-solid fa-briefcase"></i></div>
            <h3>Xây dựng Portfolio</h3>
            <p>Tạo dấu ấn chuyên nghiệp với hồ sơ năng lực trực tuyến. Các mẫu thiết kế được tinh chỉnh để gây ấn tượng mạnh với nhà tuyển dụng ngay từ cái nhìn đầu tiên.</p>
            <Link to="/templates" className="explore-link">Khám phá các mẫu →</Link>
          </div>
        </div>

        <div className="solutions-bottom-grid">
          <div className="solution-card route-card">
            <div className="solution-icon-wrapper purple-icon"><i className="fa-solid fa-code-branch"></i></div>
            <h3>Lộ trình học tập</h3>
            <p>Đừng học mù quáng. AI sẽ vạch ra con đường ngắn nhất để đạt được mục tiêu sự nghiệp của bạn với các tài liệu chọn lọc và cột mốc rõ ràng.</p>
            <div className="mini-timeline">
              <div className="timeline-step active">
                <div className="timeline-icon"><i className="fa-solid fa-check"></i></div>
                <span>BẮT ĐẦU</span>
              </div>
              <span className="line"></span>
              <div className="timeline-step current">
                <div className="timeline-icon"><i className="fa-regular fa-compass"></i></div>
                <span>ĐANG HỌC</span>
              </div>
              <span className="line dashed"></span>
              <div className="timeline-step future">
                <div className="timeline-icon"><i className="fa-solid fa-bullseye"></i></div>
                <span>MỤC TIÊU</span>
              </div>
            </div>
          </div>

          <div className="data-section">
            <div className="data-content">
              <h2>Dữ liệu thị trường thời gian thực</h2>
              <p>Chúng tôi phân tích hàng ngàn tin tuyển dụng mỗi giờ để cập nhật cho bạn những kỹ năng đang "khát" nhân lực và mức lương thực tế tại khu vực của bạn.</p>
              <div className="data-stats">
                <div className="stat-box">
                  <h3>500k+</h3>
                  <p>TIN TUYỂN DỤNG</p>
                </div>
                <div className="stat-box">
                  <h3>200+</h3>
                  <p>VỊ TRÍ NGHỀ NGHIỆP</p>
                </div>
              </div>
            </div>
            <div className="data-chart-mock">
              <div className="bar bar-1"></div>
              <div className="bar bar-2"></div>
              <div className="bar bar-3 active"></div>
              <div className="bar bar-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 STEPS SECTION */}
      <section className="steps">
        <h2>Chỉ với <span className="highlight-blue">3 bước</span></h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number"><i className="fa-regular fa-user"></i></div>
            <h3>Đăng nhập/Đăng ký</h3>
            <p>Người dùng đăng ký tài khoản nhanh chóng và cập nhật thông tin để thiết lập không gian quản lý hồ sơ cá nhân.</p>
          </div>
          <div className="step-arrow"><i className="fa-solid fa-arrow-right-long"></i></div>
          <div className="step-item">
            <div className="step-number"><i className="fa-regular fa-file-lines"></i></div>
            <h3>Tối ưu CV & Portfolio</h3>
            <p>Tải hồ sơ lên để AI phân tích chuyên sâu, đồng thời tự động tạo trang trưng bày dự án ấn tượng trên nền tảng.</p>
          </div>
          <div className="step-arrow"><i className="fa-solid fa-arrow-right-long"></i></div>
          <div className="step-item">
            <div className="step-number"><i className="fa-solid fa-magnifying-glass"></i></div>
            <h3>Kết nối việc làm</h3>
            <p>Nhận ngay gợi ý về công việc phù hợp với kỹ năng hiện tại, kèm các khóa học bồi dưỡng để bứt phá bản thân.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CareerAI</h4>
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/contact">Liên hệ với chúng tôi</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Công cụ</h4>
            <ul>
              <li><button type="button" className="footer-nav-btn" onClick={(e) => { e.preventDefault(); requireLogin('Hồ sơ'); }}>Hồ sơ</button></li>
              <li><button type="button" className="footer-nav-btn" onClick={(e) => { e.preventDefault(); requireLogin('Nghề nghiệp'); }}>Nghề nghiệp</button></li>
              <li><button type="button" className="footer-nav-btn" onClick={(e) => { e.preventDefault(); requireLogin('Lộ trình học tập'); }}>Lộ trình học tập</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Chính sách</h4>
            <ul>
              <li><Link to="/terms">Điều khoản</Link></li>
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            </ul>
          </div>
          <div className="footer-newsletter">
            <h4 className="newsletter-title">Đăng ký nhận bản tin của chúng tôi và không bao giờ bỏ lỡ bất kỳ cập nhật việc làm nào!</h4>
            <div className="newsletter-input-wrapper">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (emailSuccess) setEmailSuccess('');
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubscribe(); }}
              />
              <i 
                className="fa-regular fa-envelope newsletter-mail-icon" 
                onClick={handleSubscribe} 
                style={{ cursor: 'pointer' }}
              ></i>
            </div>
            {emailError && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{emailError}</div>}
            {emailSuccess && <div style={{ color: '#10b981', fontSize: '13px', marginTop: '8px' }}>{emailSuccess}</div>}
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright © 2026 CareerAI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}