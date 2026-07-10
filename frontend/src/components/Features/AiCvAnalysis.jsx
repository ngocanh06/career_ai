import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './AiCvAnalysis.css';
import {
  CheckCircle as IconCheckCircle,
  LineChart as IconLineChart,
  Target as IconTarget,
} from 'lucide-react';
import {
  FaWandMagicSparkles,
  FaDownload,
  FaShareNodes,
  FaFileLines,
  FaArrowsRotate,
  FaLightbulb,
  FaCircleCheck,
  FaChartLine,
  FaBullseye,
  FaBolt,
  FaCircleInfo,
  FaCloudArrowUp,
  FaSpinner,
  FaCircleExclamation,
  FaLink,
} from 'react-icons/fa6';

export default function AiCvAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const localUser  = JSON.parse(localStorage.getItem('career_user')) || {};
  const userId     = localUser.user_id;

  const [cvData,       setCvData]       = useState(null);
  const [atsScore,     setAtsScore]     = useState(null);
  const [suggestions,  setSuggestions]  = useState([]);
  const [missingSkills,setMissingSkills]= useState([]);
  const [loading,      setLoading]      = useState(true);
  const [uploading,    setUploading]    = useState(false);
  const [uploadMsg,    setUploadMsg]    = useState('');
  const [error,        setError]        = useState('');
  const [shareMsg,     setShareMsg]     = useState('');

  /* ── Fetch CV data ── */
  const fetchCv = () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    fetch(`http://localhost:5000/api/cv/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) { setLoading(false); return; }
        const d = json.data;
        setCvData(d);
        setAtsScore(Math.round(d.ats_score || 0));

        // Parse improvement_suggestions
        try {
          const parsed = typeof d.improvement_suggestions === 'string'
            ? JSON.parse(d.improvement_suggestions) : d.improvement_suggestions;
          setSuggestions((parsed?.suggestions || []).map(s => ({ ...s, status: 'pending' })));
        } catch { setSuggestions([]); }

        // Parse missing skills from analysis_result.weaknesses
        try {
          const parsed = typeof d.analysis_result === 'string'
            ? JSON.parse(d.analysis_result) : d.analysis_result;
          setMissingSkills(parsed?.weaknesses || []);
        } catch { setMissingSkills([]); }
      })
      .catch(() => setError('Không thể kết nối đến máy chủ'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCv(); }, [userId]);

  /* ── Xử lý upload CV ── */
  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setUploadMsg('Chỉ chấp nhận file PDF hoặc Word (.doc, .docx)');
      return;
    }
    setUploading(true);
    setUploadMsg('');
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('user_id', userId);
    try {
      const res  = await fetch('http://localhost:5000/api/cv/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (json.success) {
        setUploadMsg('✓ Tải lên thành công! Đang phân tích CV...');
        setTimeout(() => { setUploadMsg(''); fetchCv(); }, 1800);
      } else {
        setUploadMsg(json.message || 'Tải lên thất bại');
      }
    } catch {
      setUploadMsg('Không thể kết nối đến máy chủ');
    } finally {
      setUploading(false);
    }
  };

  /* ── Copy link chia sẻ ── */
  const handleShare = () => {
    const link = `${window.location.origin}/portfolio?user=${userId}`;
    navigator.clipboard.writeText(link).then(() => {
      setShareMsg('✓ Đã sao chép link!');
      setTimeout(() => setShareMsg(''), 2000);
    });
  };

  /* ── Tải báo cáo ── */
  const handleDownload = () => {
    if (cvData?.file_path) {
      window.open(cvData.file_path, '_blank');
    } else {
      alert('Chưa có file CV để tải xuống.');
    }
  };

  /* ── Apply / Dismiss suggestion ── */
  const handleApply   = (id) => setSuggestions(p => p.map(s => s.id === id ? { ...s, status: 'applied' }    : s));
  const handleDismiss = (id) => setSuggestions(p => p.map(s => s.id === id ? { ...s, status: 'dismissed' }  : s));

  /* ── Computed stats từ atsScore thực ── */
  const stats = atsScore !== null ? [
    { label: 'Chất lượng nội dung',  value: Math.min(atsScore - 3, 99),       badge: '+5%',         badgeType: 'success', icon: <IconCheckCircle /> },
    { label: 'Độ tương thích ATS',   value: atsScore,                          badge: atsScore >= 80 ? 'Tốt' : 'Cần cải thiện', badgeType: atsScore >= 80 ? 'success' : 'danger', icon: <IconCheckCircle /> },
    { label: 'Tác động định lượng',  value: Math.round(atsScore * 0.68),       badge: 'Cần cải thiện', badgeType: 'danger',  icon: <IconLineChart /> },
    { label: 'Độ khớp kỹ năng',      value: Math.round(atsScore * 0.83),       badge: 'Đạt yêu cầu',  badgeType: 'info',    icon: <IconTarget /> },
  ] : [];

  const hasCV = cvData !== null;

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <DashboardLayout>
      <div className="aicv-page">

        {/* ── Hero banner ── */}
        <div className="aicv-hero-banner">
          <div className="aicv-hero-left">
            <span className="aicv-hero-badge">
              <FaWandMagicSparkles className="btn-icon" /> AI INSIGHT
            </span>
            <h1 className="aicv-hero-title">
              {hasCV ? 'Báo cáo thông minh về CV' : 'Phân tích CV bằng AI'}
            </h1>
            <p className="aicv-hero-subtitle">
              {hasCV
                ? <>AI đã quét hồ sơ của bạn. Điểm ATS: <span className="highlight-role">{atsScore}/100</span>. Cập nhật: {cvData?.upload_date || '—'}</>
                : 'Tải CV lên để AI phân tích chuyên sâu, đưa ra điểm ATS và gợi ý cải thiện cá nhân hoá.'
              }
            </p>

            <div className="aicv-hero-buttons">
              {hasCV ? (
                <>
                  <button className="aicv-btn-download" onClick={handleDownload}>
                    <FaDownload className="btn-icon" /> Xem file CV
                  </button>
                  <button className="aicv-btn-share" onClick={handleShare}>
                    <FaLink className="btn-icon" />
                    {shareMsg || 'Sao chép link hồ sơ'}
                  </button>
                  <button
                    className="aicv-btn-share"
                    style={{ background: 'rgba(255,255,255,0.18)' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <FaArrowsRotate className="btn-icon" />
                    {uploading ? 'Đang tải...' : 'Cập nhật CV'}
                  </button>
                </>
              ) : (
                <button
                  className="aicv-btn-download"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <FaCloudArrowUp className="btn-icon" />
                  {uploading ? 'Đang tải lên...' : 'Tải CV lên ngay'}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => handleUpload(e.target.files?.[0])}
              />
            </div>

            {uploadMsg && (
              <div className={`aicv-upload-msg ${uploadMsg.startsWith('✓') ? 'success' : 'error'}`}>
                {uploadMsg}
              </div>
            )}
          </div>

          {/* Score ring */}
          <div className="aicv-hero-right">
            {loading ? (
              <div className="aicv-score-circular-wrapper">
                <div className="aicv-circular-progress-svg">
                  <svg viewBox="0 0 100 100" width="120" height="120">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="8" />
                  </svg>
                  <div className="score-text-overlay">
                    <FaSpinner style={{ fontSize: 22, animation: 'spin 1s linear infinite' }} />
                  </div>
                </div>
              </div>
            ) : hasCV ? (
              <div className="aicv-score-circular-wrapper">
                <div className="aicv-circular-progress-svg">
                  <svg viewBox="0 0 100 100" width="120" height="120">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="8" />
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
                <div className="aicv-score-badge">
                  {atsScore >= 80 ? 'Top 10%' : atsScore >= 60 ? 'Top 30%' : 'Cần cải thiện'}
                </div>
              </div>
            ) : (
              <div className="aicv-score-circular-wrapper">
                <div className="aicv-circular-progress-svg">
                  <svg viewBox="0 0 100 100" width="120" height="120">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="8" />
                  </svg>
                  <div className="score-text-overlay">
                    <span className="score-num" style={{ fontSize: 22 }}>—</span>
                    <span className="score-label">CHƯA CÓ CV</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Error / loading ── */}
        {error && (
          <div className="aicv-error-banner">
            <FaCircleExclamation /> <span>{error}</span>
            <button onClick={fetchCv}>Thử lại</button>
          </div>
        )}

        {/* ── Khi chưa có CV: upload dropzone ── */}
        {!loading && !hasCV && !error && (
          <div
            className="aicv-upload-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files?.[0]); }}
          >
            <FaCloudArrowUp className="aicv-upload-dropzone-icon" />
            <p className="aicv-upload-dropzone-title">Kéo thả hoặc nhấn để tải CV lên</p>
            <p className="aicv-upload-dropzone-sub">Hỗ trợ PDF, DOC, DOCX · Tối đa 10MB</p>
            {uploading && <FaSpinner style={{ marginTop: 12, fontSize: 20, animation: 'spin 1s linear infinite' }} />}
          </div>
        )}

        {/* ── Main content (chỉ khi có CV) ── */}
        {hasCV && (
          <div className="aicv-main-grid">

            {/* LEFT */}
            <div className="aicv-grid-left">

              {/* CV Preview */}
              <div className="aicv-card-container">
                <div className="aicv-card-header-row">
                  <h3 className="aicv-card-title">
                    <FaFileLines className="title-icon" /> Xem trước CV
                  </h3>
                  <button className="aicv-link-btn" onClick={() => fileInputRef.current?.click()}>
                    <FaArrowsRotate className="link-icon" />
                    {uploading ? 'Đang tải...' : 'Thay thế tệp'}
                  </button>
                </div>
                <div className="aicv-cv-preview-box">
                  {cvData?.file_path && cvData?.file_type === 'application/pdf' ? (
                    <iframe
                      src={cvData.file_path}
                      title="CV Preview"
                      style={{ width: '100%', minHeight: 380, border: 'none', borderRadius: 8 }}
                    />
                  ) : (
                    <div className="cv-mock-page">
                      <div className="cv-mock-line cv-mock-header" />
                      <div className="cv-mock-avatar-placeholder" />
                      <div className="cv-mock-line cv-mock-title" />
                      <div className="cv-mock-line cv-mock-body-1" />
                      <div className="cv-mock-line cv-mock-body-2" />
                      <div className="cv-mock-line cv-mock-body-3" />
                      <div className="cv-mock-line cv-mock-body-4" />
                      <div className="cv-mock-line cv-mock-body-5" />
                      <div className="cv-mock-line cv-mock-body-6" />
                      <div className="cv-mock-line cv-mock-body-7" />
                      {cvData?.file_path && (
                        <a
                          href={cvData.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="aicv-cv-open-link"
                        >
                          <FaFileLines style={{ marginRight: 6 }} /> Mở file CV
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Gap */}
              <div className="aicv-card-container gap-top">
                <div className="aicv-card-header-row">
                  <h3 className="aicv-card-title flex-align">
                    <div className="icon-badge-round bg-blue-light">
                      <FaLightbulb className="title-icon icon-blue" />
                    </div>
                    Phân tích thiếu hụt kỹ năng
                  </h3>
                  <button className="aicv-link-btn" onClick={() => navigate('/learning-path')}>
                    Xem lộ trình
                  </button>
                </div>
                {missingSkills.length > 0 ? (
                  <>
                    <p className="aicv-card-description">
                      Dựa trên CV của bạn, AI xác định {missingSkills.length} kỹ năng cần bổ sung:
                    </p>
                    <div className="aicv-skills-gap-list">
                      {missingSkills.map((skill, i) => (
                        <span key={i} className="skill-gap-badge">
                          <span className="plus-sign">+</span> {skill}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="aicv-card-description" style={{ textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                    ✓ Không phát hiện kỹ năng thiếu hụt đáng kể!
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="aicv-grid-right">

              {/* Stats 2x2 */}
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
                      <div className="progress-fill" style={{ width: `${stat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="aicv-card-container gap-top">
                <div className="aicv-card-header-row header-with-btn">
                  <h3 className="aicv-card-title">
                    <FaCircleInfo className="title-icon" /> Gợi ý chi tiết từng dòng
                  </h3>
                  <button
                    className="aicv-btn-optimize"
                    onClick={() => {
                      // Reset tất cả về pending
                      setSuggestions(p => p.map(s => ({ ...s, status: 'pending' })));
                    }}
                  >
                    <FaBolt className="btn-icon" /> Xem lại tất cả
                  </button>
                </div>

                {suggestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    <FaCircleCheck style={{ fontSize: 32, color: '#10b981', marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 600, color: '#10b981' }}>CV của bạn đã được tối ưu!</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13 }}>Không có gợi ý nào cần cải thiện.</p>
                  </div>
                ) : (
                  <div className="suggestions-list">
                    {suggestions.map((sug) => {
                      if (sug.status !== 'pending') {
                        return (
                          <div key={sug.id} className={`suggestion-item item-${sug.status}`}>
                            <div className="suggestion-item-status-msg">
                              {sug.status === 'applied' ? '✓ Đã áp dụng gợi ý này' : '✕ Đã bỏ qua'}
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
                              <span className="diff-text">{sug.recommendation}</span>
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
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </DashboardLayout>
  );
}