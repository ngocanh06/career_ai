import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';
import './AiCvAnalysis.css';
import { CheckCircle as IconCheckCircle, LineChart as IconLineChart, Target as IconTarget } from "lucide-react";

import {
  FaWandMagicSparkles,
  FaDownload,
  FaShareNodes,
  FaFileLines,
  FaArrowsRotate,
  FaLightbulb,
  FaCircleCheck, // Đã fix chuẩn tên icon ở đây
  FaChartLine,
  FaBullseye,
  FaBolt,
  FaCircleInfo
} from "react-icons/fa6";

export default function AiCvAnalysis() {
  const [atsScore, setAtsScore] = useState(85);
  const [suggestions, setSuggestions] = useState([]);
  const [MissingSkills, setMissingSkills] = useState([]);
  const [loading, setLoading] = useState(true);

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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Đã fix thẻ <FaCircleCheck /> ở đây
  const statss = [
    { label: "Chất lượng nội dung", value: 82, badge: "+5%", badgeType: "success", icon: <FaCircleCheck className="card-header-icon color-green" /> },
    { label: "Độ tương thích ATS", value: 94, badge: "Tốt", badgeType: "success", icon: <FaCircleCheck className="card-header-icon color-green" /> },
    { label: "Tác động định lượng", value: 58, badge: "Cần cải thiện", badgeType: "danger", icon: <FaChartLine className="card-header-icon color-purple" /> },
    { label: "Độ khớp kỹ năng", value: 71, badge: "Đạt yêu cầu", badgeType: "info", icon: <FaBullseye className="card-header-icon color-blue" /> }
  ];

  const missingSkills = ["Kubernetes", "AWS Lambda", "GraphQL", "CI/CD Pipelines"];

  const handleApply = (id) => {
    setSuggestions(prev => prev.map(item => item.id === id ? { ...item, status: 'applied' } : item));
  };

  const handleDismiss = (id) => {
    setSuggestions(prev => prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item));
  };

  const stats = [
    { label: "Chất lượng nội dung", value: Math.min(atsScore - 3, 99), badge: "+5%", badgeType: "success", icon: <IconCheckCircle /> },
    { label: "Độ tương thích ATS", value: atsScore, badge: "Tốt", badgeType: "success", icon: <IconCheckCircle /> },
    { label: "Tác động định lượng", value: Math.round(atsScore * 0.68), badge: "Cần cải thiện", badgeType: "danger", icon: <IconLineChart /> },
    { label: "Độ khớp kỹ năng", value: Math.round(atsScore * 0.83), badge: "Đạt yêu cầu", badgeType: "info", icon: <IconTarget /> },
  ];

  return (
    <DashboardLayout>


      <div className="aicv-page">
        {/* ================= HERO SECTION ================= */}
        <div className="aicv-hero-banner">
          <div className="aicv-hero-left">
            <span className="aicv-hero-badge">
              <FaWandMagicSparkles className="btn-icon" />
              AI INSIGHT
            </span>
            <h1 className="aicv-hero-title">Báo cáo thông minh về CV</h1>
            <p className="aicv-hero-subtitle">
              AI đã quét hồ sơ chuyên nghiệp của bạn. Điểm số dựa trên tiêu chuẩn ngành cho vai trò <span className="highlight-role">Senior Full-Stack Engineer</span>.
            </p>
            <div className="aicv-hero-buttons">
              <button className="aicv-btn-download">
                <FaDownload className="btn-icon" />
                Tải báo cáo PDF
              </button>
              <button className="aicv-btn-share">
                <FaShareNodes className="btn-icon" />
                Chia sẻ hồ sơ
              </button>
            </div>
          </div>

          <div className="aicv-hero-right">
            <div className="aicv-score-circular-wrapper">
              <div className="aicv-circular-progress-svg">
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="8" />
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

        {/* ================= MAIN 2-COLUMN GRID ================= */}
        <div className="aicv-main-grid">
          {/* LEFT COLUMN */}
          <div className="aicv-grid-left">
            {/* CV Preview Card */}
            <div className="aicv-card-container">
              <div className="aicv-card-header-row">
                <h3 className="aicv-card-title">
                  <FaFileLines className="title-icon" /> Xem trước CV
                </h3>
                <button className="aicv-link-btn">
                  <FaArrowsRotate className="link-icon" /> Thay thế tệp
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
                    <FaLightbulb className="title-icon icon-blue" />
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

          {/* RIGHT COLUMN */}
          <div className="aicv-grid-right">
            {/* Stats Cards Grid */}
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
                  <FaCircleInfo className="title-icon" /> Gợi ý chi tiết từng dòng
                </h3>
                <button className="aicv-btn-optimize">
                  <FaBolt className="btn-icon" /> Tối ưu cho ATS
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