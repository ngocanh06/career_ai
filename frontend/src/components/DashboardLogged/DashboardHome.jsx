import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  FaArrowTrendUp,
  FaChevronRight,
  FaCheck,
  FaCloudArrowUp,
  FaFileLines,
  FaBriefcase,
  FaCode,
  FaCertificate,
  FaLightbulb,
  FaArrowRight,
  FaPlus,
  FaSpinner,
  FaCircleExclamation,
} from "react-icons/fa6";
import './DashboardHome.css';

/* ── Skeleton loader cho card ── */
function SkeletonCard({ height = 120 }) {
  return (
    <div className="home-card skeleton-card" style={{ minHeight: height }}>
      <div className="skeleton-line" style={{ width: '40%', height: 12, marginBottom: 10 }} />
      <div className="skeleton-line" style={{ width: '70%', height: 20, marginBottom: 8 }} />
      <div className="skeleton-line" style={{ width: '55%', height: 10 }} />
    </div>
  );
}

/* ── Trạng thái chưa có dữ liệu ── */
function EmptyState({ icon, title, desc, btnLabel, onClick }) {
  return (
    <div className="home-empty-state">
      <div className="home-empty-icon">{icon}</div>
      <p className="home-empty-title">{title}</p>
      <p className="home-empty-desc">{desc}</p>
      {btnLabel && (
        <button className="home-btn-primary home-empty-btn" onClick={onClick}>
          <FaPlus style={{ marginRight: 6 }} /> {btnLabel}
        </button>
      )}
    </div>
  );
}

