import React from 'react';
import './Dashboard.css';
import robot from '../../assets/images/right.png';

export default function Dashboard() {
	return (
		<div className="dashboard">
			<nav className="dashboard-nav">
				<div className="logo">CareerAI</div>
				<ul className="nav-links">
					<li><i className="fa-solid fa-house"></i> Trang chủ</li>
					<li><i className="fa-regular fa-id-badge"></i> Hồ sơ</li>
					<li><i className="fa-solid fa-briefcase"></i> Nghề nghiệp</li>
					<li><i className="fa-solid fa-toolbox"></i> Công cụ</li>
					<li><i className="fa-solid fa-road"></i> Lộ trình học tập</li>
				</ul>
				<div className="nav-actions">
					<button className="btn btn-outline">Đăng ký</button>
					<button className="btn btn-primary">Đăng nhập</button>
				</div>
			</nav>

			<header className="hero">
				<div className="hero-left">
					<h1 className="hero-title">Giúp bạn tìm được <span className="accent">việc làm</span> và thực hiện hóa <span className="accent">ước mơ</span></h1>

					<div className="search-wrap">
						<input className="search-input" placeholder="Find your idea" />
						<button className="search-btn">Search</button>
					</div>

					<p className="partner-text">Hơn <strong>22,000</strong> công ty hợp tác với chúng tôi để mang đến cơ hội nghề nghiệp!</p>

					<div className="partners">
						<span className="partner">Pinterest</span>
						<span className="partner">Spotify</span>
						<span className="partner">LOWE'S</span>
						<span className="partner">airbnb</span>
						<span className="partner">slack</span>
						<span className="partner">Dropbox</span>
						<span className="partner">LinkedIn</span>
						<span className="partner">macy's</span>
						<span className="partner">Walmart</span>
					</div>
				</div>

				<div className="hero-right">
					<div className="hero-illustration">
						<img src={robot} alt="robot" />
					</div>
				</div>
			</header>

			<section className="features">
				<h2 className="section-title">Tất cả trong một</h2>
				<div className="features-grid">
					<div className="feature-card">Quản lý hồ sơ cá nhân<br/><small>Cập nhật thông tin nhanh chóng</small></div>
					<div className="feature-card">Tạo, upload và Phân tích CV<br/><small>Tự động tối ưu theo chuẩn AI</small></div>
					<div className="feature-card highlight">Tạo và Quản lý Portfolio<br/><small>Số hóa sản phẩm, dự án cá nhân</small></div>
					<div className="feature-card">Gợi ý nghề nghiệp<br/><small>Đề xuất vị trí phù hợp nhất</small></div>
					<div className="feature-card">Phân tích khoảng cách kỹ năng<br/><small>Xác định điểm cần cải thiện</small></div>
					<div className="feature-card">Xây dựng lộ trình học tập<br/><small>Định hướng khóa học chuyên sâu</small></div>
				</div>
			</section>

			<section className="steps">
				<h2 className="section-title">Chỉ với <span className="accent">3 bước</span></h2>
				<div className="steps-grid">
					<div className="step-card">
						<div className="step-icon">1</div>
						<h3>Đăng nhập/Đăng ký</h3>
						<p>Người dùng đăng ký tài khoản và cập nhật thông tin để thiết lập quản lý hồ sơ cá nhân.</p>
					</div>
					<div className="step-card">
						<div className="step-icon">2</div>
						<h3>Tối ưu CV & Portfolio</h3>
						<p>Tải hồ sơ lên để AI phân tích tự động và tạo trang trình bày ấn tượng.</p>
					</div>
					<div className="step-card">
						<div className="step-icon">3</div>
						<h3>Kết nối & Thăng tiến</h3>
						<p>Nhận gợi ý việc làm chuẩn gửi, biết mình thiếu kỹ năng gì để học và phát triển.</p>
					</div>
				</div>
			</section>
		</div>
	);
}
