import React from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './LearningPath.css';

// Import FontAwesome Icons
import {
  FaWandMagicSparkles,
  FaDownload,
  FaRoute,
  FaCalendarDay,
  FaCheck,
  FaBolt,
  FaLock,
  FaBookOpen,
  FaClock,
  FaStar,
  FaArrowRight,
  FaChartSimple,
  FaFileArrowUp,
  FaChartPie, // Icon cho khóa học 1
  FaChartLine // Icon cho khóa học 2
} from "react-icons/fa6";

const courses = [
  {
    id: 1,
    title: 'Data Visualization Specialization',
    desc: 'Hướng dẫn toàn diện về Power BI và Tableau với các bộ dữ liệu thực tế.',
    hours: 14,
    level: 'NÂNG CAO',
    type: 'ĐỀ XUẤT',
    badgeClass: 'lp-badge-recommend',
    icon: <FaChartPie style={{ fontSize: '24px', color: '#3b5bdb' }} /> // Đã đổi sang FontAwesome
  },
  {
    id: 2,
    title: 'Tableau Desktop Specialist',
    desc: 'Chuẩn bị cho kỳ thi và đi sâu vào việc tạo bảng điều khiển và kể chuyện.',
    hours: 8,
    level: 'TRUNG CẤP',
    type: 'THỰC TẾ',
    badgeClass: 'lp-badge-practice',
    icon: <FaChartLine style={{ fontSize: '24px', color: '#10b981' }} /> // Đã đổi sang FontAwesome
  }
];

const skills = [
  { name: 'SQL / Cơ sở dữ liệu', pct: 100, target: null },
  { name: 'Thống kê', pct: 95, target: null },
  { name: 'Power BI / Tableau', pct: 65, target: 90 },
  { name: 'Học máy', pct: 10, target: 75, low: true },
];