export default function DashboardLogged() {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('career_user')) || {};
  const userId = localUser.user_id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetch(`http://localhost:5000/api/dashboard/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError(json.message || 'Không thể tải dữ liệu');
      })
      .catch(() => setError('Không thể kết nối đến máy chủ'))
      .finally(() => setLoading(false));
  }, [userId]);

  const fullName = data?.user?.full_name || localUser.full_name || 'Người dùng';
  const completion = data?.profile_completion ?? 0;
  const atsScore = data?.cv?.ats_score ? Math.round(data.cv.ats_score) : null;
  const hasCV = data?.has_cv;
  const hasRoadmap = data?.has_roadmap;
  const roadmap = data?.roadmap;
  const goals = data?.roadmap_goals || [];
  const missingSkills = data?.missing_skills || [];
  // Ưu tiên user_skills (kỹ năng thực từ DB), fallback sang strong_skills từ CV analysis
  const userSkills = data?.user_skills || [];
  const strongSkills = data?.strong_skills || [];

  /* Tạo dữ liệu "next steps" dựa trên trạng thái thực */
  const nextSteps = [];
  if (!hasCV) {
    nextSteps.push({
      icon: <FaFileLines style={{ color: 'var(--primary-color,#3b5bdb)' }} />,
      title: 'Tải lên CV của bạn',
      desc: 'AI sẽ phân tích và cho điểm hồ sơ',
      color: '#eff2ff',
      action: () => navigate('/ai-cv'),
    });
  } else if (missingSkills.length > 0) {
    nextSteps.push({
      icon: <FaLightbulb style={{ color: '#f59e0b' }} />,
      title: `Cải thiện ${missingSkills.length} kỹ năng còn thiếu`,
      desc: missingSkills.slice(0, 2).join(', ') + (missingSkills.length > 2 ? '...' : ''),
      color: '#fffbeb',
      action: () => navigate('/ai-cv'),
    });
  }
  if (!hasRoadmap) {
    nextSteps.push({
      icon: <FaArrowTrendUp style={{ color: '#0ea5e9' }} />,
      title: 'Tạo lộ trình học tập',
      desc: 'Nhận kế hoạch phát triển cá nhân từ AI',
      color: '#e0f2fe',
      action: () => navigate('/learning-path'),
    });
  }
  if (completion < 80) {
    nextSteps.push({
      icon: <FaBriefcase style={{ color: '#8b5cf6' }} />,
      title: 'Hoàn thiện hồ sơ của bạn',
      desc: `Hồ sơ mới đạt ${completion}% — thêm kinh nghiệm và học vấn`,
      color: '#f5f3ff',
      action: () => navigate('/profile'),
    });
  }
  /* Fallback nếu đã hoàn chỉnh */
  if (nextSteps.length === 0) {
    nextSteps.push({
      icon: <FaCertificate style={{ color: '#10b981' }} />,
      title: 'Khám phá cơ hội nghề nghiệp',
      desc: 'Hồ sơ của bạn đang ở trạng thái tốt!',
      color: '#ecfdf5',
      action: () => navigate('/career'),
    });
  }

  /* Roadmap steps hiển thị */
  const roadmapSteps = goals.length > 0
    ? goals.map(g => ({
        label: g.skill_name || `Tháng ${g.target_month}`,
        sub: g.status === 'completed' ? 'Hoàn thành'
           : g.status === 'in_progress' ? 'Đang học'
           : `Tháng ${g.target_month}`,
        done: g.status === 'completed',
        active: g.status === 'in_progress',
      }))
    : [
        { label: 'Foundation', sub: 'Chưa bắt đầu', done: false, active: false },
        { label: 'Specialization', sub: 'Mục tiêu', done: false, active: false },
      ];

  return (
    <DashboardLayout>
      <div className="home-page">

        {/* ── Hero ── */}
        <div className="home-hero">
          <div>
            <h1 className="home-greeting">
              {loading ? 'Đang tải...' : `Xin chào, ${fullName}!`}
            </h1>
            <p className="home-greeting-sub">
              {loading
                ? 'Đang lấy dữ liệu...'
                : hasCV
                  ? `Hồ sơ của bạn đang ở Top ${atsScore >= 80 ? '10%' : '25%'}. Tiếp tục cải thiện để tăng cơ hội được tuyển dụng.`
                  : 'Hãy bắt đầu bằng cách tải CV lên để AI phân tích và đưa ra gợi ý cá nhân hoá cho bạn.'
              }
            </p>
          </div>
          <div className="home-hero-actions">
            {hasCV ? (
              <>
                <button className="home-btn-primary" onClick={() => navigate('/career')}>
                  <FaBriefcase style={{ marginRight: 8 }} /> Xem cơ hội việc làm
                </button>
                <button className="home-btn-secondary" onClick={() => navigate('/ai-cv')}>
                  Tối ưu CV
                </button>
              </>
            ) : (
              <>
                <button className="home-btn-primary" onClick={() => navigate('/ai-cv')}>
                  <FaCloudArrowUp style={{ marginRight: 8 }} /> Tải CV lên ngay
                </button>
                <button className="home-btn-secondary" onClick={() => navigate('/profile')}>
                  Cập nhật hồ sơ
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="home-error-banner">
            <FaCircleExclamation />
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="home-stats-row">

          {/* Profile completion */}
          {loading ? <SkeletonCard /> : (
            <div className="home-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <div className="home-card-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                TRẠNG THÁI HỒ SƠ
              </div>
              <p className="home-profile-title">
                {completion > 0 ? `Hoàn thành ${completion}%` : 'Chưa cập nhật hồ sơ'}
              </p>
              <p className="home-profile-sub">
                {completion >= 80 ? 'Hồ sơ đầy đủ — sẵn sàng ứng tuyển!'
                  : completion > 40 ? 'Cần bổ sung thêm thông tin.'
                  : 'Hãy cập nhật hồ sơ để tăng cơ hội.'}
              </p>
              <div className="home-progress-track">
                <div className="home-progress-fill" style={{ width: `${completion}%` }} />
              </div>
              <div className="home-card-link">
                Cập nhật hồ sơ <FaChevronRight style={{ fontSize: 10 }} />
              </div>
            </div>
          )}

          {/* CV Score */}
          {loading ? <SkeletonCard /> : (
            <div className="home-card home-card-score" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai-cv')}>
              <div className="home-card-label">ĐIỂM CV</div>
              {hasCV ? (
                <>
                  <div className="home-score-circle">
                    <svg viewBox="0 0 100 100" width="90" height="90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e8edff" strokeWidth="9" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="var(--primary-color, #3b5bdb)" strokeWidth="9"
                        strokeDasharray={`${2 * Math.PI * 42 * (atsScore / 100)} ${2 * Math.PI * 42}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <span className="home-score-number">{atsScore}</span>
                  </div>
                  <p className="home-score-sub">
                    {atsScore >= 80 ? 'Top 10% trong khu vực' : atsScore >= 60 ? 'Mức trung bình' : 'Cần cải thiện'}
                  </p>
                  <div className="home-card-link">
                    Xem phân tích chi tiết <FaChevronRight style={{ fontSize: 10 }} />
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<FaFileLines style={{ fontSize: 28, color: '#94a3b8' }} />}
                  title="Chưa có CV"
                  desc="Tải lên để nhận điểm ATS"
                  btnLabel="Tải CV lên"
                  onClick={() => navigate('/ai-cv')}
                />
              )}
            </div>
          )}

          {/* Career goal / Roadmap */}
          {loading ? <SkeletonCard /> : (
            <div className="home-card home-card-goal" style={{ cursor: 'pointer' }} onClick={() => navigate('/learning-path')}>
              <div className="home-card-goal-header">
                <span className="home-card-label">LỘ TRÌNH HỌC TẬP</span>
              </div>
              {hasRoadmap ? (
                <>
                  <p className="home-goal-title">{roadmap?.title || 'Lộ trình cá nhân'}</p>
                  <div className="home-goal-demand">
                    Tiến độ: <span className="home-goal-badge">{roadmap?.completion_rate ?? 0}%</span>
                  </div>
                  <div className="home-progress-track" style={{ marginTop: 8 }}>
                    <div className="home-progress-fill" style={{
                      width: `${roadmap?.completion_rate ?? 0}%`,
                      background: 'rgba(255,255,255,0.6)'
                    }} />
                  </div>
                  <button className="home-goal-btn" onClick={(e) => { e.stopPropagation(); navigate('/learning-path'); }}>
                    Tiếp tục học tập →
                  </button>
                </>
              ) : (
                <>
                  <p className="home-goal-title">Chưa có lộ trình</p>
                  <div className="home-goal-demand">AI sẽ tạo kế hoạch riêng cho bạn</div>
                  <button className="home-goal-btn" onClick={(e) => { e.stopPropagation(); navigate('/learning-path'); }}>
                    Tạo lộ trình ngay →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Two-column ── */}
        <div className="home-two-col">

          {/* Skills panel */}
          {loading ? (
            <SkeletonCard height={200} />
          ) : (
            <div className="home-card home-market-card">
              <div className="home-market-header">
                <span className="home-section-title">
                  {strongSkills.length > 0 ? 'Kỹ năng nổi bật của bạn' : 'Phân tích kỹ năng'}
                </span>
                <button
                  className="home-market-btn"
                  onClick={() => navigate('/ai-cv')}
                >
                  <FaArrowRight style={{ fontSize: 11 }} /> Xem chi tiết
                </button>
              </div>

              {hasCV && (userSkills.length > 0 || strongSkills.length > 0 || missingSkills.length > 0) ? (
                <>
                  {/* User skills từ DB (userskill table) */}
                  {userSkills.length > 0 && (
                    <div className="home-skills-list">
                      {userSkills.slice(0, 4).map((s, i) => {
                        const lvlMap = { expert: 95, advanced: 80, intermediate: 65, beginner: 40 };
                        const pct = lvlMap[s.proficiency_level] ?? 70;
                        const lvlLabel = {
                          expert: 'Thành thạo', advanced: 'Nâng cao',
                          intermediate: 'Trung bình', beginner: 'Cơ bản'
                        }[s.proficiency_level] || s.proficiency_level;
                        return (
                          <div key={i} className="home-skill-row">
                            <div className="home-skill-meta">
                              <span className="home-skill-name">{s.skill_name}</span>
                              <span className="home-skill-badge">{lvlLabel}</span>
                            </div>
                            <div className="home-skill-track">
                              <div className="home-skill-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="home-skill-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Nếu không có userSkills, hiển thị strongSkills từ CV analysis */}
                  {userSkills.length === 0 && strongSkills.length > 0 && (
                    <div className="home-skills-list">
                      {strongSkills.map((skill, i) => (
                        <div key={i} className="home-skill-row">
                          <div className="home-skill-meta">
                            <span className="home-skill-name">{skill}</span>
                            <span className="home-skill-badge">Ghi nhận từ CV</span>
                          </div>
                          <div className="home-skill-track">
                            <div className="home-skill-fill" style={{ width: `${85 - i * 10}%` }} />
                          </div>
                          <span className="home-skill-pct">{85 - i * 10}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {missingSkills.length > 0 && (
                    <div className="home-insight-box" style={{ marginTop: 12 }}>
                      <FaLightbulb style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <p>Cần bổ sung: <strong>{missingSkills.slice(0, 3).join(', ')}</strong></p>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={<FaCode style={{ fontSize: 28, color: '#94a3b8' }} />}
                  title="Chưa có dữ liệu kỹ năng"
                  desc="Tải CV lên để AI phân tích điểm mạnh của bạn"
                  btnLabel="Phân tích CV ngay"
                  onClick={() => navigate('/ai-cv')}
                />
              )}
            </div>
          )}

          {/* Next Steps */}
          {loading ? (
            <SkeletonCard height={200} />
          ) : (
            <div className="home-card home-nextsteps-card">
              <span className="home-section-title">Các bước tiếp theo</span>
              <div className="home-steps-list">
                {nextSteps.slice(0, 3).map((s, i) => (
                  <div key={i} className="home-step-item" onClick={s.action} style={{ cursor: 'pointer' }}>
                    <div className="home-step-icon" style={{ background: s.color }}>{s.icon}</div>
                    <div className="home-step-text">
                      <p className="home-step-title">{s.title}</p>
                      <p className="home-step-desc">{s.desc}</p>
                    </div>
                    <FaChevronRight style={{ color: '#d1d5db', fontSize: 13, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Roadmap ── */}
        {!loading && (
          <div className="home-card home-roadmap-card">
            <div className="home-roadmap-header">
              <span className="home-section-title">
                {hasRoadmap ? `Lộ trình: ${roadmap?.title}` : 'Lộ trình nghề nghiệp'}
              </span>
              <button className="home-roadmap-link" onClick={() => navigate('/learning-path')}>
                {hasRoadmap ? 'Xem chi tiết' : 'Tạo lộ trình'}
                <FaChevronRight style={{ fontSize: 11, marginLeft: 4 }} />
              </button>
            </div>
            {hasRoadmap
              ? <p className="home-roadmap-sub">Tiến độ tổng: {roadmap?.completion_rate ?? 0}% — {roadmap?.total_months} tháng</p>
              : <p className="home-roadmap-sub">AI sẽ vạch ra lộ trình học tập tối ưu dựa trên kỹ năng và mục tiêu của bạn.</p>
            }

            {hasRoadmap ? (
              <div className="home-roadmap-track">
                <div className="home-roadmap-line" />
                {roadmapSteps.map((step, i) => (
                  <div key={i} className="home-roadmap-step">
                    <div className={`home-roadmap-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                      {step.done ? (
                        <FaCheck style={{ color: 'white', fontSize: 10 }} />
                      ) : step.active ? (
                        <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }} />
                      ) : null}
                    </div>
                    <div className="home-roadmap-label">
                      <span className={`home-roadmap-name ${step.active ? 'active-label' : ''}`}>{step.label}</span>
                      <span className="home-roadmap-sub-label">{step.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Không có roadmap → hướng dẫn nhìn lên nút "Tạo lộ trình" ở header card (tránh lặp CTA) */
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: 14 }}>
                Nhấn <strong style={{ color: 'var(--primary-color, #3b5bdb)' }}>"Tạo lộ trình"</strong> ở góc trên để bắt đầu.
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
