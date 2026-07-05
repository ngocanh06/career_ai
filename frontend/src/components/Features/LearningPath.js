import React, { useState } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';
import './LearningPath.css';

const courses = [
  {
    id: 1,
    title: 'Data Visualization Specialization',
    desc: 'Hướng dẫn toàn diện về Power BI và Tableau với các bộ dữ liệu thực tế.',
    hours: 14,
    level: 'NÂNG CAO',
    type: 'ĐỀ XUẤT',
    badgeClass: 'lp-badge-recommend',
    icon: '📊'
  },
  {
    id: 2,
    title: 'Tableau Desktop Specialist',
    desc: 'Chuẩn bị cho kỳ thi và đi sâu vào việc tạo bảng điều khiển và kể chuyện.',
    hours: 8,
    level: 'TRUNG CẤP',
    type: 'THỰC TẾ',
    badgeClass: 'lp-badge-practice',
    icon: '📉'
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
    <DashboardLayout>
      <Topbar user={{ name: 'Ngọc Anh' }} />
      <div className="lp-page">
        
        {/* Hero Card */}
        <div className="lp-hero-card">
          <div className="lp-hero-body">
            <div className="lp-hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              LỘ TRÌNH AI CÁ NHÂN HÓA
            </div>
            <h1 className="lp-hero-title">Mục tiêu: <span>Chuyên viên phân tích dữ liệu cấp cao</span></h1>
            <p className="lp-hero-sub">Hành trình 3 tháng được thiết kế riêng để bạn chinh phục các kỹ năng còn thiếu và bứt phá sự nghiệp.</p>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div>
                <h2 className="lp-journey-title">Hành trình chinh phục</h2>
                <p className="lp-journey-sub">Các cột mốc chiến lược tiếp theo của bạn</p>
              </div>
            </div>
            <div className="lp-journey-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Tháng 6, 2026
            </div>
          </div>

          <div className="lp-timeline">
            {/* Step 1 */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot done">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="lp-step-month active-label">THÁNG 1</p>
              <p className="lp-step-name active-label" style={{color:'#111827'}}>Nền tảng</p>
              <p className="lp-step-desc">SQL, Thống kê nâng cao &amp; Xử lý dữ liệu</p>
            </div>
            <div className="lp-timeline-connector" style={{ background: '#3b5bdb' }} />
            
            {/* Step 2 (Active) */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <p className="lp-step-month active-label">THÁNG 2 (HIỆN TẠI)</p>
              <p className="lp-step-name active-label">Trực quan hóa</p>
              <p className="lp-step-desc">Power BI, Tableau &amp; Kể chuyện qua dữ liệu</p>
            </div>
            <div className="lp-timeline-connector" style={{ background: '#e5e7eb' }} />
            
            {/* Step 3 (Upcoming) */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot upcoming">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {c.hours} GIỜ
                    </div>
                    <div className="lp-course-level">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{marginRight:4}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>

          {/* Sidebar Right - Analysis & Sync */}
          <div className="lp-sidebar">
            <div className="lp-skill-card">
              <h3 className="lp-skill-card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2.5"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
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
