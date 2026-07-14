import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './PortfolioBuilder.css';

import {
  FaBolt,
  FaBriefcase,
  FaMedal,
  FaCheck,
  FaXmark,
  FaPlus,
  FaWandMagicSparkles,
  FaLightbulb,
  FaDesktop,
  FaMobileScreen,
  FaGlobe,
  FaStar,
  FaDownload,
  FaTrophy,
  FaChevronDown,
  FaImage,
  FaCircleCheck,
  FaRobot,
} from 'react-icons/fa6';

/* ────────────────────────── CONSTANTS ────────────────────────── */
const THEMES = [
  { id: 'modern', name: 'Modern', colors: ['var(--primary-color, #3b5bdb)', '#6b8df7', '#eef0ff'] },
  { id: 'creative', name: 'Creative', colors: ['#7c3aed', '#a78bfa', '#f5f3ff'] },
  { id: 'minimal', name: 'Minimal', colors: ['#111827', '#6b7280', '#f3f4f6'] },
  { id: 'professional', name: 'Professional', colors: ['#0f766e', '#14b8a6', '#f0fdfa'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0369a1', '#38bdf8', '#f0f9ff'] },
  { id: 'sunset', name: 'Sunset', colors: ['#dc2626', '#fb923c', '#fff7ed'] },
];

const FALLBACK_INFO = { name: '', title: '', bio: '', email: '', linkedin: '' };

/* ── Fix I.2: URL không lộ tên thật — dùng hash ngắn từ user_id ── */
function makePortfolioSlug(userId) {
  // Tạo ID ngắn dạng "p-a3f8" không lộ thông tin người dùng
  const hash = ((userId * 2654435761) >>> 0).toString(16).slice(0, 4);
  return `portfolio.ai/u/p-${hash}`;
}

/* ────────────────────────── SUB-COMPONENTS ────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="pb-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pb-toggle-slider" />
    </label>
  );
}

function SectionRow({ dot, title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pb-section-row">
      <div className="pb-section-row-header" onClick={() => setOpen(!open)}>
        <div className="pb-section-row-icon" style={{ background: dot }} />
        <div className="pb-section-row-texts">
          <p className="pb-section-row-title">{title}</p>
          <p className="pb-section-row-sub">{subtitle}</p>
        </div>
        <button
          className={`pb-section-row-edit ${open ? 'open' : ''}`}
          onClick={e => { e.stopPropagation(); setOpen(!open); }}
          aria-label={open ? 'Thu gọn' : 'Mở rộng'}
        >
          <FaChevronDown style={{ fontSize: '11px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>
      {open && <div className="pb-section-row-body">{children}</div>}
    </div>
  );
}

/* ── Portfolio Preview (bên phải) ── */
function PortfolioPreview({ info, skills, projects, awards, theme, showScore }) {
  const t = THEMES.find(x => x.id === theme) || THEMES[0];

  // Màu nền gradient cho project thumbnail theo index
  const thumbGrads = [
    [`${t.colors[0]}`, `${t.colors[1]}`],
    ['#7c3aed', '#a78bfa'],
    ['#0f766e', '#14b8a6'],
    ['#dc2626', '#fb923c'],
  ];

  return (
    <div className="pf-card">
      {/* Hero */}
      <div className="pf-hero">
        <div className="pf-hero-bg">
          <svg width="100%" height="100%" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={t.colors[2]} />
                <stop offset="100%" stopColor="#fff" />
              </linearGradient>
            </defs>
            <rect width="640" height="200" fill="url(#hg)" />
          </svg>
        </div>
        <div className="pf-hero-content">
          <div className="pf-avatar" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <h2 className="pf-name">{info.name || 'Tên của bạn'}</h2>
          <div className="pf-title-row">
            <div className="pf-title-line" style={{ background: t.colors[0] }} />
            <span className="pf-title-text" style={{ color: t.colors[0] }}>{info.title || 'Chức danh'}</span>
            <div className="pf-title-line" style={{ background: t.colors[0] }} />
          </div>
          <p className="pf-bio">{info.bio || 'Giới thiệu bản thân của bạn...'}</p>
          <div className="pf-cta-row">
            <button className="pf-btn pf-btn-primary" style={{ background: t.colors[0] }}>Tải CV (PDF)</button>
            <button className="pf-btn pf-btn-outline">Liên hệ</button>
          </div>
        </div>
      </div>

      {/* Skills & Score */}
      <div className="pf-skills-score-row">
        <div className="pf-skills-card">
          <p className="pf-skills-card-label">
            Kỹ năng cốt lõi
            <FaBolt style={{ color: t.colors[0], fontSize: '12px', marginLeft: '4px' }} />
          </p>
          {skills.length > 0 ? (
            <div className="pf-skill-pills">
              {skills.map(s => <span key={s} className="pf-skill-pill">{s}</span>)}
            </div>
          ) : (
            <p className="pf-empty-hint">Thêm kỹ năng của bạn →</p>
          )}
        </div>

        {/* Fix I.1: Chỉ hiển thị score khi có đủ dữ liệu thật */}
        {showScore ? (
          <div className="pf-score-card" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
            <p className="pf-score-card-label">Chỉ số ấn tượng</p>
            <div>
              <div className="pf-score-number">{info.score}%</div>
              <div className="pf-score-sub">Khả năng phù hợp với JD</div>
            </div>
            <div className="pf-score-bar-track">
              <div className="pf-score-bar-fill" style={{ width: `${info.score}%` }} />
            </div>
          </div>
        ) : (
          <div className="pf-score-card pf-score-placeholder" style={{ background: `linear-gradient(135deg, ${t.colors[0]}aa, ${t.colors[1]}aa)` }}>
            <p className="pf-score-card-label">Chỉ số ấn tượng</p>
            <div className="pf-score-placeholder-content">
              <FaWandMagicSparkles style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }} />
              <div className="pf-score-placeholder-text">Thêm kỹ năng &amp; dự án để AI tính điểm</div>
            </div>
          </div>
        )}
      </div>

      {/* Projects ─ Visual Cards */}
      <div className="pf-section-divider" />
      <div className="pf-section">
        <p className="pf-section-title">Dự án tiêu biểu</p>
        {projects.length > 0 ? projects.map((p, idx) => {
          const grad = thumbGrads[idx % thumbGrads.length];
          const techList = p.tech ? p.tech.split(',').map(t => t.trim()).filter(Boolean) : [];
          return (
            <div key={p.id} className="pf-project-visual-card">
              {/* Thumbnail */}
              <div className="pf-project-thumb-visual" style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
                {p.image ? (
                  <img src={p.image} alt={p.title} />
                ) : (
                  <div className="pf-project-thumb-placeholder">
                    <FaBriefcase style={{ fontSize: 24, marginBottom: 4 }} />
                    <span>{p.title}</span>
                  </div>
                )}
              </div>
              {/* Body */}
              <div className="pf-project-card-body">
                <p className="pf-project-title">{p.title}</p>
                <p className="pf-project-desc">{p.desc}</p>
                {techList.length > 0 && (
                  <div className="pf-project-tech-tags">
                    {techList.map(tech => (
                      <span key={tech} className="pf-tech-tag" style={{ background: t.colors[2], color: t.colors[0] }}>{tech}</span>
                    ))}
                  </div>
                )}
                {p.link && (
                  <a href={p.link} className="pf-project-link" style={{ fontSize: 11, color: '#6b7280', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    🔗 {p.link}
                  </a>
                )}
              </div>
            </div>
          );
        }) : (
          <p className="pf-empty-hint">Thêm dự án đầu tiên của bạn →</p>
        )}
      </div>

      {/* Awards */}
      {awards && awards.length > 0 && (
        <>
          <div className="pf-section-divider" />
          <div className="pf-section">
            <p className="pf-section-title">Thành tựu &amp; Giải thưởng</p>
            {awards.map(a => (
              <div key={a.id} className="pf-award-item">
                <div className="pf-award-icon" style={{ background: t.colors[2] }}>
                  <FaMedal style={{ color: t.colors[0], fontSize: '16px' }} />
                </div>
                <div className="pf-award-body">
                  <p className="pf-award-title">{a.title}</p>
                  <p className="pf-award-org">{a.org}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ────────────────────────── MAIN COMPONENT ────────────────────────── */
export default function PortfolioBuilder() {
  const [theme, setTheme] = useState('modern');
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [aiOn, setAiOn] = useState(true);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [info, setInfo] = useState(FALLBACK_INFO);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState([]);
  const [awards, setAwards] = useState([]);
  const [aiInsight, setAiInsight] = useState({ insight: '', score: 0 });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [portfolioUrl, setPortfolioUrl] = useState('portfolio.ai/u/p-????');

  /* ── Parse user từ localStorage (safe) ── */
  useEffect(() => {
    let uid = null;
    try {
      const u = JSON.parse(localStorage.getItem('career_user'));
      uid = u?.user_id || null;
    } catch { uid = null; }
    setUserId(uid);
    // Fix I.2: URL dùng hash ngắn, không lộ tên thật
    if (uid) setPortfolioUrl(makePortfolioSlug(uid));
  }, []);

  /* ── Fetch dữ liệu từ API ── */
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/user/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const d = json.data;
        setInfo({
          name: d.full_name || '',
          title: d.bio?.includes('||') ? d.bio.split('||')[0] : (d.bio?.split('.')[0] || ''),
          bio: d.bio?.includes('||') ? d.bio.split('||')[1] : (d.bio || ''),
          email: d.email || '',
          linkedin: '',
        });
      }).catch(() => { });

    fetch(`http://localhost:5000/api/skills/${userId}`)
      .then(r => r.json())
      .then(json => { if (json.success) setSkills(json.data.map(s => s.skill_name)); })
      .catch(() => { });

    fetch(`http://localhost:5000/api/experience/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        setProjects(json.data.map(exp => ({
          id: exp.experience_id,
          title: `${exp.position} - ${exp.company}`,
          desc: exp.description || '',
          tech: '',
          link: '',
        })));
      }).catch(() => { });

    fetch(`http://localhost:5000/api/certificate/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        setAwards(json.data.map(cert => ({
          id: cert.certificate_id,
          title: cert.name,
          org: cert.organization + (cert.issue_date ? ` (${cert.issue_date})` : ''),
        })));
      }).catch(() => { });
  }, [userId]);

  /* ── Fix I.1: Score chỉ được fetch khi có data thật, không hardcode ── */
  useEffect(() => {
    // Không fetch nếu AI off hoặc chưa có đủ dữ liệu
    if (!aiOn || (skills.length === 0 && projects.length === 0)) {
      setAiInsight({ insight: '', score: 0 });
      return;
    }
    const timer = setTimeout(() => {
      setAiInsight(prev => ({ ...prev, insight: 'Đang phân tích...' }));
      fetch('http://localhost:5000/api/portfolio/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, projects }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) setAiInsight({ insight: json.data.insight, score: json.data.score || 0 });
        })
        .catch(() => setAiInsight(prev => ({ ...prev, insight: 'AI hiện không khả dụng.' })));
    }, 2000);
    return () => clearTimeout(timer);
  }, [skills, projects, aiOn]);

  /* ── Fix II.2: Toggle AI ảnh hưởng thực sự đến UI ── */
  const handleAiToggle = (val) => {
    setAiOn(val);
    if (!val) {
      setAiInsight({ insight: '', score: 0 });
    }
  };

  /* ── Optimize projects bằng AI (chỉ khi aiOn) ── */
  const handleOptimizeProjects = async () => {
    if (projects.length === 0 || !aiOn) return;
    setIsOptimizing(true);
    const newProjects = [...projects];
    for (let i = 0; i < newProjects.length; i++) {
      if (newProjects[i].desc) {
        try {
          const res = await fetch('http://localhost:5000/api/portfolio/optimize-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newProjects[i].desc }),
          });
          const json = await res.json();
          if (json.success) newProjects[i].desc = json.data;
        } catch (e) { console.error(e); }
      }
    }
    setProjects(newProjects);
    setIsOptimizing(false);
  };

  /* ── Fix I.3: Auto-fill có confirm dialog khi đang có dữ liệu ── */
  const handleExtractCV = async () => {
    const hasExistingData = skills.length > 0 || projects.length > 0 || awards.length > 0;
    if (hasExistingData) {
      const confirmed = window.confirm(
        '⚠️ Bạn đang có dữ liệu trong Portfolio.\n\n' +
        'Tính năng "Auto điền từ CV" sẽ BỔ SUNG thêm dữ liệu từ CV vào các mục hiện tại (không xoá dữ liệu cũ).\n\n' +
        'Bạn có muốn tiếp tục không?'
      );
      if (!confirmed) return;
    }

    setIsExtracting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/portfolio/extract-cv/${userId}`, { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.skills) setSkills(prev => [...new Set([...prev, ...d.skills])]);
        if (d.projects) setProjects(prev => [...prev, ...d.projects.map((p, i) => ({ id: Date.now() + i, title: p.title || 'Dự án mới', desc: p.desc || '', tech: p.tech || '', link: '' }))]);
        if (d.awards) setAwards(prev => [...prev, ...d.awards.map((a, i) => ({ id: Date.now() + 100 + i, title: a.title || 'Giải thưởng', org: a.org || '' }))]);
        alert('✅ Đã trích xuất và bổ sung thông tin từ CV thành công!');
      } else {
        alert(json.message || 'Không tìm thấy dữ liệu CV để trích xuất.');
      }
    } catch {
      alert('Không thể kết nối máy chủ. Vui lòng thử lại.');
    }
    setIsExtracting(false);
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    try {
      await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: info.name, bio: `${info.title}||${info.bio}` }),
      });
    } catch (e) { console.error('Failed to save profile', e); }
  };

  /* ── Tải PDF (Fix II.4: nút này ở đúng vị trí — preview header) ── */
  const handleDownloadPDF = () => {
    const element = document.getElementById('portfolio-preview-content');
    if (element) {
      const slug = userId ? `p-${((userId * 2654435761) >>> 0).toString(16).slice(0, 4)}` : 'career_ai';
      html2pdf().set({
        margin: [0, 0, 0, 0],
        filename: `Portfolio_${slug}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }).from(element).save();
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  /* Fix I.1: showScore chỉ true khi có đủ dữ liệu thật và AI đang bật */
  const showScore = aiOn && skills.length > 0 && projects.length > 0 && aiInsight.score > 0;

  /* Fix II.1a: Themes hiển thị — 4 khi thu gọn, tất cả khi mở rộng */
  const visibleThemes = showAllThemes ? THEMES : THEMES.slice(0, 4);

  /* Fix II.1b: Preview width theo device */
  const previewMaxWidth = device === 'mobile' ? '375px' : '100%';
  const previewRadius = device === 'mobile' ? '32px' : '12px';
  const previewBorder = device === 'mobile' ? '6px solid #1a1a1a' : 'none';
  const previewShadow = device === 'mobile' ? '0 20px 60px rgba(0,0,0,0.25)' : 'none';

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <DashboardLayout>
      <div className="pb-page">
        <div className="pb-main">

          {/* ══════════════ LEFT EDITOR ══════════════ */}
          <div className="pb-editor">

            {/* Theme selector */}
            <div className="pb-theme-bar">
              <div className="pb-theme-bar-row">
                <span className="pb-theme-bar-label">Chọn Giao diện</span>
                {/* Fix II.1a: nút "Xem tất cả" thực sự toggle */}
                <button className="pb-theme-see-all" onClick={() => setShowAllThemes(v => !v)}>
                  {showAllThemes ? 'Thu gọn' : `Xem tất cả (${THEMES.length})`}
                </button>
              </div>
              <div className={`pb-theme-cards ${showAllThemes ? 'expanded' : ''}`}>
                {visibleThemes.map(t => (
                  <div key={t.id} className={`pb-theme-card ${theme === t.id ? 'selected' : ''}`} onClick={() => setTheme(t.id)}>
                    <div className="pb-theme-thumb" style={{ background: t.colors[2] }}>
                      <div className="pb-theme-bar-line" style={{ background: t.colors[0] }} />
                      <div className="pb-theme-bar-line short" style={{ background: t.colors[1] }} />
                      <div className="pb-theme-bar-line xshort" style={{ background: t.colors[1] }} />
                    </div>
                    <div className="pb-theme-card-name">{t.name}</div>
                    {theme === t.id && (
                      <div className="pb-selected-dot">
                        <FaCheck style={{ color: 'white', fontSize: '10px' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content header */}
            <div className="pb-content-header-bar">
              <span className="pb-content-header-bar-label">Khối nội dung</span>
              {/* Fix II.2: Toggle thực sự ảnh hưởng đến AI insight và nút optimize */}
              <div className="pb-ai-toggle-row">
                <span style={{ color: aiOn ? 'var(--primary-color, #3b5bdb)' : '#9ca3af' }}>Tối ưu AI</span>
                <Toggle checked={aiOn} onChange={handleAiToggle} />
              </div>
            </div>

            {/* Section rows */}
            <div className="pb-sections-list">

              {/* Thông tin cá nhân */}
              <SectionRow dot="var(--primary-color, #3b5bdb)" title="Thông tin cá nhân" subtitle={info.name ? `${info.name}${info.title ? ' • ' + info.title : ''}` : 'Chưa có thông tin'}>
                {['name', 'title', 'email', 'linkedin'].map(f => (
                  <div className="pb-form-group" key={f}>
                    <label className="pb-form-label">{{ name: 'Họ và tên', title: 'Chức danh', email: 'Email', linkedin: 'LinkedIn' }[f]}</label>
                    <input className="pb-form-input" value={info[f]} onChange={e => setInfo({ ...info, [f]: e.target.value })} onBlur={handleSaveProfile} />
                  </div>
                ))}
                <div className="pb-form-group">
                  <label className="pb-form-label">Giới thiệu</label>
                  <textarea className="pb-form-textarea" value={info.bio} onChange={e => setInfo({ ...info, bio: e.target.value })} onBlur={handleSaveProfile} />
                </div>
              </SectionRow>

              {/* Kỹ năng */}
              <SectionRow dot="#f59e0b" title="Kỹ năng cốt lõi" subtitle={skills.length > 0 ? `${skills.length} kỹ năng đã xác thực` : 'Chưa có kỹ năng — thêm vào ngay!'}>
                <div className="pb-skills-tags">
                  {skills.map(s => (
                    <div key={s} className="pb-skill-tag">
                      {s}
                      <button className="pb-skill-remove" onClick={() => setSkills(skills.filter(x => x !== s))}>
                        <FaXmark />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pb-add-skill-row">
                  <input className="pb-add-skill-input" placeholder="Thêm kỹ năng..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                  <button className="pb-add-skill-btn" onClick={addSkill}>Thêm</button>
                </div>
              </SectionRow>

              {/* Dự án */}
              <SectionRow dot="#8b5cf6" title="Dự án tiêu biểu" subtitle={projects.length > 0 ? `${projects.length} dự án` : 'Chưa có dự án — thêm ngay!'}>
                {/* Fix II.2: Nút optimize chỉ active khi aiOn = true */}
                <button
                  className={`pb-ai-optimize-btn ${!aiOn ? 'disabled' : ''}`}
                  onClick={handleOptimizeProjects}
                  disabled={isOptimizing || !aiOn || projects.length === 0}
                  title={!aiOn ? 'Bật Tối ưu AI để sử dụng tính năng này' : ''}
                >
                  <FaWandMagicSparkles style={{ marginRight: '6px' }} />
                  {isOptimizing ? 'Đang tối ưu...' : !aiOn ? 'Tối ưu AI (đang tắt)' : 'Tối ưu mô tả dự án bằng AI'}
                </button>
                {projects.map(p => (
                  <div key={p.id} className="pb-proj-card">
                    <div className="pb-proj-card-head">
                      <span className="pb-proj-card-title">{p.title}</span>
                      <button className="pb-proj-remove" onClick={() => setProjects(projects.filter(x => x.id !== p.id))}>
                        <FaXmark />
                      </button>
                    </div>
                    <label className="pb-form-label">Tên dự án</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} value={p.title} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, title: e.target.value } : x))} />
                    <label className="pb-form-label">Công nghệ / Kỹ năng</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} placeholder="React, Node.js, Python..." value={p.tech || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, tech: e.target.value } : x))} />
                    <label className="pb-form-label">Link dự án (Tuỳ chọn)</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} placeholder="https://..." value={p.link || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, link: e.target.value } : x))} />
                    <label className="pb-form-label">Mô tả chi tiết</label>
                    <textarea className="pb-form-textarea" style={{ minHeight: 60 }} placeholder="Mô tả theo cấu trúc: Hành động + Công việc + Kết quả đo lường được..." value={p.desc} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, desc: e.target.value } : x))} />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setProjects([...projects, { id: Date.now(), title: 'Dự án mới', desc: '', tech: '', link: '' }])}>
                  <FaPlus style={{ marginRight: '6px' }} /> Thêm dự án
                </button>
              </SectionRow>

              {/* Thành tựu — Fix II.3: Empty state tích cực */}
              <SectionRow
                dot="#10b981"
                title="Thành tựu & Giải thưởng"
                subtitle={awards.length > 0 ? awards[0]?.title : 'Thêm thành tựu đầu tiên của bạn!'}
              >
                {awards.length === 0 && (
                  <div className="pb-empty-state-cta">
                    <FaTrophy style={{ fontSize: 28, color: '#d1d5db', marginBottom: 8 }} />
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#374151', fontSize: 13 }}>Chứng chỉ, giải thưởng, học bổng...</p>
                    <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: 12 }}>Thêm thành tựu giúp profile của bạn nổi bật hơn 3x so với ứng viên khác</p>
                  </div>
                )}
                {awards.map(a => (
                  <div key={a.id} className="pb-proj-card">
                    <div className="pb-proj-card-head">
                      <span className="pb-proj-card-title">{a.title}</span>
                      <button className="pb-proj-remove" onClick={() => setAwards(awards.filter(x => x.id !== a.id))}>
                        <FaXmark />
                      </button>
                    </div>
                    <div className="pb-form-group" style={{ marginBottom: 10 }}>
                      <label className="pb-form-label">Tên giải thưởng / Chứng chỉ</label>
                      <input className="pb-form-input" value={a.title} onChange={e => setAwards(awards.map(x => x.id === a.id ? { ...x, title: e.target.value } : x))} />
                    </div>
                    <label className="pb-form-label">Tổ chức cấp & Năm nhận</label>
                    <input className="pb-form-input" placeholder="VD: Google - 2025" value={a.org} onChange={e => setAwards(awards.map(x => x.id === a.id ? { ...x, org: e.target.value } : x))} />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setAwards([...awards, { id: Date.now(), title: 'Giải thưởng mới', org: '' }])}>
                  <FaPlus style={{ marginRight: '6px' }} /> Thêm giải thưởng
                </button>
              </SectionRow>
            </div>

            {/* AI Insight — Fix II.2: chỉ hiện khi aiOn */}
            {aiOn && aiInsight.insight && (
              <div className="pb-ai-insight">
                <div className="pb-ai-insight-icon">
                  <FaLightbulb style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <div>
                  <p className="pb-ai-insight-label">AI Insight</p>
                  <p className="pb-ai-insight-text">{aiInsight.insight}</p>
                </div>
              </div>
            )}
            {!aiOn && (
              <div className="pb-ai-insight pb-ai-off">
                <div className="pb-ai-insight-icon" style={{ background: '#e5e7eb' }}>
                  <FaLightbulb style={{ color: '#9ca3af', fontSize: '14px' }} />
                </div>
                <div>
                  <p className="pb-ai-insight-label" style={{ color: '#9ca3af' }}>Tối ưu AI đang tắt</p>
                  <p className="pb-ai-insight-text" style={{ color: '#9ca3af' }}>Bật toggle "Tối ưu AI" phía trên để nhận phân tích từ AI.</p>
                </div>
              </div>
            )}

            {/* Actions — Fix II.4: Chỉ để "Auto điền từ CV" ở đây, PDF đã chuyển lên preview header */}
            <div className="pb-actions-bar">
              <button className="pb-btn-extract" onClick={handleExtractCV} disabled={isExtracting || !userId}>
                <FaWandMagicSparkles style={{ marginRight: '6px' }} />
                {isExtracting ? 'Đang đọc CV...' : 'Auto điền từ CV'}
              </button>
            </div>
          </div>

          {/* ══════════════ RIGHT PREVIEW ══════════════ */}
          <div className="pb-preview">

            {/* Toolbar: Device switch + PDF button (Fix II.4: PDF đúng vị trí) */}
            <div className="pb-preview-toolbar">
              {/* Fix II.1b: Device switch thực sự thay đổi preview */}
              <div className="pb-device-switch">
                {[['desktop', 'Desktop', <FaDesktop />], ['mobile', 'Mobile', <FaMobileScreen />]].map(([d, label, icon]) => (
                  <button
                    key={d}
                    className={`pb-device-btn ${device === d ? 'active' : ''}`}
                    onClick={() => setDevice(d)}
                    aria-label={`Chế độ xem ${label}`}
                  >
                    {icon} <span style={{ marginLeft: 4 }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Fix II.4: Nút PDF ở góc trên phải preview — đúng UX flow (publish cuối cùng) */}
              <button className="pb-btn-pdf" onClick={handleDownloadPDF}>
                <FaDownload style={{ marginRight: '6px' }} /> Tải PDF
              </button>
            </div>

            {/* URL bar */}
            <div className="pb-preview-url-bar">
              <div className="pb-browser-dots">
                <div className="pb-dot" style={{ background: '#ef4444' }} />
                <div className="pb-dot" style={{ background: '#f59e0b' }} />
                <div className="pb-dot" style={{ background: '#10b981' }} />
              </div>
              <div className="pb-url-input">
                <FaGlobe style={{ color: '#9ca3af', marginRight: '6px' }} />
                {/* Fix I.2: Hiển thị URL an toàn, không lộ tên thật */}
                {portfolioUrl}
              </div>
              <button className="pb-star-btn" title="Lưu trang">
                <FaStar style={{ color: '#9ca3af' }} />
              </button>
            </div>

            {/* Preview frame — Fix II.1b: thực sự co giãn theo device */}
            <div className="pb-preview-frame">
              <div
                id="portfolio-preview-content"
                className={`pb-preview-inner ${device}`}
                style={{
                  width: '100%',
                  maxWidth: previewMaxWidth,
                  margin: '0 auto',
                  background: 'transparent',
                  borderRadius: previewRadius,
                  border: previewBorder,
                  boxShadow: previewShadow,
                  transition: 'max-width 0.3s ease, border-radius 0.3s ease',
                  // Fix: KHÔNG dùng overflow:hidden — sẽ clip nội dung và ẩn scrollbar
                  // Desktop: overflow visible để pb-preview-frame xử lý scroll
                  // Mobile: overflow auto để cuộn trong khung phone frame
                  overflow: device === 'mobile' ? 'auto' : 'visible',
                  maxHeight: device === 'mobile' ? 'calc(100vh - 220px)' : 'none',
                }}
              >
                <PortfolioPreview
                  info={{ ...info, score: aiInsight.score }}
                  skills={skills}
                  projects={projects}
                  awards={awards}
                  theme={theme}
                  showScore={showScore}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}