export default function LearningPath() {
  return (
    <DashboardLayout user={{ name: 'Ngọc Anh' }}>
      <div className="lp-page">
        
        {/* Hero Card */}
        <div className="lp-hero-card">
          <div className="lp-hero-body">
            <div className="lp-hero-badge">
              <FaWandMagicSparkles style={{ fontSize: '14px', marginRight: '6px' }} />
              LỘ TRÌNH AI CÁ NHÂN HÓA
            </div>
            <h1 className="lp-hero-title">Mục tiêu: <span>Chuyên viên phân tích dữ liệu cấp cao</span></h1>
            <p className="lp-hero-sub">Hành trình 3 tháng được thiết kế riêng để bạn chinh phục các kỹ năng còn thiếu và bứt phá sự nghiệp.</p>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary">
                <FaDownload style={{ marginRight: '6px' }} />
                Xuất lộ trình PDF
              </button>
              <button className="lp-btn-outline">Tùy chỉnh lộ trình</button>
            </div>
          </div>
          
          <div className="lp-hero-progress">
            <div className="lp-circle-wrap">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#3b5bdb" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42 * 0.7} ${2 * Math.PI * 42}`} transform="rotate(-90 50 50)" />
              </svg>
              <div className="lp-circle-inner">
                <span className="lp-circle-pct">70%</span>
                <span className="lp-circle-label">HOÀN TẤT</span>
              </div>
            </div>
            <div className="lp-hero-badge-bottom">+15% tuần này</div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="lp-journey-card">
          <div className="lp-journey-header">
            <div className="lp-journey-header-left">
              <div className="lp-journey-icon">
                <FaRoute style={{ color: '#3b5bdb', fontSize: '18px' }} />
              </div>
              <div>
                <h2 className="lp-journey-title">Hành trình chinh phục</h2>
                <p className="lp-journey-sub">Các cột mốc chiến lược tiếp theo của bạn</p>
              </div>
            </div>
            <div className="lp-journey-date">
              <FaCalendarDay style={{ marginRight: '6px' }} />
              Tháng 6, 2026
            </div>
          </div>

          <div className="lp-timeline">
            {/* Step 1 */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot done">
                <FaCheck style={{ color: 'white', fontSize: '14px' }} />
              </div>
              <p className="lp-step-month active-label">THÁNG 1</p>
              <p className="lp-step-name active-label" style={{color:'#111827'}}>Nền tảng</p>
              <p className="lp-step-desc">SQL, Thống kê nâng cao &amp; Xử lý dữ liệu</p>
            </div>
            <div className="lp-timeline-connector" style={{ background: '#3b5bdb' }} />
            
            {/* Step 2 (Active) */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot active">
                <FaBolt style={{ color: '#3b5bdb', fontSize: '14px' }} />
              </div>
              <p className="lp-step-month active-label">THÁNG 2 (HIỆN TẠI)</p>
              <p className="lp-step-name active-label">Trực quan hóa</p>
              <p className="lp-step-desc">Power BI, Tableau &amp; Kể chuyện qua dữ liệu</p>
            </div>
            <div className="lp-timeline-connector" style={{ background: '#e5e7eb' }} />
            
            {/* Step 3 (Upcoming) */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot upcoming">
                <FaLock style={{ color: '#d1d5db', fontSize: '12px' }} />
              </div>
              <p className="lp-step-month">THÁNG 3</p>
              <p className="lp-step-name">Học máy</p>
              <p className="lp-step-desc">Cơ bản về Scikit-Learn &amp; Dự báo</p>
            </div>
          </div>
        </div>

        {/* 2-Col Content */}
        <div className="lp-two-col">
          {/* Main Left - Resources */}
          <div className="lp-resources-section">
            <div className="lp-section-header">
              <div className="lp-section-header-left">
                <FaBookOpen style={{ color: '#3b5bdb', fontSize: '18px' }} />
                <h3 className="lp-section-title">Tài nguyên học tập tháng 6</h3>
              </div>
              <button className="lp-see-all">Xem tất cả</button>
            </div>

            <div className="lp-courses-grid">
              {courses.map(c => (
                <div key={c.id} className="lp-course-card">
                  <div className="lp-course-card-top">
                    <div className="lp-course-icon">{c.icon}</div>
                    <span className={`lp-course-badge ${c.badgeClass}`}>{c.type}</span>
                  </div>
                  <h4 className="lp-course-name">{c.title}</h4>
                  <p className="lp-course-desc">{c.desc}</p>
                  <div className="lp-course-meta">
                    <div className="lp-course-meta-item">
                      <FaClock style={{ marginRight: '6px' }} />
                      {c.hours} GIỜ
                    </div>
                    <div className="lp-course-level">
                      <FaStar style={{ marginRight: '4px', color: 'currentColor' }} />
                      {c.level}
                    </div>
                  </div>
                  <button className="lp-course-btn">Bắt đầu học ngay</button>
                </div>
              ))}
            </div>

            <div className="lp-skill-gap-box">
              <h4 className="lp-skill-gap-title">Phân tích lỗ hổng kỹ năng của AI</h4>
              <p className="lp-skill-gap-desc">Tập trung vào <span>Công thức DAX</span> trong tuần này có thể rút ngắn lộ trình của bạn thêm 15%.</p>
              <button className="lp-skill-gap-link">
                Làm bài kiểm tra ngay
                <FaArrowRight style={{ marginLeft: '6px' }} />
              </button>
            </div>
          </div>

          {/* Sidebar Right - Analysis & Sync */}
          <div className="lp-sidebar">
            <div className="lp-skill-card">
              <h3 className="lp-skill-card-title">
                <FaChartSimple style={{ color: '#3b5bdb', fontSize: '16px' }} />
                Phân tích kỹ năng
              </h3>
              
              <div className="lp-skill-rows">
                {skills.map(s => (
                  <div key={s.name} className="lp-skill-row">
                    <div className="lp-skill-row-header">
                      <span className="lp-skill-row-name">{s.name}</span>
                      <span className={`lp-skill-row-pct ${s.target ? 'has-target' : ''}`}>
                        {s.target ? <>{s.pct}% / <span>{s.target}%</span></> : `${s.pct}%`}
                      </span>
                    </div>
                    <div className="lp-skill-track">
                      <div className="lp-skill-fill" style={{ width: `${s.pct}%`, background: s.low ? '#e5e7eb' : '#3b5bdb' }} />
                      {s.target && (
                        <div className="lp-skill-target-marker" style={{ left: `${s.target}%` }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lp-readiness">
                <div className="lp-readiness-circle">
                  <svg width="110" height="110" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#3b5bdb" strokeWidth="12" />
                  </svg>
                  <div className="lp-readiness-inner">
                    <span className="lp-readiness-pct">70%</span>
                    <span className="lp-readiness-sub">Sẵn sàng<br/>nghề nghiệp</span>
                  </div>
                </div>
                <p className="lp-readiness-desc">Bạn chỉ còn <span>5 cột mốc</span> để hoàn thiện bộ kỹ năng Senior.</p>
              </div>
            </div>

            <div className="lp-sync-card">
              <div className="lp-sync-icon">
                <FaFileArrowUp style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <h3 className="lp-sync-title">Đồng bộ kỹ năng vào CV</h3>
              <p className="lp-sync-desc">Tự động cập nhật các chứng chỉ và kỹ năng mới vào hồ sơ chuyên môn của bạn.</p>
              <button className="lp-sync-btn">Cập nhật CV ngay</button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}