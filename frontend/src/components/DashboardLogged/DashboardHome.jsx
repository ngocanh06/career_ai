import React from 'react';
import DashboardLayout from './DashboardLayout';
import {
  FaShieldHalved,
  FaBullseye,
  FaArrowTrendUp,
  FaLightbulb,
  FaChevronRight,
  FaCheck,
  FaPenToSquare,
  FaCertificate,
  FaCloudArrowUp
} from "react-icons/fa6";
import './DashboardHome.css';
import Topbar from "./Topbar";

const skills = [
  { name: 'Cloud Architecture', pct: 92, color: '#3b5bdb' },
  { name: 'Product Strategy', pct: 78, color: '#3b5bdb' },
  { name: 'Data Visualization', pct: 65, color: '#3b5bdb' },
];

const nextSteps = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
    title: 'Tinh chỉnh từ khóa CV',
    desc: 'Được đề xuất bởi AI',
    color: '#eff2ff',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Chứng chỉ Python hoàn chỉnh',
    desc: 'Còn lại 3 bài mẫu',
    color: '#e0f2fe',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Update Portfolio',
    desc: 'Đồng bộ với LinkedIn',
    color: '#f5f3ff',
  },
];

const roadmap = [
  { label: 'Foundation', sub: 'Hoàn thành', done: true, active: false },
  { label: 'Specialization', sub: 'Trung tâm hiện tại', done: false, active: true },
  { label: 'Leadership', sub: 'Q3 2025', done: false, active: false },
  { label: 'Mastery', sub: '2026 Goal', done: false, active: false },
];

export default function DashboardLogged() {
  const localUser = JSON.parse(localStorage.getItem('career_user')) || {};
  const fullName = localUser.full_name || 'Người dùng';

  return (
    <DashboardLayout>

      <div className="home-page">
        {/* ── Hero ── */}
        <div className="home-hero">
          <h1 className="home-greeting">Xin chào, {fullName}!</h1>
          <p className="home-greeting-sub">
            Con đường sự nghiệp của bạn đang rất tươi sáng. Chúng tôi đã tìm thấy 3 cơ hội
            việc làm phù hợp cao nhờ trên hồ sơ kỹ năng được cập nhật của bạn.
          </p>
          <div className="home-hero-actions">
            <button className="home-btn-primary">Xem cơ hội</button>
            <button className="home-btn-secondary">Tiếp tục tối ưu hóa</button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="home-stats-row">
          {/* Profile status */}
          <div className="home-card">
            <div className="home-card-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              TRẠNG THÁI HỒ SƠ
            </div>
            <p className="home-profile-title">Hoàn thành 85%</p>
            <p className="home-profile-sub">Gần đạt mức hiệu chỉnh giá.</p>
            <div className="home-progress-track">
              <div className="home-progress-fill" style={{ width: '85%' }} />
            </div>
          </div>

          {/* CV Score */}
          <div className="home-card home-card-score">
            <div className="home-card-label">ĐIỂM CV</div>
            <div className="home-score-circle">
              <svg viewBox="0 0 100 100" width="90" height="90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e8edff" strokeWidth="9" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="#3b5bdb" strokeWidth="9"
                  strokeDasharray={`${2 * Math.PI * 42 * 0.85} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span className="home-score-number">85</span>
            </div>
            <p className="home-score-sub">Top 12% trong khu vực</p>
          </div>

          {/* Career goal */}
          <div className="home-card home-card-goal">
            <div className="home-card-goal-header">
              <span className="home-card-label">MỤC TIÊU NGHỀ NGHIỆP</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
            </div>
            <p className="home-goal-title">Chuyên viên phân tích dữ liệu</p>
            <div className="home-goal-demand">
              Nhu cầu thị trường: <span className="home-goal-badge">Cao</span>
            </div>
            <button className="home-goal-btn">Xem phân tích vai trò</button>
          </div>
        </div>

        {/* ── Two-column ── */}
        <div className="home-two-col">
          {/* Market value */}
          <div className="home-card home-market-card">
            <div className="home-market-header">
              <span className="home-section-title">Giá trị thị trường &amp; nhu cầu kỹ năng</span>
              <span className="home-market-trend">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                +12%/năm
              </span>
            </div>
            <div className="home-skills-list">
              {skills.map((s) => (
                <div key={s.name} className="home-skill-row">
                  <div className="home-skill-meta">
                    <span className="home-skill-name">{s.name}</span>
                    <span className="home-skill-badge">Phù hợp</span>
                  </div>
                  <div className="home-skill-track">
                    <div className="home-skill-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="home-skill-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
            <div className="home-insight-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>
                Thông tin chuyên sâu: Học Tableau có thể giúp tăng giá trị thị trường của bạn lên 15%
                tại khu vực hiện tại
              </p>
            </div>
          </div>

          {/* Next steps */}
          <div className="home-card home-nextsteps-card">
            <span className="home-section-title">Các bước tiếp theo</span>
            <div className="home-steps-list">
              {nextSteps.map((s, i) => (
                <div key={i} className="home-step-item">
                  <div className="home-step-icon" style={{ background: s.color }}>{s.icon}</div>
                  <div className="home-step-text">
                    <p className="home-step-title">{s.title}</p>
                    <p className="home-step-desc">{s.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Roadmap ── */}
        <div className="home-card home-roadmap-card">
          <div className="home-roadmap-header">
            <span className="home-section-title">Lộ trình nghề nghiệp: Kiến trúc sư cao cấp</span>
            <button className="home-roadmap-link">
              Tùy chỉnh đường dẫn
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <p className="home-roadmap-sub">Dự báo Pathfinder dựa trên các kỹ năng hiện có</p>

          <div className="home-roadmap-track">
            <div className="home-roadmap-line" />
            {roadmap.map((step, i) => (
              <div key={i} className="home-roadmap-step">
                <div className={`home-roadmap-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                  {step.done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : step.active ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ) : null}
                </div>
                <div className="home-roadmap-label">
                  <span className={`home-roadmap-name ${step.active ? 'active-label' : ''}`}>{step.label}</span>
                  <span className="home-roadmap-sub-label">{step.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
