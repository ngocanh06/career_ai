import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './PortfolioBuilder.css';

import {
  FaBolt, FaBriefcase, FaMedal, FaCheck, FaXmark, FaPlus,
  FaWandMagicSparkles, FaLightbulb, FaDesktop, FaMobileScreen,
  FaGlobe, FaStar, FaDownload, FaTrophy, FaChevronDown,
  FaCircleCheck, FaRobot, FaGithub, FaLink, FaArrowRight,
  FaMagnifyingGlass, FaPalette, FaTableColumns,
  FaFont, FaPen, FaBullseye, FaImage, FaChevronRight,
  FaCamera, FaUserTie, FaEnvelope, FaLinkedin,
  FaPhone, FaLocationDot,
} from 'react-icons/fa6';

/* ─────────────────────── DESIGN TOKENS ─────────────────────── */
const PRIMARY = '#4f6ef7';

/* ─────────────────────── CONSTANTS ─────────────────────── */
const THEMES = [
  { id: 'modern', name: 'Modern', colors: [PRIMARY, '#7b96ff', '#eef0ff'] },
  { id: 'creative', name: 'Creative', colors: ['#7c3aed', '#a78bfa', '#f5f3ff'] },
  { id: 'minimal', name: 'Minimal', colors: ['#111827', '#6b7280', '#f3f4f6'] },
  { id: 'professional', name: 'Professional', colors: ['#0f766e', '#14b8a6', '#f0fdfa'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0369a1', '#38bdf8', '#f0f9ff'] },
  { id: 'sunset', name: 'Sunset', colors: ['#dc2626', '#fb923c', '#fff7ed'] },
];

const FONTS = [
  { id: 'sans', name: 'Sans', label: 'Inter', css: "'Inter', system-ui, sans-serif" },
  { id: 'serif', name: 'Serif', label: 'Playfair Display', css: "'Playfair Display', Georgia, serif" },
  { id: 'mono', name: 'Mono', label: 'Fira Code', css: "'Fira Code', 'Courier New', monospace" },
];

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Chuyên nghiệp, formal' },
  { id: 'creative', label: 'Creative', desc: 'Sáng tạo, phóng khoáng' },
  { id: 'tech', label: 'Tech-focused', desc: 'Kỹ thuật, data-driven' },
];

const FALLBACK_INFO = { name: '', title: '', bio: '', email: '', linkedin: '', phone: '', address: '' };

/* ─────────────────────── HELPER: detect AI critique text ─────────────────────── */
const AI_CRITIQUE_KEYWORDS = [
  'cần cải thiện', 'thiếu kinh nghiệm', 'chưa hoàn thiện', 'nên bổ sung',
  'hạn chế', 'cần phát triển', 'ứng viên cần', 'cv của ứng viên',
  'tuy nhiên, ứng viên', 'điểm yếu', 'điểm cần', 'chưa có bằng',
];

function isCritiqueText(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return AI_CRITIQUE_KEYWORDS.some(kw => lower.includes(kw));
}

function makePortfolioSlug(userId) {
  const hash = ((userId * 2654435761) >>> 0).toString(16).slice(0, 4);
  return `portfolio.ai/u/p-${hash}`;
}

/* ─────────────────────── TOGGLE ─────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="pb-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pb-toggle-slider" />
    </label>
  );
}

/* ─────────────────────── SECTION ROW ─────────────────────── */
function SectionRow({ dot, title, subtitle, children, sectionRef, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pb-section-row" ref={sectionRef}>
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

/* ─────────────────────── ATS PANEL ─────────────────────── */
function ATSPanel({ score, skills, onAddKeywords, themeColor }) {
  const [open, setOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async () => {
    if (!jdText.trim()) return;
    setScanning(true);
    try {
      const res = await fetch('http://localhost:5000/api/portfolio/ats-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: jdText, skills }),
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      } else {
        const words = jdText.match(/\b[A-Za-z][A-Za-z0-9+#.]{1,15}\b/g) || [];
        const techWords = [...new Set(words.filter(w => w.length > 3))].slice(0, 10);
        const skillsLower = skills.map(s => s.toLowerCase());
        setResults({
          matched: techWords.filter(w => skillsLower.includes(w.toLowerCase())),
          missing: techWords.filter(w => !skillsLower.includes(w.toLowerCase())).slice(0, 6),
        });
      }
    } catch {
      const words = jdText.match(/\b[A-Za-z][A-Za-z0-9+#.]{1,15}\b/g) || [];
      const techWords = [...new Set(words.filter(w => w.length > 3))].slice(0, 10);
      const skillsLower = skills.map(s => s.toLowerCase());
      setResults({
        matched: techWords.filter(w => skillsLower.includes(w.toLowerCase())),
        missing: techWords.filter(w => !skillsLower.includes(w.toLowerCase())).slice(0, 6),
      });
    }
    setScanning(false);
  };

  return (
    <div className="pf-ats-wrapper">
      <div
        className={`pf-score-card ${open ? 'expanded' : ''}`}
        style={{ background: `linear-gradient(135deg, ${themeColor[0]}, ${themeColor[1]})` }}
        onClick={() => setOpen(!open)}
        role="button"
        aria-expanded={open}
      >
        <div className="pf-score-card-top">
          <p className="pf-score-card-label">Chỉ số ATS</p>
          <FaChevronRight className={`pf-score-chevron ${open ? 'open' : ''}`} />
        </div>
        {score > 0 ? (
          <>
            <div className="pf-score-number">{score}%</div>
            <div className="pf-score-sub">Khả năng phù hợp với JD</div>
            <div className="pf-score-bar-track">
              <div className="pf-score-bar-fill" style={{ width: `${score}%` }} />
            </div>
          </>
        ) : (
          <div className="pf-score-placeholder-content">
            <FaBullseye style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }} />
            <div className="pf-score-placeholder-text">Paste JD để phân tích ATS →</div>
          </div>
        )}
        <div className="pf-score-hint">Nhấn để quét từ khóa</div>
      </div>

      {open && (
        <div className="pf-ats-panel">
          <div className="pf-ats-panel-header">
            <FaMagnifyingGlass style={{ color: themeColor[0] }} />
            <span>ATS Keyword Scanner</span>
          </div>
          <textarea
            className="pf-ats-jd-input"
            placeholder="Paste Job Description (JD) của nhà tuyển dụng vào đây..."
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={5}
          />
          <button
            className="pf-ats-scan-btn"
            style={{ background: `linear-gradient(135deg, ${themeColor[0]}, ${themeColor[1]})` }}
            onClick={handleScan}
            disabled={scanning || !jdText.trim()}
          >
            {scanning ? 'Đang quét...' : 'Quét từ khóa ATS'}
          </button>

          {results && (
            <div className="pf-ats-results">
              {results.matched.length > 0 && (
                <div className="pf-ats-group">
                  <p className="pf-ats-group-label pf-ats-matched">
                    <FaCircleCheck /> Có trong CV ({results.matched.length})
                  </p>
                  <div className="pf-ats-tags">
                    {results.matched.map(kw => (
                      <span key={kw} className="pf-ats-tag matched">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
              {results.missing.length > 0 && (
                <div className="pf-ats-group">
                  <p className="pf-ats-group-label pf-ats-missing">
                    <FaXmark /> Thiếu trong CV ({results.missing.length})
                  </p>
                  <div className="pf-ats-tags">
                    {results.missing.map(kw => (
                      <span key={kw} className="pf-ats-tag missing">{kw}</span>
                    ))}
                  </div>
                  <button
                    className="pf-ats-add-btn"
                    onClick={() => { onAddKeywords(results.missing); setResults(prev => ({ ...prev, missing: [], matched: [...prev.matched, ...prev.missing] })); }}
                  >
                    <FaWandMagicSparkles /> AI Tự động thêm vào CV
                  </button>
                </div>
              )}
              {results.matched.length > 0 && results.missing.length === 0 && (
                <p className="pf-ats-perfect">CV của bạn đã bao gồm tất cả từ khóa quan trọng!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── AI CO-PILOT MODAL ─────────────────────── */
function AICopilotModal({ visible, onClose, onApply, loading, toneId, setToneId }) {
  if (!visible) return null;
  return (
    <div className="pb-copilot-overlay" onClick={onClose}>
      <div className="pb-copilot-modal" onClick={e => e.stopPropagation()}>
        <div className="pb-copilot-header">
          <FaRobot style={{ color: PRIMARY }} />
          <span>AI Writing Co-pilot</span>
          <button className="pb-copilot-close" onClick={onClose}><FaXmark /></button>
        </div>
        <p className="pb-copilot-sub">Chọn giọng văn phù hợp với ngành của bạn:</p>
        <div className="pb-copilot-tones">
          {TONES.map(t => (
            <div
              key={t.id}
              className={`pb-copilot-tone ${toneId === t.id ? 'selected' : ''}`}
              onClick={() => setToneId(t.id)}
            >
              <div className="pb-copilot-tone-label">{t.label}</div>
              <div className="pb-copilot-tone-desc">{t.desc}</div>
            </div>
          ))}
        </div>
        <button
          className="pb-copilot-btn"
          onClick={onApply}
          disabled={loading}
          style={{ background: `linear-gradient(135deg, ${PRIMARY}, #7b96ff)` }}
        >
          {loading ? 'AI đang viết...' : 'Tạo nội dung'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── PORTFOLIO PREVIEW ─────────────────────── */
function PortfolioPreview({ info, skills, projects, awards, theme, layout, fontStyle, showScore, atsScore, onAtsAddKeywords, avatarUrl, onAvatarClick, contactSectionRef }) {
  const t = THEMES.find(x => x.id === theme) || THEMES[0];
  const fontCss = FONTS.find(f => f.id === fontStyle)?.css || FONTS[0].css;
  const thumbGrads = [
    [t.colors[0], t.colors[1]],
    ['#7c3aed', '#a78bfa'],
    ['#0f766e', '#14b8a6'],
    ['#dc2626', '#fb923c'],
  ];

  const isLeft = layout === 'left';

  return (
    <div className="pf-card" style={{ fontFamily: fontCss }}>
      {/* Hero */}
      <div className={`pf-hero ${isLeft ? 'pf-hero-left' : ''}`}>
        {/* Decorative background */}
        <div className="pf-hero-bg" style={{ background: `linear-gradient(135deg, ${t.colors[2]} 0%, #fff 100%)` }}>
          {/* Floating orbs */}
          <div className="pf-orb pf-orb-1" style={{ background: `${t.colors[0]}22` }} />
          <div className="pf-orb pf-orb-2" style={{ background: `${t.colors[1]}18` }} />
          <div className="pf-orb pf-orb-3" style={{ background: `${t.colors[0]}15` }} />
        </div>

        <div className={`pf-hero-content ${isLeft ? 'pf-hero-content-left' : ''}`}>
          {/* === INTERACTIVE AVATAR === */}
          <div
            className="pf-avatar-wrapper"
            onClick={onAvatarClick}
            title="Nhấn để thay đổi ảnh đại diện"
          >
            <div
              className="pf-avatar"
              style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="pf-avatar-img" />
              ) : (
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              )}
            </div>
            {/* Camera overlay on hover */}
            <div className="pf-avatar-overlay">
              <FaCamera style={{ fontSize: 14, color: '#fff' }} />
              <span>Thay ảnh</span>
            </div>
          </div>

          <div className={`pf-hero-text ${isLeft ? 'pf-hero-text-left' : ''}`}>
            <h2 className="pf-name">{info.name || 'Tên của bạn'}</h2>

            {/* === TITLE — now properly extracted from CV === */}
            <div className={`pf-title-row ${isLeft ? 'pf-title-row-left' : ''}`}>
              {!isLeft && <div className="pf-title-line" style={{ background: t.colors[0] }} />}
              <span className={`pf-title-text ${!info.title ? 'pf-title-empty' : ''}`} style={{ color: t.colors[0] }}>
                {info.title || 'Thêm chức danh →'}
              </span>
              {!isLeft && <div className="pf-title-line" style={{ background: t.colors[0] }} />}
            </div>

            {/* === BIO — professional first-person intro === */}
            {info.bio ? (
              <p className="pf-bio">{info.bio}</p>
            ) : (
              <div className="pf-bio-placeholder">
                <FaPen style={{ fontSize: 11, opacity: 0.4 }} />
                <span>Nhấn "AI viết hộ" để tạo giới thiệu bản thân chuyên nghiệp</span>
              </div>
            )}

            {/* Contact badges */}
            <div className="pf-contact-row">
              {info.email && (
                <span className="pf-contact-badge">
                  <FaEnvelope style={{ fontSize: 10 }} />
                  {info.email}
                </span>
              )}
              {info.phone && (
                <span className="pf-contact-badge">
                  <FaPhone style={{ fontSize: 10 }} />
                  {info.phone}
                </span>
              )}
              {info.address && (
                <span className="pf-contact-badge">
                  <FaLocationDot style={{ fontSize: 10 }} />
                  {info.address}
                </span>
              )}
              {info.linkedin && (
                <span className="pf-contact-badge">
                  <FaLinkedin style={{ fontSize: 10 }} />
                  {info.linkedin}
                </span>
              )}
            </div>

            <div className="pf-cta-row">
              <button
                className="pf-btn pf-btn-primary"
                style={{ background: t.colors[0], borderColor: t.colors[0] }}
              >
                <FaDownload style={{ fontSize: 11 }} /> Tải CV (PDF)
              </button>
              <button
                className="pf-btn pf-btn-outline"
                style={{ borderColor: t.colors[0], color: t.colors[0] }}
                onClick={() => {
                  if (contactSectionRef?.current) {
                    contactSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    window.location.href = `mailto:${info.email || ''}`;
                  }
                }}
              >
                Liên hệ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & ATS Score */}
      <div className="pf-skills-score-row">
        <div className="pf-skills-card">
          <p className="pf-skills-card-label">
            Kỹ năng cốt lõi
            <FaBolt style={{ color: t.colors[0], fontSize: '12px', marginLeft: '4px' }} />
          </p>
          {skills.length > 0 ? (
            <div className="pf-skill-pills">
              {skills.map(s => (
                <span key={s} className="pf-skill-pill" style={{ borderColor: `${t.colors[0]}33`, color: t.colors[0], background: `${t.colors[0]}0d` }}>
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="pf-empty-hint">Thêm kỹ năng của bạn →</p>
          )}
        </div>

        <ATSPanel
          score={showScore ? atsScore : 0}
          skills={skills}
          onAddKeywords={onAtsAddKeywords}
          themeColor={t.colors}
        />
      </div>

      {/* Projects */}
      <div className="pf-section-divider" />
      <div className="pf-section">
        <div className="pf-section-title-row">
          <p className="pf-section-title">Dự án tiêu biểu</p>
          <div className="pf-section-title-line" style={{ background: `linear-gradient(90deg, ${t.colors[0]}, transparent)` }} />
        </div>
        {projects.length > 0 ? projects.map((p, idx) => {
          const grad = thumbGrads[idx % thumbGrads.length];
          const techList = p.tech ? p.tech.split(',').map(t => t.trim()).filter(Boolean) : [];
          return (
            <div key={p.id} className="pf-project-visual-card">
              <div
                className="pf-project-thumb-visual"
                style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
              >
                {p.image ? (
                  <img src={p.image} alt={p.title} />
                ) : (
                  <div className="pf-project-thumb-placeholder">
                    <FaBriefcase style={{ fontSize: 24, marginBottom: 4 }} />
                    <span>{p.title}</span>
                  </div>
                )}
              </div>
              <div className="pf-project-card-body">
                <div className="pf-project-title-row">
                  <p className="pf-project-title">{p.title}</p>
                  {p.isNew && <span className="pf-project-new-badge">New</span>}
                </div>
                <p className="pf-project-desc">{p.desc}</p>
                {techList.length > 0 && (
                  <div className="pf-project-tech-tags">
                    {techList.map(tech => (
                      <span key={tech} className="pf-tech-tag" style={{ background: t.colors[2], color: t.colors[0] }}>{tech}</span>
                    ))}
                  </div>
                )}
                {(p.link || p.github) && (
                  <div className="pf-project-links">
                    {p.link && (
                      <a href={p.link} className="pf-project-link-btn" style={{ background: t.colors[2], color: t.colors[0] }}>
                        <FaLink style={{ fontSize: 10 }} /> Demo
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} className="pf-project-link-btn pf-project-link-github">
                        <FaGithub style={{ fontSize: 10 }} /> GitHub
                      </a>
                    )}
                  </div>
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
            <div className="pf-section-title-row">
              <p className="pf-section-title">Thành tựu & Giải thưởng</p>
              <div className="pf-section-title-line" style={{ background: `linear-gradient(90deg, ${t.colors[0]}, transparent)` }} />
            </div>
            <div className="pf-awards-grid">
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
          </div>
        </>
      )}

      {/* Portfolio footer */}
      <div className="pf-footer" style={{ borderTop: `1px solid ${t.colors[2]}` }}>
        <span className="pf-footer-text" style={{ color: t.colors[0] }}>Built with Career AI</span>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */
export default function PortfolioBuilder() {
  const [theme, setTheme] = useState('modern');
  const [layout, setLayout] = useState('center');
  const [fontStyle, setFontStyle] = useState('sans');
  const [device, setDevice] = useState('desktop');
  const [aiOn, setAiOn] = useState(true);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [brandingTab, setBrandingTab] = useState('theme');
  const [info, setInfo] = useState(FALLBACK_INFO);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState([]);
  const [awards, setAwards] = useState([]);
  const [aiInsight, setAiInsight] = useState({ insight: '', score: 0 });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [userId, setUserId] = useState(null);
  const [portfolioUrl, setPortfolioUrl] = useState('portfolio.ai/u/p-????');
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // === FIX 3: Avatar state ===
  const [avatarUrl, setAvatarUrl] = useState(null);
  const avatarInputRef = useRef(null);

  // AI Co-pilot state
  const [copilotVisible, setCopilotVisible] = useState(false);
  const [copilotTone, setCopilotTone] = useState('professional');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotTarget, setCopilotTarget] = useState('bio');

  // Section refs
  const skillsRef = useRef(null);
  const projectsRef = useRef(null);
  const awardsRef = useRef(null);
  const infoRef = useRef(null);
  const contactSectionRef = useRef(null); // For "Liên hệ" button scroll

  /* ── Toast helper ── */
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  /* ── Parse user from localStorage — load email immediately ── */
  useEffect(() => {
    let uid = null;
    try {
      const u = JSON.parse(localStorage.getItem('career_user'));
      uid = u?.user_id || null;
      // Immediately pre-populate email from localStorage so it's never stale
      if (u?.email) {
        setInfo(prev => ({ ...prev, email: u.email }));
      }
    } catch { uid = null; }
    setUserId(uid);
    if (uid) setPortfolioUrl(makePortfolioSlug(uid));
  }, []);

  const lastSavedDraftRef = useRef(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  /* ── Fetch data from API — check draft first ── */
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/portfolio/draft/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          if (d.theme) setTheme(d.theme);
          if (d.layout) setLayout(d.layout);
          if (d.fontStyle) setFontStyle(d.fontStyle);
          if (d.info) setInfo(d.info);
          if (d.skills) setSkills(d.skills);
          if (d.projects) setProjects(d.projects);
          if (d.awards) setAwards(d.awards);
          if (d.avatarUrl) setAvatarUrl(d.avatarUrl);
          
          lastSavedDraftRef.current = JSON.stringify(d);
          setHasLoadedInitialData(true);
          showToast('✓ Đã khôi phục bản nháp Portfolio!', 'info');
        } else {
          loadFromStandardProfile();
        }
      })
      .catch(() => {
        loadFromStandardProfile();
      });

    function loadFromStandardProfile() {
      Promise.allSettled([
        fetch(`http://localhost:5000/api/user/${userId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/cv/${userId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/skills/${userId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/experience/${userId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/certificate/${userId}`).then(r => r.json())
      ]).then(([resUser, resCv, resSkills, resExp, resCert]) => {
        let loadedInfo = { ...FALLBACK_INFO };
        setInfo(prev => {
          loadedInfo = { ...prev };
          return prev;
        });
        let loadedSkills = [];
        let loadedProjects = [];
        let loadedAwards = [];
        let loadedInsight = '';

        // 1. User profile
        if (resUser.status === 'fulfilled' && resUser.value?.success) {
          const d = resUser.value.data;
          let savedTitle = '';
          let savedBio = '';
          if (d.bio?.includes('||')) {
            const parts = d.bio.split('||');
            savedTitle = parts[0] || '';
            savedBio = parts.slice(1).join('||') || '';
          } else {
            savedBio = d.bio || '';
          }
          loadedInfo.name = d.full_name || loadedInfo.name;
          loadedInfo.title = savedTitle || loadedInfo.title;
          loadedInfo.bio = savedBio || loadedInfo.bio;
          loadedInfo.email = d.email || loadedInfo.email;
        }

        // 2. CV data
        if (resCv.status === 'fulfilled' && resCv.value?.success && resCv.value.data) {
          const cv = resCv.value.data;
          try {
            const analysis = typeof cv.analysis_result === 'string'
              ? JSON.parse(cv.analysis_result)
              : cv.analysis_result;

            let extractedTitle = '';
            if (cv.desired_position) {
              extractedTitle = cv.desired_position;
            } else if (analysis?.objective) {
              const objLines = analysis.objective.split(/[.。\n]/);
              if (objLines[0]?.length < 60) extractedTitle = objLines[0].trim();
            } else if (cv.position) {
              extractedTitle = cv.position;
            }

            const summary = analysis?.summary || '';
            if (isCritiqueText(summary)) {
              loadedInsight = summary;
            } else if (summary) {
              loadedInfo.bio = loadedInfo.bio || summary;
            }

            if (extractedTitle) {
              loadedInfo.title = loadedInfo.title || extractedTitle;
            }
          } catch { }
        }

        // 3. Skills
        if (resSkills.status === 'fulfilled' && resSkills.value?.success) {
          loadedSkills = resSkills.value.data.map(s => s.skill_name);
        }

        // 4. Experience
        if (resExp.status === 'fulfilled' && resExp.value?.success) {
          const expData = resExp.value.data;
          loadedProjects = expData.map(exp => ({
            id: exp.experience_id,
            title: `${exp.position} - ${exp.company}`,
            desc: exp.description || '',
            tech: '',
            link: '',
            github: '',
            image: null,
          }));
          if (expData.length > 0) {
            loadedInfo.title = loadedInfo.title || expData[0].position || '';
          }
        }

        // 5. Certificates
        if (resCert.status === 'fulfilled' && resCert.value?.success) {
          const certData = resCert.value.data;
          loadedAwards = certData.map(cert => ({
            id: cert.certificate_id,
            title: cert.name,
            org: cert.organization + (cert.issue_date ? ` (${cert.issue_date})` : ''),
          }));
        }

        if (loadedInsight) setAiInsight(prev => ({ ...prev, insight: loadedInsight }));
        setInfo(loadedInfo);
        setSkills(loadedSkills);
        setProjects(loadedProjects);
        setAwards(loadedAwards);

        // Pre-populate lastSavedDraftRef
        const initialDraftData = {
          theme: 'modern',
          layout: 'center',
          fontStyle: 'sans',
          info: loadedInfo,
          skills: loadedSkills,
          projects: loadedProjects,
          awards: loadedAwards,
          avatarUrl: null
        };
        lastSavedDraftRef.current = JSON.stringify(initialDraftData);
        setHasLoadedInitialData(true);
      }).catch(() => {
        setHasLoadedInitialData(true);
      });
    }
  }, [userId]);

  /* ── Auto-save Draft with Debounce (1.5s) ── */
  useEffect(() => {
    if (!userId || !hasLoadedInitialData) return;

    const draftData = {
      theme,
      layout,
      fontStyle,
      info,
      skills,
      projects,
      awards,
      avatarUrl
    };

    const draftStr = JSON.stringify(draftData);
    if (draftStr === lastSavedDraftRef.current) {
      return;
    }

    setSaveStatus('saving');

    const delayDebounceFn = setTimeout(() => {
      fetch('http://localhost:5000/api/portfolio/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          draft_data: draftData
        })
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            lastSavedDraftRef.current = draftStr;
            setSaveStatus('saved');
          } else {
            setSaveStatus('idle');
          }
        })
        .catch(() => {
          setSaveStatus('idle');
        });
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [theme, layout, fontStyle, info, skills, projects, awards, avatarUrl, userId, hasLoadedInitialData]);

  /* ── Save Draft immediately (used after extract-CV so F5 doesn't wipe data) ── */
  const saveDraftNow = useCallback((overrides = {}) => {
    if (!userId) return;
    const draftData = {
      theme,
      layout,
      fontStyle,
      info,
      skills,
      projects,
      awards,
      avatarUrl,
      ...overrides,
    };
    const draftStr = JSON.stringify(draftData);
    lastSavedDraftRef.current = draftStr;

    fetch('http://localhost:5000/api/portfolio/save-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, draft_data: draftData }),
    }).catch(() => {});
  }, [userId, theme, layout, fontStyle, info, skills, projects, awards, avatarUrl]);

  /* ── Manual Save ── */
  const [isManuallySaving, setIsManuallySaving] = useState(false);
  const handleManualSave = async () => {
    if (!userId || isManuallySaving) return;
    setIsManuallySaving(true);
    const draftData = { theme, layout, fontStyle, info, skills, projects, awards, avatarUrl };
    const draftStr = JSON.stringify(draftData);
    try {
      const res = await fetch('http://localhost:5000/api/portfolio/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          draft_data: draftData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        lastSavedDraftRef.current = draftStr;
        showToast('✓ Đã lưu Portfolio!', 'success');
      } else {
        showToast('Lưu thất bại, thử lại.', 'warn');
      }
    } catch {
      showToast('Không thể kết nối máy chủ.', 'warn');
    }
    setIsManuallySaving(false);
  };


  /* ── AI Insight fetch ── */
  useEffect(() => {
    if (!aiOn || (skills.length === 0 && projects.length === 0)) {
      setAiInsight(prev => ({ ...prev, score: 0 }));
      return;
    }
    const timer = setTimeout(() => {
      setAiInsight(prev => ({ ...prev, insight: prev.insight || 'Đang phân tích...' }));
      fetch('http://localhost:5000/api/portfolio/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, projects }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.success) setAiInsight(prev => ({ insight: json.data.insight || prev.insight, score: json.data.score || 0 }));
        })
        .catch(() => setAiInsight(prev => ({ ...prev })));
    }, 2000);
    return () => clearTimeout(timer);
  }, [skills, projects, aiOn]);

  /* ── AI Toggle ── */
  const handleAiToggle = (val) => {
    setAiOn(val);
    if (!val) setAiInsight(prev => ({ ...prev, score: 0 }));
  };

  /* ── AI Insight CTA: scroll + open relevant section ── */
  const handleInsightCTA = () => {
    const insight = aiInsight.insight.toLowerCase();
    let ref = null;
    if (insight.includes('dự án') || insight.includes('project')) ref = projectsRef;
    else if (insight.includes('kỹ năng') || insight.includes('skill')) ref = skillsRef;
    else if (insight.includes('thành tựu') || insight.includes('giải thưởng')) ref = awardsRef;
    else ref = infoRef;

    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const header = ref.current.querySelector('.pb-section-row-header');
      if (header) setTimeout(() => header.click(), 400);
    }
  };

  /* ── Optimize projects ── */
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
    showToast('Đã tối ưu mô tả dự án bằng AI!', 'success');
  };

  /* ── AI Co-pilot ── */
  const handleOpenCopilot = (target = 'bio') => {
    setCopilotTarget(target);
    setCopilotVisible(true);
  };

  const handleCopilotApply = async () => {
    setCopilotLoading(true);
    const isProject = copilotTarget !== 'bio';
    const currentText = isProject
      ? projects.find(p => p.id === copilotTarget)?.desc || ''
      : info.bio;

    try {
      const res = await fetch('http://localhost:5000/api/portfolio/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, tone: copilotTone }),
      });
      const json = await res.json();
      if (json.success) {
        if (isProject) {
          setProjects(prev => prev.map(p => p.id === copilotTarget ? { ...p, desc: json.data } : p));
        } else {
          setInfo(prev => ({ ...prev, bio: json.data }));
        }
        showToast('AI đã viết lại thành công!', 'success');
      } else {
        showToast('AI chưa sẵn sàng. Vui lòng thử lại.', 'warn');
      }
    } catch {
      showToast('Không thể kết nối AI. Vui lòng thử lại.', 'warn');
    }
    setCopilotLoading(false);
    setCopilotVisible(false);
  };

  /* ── Generate professional bio from CV data ── */
  const handleGenerateBio = async () => {
    if (!userId) return;
    setIsGeneratingBio(true);
    try {
      // Build context from current data
      const context = {
        name: info.name,
        title: info.title,
        skills: skills.slice(0, 10),
        projects: projects.slice(0, 3).map(p => p.title),
        // Pass raw critique as source material for rewriting
        raw_summary: aiInsight.insight,
        tone: copilotTone,
      };
      const res = await fetch('http://localhost:5000/api/portfolio/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setInfo(prev => ({ ...prev, bio: json.data }));
        showToast('AI đã tạo giới thiệu bản thân chuyên nghiệp!', 'success');
      } else {
        // Fallback: use copilot rewrite endpoint
        const rewriteRes = await fetch('http://localhost:5000/api/portfolio/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: aiInsight.insight || `${info.name} là ${info.title}. Có kỹ năng: ${skills.slice(0, 5).join(', ')}.`,
            tone: 'professional',
          }),
        });
        const rewriteJson = await rewriteRes.json();
        if (rewriteJson.success) {
          setInfo(prev => ({ ...prev, bio: rewriteJson.data }));
          showToast('AI đã tạo giới thiệu bản thân!', 'success');
        } else {
          showToast('AI chưa sẵn sàng. Vui lòng nhập thủ công.', 'warn');
        }
      }
    } catch {
      showToast('Không thể kết nối AI. Vui lòng thử lại.', 'warn');
    }
    setIsGeneratingBio(false);
  };

  /* ── Auto-fill from CV ── */
  const handleExtractCV = async () => {
    const hasExistingData = skills.length > 0 || projects.length > 0 || awards.length > 0;
    if (hasExistingData) {
      const confirmed = window.confirm(
        'Bạn đang có dữ liệu trong Portfolio.\n\n' +
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

        // Build the new merged state eagerly so we can save it immediately
        const newSkills = d.skills ? [...new Set([...skills, ...d.skills])] : skills;
        const newProjects = d.projects
          ? [...projects, ...d.projects.map((p, i) => ({ id: Date.now() + i, title: p.title || 'Dự án mới', desc: p.desc || '', tech: p.tech || '', link: '', github: '', image: null }))]
          : projects;
        const newAwards = d.awards
          ? [...awards, ...d.awards.map((a, i) => ({ id: Date.now() + 100 + i, title: a.title || 'Giải thưởng', org: a.org || '' }))]
          : awards;

        const extractedTitle = d.title || d.desired_position || d.position || '';
        const extractedPhone = d.phone || '';
        const extractedAddress = d.address || '';

        const newInfo = {
          ...info,
          title: info.title || extractedTitle,
          phone: info.phone || extractedPhone,
          address: info.address || extractedAddress,
        };

        if (d.summary) {
          if (isCritiqueText(d.summary)) {
            setAiInsight(prev => ({ ...prev, insight: d.summary }));
          } else if (!newInfo.bio) {
            newInfo.bio = d.summary;
          }
        }

        // Apply state
        setSkills(newSkills);
        setProjects(newProjects);
        setAwards(newAwards);
        setInfo(newInfo);

        // ── Persist IMMEDIATELY so F5 won't lose the data ──
        // (the normal debounce fires 1.5s later but the user may refresh first)
        setHasLoadedInitialData(true); // ensure auto-save guard is open
        fetch('http://localhost:5000/api/portfolio/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            draft_data: { theme, layout, fontStyle, info: newInfo, skills: newSkills, projects: newProjects, awards: newAwards, avatarUrl },
          }),
        }).catch(() => {});

        showToast('Đã trích xuất thông tin từ CV!', 'success');
      } else {
        showToast(json.message || 'Không tìm thấy dữ liệu CV.', 'warn');
      }
    } catch {
      showToast('Không thể kết nối máy chủ.', 'warn');
    }
    setIsExtracting(false);
  };

  /* ── ATS Add Keywords ── */
  const handleAtsAddKeywords = (keywords) => {
    setSkills(prev => [...new Set([...prev, ...keywords])]);
    showToast(`Đã thêm ${keywords.length} từ khóa vào CV!`, 'success');
  };

  /* ── Save profile ── */
  const handleSaveProfile = async () => {
    if (!userId) return;
    try {
      await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: info.name,
          bio: `${info.title}||${info.bio}`,
          phone: info.phone,
        }),
      });
    } catch (e) { console.error('Failed to save profile', e); }
  };

  /* ── Download PDF ── */
  const handleDownloadPDF = async () => {
    if (isExportingPdf) return;

    const card = document.querySelector('#portfolio-preview-content .pf-card');
    if (!card) {
      showToast('Không tìm thấy nội dung để xuất PDF.', 'warn');
      return;
    }

    const exportHost = document.createElement('div');
    exportHost.id = 'portfolio-pdf-export-host';
    exportHost.setAttribute('aria-hidden', 'true');
    exportHost.style.cssText = [
      'position:fixed',
      'left:-10000px',
      'top:0',
      'width:640px',
      'background:#fff',
      'overflow:visible',
      'z-index:-1',
      'pointer-events:none',
    ].join(';');

    const exportCard = card.cloneNode(true);
    exportCard.id = 'portfolio-pdf-export';
    exportCard.style.maxWidth = '640px';
    exportCard.style.width = '640px';
    exportCard.style.margin = '0';
    exportCard.style.boxShadow = 'none';
    exportCard.style.borderRadius = '0';

    exportHost.appendChild(exportCard);
    document.body.appendChild(exportHost);

    exportCard.querySelectorAll(
      '.pf-cta-row, .pf-avatar-overlay, .pf-ats-panel, .pf-orb, .pf-avatar-wrapper'
    ).forEach(el => el.remove());

    setIsExportingPdf(true);
    try {
      const slug = userId ? `p-${((userId * 2654435761) >>> 0).toString(16).slice(0, 4)}` : 'career_ai';
      const contentHeight = exportCard.scrollHeight || exportCard.offsetHeight;
      const scale = contentHeight > 7000 ? 1 : contentHeight > 4500 ? 1.5 : 2;

      const canvas = await html2canvas(exportCard, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 640,
        windowHeight: Math.max(contentHeight, 800),
        onclone: (clonedDoc) => {
          const clonedHost = clonedDoc.getElementById('portfolio-pdf-export-host');
          if (clonedHost) {
            clonedHost.style.left = '0';
            clonedHost.style.position = 'static';
          }
          const clonedCard = clonedDoc.getElementById('portfolio-pdf-export');
          if (clonedCard) {
            clonedCard.style.maxWidth = '640px';
            clonedCard.style.width = '640px';
            clonedCard.style.overflow = 'visible';
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;
      const imgWidth = printableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        position -= printableHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= printableHeight;
      }

      pdf.save(`Portfolio_${slug}.pdf`);
      showToast('Đã tải PDF thành công!', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Lỗi tạo PDF. Vui lòng thử lại.', 'warn');
    } finally {
      exportHost.remove();
      setIsExportingPdf(false);
    }
  };

  /* ── Image upload for project ── */
  const handleProjectImageUpload = (projectId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, image: e.target.result } : p));
    };
    reader.readAsDataURL(file);
  };

  /* ── FIX 3: Avatar upload handler ── */
  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setAvatarUrl(ev.target.result);
      showToast('Ảnh đại diện đã được cập nhật!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const showScore = aiOn && skills.length > 0 && projects.length > 0 && aiInsight.score > 0;
  const visibleThemes = showAllThemes ? THEMES : THEMES.slice(0, 4);

  // Show AI insight panel only when insight is a genuine critique (moved from bio)
  const insightText = aiInsight.insight;
  const showInsightPanel = aiOn && insightText && insightText !== 'Đang phân tích...';

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <DashboardLayout>
      {/* Hidden avatar input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      <div className="pb-page">
        <div className="pb-main">

          {/* ══════════ LEFT EDITOR ══════════ */}
          <div className="pb-editor">

            {/* ── Personal Branding Panel ── */}
            <div className="pb-branding-panel">
              <div className="pb-branding-tabs">
                {[
                  { id: 'theme', icon: <FaPalette />, label: 'Giao diện' },
                  { id: 'layout', icon: <FaTableColumns />, label: 'Bố cục' },
                  { id: 'font', icon: <FaFont />, label: 'Font chữ' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    className={`pb-branding-tab ${brandingTab === tab.id ? 'active' : ''}`}
                    onClick={() => setBrandingTab(tab.id)}
                  >
                    {tab.icon} <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Theme Tab */}
              {brandingTab === 'theme' && (
                <div className="pb-branding-content">
                  <div className="pb-theme-bar-row">
                    <span className="pb-theme-bar-label">Chủ đề màu sắc</span>
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
              )}

              {/* Layout Tab */}
              {brandingTab === 'layout' && (
                <div className="pb-branding-content">
                  <span className="pb-theme-bar-label">Bố cục tiêu đề</span>
                  <div className="pb-layout-options">
                    {[
                      { id: 'center', label: 'Căn giữa', icon: '▣' },
                      { id: 'left', label: 'Căn trái', icon: '◧' },
                    ].map(opt => (
                      <div
                        key={opt.id}
                        className={`pb-layout-option ${layout === opt.id ? 'selected' : ''}`}
                        onClick={() => setLayout(opt.id)}
                      >
                        <div className="pb-layout-option-icon">{opt.icon}</div>
                        <div className="pb-layout-option-label">{opt.label}</div>
                        {layout === opt.id && <FaCheck className="pb-layout-check" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Font Tab */}
              {brandingTab === 'font' && (
                <div className="pb-branding-content">
                  <span className="pb-theme-bar-label">Kiểu chữ</span>
                  <div className="pb-font-options">
                    {FONTS.map(f => (
                      <div
                        key={f.id}
                        className={`pb-font-option ${fontStyle === f.id ? 'selected' : ''}`}
                        onClick={() => setFontStyle(f.id)}
                        style={{ fontFamily: f.css }}
                      >
                        <div className="pb-font-preview">Aa</div>
                        <div className="pb-font-label">{f.label}</div>
                        {fontStyle === f.id && <FaCheck className="pb-font-check" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Content Sections Header ── */}
            <div className="pb-content-header-bar">
              <span className="pb-content-header-bar-label">Khối nội dung</span>
              <div className="pb-ai-toggle-row">
                <span style={{ color: aiOn ? PRIMARY : '#9ca3af' }}>Tối ưu AI</span>
                <Toggle checked={aiOn} onChange={handleAiToggle} />
              </div>
            </div>

            {/* ── Section Rows ── */}
            <div className="pb-sections-list">

              {/* Thông tin cá nhân */}
              <SectionRow
                dot={PRIMARY}
                title="Thông tin cá nhân"
                subtitle={info.name ? `${info.name}${info.title ? ' • ' + info.title : ''}` : 'Chưa có thông tin'}
                sectionRef={infoRef}
              >
                {/* Avatar upload shortcut */}
                <div className="pb-avatar-upload-row" onClick={handleAvatarClick}>
                  <div className="pb-avatar-mini" style={{ background: avatarUrl ? 'transparent' : `linear-gradient(135deg, ${PRIMARY}, #7b96ff)` }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : <FaCamera style={{ color: 'white', fontSize: 14 }} />
                    }
                  </div>
                  <div className="pb-avatar-upload-text">
                    <span className="pb-avatar-upload-label">{avatarUrl ? 'Thay ảnh đại diện' : 'Tải ảnh đại diện lên'}</span>
                    <span className="pb-avatar-upload-hint">PNG, JPG, WebP • Tối đa 5MB</span>
                  </div>
                  <div className="pb-avatar-upload-btn">
                    <FaCamera style={{ fontSize: 12 }} /> Chọn ảnh
                  </div>
                </div>

                {['name', 'title', 'email', 'phone', 'address', 'linkedin'].map(f => (
                  <div className="pb-form-group" key={f}>
                    <label className="pb-form-label">
                      {{
                        name: 'Họ và tên',
                        title: 'Chức danh / Vị trí',
                        email: 'Email',
                        phone: 'Số điện thoại',
                        address: 'Địa chỉ',
                        linkedin: 'LinkedIn URL'
                      }[f]}
                      {f === 'title' && !info.title && (
                        <span className="pb-field-hint">⚠ Chưa có chức danh</span>
                      )}
                    </label>
                    <input
                      className={`pb-form-input ${f === 'title' && !info.title ? 'pb-input-empty' : ''}`}
                      value={info[f] || ''}
                      placeholder={
                        f === 'title' ? 'VD: Frontend Developer, Data Analyst...' :
                          f === 'name' ? 'Họ và tên đầy đủ' :
                            f === 'email' ? 'email@example.com' :
                              f === 'phone' ? 'VD: 0987654321' :
                                f === 'address' ? 'VD: Hà Nội, Việt Nam' :
                                  'https://linkedin.com/in/...'
                      }
                      onChange={e => setInfo({ ...info, [f]: e.target.value })}
                      onBlur={handleSaveProfile}
                    />
                  </div>
                ))}

                {/* === FIX 2: Bio — clearly labeled as PUBLIC intro, not AI critique === */}
                <div className="pb-form-group">
                  <div className="pb-form-label-row">
                    <label className="pb-form-label">
                      Giới thiệu bản thân
                      <span className="pb-public-badge">🌐 Hiển thị công khai</span>
                    </label>
                    <div className="pb-bio-actions">
                      {aiOn && (
                        <button
                          className="pb-gen-bio-btn"
                          onClick={handleGenerateBio}
                          disabled={isGeneratingBio}
                          title="AI tự viết giới thiệu bản thân chuyên nghiệp từ dữ liệu CV của bạn"
                        >
                          <FaWandMagicSparkles style={{ fontSize: 10 }} />
                          {isGeneratingBio ? 'Đang tạo...' : 'AI tự viết'}
                        </button>
                      )}
                      {aiOn && info.bio && (
                        <button className="pb-copilot-trigger" onClick={() => handleOpenCopilot('bio')}>
                          <FaPen style={{ fontSize: 10 }} /> Viết lại
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pb-bio-notice">
                    <FaUserTie style={{ fontSize: 11, color: '#6366f1', flexShrink: 0 }} />
                    <span>Đây là đoạn văn nhà tuyển dụng sẽ đọc. AI sẽ viết theo góc nhìn <strong>ngôi thứ nhất</strong>, nêu bật thế mạnh của bạn.</span>
                  </div>
                  <textarea
                    className="pb-form-textarea"
                    value={info.bio}
                    onChange={e => setInfo({ ...info, bio: e.target.value })}
                    onBlur={handleSaveProfile}
                    placeholder="VD: Tôi là sinh viên ngành Hệ thống thông tin quản lý với đam mê xây dựng ứng dụng web..."
                    rows={4}
                  />
                </div>
              </SectionRow>

              {/* Kỹ năng */}
              <SectionRow
                dot="#f59e0b"
                title="Kỹ năng cốt lõi"
                subtitle={skills.length > 0 ? `${skills.length} kỹ năng đã xác thực` : 'Chưa có kỹ năng — thêm vào ngay!'}
                sectionRef={skillsRef}
              >
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
                  <input
                    className="pb-add-skill-input"
                    placeholder="Thêm kỹ năng (Enter để xác nhận)..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                  />
                  <button className="pb-add-skill-btn" onClick={addSkill}>Thêm</button>
                </div>
              </SectionRow>

              {/* Dự án */}
              <SectionRow
                dot="#8b5cf6"
                title="Dự án tiêu biểu"
                subtitle={projects.length > 0 ? `${projects.length} dự án` : 'Chưa có dự án — thêm ngay!'}
                sectionRef={projectsRef}
              >
                <button
                  className={`pb-ai-optimize-btn ${!aiOn ? 'disabled' : ''}`}
                  onClick={handleOptimizeProjects}
                  disabled={isOptimizing || !aiOn || projects.length === 0}
                  title={!aiOn ? 'Bật Tối ưu AI để sử dụng tính năng này' : ''}
                >
                  <FaWandMagicSparkles />
                  {isOptimizing ? 'Đang tối ưu...' : !aiOn ? 'Tối ưu AI (đang tắt)' : 'Tối ưu tất cả mô tả bằng AI STAR'}
                </button>

                {projects.map(p => (
                  <div key={p.id} className="pb-proj-card">
                    <div className="pb-proj-card-head">
                      <span className="pb-proj-card-title">{p.title}</span>
                      <button className="pb-proj-remove" onClick={() => setProjects(projects.filter(x => x.id !== p.id))}>
                        <FaXmark />
                      </button>
                    </div>

                    {/* Image upload */}
                    <div className="pb-proj-img-upload" onClick={() => document.getElementById(`img-upload-${p.id}`)?.click()}>
                      {p.image ? (
                        <img src={p.image} alt="preview" />
                      ) : (
                        <>
                          <FaImage style={{ fontSize: 16, opacity: 0.4 }} />
                          <span>Nhấn để thêm ảnh thumbnail</span>
                        </>
                      )}
                      <input
                        id={`img-upload-${p.id}`}
                        type="file"
                        accept="image/*"
                        onChange={e => handleProjectImageUpload(p.id, e.target.files[0])}
                      />
                    </div>

                    <label className="pb-form-label">Tên dự án</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} value={p.title} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, title: e.target.value } : x))} />
                    <label className="pb-form-label">Công nghệ / Kỹ năng</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} placeholder="React, Node.js, Python..." value={p.tech || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, tech: e.target.value } : x))} />

                    <div className="pb-proj-links-row">
                      <div className="pb-proj-link-field">
                        <label className="pb-form-label"><FaLink style={{ marginRight: 4 }} />Demo URL</label>
                        <input className="pb-form-input" placeholder="https://your-demo.com" value={p.link || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, link: e.target.value } : x))} />
                      </div>
                      <div className="pb-proj-link-field">
                        <label className="pb-form-label"><FaGithub style={{ marginRight: 4 }} />GitHub</label>
                        <input className="pb-form-input" placeholder="https://github.com/..." value={p.github || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, github: e.target.value } : x))} />
                      </div>
                    </div>

                    <div className="pb-form-label-row">
                      <label className="pb-form-label">Mô tả chi tiết</label>
                      {aiOn && (
                        <button className="pb-copilot-trigger" onClick={() => handleOpenCopilot(p.id)}>
                          <FaWandMagicSparkles style={{ fontSize: 10 }} /> STAR rewrite
                        </button>
                      )}
                    </div>
                    <textarea
                      className="pb-form-textarea"
                      style={{ minHeight: 60 }}
                      placeholder="Mô tả theo STAR: Situation → Task → Action → Result..."
                      value={p.desc}
                      onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, desc: e.target.value } : x))}
                    />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setProjects([...projects, { id: Date.now(), title: 'Dự án mới', desc: '', tech: '', link: '', github: '', image: null }])}>
                  <FaPlus /> Thêm dự án
                </button>
              </SectionRow>

              {/* Thành tựu */}
              <SectionRow
                dot="#10b981"
                title="Thành tựu & Giải thưởng"
                subtitle={awards.length > 0 ? awards[0]?.title : 'Thêm thành tựu đầu tiên của bạn!'}
                sectionRef={awardsRef}
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
                  <FaPlus /> Thêm giải thưởng
                </button>
              </SectionRow>
            </div>

            {/* ── AI Insight Panel (shows critique text here, NOT in public bio) ── */}
            {showInsightPanel && (
              <div className="pb-ai-insight">
                <div className="pb-ai-insight-icon">
                  <FaLightbulb style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <div className="pb-ai-insight-body">
                  <p className="pb-ai-insight-label">
                    AI Insight
                    <span className="pb-insight-private-badge">Riêng tư</span>
                  </p>
                  <p className="pb-ai-insight-text">{insightText}</p>
                  <button className="pb-ai-insight-cta" onClick={handleInsightCTA}>
                    Cải thiện ngay <FaArrowRight style={{ fontSize: 10 }} />
                  </button>
                </div>
              </div>
            )}
            {aiOn && insightText === 'Đang phân tích...' && (
              <div className="pb-ai-insight pb-ai-analyzing">
                <div className="pb-ai-insight-icon pb-ai-pulse">
                  <FaRobot style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <div>
                  <p className="pb-ai-insight-label">AI đang phân tích...</p>
                  <div className="pb-ai-dots"><span /><span /><span /></div>
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

            {/* ── Bottom Actions ── */}
            <div className="pb-actions-bar">
              <button className="pb-btn-extract" onClick={handleExtractCV} disabled={isExtracting || !userId}>
                <FaWandMagicSparkles />
                {isExtracting ? 'Đang đọc CV...' : 'Auto điền từ CV'}
              </button>
              <button className="pb-btn-save" onClick={handleManualSave} disabled={isManuallySaving || !userId}>
                {isManuallySaving
                  ? <><span className="pb-save-spinner" /> Đang lưu...</>
                  : <>✓ Lưu</>}
              </button>
            </div>
          </div>

          {/* ══════════ RIGHT PREVIEW ══════════ */}
          <div className="pb-preview">

            {/* Toolbar */}
            <div className="pb-preview-toolbar">
              <div className="pb-device-switch">
                {[['desktop', 'Desktop', <FaDesktop />], ['mobile', 'Mobile', <FaMobileScreen />]].map(([d, label, icon]) => (
                  <button
                    key={d}
                    className={`pb-device-btn ${device === d ? 'active' : ''}`}
                    onClick={() => setDevice(d)}
                    aria-label={`Chế độ xem ${label}`}
                  >
                    {icon} <span>{label}</span>
                  </button>
                ))}
              </div>
              <button className="pb-btn-pdf" onClick={handleDownloadPDF} disabled={isExportingPdf}>
                <FaDownload /> {isExportingPdf ? 'Đang tạo PDF...' : 'Tải PDF'}
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
                <FaGlobe style={{ color: '#9ca3af', marginRight: '6px', flexShrink: 0 }} />
                <span className="pb-url-text">{portfolioUrl}</span>
              </div>
              {saveStatus === 'saving' && (
                <span className="pb-save-indicator saving" style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
                  <span className="pb-save-spinner" style={{ width: '8px', height: '8px', border: '1.5px solid #d1d5db', borderTopColor: '#4f6ef7', borderRadius: '50%', display: 'inline-block', animation: 'pbSpinner 0.8s linear infinite' }} /> đang lưu...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="pb-save-indicator saved" style={{ fontSize: '11px', color: '#10b981', marginRight: '8px', fontWeight: 600 }}>
                  ✓ Đã lưu thay đổi vào hệ thống
                </span>
              )}
              <button className="pb-star-btn" title="Lưu trang">
                <FaStar style={{ color: '#9ca3af' }} />
              </button>
            </div>

            {/* Preview frame */}
            <div className="pb-preview-frame">
              <div
                id="portfolio-preview-content"
                className={`pb-preview-inner ${device}`}
              >
                <PortfolioPreview
                  info={{ ...info, score: aiInsight.score }}
                  skills={skills}
                  projects={projects}
                  awards={awards}
                  theme={theme}
                  layout={layout}
                  fontStyle={fontStyle}
                  showScore={showScore}
                  atsScore={aiInsight.score}
                  onAtsAddKeywords={handleAtsAddKeywords}
                  avatarUrl={avatarUrl}
                  onAvatarClick={handleAvatarClick}
                  contactSectionRef={contactSectionRef}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Co-pilot Modal */}
        <AICopilotModal
          visible={copilotVisible}
          onClose={() => setCopilotVisible(false)}
          onApply={handleCopilotApply}
          loading={copilotLoading}
          toneId={copilotTone}
          setToneId={setCopilotTone}
        />

        {/* Toast */}
        <div className={`pb-toast ${toast.type} ${toast.show ? 'show' : ''}`}>
          {toast.msg}
        </div>
      </div>
    </DashboardLayout>
  );
}