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
  FaFileLines,
  FaArrowsRotate,
  FaLightbulb,
  FaCircleCheck,
  FaBolt,
  FaCircleInfo,
  FaCloudArrowUp,
  FaSpinner,
  FaCircleExclamation,
} from 'react-icons/fa6';

export default function AiCvAnalysis() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── Fix I.5: Bọc JSON.parse trong try/catch để tránh crash ──
  let localUser = {};
  try {
    localUser = JSON.parse(localStorage.getItem('career_user')) || {};
  } catch {
    localUser = {};
  }
  const userId = localUser.user_id;

  const [cvData,        setCvData]        = useState(null);
  const [atsScore,      setAtsScore]      = useState(null);
  const [suggestions,   setSuggestions]   = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [uploading,     setUploading]     = useState(false);
  const [uploadMsg,     setUploadMsg]     = useState('');
  const [error,         setError]         = useState('');

  // ── PDF Blob URL: fetch PDF từ backend về client để tránh Chrome chặn CORS/X-Frame-Options ──
  const [pdfBlobUrl,  setPdfBlobUrl]  = useState(null);
  const [pdfLoading,  setPdfLoading]  = useState(false);
  const [pdfError,    setPdfError]    = useState(false);

  /* ── Fetch CV data từ backend (nguồn thật, không từ localStorage) ── */
  const fetchCv = () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    fetch(`http://localhost:5000/api/cv/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) { setLoading(false); return; }
        const d = json.data;
        setCvData(d);
        // Fix I.1: Điểm ATS từ API, không hardcode, đồng bộ với Dashboard
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

  /* ── Khi có file PDF: fetch về Blob để bypass Chrome iframe CORS block ──
   *  Blob URL (blob://localhost/...) thuộc origin frontend → Chrome không chặn.
   *  Cleanup: revokeObjectURL khi URL cũ bị thay thế hoặc component unmount.
   */
  useEffect(() => {
    if (!cvData?.file_path || cvData?.file_type !== 'application/pdf') {
      setPdfBlobUrl(null);
      return;
    }
    let currentUrl = null;
    setPdfLoading(true);
    setPdfError(false);

    fetch(cvData.file_path)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        currentUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(currentUrl);
      })
      .catch(() => setPdfError(true))
      .finally(() => setPdfLoading(false));

    // Cleanup: giải phóng bộ nhớ khi blob URL cũ không còn dùng
    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [cvData?.file_path]);

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

  /* ── Tải file CV gốc (mở trong tab mới) ── */
  const handleDownload = () => {
    if (cvData?.file_path) {
      window.open(cvData.file_path, '_blank');
    } else {
      alert('Chưa có file CV để tải xuống.');
    }
  };

  /* ── Apply / Dismiss suggestion ── */
  const handleApply   = (id) => setSuggestions(p => p.map(s => s.id === id ? { ...s, status: 'applied' }   : s));
  const handleDismiss = (id) => setSuggestions(p => p.map(s => s.id === id ? { ...s, status: 'dismissed' } : s));

  /* ── Computed stats từ atsScore thực (Fix I.1: đồng bộ điểm) ── */
  const stats = atsScore !== null ? [
    { label: 'Chất lượng nội dung', value: Math.min(atsScore - 3, 99),     badge: '+5%',          badgeType: 'success', icon: <IconCheckCircle /> },
    { label: 'Độ tương thích ATS',  value: atsScore,                        badge: atsScore >= 80 ? 'Tốt' : 'Cần cải thiện', badgeType: atsScore >= 80 ? 'success' : 'danger', icon: <IconCheckCircle /> },
    { label: 'Tác động định lượng', value: Math.round(atsScore * 0.68),     badge: 'Cần cải thiện', badgeType: 'danger',  icon: <IconLineChart /> },
    { label: 'Độ khớp kỹ năng',     value: Math.round(atsScore * 0.83),     badge: 'Đạt yêu cầu',  badgeType: 'info',    icon: <IconTarget /> },
  ] : [];

  const hasCV = cvData !== null;

  // Fix I.3: Logic gợi ý thông minh hơn
  // Nếu điểm chưa tối đa (< 100) nhưng suggestions rỗng → hiển thị thông báo trung lập
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const allActioned        = suggestions.length > 0 && pendingSuggestions.length === 0;
  const noSuggestionsFromAI = suggestions.length === 0;

  const suggestionEmptyReason = atsScore !== null && atsScore < 100
    ? `Điểm ATS của bạn là ${atsScore}/100. AI chưa tạo được gợi ý cụ thể cho CV này — hãy thử phân tích lại.`
    : 'CV của bạn đạt điểm tối đa! Không có gợi ý nào cần cải thiện.';

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
                  {/* Nút xem file CV */}
                  <button className="aicv-btn-download" onClick={handleDownload}>
                    <FaDownload className="btn-icon" /> Xem file CV
                  </button>

                  {/* Fix II.3: Gộp "Cập nhật CV" + "Thay thế tệp" thành 1 nút duy nhất ở hero.
                      Bỏ "Sao chép link hồ sơ" vì sai ngữ cảnh (trang phân tích nội bộ). */}
                  <button
                    className="aicv-btn-share"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <FaArrowsRotate className="btn-icon" />
                    {uploading ? 'Đang tải lên...' : 'Cập nhật CV'}
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
                  {/* Fix II.3: Chỉ 1 nút thay thế file ở đây (trong card), nút ở hero đã bị gộp */}
                  <button className="aicv-link-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <FaArrowsRotate className="link-icon" />
                    {uploading ? 'Đang tải...' : 'Đổi file'}
                  </button>
                </div>

                {/* PDF viewer: dùng Blob URL để bypass Chrome CORS/X-Frame-Options block */}
                <div className="aicv-cv-preview-box">
                  {cvData?.file_type === 'application/pdf' ? (
                    pdfLoading ? (
                      /* Đang fetch PDF từ backend */
                      <div className="aicv-pdf-loading">
                        <FaSpinner style={{ fontSize: 28, animation: 'spin 1s linear infinite', color: '#3b5bdb' }} />
                        <p>Đang tải file CV...</p>
                      </div>
                    ) : pdfError || !pdfBlobUrl ? (
                      /* Fetch thất bại — hiển thị fallback mở tab mới */
                      <div className="aicv-pdf-error">
                        <FaFileLines style={{ fontSize: 36, color: '#94a3b8', marginBottom: 12 }} />
                        <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#374151' }}>Không thể xem trước PDF</p>
                        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
                          File có thể chưa sẵn sàng hoặc server chưa phản hồi.
                        </p>
                        <a
                          href={cvData.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="aicv-cv-open-link"
                        >
                          <FaDownload style={{ marginRight: 6 }} /> Mở PDF trong tab mới
                        </a>
                      </div>
                    ) : (
                      /* Blob URL thành công — nhúng trực tiếp bằng <embed>, Chrome không chặn */
                      <embed
                        src={pdfBlobUrl}
                        type="application/pdf"
                        style={{
                          width: '100%',
                          height: '420px',
                          border: 'none',
                          borderRadius: 8,
                          display: 'block',
                        }}
                      />
                    )
                  ) : (
                    /* Không phải PDF (DOC/DOCX) — hiển thị mock + link mở */
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

              {/* Suggestions — Fix I.3: Logic mâu thuẫn đã được sửa */}
              <div className="aicv-card-container gap-top">
                <div className="aicv-card-header-row header-with-btn">
                  <h3 className="aicv-card-title">
                    <FaCircleInfo className="title-icon" /> Gợi ý cải thiện từng dòng
                  </h3>
                  {suggestions.length > 0 && (
                    <button
                      className="aicv-btn-optimize"
                      onClick={() => setSuggestions(p => p.map(s => ({ ...s, status: 'pending' })))}
                    >
                      <FaBolt className="btn-icon" /> Xem lại tất cả
                    </button>
                  )}
                </div>

                {/* Fix I.3: Tách biệt 3 trường hợp rõ ràng */}
                {allActioned ? (
                  /* Người dùng đã xử lý hết tất cả gợi ý */
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <FaCircleCheck style={{ fontSize: 32, color: '#10b981', marginBottom: 8 }} />
                    <p style={{ margin: 0, fontWeight: 600, color: '#10b981' }}>Bạn đã xử lý tất cả gợi ý!</p>
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>Nhấn "Xem lại tất cả" để xem lại.</p>
                  </div>
                ) : noSuggestionsFromAI ? (
                  /* AI không tạo ra suggestions — phân biệt đạt max hay thiếu dữ liệu */
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    {atsScore === 100 ? (
                      <>
                        <FaCircleCheck style={{ fontSize: 32, color: '#10b981', marginBottom: 8 }} />
                        <p style={{ margin: 0, fontWeight: 600, color: '#10b981' }}>CV đạt điểm tuyệt đối!</p>
                        <p style={{ margin: '6px 0 0', fontSize: 13 }}>Không có gợi ý nào cần cải thiện.</p>
                      </>
                    ) : (
                      <>
                        <FaCircleInfo style={{ fontSize: 32, color: '#f59e0b', marginBottom: 8 }} />
                        <p style={{ margin: 0, fontWeight: 600, color: '#92400e' }}>
                          Điểm ATS: {atsScore}/100
                        </p>
                        <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                          AI chưa tạo được gợi ý cụ thể cho CV này.
                          <br />Thử <strong>cập nhật CV</strong> để nhận phân tích chi tiết hơn.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  /* Danh sách gợi ý pending */
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