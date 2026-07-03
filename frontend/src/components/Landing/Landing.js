import React from 'react';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">CareerAI</div>
          <nav className="nav">
            <a href="#home">Trang chủ</a>
            <a href="#profile">Hồ sơ</a>
            <a href="#career">Nghề nghiệp</a>
            <a href="#tools">Công cụ</a>
            <a href="#learning">Lộ trình học tập</a>
          </nav>
          <div className="auth-buttons">
            <button className="btn-login">Đăng nhập</button>
            <button className="btn-signup">Đăng kí</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1><strong>Giúp bạn tìm được</strong><br/><span className="highlight">việc làm</span> <strong>và thực</strong><br/><strong>hiện hóa</strong> <span className="highlight">ước mơ</span></h1>
            <p>Mình không chỉ là công cụ, mình còn là người bạn đồng hành sử dụng AI để tìm hiểu kĩ năng và vạch ra lộ trình thăng tiến cá nhân.</p>
            <div className="hero-buttons">
              <button className="btn-primary">Bắt đầu miễn phí →</button>
              <button className="btn-secondary">Tìm hiểu thêm</button>
            </div>
            <div className="hero-stats">
              <div className="avatars">
                <div className="avatar"></div>
                <div className="avatar"></div>
                <div className="avatar"></div>
              </div>
              <span className="stat-number">+10,000</span> <span className="stat-text">chuyên gia đã thăng tiến cùng CareerAI</span>
            </div>
          </div>
          <div className="hero-graphics">
            <div className="graphics-container">
              {/* Cards around robot */}
              <div className="card card-1">
                <div className="card-icon">👤</div>
                <p>Profile</p>
              </div>
              <div className="card card-2">
                <div className="card-icon">📊</div>
                <p>Analytics</p>
              </div>
              <div className="card card-3">
                <div className="card-icon">📈</div>
                <p>Growth</p>
              </div>
              <div className="card card-4">
                <div className="card-icon">📋</div>
                <p>Dashboard</p>
              </div>
              
              {/* Robot in center */}
              <div className="robot-center">🤖</div>
            </div>
            
            {/* Skill card below */}
            <div className="skill-card">
              <div className="skill-header">
                <span className="skill-icon">📄</span>
                <span className="skill-title-text">PHÂN TÍCH CV</span>
              </div>
              <h3>Chi số lương thích: 85%</h3>
              <div className="skill-progress-group">
                <div className="skill-progress-item">
                  <p>Kỹ năng chuyên môn</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '92%'}}></div>
                    <span className="progress-percent">92%</span>
                  </div>
                </div>
                <div className="skill-progress-item">
                  <p>Kỹ năng mềm</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '78%'}}></div>
                    <span className="progress-percent">78%</span>
                  </div>
                </div>
              </div>
              <p className="skill-testimonial">
                <span className="testimonial-icon">⭐</span>
                "Bộ sưu chúng chỉ AWS Solutions Architect có thể tăng cơ hội thăng tiến của bạn lên 35% trong năm nay."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies">
        <h2>Hơn 22,000 công ty hợp tác với chúng tôi để mang đến cơ hội nghề nghiệp!</h2>
        <div className="companies-grid">
          <div className="company-logo">📌</div>
          <div className="company-logo">🎵</div>
          <div className="company-logo">Lowe's</div>
          <div className="company-logo">🏠</div>
          <div className="company-logo">➕</div>
          <div className="company-logo">📦</div>
          <div className="company-logo">in</div>
          <div className="company-logo">★</div>
          <div className="company-logo">🟡</div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="solutions" id="solutions">
        <h2>Giải pháp toàn diện cho<br/>hành trình nghề nghiệp</h2>
        <p>AICPG kết hợp đồi liệu thị trường thực tế với tuế nhân tạo để dưa ra những chỉ dẫn chính xác nhất.</p>
        
        <div className="solutions-grid">
          <div className="solution-card">
            <div className="solution-icon">📄</div>
            <h3>Phân tích CV thông minh</h3>
            <p>Vượt qua các hệ thống lọc hộ sơ (ATS) khác nghiệp nhất. AI của chúng tôi phân tích từng dòng chữ, gợi ý từ khóa và cầu trúc tối ưu để bạn nổi bật hơn.</p>
            <div className="card-tags">
              <span className="tag">Tối ưu ATS</span>
              <span className="tag">Có văn kỹ năng</span>
            </div>
          </div>

          <div className="solution-card">
            <div className="solution-icon">💼</div>
            <h3>Xây dựng Portfolio</h3>
            <p>Tạo đầu chuyên nghiệp với hộ sơ để giới thiệu thành tích và năng lực trực tuyến. Các nhà tuyển dụng sẽ giáy giới thiệu một cách tự nhiên hơn.</p>
            <a href="#" className="card-link">Khám phá các mẫu →</a>
          </div>

          <div className="solution-card">
            <div className="solution-icon">📚</div>
            <h3>Lộ trình học tập</h3>
            <p>Đúng học với quản lý, AI sẽ vạch ra con được ngành nhất để đạt được mục tiêu nghề nghiệp của bạn với các tài liệu học luyến ngành.</p>
          </div>
        </div>

        <div className="data-section">
          <h2>Dữ liệu thị trường thời gian thực</h2>
          <p>Chúng tôi phân tích hàng ngàn tin tuyển dụng mỗi ngày để cập nhật cho bạn những kỹ năng đang "hot" nhất trong lực lương thực tế tại khu vực của bạn.</p>
          <div className="data-stats">
            <div className="stat">
              <h3>500k+</h3>
              <p>Tin tuyển dụng</p>
            </div>
            <div className="stat">
              <h3>200+</h3>
              <p>Vị trí nghề nghiệp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Đối tác nói gì về chúng tôi</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-avatar">👤 Nguyễn Hoàng Long</div>
            <p className="testimonial-role">Trưởng phòng Tuyển dụng</p>
            <p className="testimonial-text">
              "Từ khi tích hợp hệ thống Portfolio trực tuyến của chúng tôi, chất lượng hộ sơ tăng vọt. Giáo dục vì của công ty lý được sử dụng làm giá nền lực chế quản lý Công nghệ vệ Thế tệ tăng với rồi học những động lực test tròn."
            </p>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-avatar">👤 Nguyễn Hoàng Long</div>
            <p className="testimonial-role">Trưởng phòng Tuyển dụng</p>
            <p className="testimonial-text">
              "Từ khi tích hợp hệ thống Portfolio trực tuyến của chúng tôi, chất lượng hộ sơ tăng vọt. Giáo dục vì của công ty lý được sử dụng làm giá nền lực chế quản lý Công nghệ vệ Thế tệ tăng với rồi học những động lực test tròn."
            </p>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="steps">
        <h2>Chi với 3 bước</h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3>Đăng nhập/Đăng kí</h3>
            <p>Người dùng đăng ký tài khoản và cập nhật thông tin đế thích lập những gian quan lý hộ sơ nhân.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3>Tối ưu CV & Portfolio</h3>
            <p>Tải hộ sơ lên để AI phân tích, đồng thời tạo trang trưng bày dự án của ứng dụng trong tuyển dụng của chúng tôi.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3>Kết nối & Thông tin</h3>
            <p>Nhận ngày gáy về việc làm phù hợp với kỹ năng là để học kỹ năng để phát triển bản thân.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CareerAI</h4>
            <ul>
              <li><a href="#home">Trang chủ</a></li>
              <li><a href="#about">Về chúng tôi</a></li>
              <li><a href="#contact">Liên hệ với chúng tôi</a></li>
              <li><a href="#faq">Điều khoản</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Công cụ</h4>
            <ul>
              <li><a href="#tools">Công cụ</a></li>
              <li><a href="#career">Nghề nghiệp</a></li>
              <li><a href="#learning">Lộ trình học tập</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Chính sách</h4>
            <ul>
              <li><a href="#privacy">Điều khoản</a></li>
              <li><a href="#terms">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div className="footer-newsletter">
            <h4>Đăng kí nhận bản tin của chúng tôi và khỏng bao giờ bỏ lỡ cập nhật việc làm nào!</h4>
            <div className="newsletter-input">
              <input type="email" placeholder="Enter your email" />
              <button>📤</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Copyright © 2024 Mansi C. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
