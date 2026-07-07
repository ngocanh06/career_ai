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

const skills = [
  { name: 'Cloud Architecture', pct: 92 },
  { name: 'Product Strategy',   pct: 78 },
  { name: 'Data Visualization', pct: 65 },
];

const nextSteps = [
  {
    icon: <FaPenToSquare style={{ fontSize: '18px', color: '#2563eb' }} />,
    title: 'Tinh chỉnh từ khóa CV',
    desc: 'Được đề xuất bởi AI',
    color: '#eff6ff',
  },
  {
    icon: <FaCertificate style={{ fontSize: '18px', color: '#0ea5e9' }} />,
    title: 'Chứng chỉ Python hoàn chỉnh',
    desc: 'Còn lại 3 bài mẫu',
    color: '#e0f2fe',
  },
  {
    icon: <FaCloudArrowUp style={{ fontSize: '18px', color: '#8b5cf6' }} />,
    title: 'Update Portfolio',
    desc: 'Đồng bộ với LinkedIn',
    color: '#f5f3ff',
  },
];

const roadmap = [
  { label: 'Foundation',    sub: 'Hoàn thành',          done: true,  active: false },
  { label: 'Specialization', sub: 'Trạng thái hiện tại', done: false, active: true  },
  { label: 'Leadership',    sub: 'Q3 2025',              done: false, active: false },
  { label: 'Mastery',       sub: '2026 Goal',            done: false, active: false },
];

export default function DashboardLogged() {
  return (
    <DashboardLayout user={{ name: 'Ngọc Anh' }}>
      <div className="home-page">
        {/* ── Hero ── */}
        <div className="home-hero">
          <h1 className="home-greeting">Xin chào, Ngọc Anh!</h1>
          <p className="home-greeting-sub">
            Con đường sự nghiệp của bạn đang rất tươi sáng. Chúng tôi đã tìm thấy 3 cơ hội
            việc làm phù hợp cao dựa trên hồ sơ kỹ năng được cập nhật của bạn.
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
              <FaShieldHalved style={{ color: '#2563eb', fontSize: '14px' }} />
              TRẠNG THÁI HỒ SƠ
            </div>
            <p className="home-profile-title">Hoàn thành 85%</p>
            <p className="home-profile-sub">Gần đạt mức hiển thị chuyên gia.</p>
            <div className="home-progress-track">
              <div className="home-progress-fill" style={{ width: '85%' }} />
            </div>
          </div>

          {/* CV Score */}
          <div className="home-card home-card-score">
            <div className="home-card-label">ĐIỂM CV</div>
            <div className="home-score-circle">
              {/* Giữ lại SVG này vì nó vẽ chart vòng tròn phần trăm (stroke-dasharray) */}
              <svg viewBox="0 0 100 100" width="85" height="85">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8"/>
                <circle
                  cx="50" cy="50" r="42"
                  fill="none" stroke="#10b981" strokeWidth="8"
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
              <FaBullseye style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px' }} />
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
                <FaArrowTrendUp style={{ color: '#10b981' }} />
                +12%/năm
              </span>
            </div>
            <div className="home-skills-list">
              {skills.map((s) => (
                <div key={s.name} className="home-skill-row">
                  <div className="home-skill-meta">
                    <span className="home-skill-name">{s.name}</span>
                    <span className="home-skill-badge">{s.pct}% Phù hợp</span>
                  </div>
                  <div className="home-skill-track">
                    <div className="home-skill-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="home-insight-box">
              <FaLightbulb style={{ color: '#2563eb', fontSize: '16px' }} />
              <p>
                Thông tin chuyên sâu: Học Tableau có thể giúp tăng giá trị thị trường của bạn lên <strong>15%</strong> tại khu vực hiện tại
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
                  <FaChevronRight style={{ color: '#94a3b8', fontSize: '12px' }} />
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
              Tùy chỉnh đường dẫn <FaChevronRight style={{ marginLeft: '4px', fontSize: '10px' }} />
            </button>
          </div>
          <p className="home-roadmap-sub">Dự báo Pathfinder dựa trên các kỹ năng hiện có</p>

          <div className="home-roadmap-track">
            <div className="home-roadmap-line" />
            <div className="home-roadmap-line-filled" />
            {roadmap.map((step, i) => (
              <div key={i} className="home-roadmap-step">
                <div className={`home-roadmap-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                  {step.done ? (
                     <FaCheck style={{ color: 'white', fontSize: '12px' }} />
                  ) : step.active ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" fill="#fff"/>
                      <circle cx="12" cy="12" r="4" fill="#2563eb"/>
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