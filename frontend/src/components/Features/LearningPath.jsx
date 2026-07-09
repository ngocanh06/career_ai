import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';
import './LearningPath.css';
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
} from "react-icons/fa6";

// Ánh xạ proficiency_level sang % số
const LEVEL_PCT = { expert: 100, advanced: 80, intermediate: 60, beginner: 30 };

// Ánh xạ skill_name sang target %
const SKILL_TARGET = { 'PowerBI': 90, 'Tableau': 90, 'Học máy': 75 };

export default function LearningPath() {
  const [roadmap, setRoadmap] = useState(null);
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('career_user'));
    const userId = user ? user.user_id : 19;

    Promise.all([
      fetch(`http://localhost:5000/api/roadmap/${userId}`).then(r => r.json()),
      fetch(`http://localhost:5000/api/skills/${userId}`).then(r => r.json()),
    ])
      .then(([rmJson, skJson]) => {
        // ── Roadmap + courses ──
        if (rmJson.success) {
          setRoadmap(rmJson.data);
          const ICONS = ['📊', '📉', '🤖', '☁️'];
          const TYPES = ['ĐỀ XUẤT', 'THỰC TẾ', 'CƠ BẢN', 'NÂNG CAO'];
          const BADGES = ['lp-badge-recommend', 'lp-badge-practice', 'lp-badge-recommend', 'lp-badge-practice'];
          const LEVELS = ['NÂNG CAO', 'TRUNG CẤP', 'CƠ BẢN', 'NÂNG CAO'];
          const mapped = (rmJson.data.goals || [])
            .filter(g => g.status === 'in_progress')
            .flatMap((g, gi) => {
              let parsed = [];
              try { parsed = JSON.parse(g.suggested_courses); } catch { parsed = []; }
              return parsed.map((c, ci) => ({
                id: gi * 10 + ci,
                title: c.name,
                desc: `${c.platform} — ${g.skill_name || ''}`,
                hours: Math.round((g.progress_percentage || 50) / 5) + 4,
                level: LEVELS[gi] || 'TRUNG CẤP',
                type: TYPES[ci % TYPES.length],
                badgeClass: BADGES[ci % BADGES.length],
                icon: ICONS[gi] || '📘',
              }));
            });
          setCourses(mapped.length > 0 ? mapped : []);
        }
        // ── Skills ──
        if (skJson.success) {
          const mapped = skJson.data.map(s => ({
            name: s.skill_name,
            pct: LEVEL_PCT[s.proficiency_level] || 50,
            target: SKILL_TARGET[s.skill_name] || null,
            low: (LEVEL_PCT[s.proficiency_level] || 50) < 40,
          }));
          setSkills(mapped);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const completionRate = roadmap ? Math.round(roadmap.completion_rate) : 70;

  return (
    <DashboardLayout>
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
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary-color, #3b5bdb)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42 * (completionRate / 100)} ${2 * Math.PI * 42}`} transform="rotate(-90 50 50)" />
              </svg>
              <div className="lp-circle-inner">
                <span className="lp-circle-pct">{completionRate}%</span>
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
                <FaRoute style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '18px' }} />
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
              <p className="lp-step-name active-label" style={{ color: '#111827' }}>Nền tảng</p>
              <p className="lp-step-desc">SQL, Thống kê nâng cao &amp; Xử lý dữ liệu</p>
            </div>
            <div className="lp-timeline-connector" style={{ background: 'var(--primary-color, #3b5bdb)' }} />

            {/* Step 2 (Active) */}
            <div className="lp-timeline-step">
              <div className="lp-timeline-dot active">
                <FaBolt style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '14px' }} />
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
                <FaBookOpen style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '18px' }} />
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
                <FaChartSimple style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '16px' }} />
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
                      <div className="lp-skill-fill" style={{ width: `${s.pct}%`, background: s.low ? '#e5e7eb' : 'var(--primary-color, #3b5bdb)' }} />
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
                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--primary-color, #3b5bdb)" strokeWidth="12" />
                  </svg>
                  <div className="lp-readiness-inner">
                    <span className="lp-readiness-pct">{completionRate}%</span>
                    <span className="lp-readiness-sub">Sẵn sàng<br />nghề nghiệp</span>
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