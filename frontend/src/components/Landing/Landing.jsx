import React from 'react';
import { Link } from 'react-router-dom';
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

export default function Landing() {
  const companies = [
    { name: 'Pinterest', logo: logoPinterest, alt: 'Pinterest logo' },
    { name: 'Spotify', logo: logoSpotify, alt: 'Spotify logo' },
    { name: "Lowe's", logo: logoLowe, alt: "Lowe's logo" },
    { name: 'airbnb', logo: logoAirbnb, alt: 'Airbnb logo' },
    { name: 'slack', logo: logoSlack, alt: 'Slack logo' },
    { name: 'Dropbox', logo: logoDropbox, alt: 'Dropbox logo' },
    { name: 'LinkedIn', logo: logoLinkedin, alt: 'LinkedIn logo' },
    { name: "macy's", logo: logoMacys, alt: "Macy's logo" },
    { name: 'Walmart', logo: logoWalmart, alt: 'Walmart logo' }
  ];

  return (
    <div className="landing">
      {/* HEADER / NAVBAR */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <div className="logo-box">C</div>
            <span>CareerAI</span>
          </div>
          <nav className="nav">
            <Link to="/" className="active">Trang chủ</Link>
            <Link to="/profile">Hồ sơ</Link>
            <Link to="/career">Nghề nghiệp</Link>
            <Link to="/tools">Công cụ</Link>
            <Link to="/learning">Lộ trình học tập</Link>
          </nav>
          
          {/* Đã chuyển đổi từ <button> sang <Link> để kết nối sang Login/Register */}
          <div className="auth-buttons">
            <Link to="/register" className="btn-signup" style={{ textDecoration: 'none', display: 'inline-block', textAlignment: 'center' }}>
              Đăng ký
            </Link>
            <Link to="/login" className="btn-login" style={{ textDecoration: 'none', display: 'inline-block', textAlignment: 'center' }}>
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
              <li><Link to="/profile">Hồ sơ</Link></li>
              <li><Link to="/career">Nghề nghiệp</Link></li>
              <li><Link to="/learning">Lộ trình học tập</Link></li>
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
              <input type="email" placeholder="Enter your email" />
              <i className="fa-regular fa-envelope newsletter-mail-icon"></i>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright © 2026 CareerAI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}