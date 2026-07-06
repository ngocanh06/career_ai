import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';
import './AiCvAnalysis.css';

// SVG Icons
const IconSparkle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="btn-icon">
    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l 6.6-2.4z" />
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const IconShare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="title-icon">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
);

const IconReplace = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-icon">
    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9-9a9 9 0 0 0-9 9m9-9V3m0 18v-3"/>
  </svg>
);

const IconLightbulb = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="title-icon icon-blue">
    <path d="M9 18h6m-3-15a7 7 0 0 1 7 7c0 2.5-2 4.85-3 6h-8c-1-1.15-3-3.5-3-6a7 7 0 0 1 7-7z"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-header-icon color-green">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconLineChart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-header-icon color-purple">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const IconTarget = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="card-header-icon color-blue">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);


const IconLightning = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function AiCvAnalysis() {
  const [atsScore,      setAtsScore]      = useState(85);
  const [suggestions,   setSuggestions]   = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('career_user'));
    const userId = user ? user.user_id : 19;

    fetch(`http://localhost:5000/api/cv/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const d = json.data;
        const score = Math.round(d.ats_score || 85);
        setAtsScore(score);

        // Parse improvement_suggestions
        try {
          const parsed = typeof d.improvement_suggestions === 'string'
            ? JSON.parse(d.improvement_suggestions)
            : d.improvement_suggestions;
          setSuggestions((parsed.suggestions || []).map(s => ({ ...s, status: 'pending' })));
        } catch { setSuggestions([]); }

        // Parse analysis_result weaknesses as missing skills
        try {
          const parsed = typeof d.analysis_result === 'string'
            ? JSON.parse(d.analysis_result)
            : d.analysis_result;
          setMissingSkills(parsed.weaknesses || []);
        } catch { setMissingSkills(['Kubernetes', 'AWS Lambda', 'GraphQL', 'CI/CD Pipelines']); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApply = (id) => {
    setSuggestions(prev => prev.map(item => item.id === id ? { ...item, status: 'applied' } : item));
  };

  const handleDismiss = (id) => {
    setSuggestions(prev => prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item));
  };

  const stats = [
    { label: "Chất lượng nội dung", value: Math.min(atsScore - 3, 99),   badge: "+5%",           badgeType: "success", icon: <IconCheckCircle /> },
    { label: "Độ tương thích ATS",  value: atsScore,                      badge: "Tốt",           badgeType: "success", icon: <IconCheckCircle /> },
    { label: "Tác động định lượng", value: Math.round(atsScore * 0.68),   badge: "Cần cải thiện", badgeType: "danger",  icon: <IconLineChart />  },
    { label: "Độ khớp kỹ năng",     value: Math.round(atsScore * 0.83),   badge: "Đạt yêu cầu",  badgeType: "info",    icon: <IconTarget />     },
  ];

  return (
    <DashboardLayout>
      <Topbar />
      
      <div className="aicv-page">
        {/* HERO SECTION */}
        <div className="aicv-hero-banner">
          <div className="aicv-hero-left">
            <span className="aicv-hero-badge">
              <IconSparkle />
              AI INSIGHT
            </span>
            <h1 className="aicv-hero-title">Báo cáo thông minh về CV</h1>
            <p className="aicv-hero-subtitle">
              AI đã quét hồ sơ chuyên nghiệp của bạn. Điểm số dựa trên tiêu chuẩn ngành cho vai trò <span className="highlight-role">Senior Full-Stack Engineer</span>.
            </p>
            <div className="aicv-hero-buttons">
              <button className="aicv-btn-download">
                <IconDownload />
                Tải báo cáo PDF
              </button>
              <button className="aicv-btn-share">
                <IconShare />
                Chia sẻ hồ sơ
              </button>
            </div>
          </div>
          
          <div className="aicv-hero-right">
            <div className="aicv-score-circular-wrapper">
              <div className="aicv-circular-progress-svg">
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="8"/>
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none" stroke="#ffffff" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42 * (atsScore / 100)} ${2 * Math.PI * 42}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="score-text-overlay">
                  <span className="score-num">{atsScore}</span>
                  <span className="score-label">ĐIỂM HỒ SƠ</span>
                </div>
              </div>
              <div className="aicv-score-badge">Top 12%</div>
            </div>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div className="aicv-main-grid">
          
          {/* LEFT COLUMN: CV PREVIEW & MISSING SKILLS */}
          <div className="aicv-grid-left">
            
            {/* CV Preview Card */}
            <div className="aicv-card-container">
              <div className="aicv-card-header-row">
                <h3 className="aicv-card-title">
                  <IconFile />
                  Xem trước CV
                </h3>
                <button className="aicv-link-btn">
                  <IconReplace />
                  Thay thế tệp
                </button>
              </div>
              
              <div className="aicv-cv-preview-box">
                <div className="cv-mock-page">
                  <div className="cv-mock-line cv-mock-header"></div>
                  <div className="cv-mock-avatar-placeholder"></div>
                  <div className="cv-mock-line cv-mock-title"></div>
                  <div className="cv-mock-line cv-mock-body-1"></div>
                  <div className="cv-mock-line cv-mock-body-2"></div>
                  <div className="cv-mock-line cv-mock-body-3"></div>
                  <div className="cv-mock-line cv-mock-body-4"></div>
                  <div className="cv-mock-line cv-mock-body-5"></div>
                  <div className="cv-mock-line cv-mock-body-6"></div>
                  <div className="cv-mock-line cv-mock-body-7"></div>
                </div>
              </div>
            </div>

            {/* Skills Gap Analysis Card */}
            <div className="aicv-card-container gap-top">
              <div className="aicv-card-header-row">
                <h3 className="aicv-card-title flex-align">
                  <div className="icon-badge-round bg-blue-light">
                    <IconLightbulb />
                  </div>
                  Phân tích thiếu hụt kỹ năng
                </h3>
              </div>
              <p className="aicv-card-description">
                Các kỹ năng còn thiếu dựa trên mục tiêu nghề nghiệp của bạn:
              </p>
              <div className="aicv-skills-gap-list">
                {missingSkills.map((skill, index) => (
                  <span key={index} className="skill-gap-badge">
                    <span className="plus-sign">+</span> {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STATS & SUGGESTIONS */}
          <div className="aicv-grid-right">
            
            {/* 4 Stats Cards Grid */}
            <div className="aicv-stats-cards-grid">
              {stats.map((stat, i) => (
                <div key={i} className="aicv-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-label">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <div className="stat-value-row">
                    <span className="stat-value">{stat.value}%</span>
                    <span className={`stat-badge badge-${stat.badgeType}`}>{stat.badge}</span>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="progress-fill" style={{ width: `${stat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions Card */}
            <div className="aicv-card-container gap-top">
              <div className="aicv-card-header-row header-with-btn">
                <h3 className="aicv-card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="title-icon">
                    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                  </svg>
                  Gợi ý chi tiết từng dòng
                </h3>
                <button className="aicv-btn-optimize">
                  <IconLightning />
                  Tối ưu cho ATS
                </button>
              </div>

              <div className="suggestions-list">
                {suggestions.map((sug) => {
                  if (sug.status !== 'pending') {
                    return (
                      <div key={sug.id} className={`suggestion-item item-${sug.status}`}>
                        <div className="suggestion-item-status-msg">
                          {sug.status === 'applied' ? '✓ Đã áp dụng gợi ý này' : '✕ Đã bỏ qua gợi ý này'}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={sug.id} className="suggestion-item">
                      <div className="suggestion-item-header">
                        <span className="suggestion-type-badge">{sug.type}</span>
                        <span className="suggestion-section">{sug.section}</span>
                      </div>
                      
                      <div className="suggestion-diff-box">
                        <div className="diff-line diff-minus">
                          <span className="diff-sign">−</span>
                          <span className="diff-text">{sug.original}</span>
                        </div>
                        <div className="diff-line diff-plus">
                          <span className="diff-sign">+</span>
                          <span className="diff-text">
                            {sug.id === 1 ? (
                              <>
                                <strong className="diff-highlight">Tối ưu hóa các truy vấn SQL và lập chỉ mục cơ sở dữ liệu,</strong> giảm độ trễ <strong className="diff-highlight">đi 30%</strong> và nâng cao khả năng mở rộng <strong className="diff-highlight">cho hơn 1 triệu người dùng.</strong>
                              </>
                            ) : sug.id === 2 ? (
                              <>
                                Thêm <strong className="diff-highlight">đường dẫn LinkedIn cá nhân</strong> và <strong className="diff-highlight">liên kết Portfolio GitHub</strong> để tăng độ tin cậy từ nhà tuyển dụng <strong className="diff-highlight">thêm 45%.</strong>
                              </>
                            ) : (
                              sug.recommendation
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="suggestion-actions">
                        <button className="btn-action-apply" onClick={() => handleApply(sug.id)}>
                          Áp dụng
                        </button>
                        <button className="btn-action-dismiss" onClick={() => handleDismiss(sug.id)}>
                          Bỏ qua
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
