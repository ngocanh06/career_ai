import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
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

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ DESIGN TOKENS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const PRIMARY = '#4f6ef7';

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ CONSTANTS ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
  { id: 'professional', label: 'Professional', desc: 'Chuy├¬n nghiß╗çp, formal' },
  { id: 'creative', label: 'Creative', desc: 'S├íng tß║ío, ph├│ng kho├íng' },
  { id: 'tech', label: 'Tech-focused', desc: 'Kß╗╣ thuß║¡t, data-driven' },
];

const FALLBACK_INFO = { name: '', title: '', bio: '', email: '', linkedin: '', phone: '', address: '' };

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ HELPER: detect AI critique text ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
const AI_CRITIQUE_KEYWORDS = [
  'cß║ºn cß║úi thiß╗çn', 'thiß║┐u kinh nghiß╗çm', 'ch╞░a ho├án thiß╗çn', 'n├¬n bß╗ò sung',
  'hß║ín chß║┐', 'cß║ºn ph├ít triß╗ân', 'ß╗⌐ng vi├¬n cß║ºn', 'cv cß╗ºa ß╗⌐ng vi├¬n',
  'tuy nhi├¬n, ß╗⌐ng vi├¬n', '─æiß╗âm yß║┐u', '─æiß╗âm cß║ºn', 'ch╞░a c├│ bß║▒ng',
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

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ TOGGLE ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
function Toggle({ checked, onChange }) {
  return (
    <label className="pb-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pb-toggle-slider" />
    </label>
  );
}

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ SECTION ROW ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
          aria-label={open ? 'Thu gß╗ìn' : 'Mß╗ƒ rß╗Öng'}
        >
          <FaChevronDown style={{ fontSize: '11px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>
      {open && <div className="pb-section-row-body">{children}</div>}
    </div>
  );
}

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ ATS PANEL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
          <p className="pf-score-card-label">Chß╗ë sß╗æ ATS</p>
          <FaChevronRight className={`pf-score-chevron ${open ? 'open' : ''}`} />
        </div>
        {score > 0 ? (
          <>
            <div className="pf-score-number">{score}%</div>
            <div className="pf-score-sub">Khß║ú n─âng ph├╣ hß╗úp vß╗¢i JD</div>
            <div className="pf-score-bar-track">
              <div className="pf-score-bar-fill" style={{ width: `${score}%` }} />
            </div>
          </>
        ) : (
          <div className="pf-score-placeholder-content">
            <FaBullseye style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }} />
            <div className="pf-score-placeholder-text">Paste JD ─æß╗â ph├ón t├¡ch ATS ΓåÆ</div>
          </div>
        )}
        <div className="pf-score-hint">Nhß║Ñn ─æß╗â qu├⌐t tß╗½ kh├│a</div>
      </div>

      {open && (
        <div className="pf-ats-panel">
          <div className="pf-ats-panel-header">
            <FaMagnifyingGlass style={{ color: themeColor[0] }} />
            <span>ATS Keyword Scanner</span>
          </div>
          <textarea
            className="pf-ats-jd-input"
            placeholder="Paste Job Description (JD) cß╗ºa nh├á tuyß╗ân dß╗Ñng v├áo ─æ├óy..."
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
            {scanning ? '─Éang qu├⌐t...' : 'Qu├⌐t tß╗½ kh├│a ATS'}
          </button>

          {results && (
            <div className="pf-ats-results">
              {results.matched.length > 0 && (
                <div className="pf-ats-group">
                  <p className="pf-ats-group-label pf-ats-matched">
                    <FaCircleCheck /> C├│ trong CV ({results.matched.length})
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
                    <FaXmark /> Thiß║┐u trong CV ({results.missing.length})
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
                    <FaWandMagicSparkles /> AI Tß╗▒ ─æß╗Öng th├¬m v├áo CV
                  </button>
                </div>
              )}
              {results.matched.length > 0 && results.missing.length === 0 && (
                <p className="pf-ats-perfect">CV cß╗ºa bß║ín ─æ├ú bao gß╗ôm tß║Ñt cß║ú tß╗½ kh├│a quan trß╗ìng!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ AI CO-PILOT MODAL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
        <p className="pb-copilot-sub">Chß╗ìn giß╗ìng v─ân ph├╣ hß╗úp vß╗¢i ng├ánh cß╗ºa bß║ín:</p>
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
          {loading ? 'AI ─æang viß║┐t...' : 'Tß║ío nß╗Öi dung'}
        </button>
      </div>
    </div>
  );
}

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ PORTFOLIO PREVIEW ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
            title="Nhß║Ñn ─æß╗â thay ─æß╗òi ß║únh ─æß║íi diß╗çn"
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
              <span>Thay ß║únh</span>
            </div>
          </div>

          <div className={`pf-hero-text ${isLeft ? 'pf-hero-text-left' : ''}`}>
            <h2 className="pf-name">{info.name || 'T├¬n cß╗ºa bß║ín'}</h2>

            {/* === TITLE ΓÇö now properly extracted from CV === */}
            <div className={`pf-title-row ${isLeft ? 'pf-title-row-left' : ''}`}>
              {!isLeft && <div className="pf-title-line" style={{ background: t.colors[0] }} />}
              <span className={`pf-title-text ${!info.title ? 'pf-title-empty' : ''}`} style={{ color: t.colors[0] }}>
                {info.title || 'Th├¬m chß╗⌐c danh ΓåÆ'}
              </span>
              {!isLeft && <div className="pf-title-line" style={{ background: t.colors[0] }} />}
            </div>

            {/* === BIO ΓÇö professional first-person intro === */}
            {info.bio ? (
              <p className="pf-bio">{info.bio}</p>
            ) : (
              <div className="pf-bio-placeholder">
                <FaPen style={{ fontSize: 11, opacity: 0.4 }} />
                <span>Nhß║Ñn "AI viß║┐t hß╗Ö" ─æß╗â tß║ío giß╗¢i thiß╗çu bß║ún th├ón chuy├¬n nghiß╗çp</span>
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
                <FaDownload style={{ fontSize: 11 }} /> Tß║úi CV (PDF)
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
                Li├¬n hß╗ç
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & ATS Score */}
      <div className="pf-skills-score-row">
        <div className="pf-skills-card">
          <p className="pf-skills-card-label">
            Kß╗╣ n─âng cß╗æt l├╡i
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
            <p className="pf-empty-hint">Th├¬m kß╗╣ n─âng cß╗ºa bß║ín ΓåÆ</p>
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
          <p className="pf-section-title">Dß╗▒ ├ín ti├¬u biß╗âu</p>
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
          <p className="pf-empty-hint">Th├¬m dß╗▒ ├ín ─æß║ºu ti├¬n cß╗ºa bß║ín ΓåÆ</p>
        )}
      </div>

      {/* Awards */}
      {awards && awards.length > 0 && (
        <>
          <div className="pf-section-divider" />
          <div className="pf-section">
            <div className="pf-section-title-row">
              <p className="pf-section-title">Th├ánh tß╗▒u & Giß║úi th╞░ß╗ƒng</p>
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

/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ MAIN COMPONENT ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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
  const contactSectionRef = useRef(null); // For "Li├¬n hß╗ç" button scroll

  /* ΓöÇΓöÇ Toast helper ΓöÇΓöÇ */
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  /* ΓöÇΓöÇ Parse user from localStorage ΓÇö load email immediately ΓöÇΓöÇ */
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

  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  /* ΓöÇΓöÇ Fetch data from API ΓÇö check draft first ΓöÇΓöÇ */
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
          setHasLoadedInitialData(true);
          showToast('Γ£ô ─É├ú kh├┤i phß╗Ñc bß║ún nh├íp Portfolio!', 'info');
        } else {
          loadFromStandardProfile();
        }
      })
      .catch(() => {
        loadFromStandardProfile();
      });

    function loadFromStandardProfile() {
      // 1. Fetch user profile
      fetch(`http://localhost:5000/api/user/${userId}`)
        .then(r => r.json())
        .then(json => {
          if (!json.success) return;
          const d = json.data;
          let savedTitle = '';
          let savedBio = '';
          if (d.bio?.includes('||')) {
            const parts = d.bio.split('||');
            savedTitle = parts[0] || '';
            savedBio = parts.slice(1).join('||') || '';
          } else {
            savedBio = d.bio || '';
          }
          setInfo(prev => ({
            ...prev,
            name: d.full_name || prev.name,
            title: savedTitle || prev.title,
            bio: savedBio || prev.bio,
            email: d.email || prev.email,
          }));
        }).catch(() => { });

      // 2. Fetch CV data
      fetch(`http://localhost:5000/api/cv/${userId}`)
        .then(r => r.json())
        .then(json => {
          if (!json.success || !json.data) return;
          const cv = json.data;
          try {
            const analysis = typeof cv.analysis_result === 'string'
              ? JSON.parse(cv.analysis_result)
              : cv.analysis_result;

            let extractedTitle = '';
            if (cv.desired_position) {
              extractedTitle = cv.desired_position;
            } else if (analysis?.objective) {
              const objLines = analysis.objective.split(/[.πÇé\n]/);
              if (objLines[0]?.length < 60) extractedTitle = objLines[0].trim();
            } else if (cv.position) {
              extractedTitle = cv.position;
            }

            const summary = analysis?.summary || '';
            if (isCritiqueText(summary)) {
              setAiInsight(prev => ({ ...prev, insight: summary }));
            } else if (summary) {
              setInfo(prev => ({ ...prev, bio: prev.bio || summary }));
            }

            if (extractedTitle) {
              setInfo(prev => ({ ...prev, title: prev.title || extractedTitle }));
            }
          } catch { }
        }).catch(() => { });

      // 3. Fetch skills
      fetch(`http://localhost:5000/api/skills/${userId}`)
        .then(r => r.json())
        .then(json => { if (json.success) setSkills(json.data.map(s => s.skill_name)); })
        .catch(() => { });

      // 4. Fetch experience
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
            github: '',
            image: null,
          })));
          if (json.data.length > 0) {
            setInfo(prev => ({ ...prev, title: prev.title || json.data[0].position || '' }));
          }
        }).catch(() => { });

      // 5. Fetch certificates
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

      setHasLoadedInitialData(true);
    }
  }, [userId]);

  /* ΓöÇΓöÇ Auto-save Draft with Debounce (1.5s) ΓöÇΓöÇ */
  useEffect(() => {
    if (!userId || !hasLoadedInitialData) return;

    setSaveStatus('saving');

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

  /* ΓöÇΓöÇ AI Insight fetch ΓöÇΓöÇ */
  useEffect(() => {
    if (!aiOn || (skills.length === 0 && projects.length === 0)) {
      setAiInsight(prev => ({ ...prev, score: 0 }));
      return;
    }
    const timer = setTimeout(() => {
      setAiInsight(prev => ({ ...prev, insight: prev.insight || '─Éang ph├ón t├¡ch...' }));
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

  /* ΓöÇΓöÇ AI Toggle ΓöÇΓöÇ */
  const handleAiToggle = (val) => {
    setAiOn(val);
    if (!val) setAiInsight(prev => ({ ...prev, score: 0 }));
  };

  /* ΓöÇΓöÇ AI Insight CTA: scroll + open relevant section ΓöÇΓöÇ */
  const handleInsightCTA = () => {
    const insight = aiInsight.insight.toLowerCase();
    let ref = null;
    if (insight.includes('dß╗▒ ├ín') || insight.includes('project')) ref = projectsRef;
    else if (insight.includes('kß╗╣ n─âng') || insight.includes('skill')) ref = skillsRef;
    else if (insight.includes('th├ánh tß╗▒u') || insight.includes('giß║úi th╞░ß╗ƒng')) ref = awardsRef;
    else ref = infoRef;

    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const header = ref.current.querySelector('.pb-section-row-header');
      if (header) setTimeout(() => header.click(), 400);
    }
  };

  /* ΓöÇΓöÇ Optimize projects ΓöÇΓöÇ */
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
    showToast('─É├ú tß╗æi ╞░u m├┤ tß║ú dß╗▒ ├ín bß║▒ng AI!', 'success');
  };

  /* ΓöÇΓöÇ AI Co-pilot ΓöÇΓöÇ */
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
        showToast('AI ─æ├ú viß║┐t lß║íi th├ánh c├┤ng!', 'success');
      } else {
        showToast('AI ch╞░a sß║╡n s├áng. Vui l├▓ng thß╗¡ lß║íi.', 'warn');
      }
    } catch {
      showToast('Kh├┤ng thß╗â kß║┐t nß╗æi AI. Vui l├▓ng thß╗¡ lß║íi.', 'warn');
    }
    setCopilotLoading(false);
    setCopilotVisible(false);
  };

  /* ΓöÇΓöÇ Generate professional bio from CV data ΓöÇΓöÇ */
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
        showToast('AI ─æ├ú tß║ío giß╗¢i thiß╗çu bß║ún th├ón chuy├¬n nghiß╗çp!', 'success');
      } else {
        // Fallback: use copilot rewrite endpoint
        const rewriteRes = await fetch('http://localhost:5000/api/portfolio/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: aiInsight.insight || `${info.name} l├á ${info.title}. C├│ kß╗╣ n─âng: ${skills.slice(0, 5).join(', ')}.`,
            tone: 'professional',
          }),
        });
        const rewriteJson = await rewriteRes.json();
        if (rewriteJson.success) {
          setInfo(prev => ({ ...prev, bio: rewriteJson.data }));
          showToast('AI ─æ├ú tß║ío giß╗¢i thiß╗çu bß║ún th├ón!', 'success');
        } else {
          showToast('AI ch╞░a sß║╡n s├áng. Vui l├▓ng nhß║¡p thß╗º c├┤ng.', 'warn');
        }
      }
    } catch {
      showToast('Kh├┤ng thß╗â kß║┐t nß╗æi AI. Vui l├▓ng thß╗¡ lß║íi.', 'warn');
    }
    setIsGeneratingBio(false);
  };

  /* ΓöÇΓöÇ Auto-fill from CV ΓöÇΓöÇ */
  const handleExtractCV = async () => {
    const hasExistingData = skills.length > 0 || projects.length > 0 || awards.length > 0;
    if (hasExistingData) {
      const confirmed = window.confirm(
        'Bß║ín ─æang c├│ dß╗» liß╗çu trong Portfolio.\n\n' +
        'T├¡nh n─âng "Auto ─æiß╗ün tß╗½ CV" sß║╜ Bß╗ö SUNG th├¬m dß╗» liß╗çu tß╗½ CV v├áo c├íc mß╗Ñc hiß╗çn tß║íi (kh├┤ng xo├í dß╗» liß╗çu c┼⌐).\n\n' +
        'Bß║ín c├│ muß╗æn tiß║┐p tß╗Ñc kh├┤ng?'
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
        if (d.projects) setProjects(prev => [...prev, ...d.projects.map((p, i) => ({ id: Date.now() + i, title: p.title || 'Dß╗▒ ├ín mß╗¢i', desc: p.desc || '', tech: p.tech || '', link: '', github: '', image: null }))]);
        if (d.awards) setAwards(prev => [...prev, ...d.awards.map((a, i) => ({ id: Date.now() + 100 + i, title: a.title || 'Giß║úi th╞░ß╗ƒng', org: a.org || '' }))]);

        // === FIX 1: Extract title, phone, address from CV extract response ===
        const extractedTitle = d.title || d.desired_position || d.position || '';
        const extractedPhone = d.phone || '';
        const extractedAddress = d.address || '';

        setInfo(prev => ({
          ...prev,
          title: prev.title || extractedTitle,
          phone: prev.phone || extractedPhone,
          address: prev.address || extractedAddress
        }));

        // === FIX 2: If summary is a critique, redirect to insight panel ===
        if (d.summary) {
          if (isCritiqueText(d.summary)) {
            setAiInsight(prev => ({ ...prev, insight: d.summary }));
          } else if (!info.bio) {
            setInfo(prev => ({ ...prev, bio: d.summary }));
          }
        }

        showToast('─É├ú tr├¡ch xuß║Ñt th├┤ng tin tß╗½ CV!', 'success');
      } else {
        showToast(json.message || 'Kh├┤ng t├¼m thß║Ñy dß╗» liß╗çu CV.', 'warn');
      }
    } catch {
      showToast('Kh├┤ng thß╗â kß║┐t nß╗æi m├íy chß╗º.', 'warn');
    }
    setIsExtracting(false);
  };

  /* ΓöÇΓöÇ ATS Add Keywords ΓöÇΓöÇ */
  const handleAtsAddKeywords = (keywords) => {
    setSkills(prev => [...new Set([...prev, ...keywords])]);
    showToast(`─É├ú th├¬m ${keywords.length} tß╗½ kh├│a v├áo CV!`, 'success');
  };

  /* ΓöÇΓöÇ Save profile ΓöÇΓöÇ */
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

  /* ΓöÇΓöÇ Download PDF ΓöÇΓöÇ */
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

  /* ΓöÇΓöÇ Image upload for project ΓöÇΓöÇ */
  const handleProjectImageUpload = (projectId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, image: e.target.result } : p));
    };
    reader.readAsDataURL(file);
  };

  /* ΓöÇΓöÇ FIX 3: Avatar upload handler ΓöÇΓöÇ */
  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setAvatarUrl(ev.target.result);
      showToast('ß║ónh ─æß║íi diß╗çn ─æ├ú ─æ╞░ß╗úc cß║¡p nhß║¡t!', 'success');
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
  const showInsightPanel = aiOn && insightText && insightText !== '─Éang ph├ón t├¡ch...';

  /* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ RENDER ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
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

          {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ LEFT EDITOR ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
          <div className="pb-editor">

            {/* ΓöÇΓöÇ Personal Branding Panel ΓöÇΓöÇ */}
            <div className="pb-branding-panel">
              <div className="pb-branding-tabs">
                {[
                  { id: 'theme', icon: <FaPalette />, label: 'Giao diß╗çn' },
                  { id: 'layout', icon: <FaTableColumns />, label: 'Bß╗æ cß╗Ñc' },
                  { id: 'font', icon: <FaFont />, label: 'Font chß╗»' },
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
                    <span className="pb-theme-bar-label">Chß╗º ─æß╗ü m├áu sß║»c</span>
                    <button className="pb-theme-see-all" onClick={() => setShowAllThemes(v => !v)}>
                      {showAllThemes ? 'Thu gß╗ìn' : `Xem tß║Ñt cß║ú (${THEMES.length})`}
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
                  <span className="pb-theme-bar-label">Bß╗æ cß╗Ñc ti├¬u ─æß╗ü</span>
                  <div className="pb-layout-options">
                    {[
                      { id: 'center', label: 'C─ân giß╗»a', icon: 'Γûú' },
                      { id: 'left', label: 'C─ân tr├íi', icon: 'Γùº' },
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
                  <span className="pb-theme-bar-label">Kiß╗âu chß╗»</span>
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

            {/* ΓöÇΓöÇ Content Sections Header ΓöÇΓöÇ */}
            <div className="pb-content-header-bar">
              <span className="pb-content-header-bar-label">Khß╗æi nß╗Öi dung</span>
              <div className="pb-ai-toggle-row">
                <span style={{ color: aiOn ? PRIMARY : '#9ca3af' }}>Tß╗æi ╞░u AI</span>
                <Toggle checked={aiOn} onChange={handleAiToggle} />
              </div>
            </div>

            {/* ΓöÇΓöÇ Section Rows ΓöÇΓöÇ */}
            <div className="pb-sections-list">

              {/* Th├┤ng tin c├í nh├ón */}
              <SectionRow
                dot={PRIMARY}
                title="Th├┤ng tin c├í nh├ón"
                subtitle={info.name ? `${info.name}${info.title ? ' ΓÇó ' + info.title : ''}` : 'Ch╞░a c├│ th├┤ng tin'}
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
                    <span className="pb-avatar-upload-label">{avatarUrl ? 'Thay ß║únh ─æß║íi diß╗çn' : 'Tß║úi ß║únh ─æß║íi diß╗çn l├¬n'}</span>
                    <span className="pb-avatar-upload-hint">PNG, JPG, WebP ΓÇó Tß╗æi ─æa 5MB</span>
                  </div>
                  <div className="pb-avatar-upload-btn">
                    <FaCamera style={{ fontSize: 12 }} /> Chß╗ìn ß║únh
                  </div>
                </div>

                {['name', 'title', 'email', 'phone', 'address', 'linkedin'].map(f => (
                  <div className="pb-form-group" key={f}>
                    <label className="pb-form-label">
                      {{
                        name: 'Hß╗ì v├á t├¬n',
                        title: 'Chß╗⌐c danh / Vß╗ï tr├¡',
                        email: 'Email',
                        phone: 'Sß╗æ ─æiß╗çn thoß║íi',
                        address: '─Éß╗ïa chß╗ë',
                        linkedin: 'LinkedIn URL'
                      }[f]}
                      {f === 'title' && !info.title && (
                        <span className="pb-field-hint">ΓÜá Ch╞░a c├│ chß╗⌐c danh</span>
                      )}
                    </label>
                    <input
                      className={`pb-form-input ${f === 'title' && !info.title ? 'pb-input-empty' : ''}`}
                      value={info[f] || ''}
                      placeholder={
                        f === 'title' ? 'VD: Frontend Developer, Data Analyst...' :
                          f === 'name' ? 'Hß╗ì v├á t├¬n ─æß║ºy ─æß╗º' :
                            f === 'email' ? 'email@example.com' :
                              f === 'phone' ? 'VD: 0987654321' :
                                f === 'address' ? 'VD: H├á Nß╗Öi, Viß╗çt Nam' :
                                  'https://linkedin.com/in/...'
                      }
                      onChange={e => setInfo({ ...info, [f]: e.target.value })}
                      onBlur={handleSaveProfile}
                    />
                  </div>
                ))}

                {/* === FIX 2: Bio ΓÇö clearly labeled as PUBLIC intro, not AI critique === */}
                <div className="pb-form-group">
                  <div className="pb-form-label-row">
                    <label className="pb-form-label">
                      Giß╗¢i thiß╗çu bß║ún th├ón
                      <span className="pb-public-badge">≡ƒîÉ Hiß╗ân thß╗ï c├┤ng khai</span>
                    </label>
                    <div className="pb-bio-actions">
                      {aiOn && (
                        <button
                          className="pb-gen-bio-btn"
                          onClick={handleGenerateBio}
                          disabled={isGeneratingBio}
                          title="AI tß╗▒ viß║┐t giß╗¢i thiß╗çu bß║ún th├ón chuy├¬n nghiß╗çp tß╗½ dß╗» liß╗çu CV cß╗ºa bß║ín"
                        >
                          <FaWandMagicSparkles style={{ fontSize: 10 }} />
                          {isGeneratingBio ? '─Éang tß║ío...' : 'AI tß╗▒ viß║┐t'}
                        </button>
                      )}
                      {aiOn && info.bio && (
                        <button className="pb-copilot-trigger" onClick={() => handleOpenCopilot('bio')}>
                          <FaPen style={{ fontSize: 10 }} /> Viß║┐t lß║íi
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="pb-bio-notice">
                    <FaUserTie style={{ fontSize: 11, color: '#6366f1', flexShrink: 0 }} />
                    <span>─É├óy l├á ─æoß║ín v─ân nh├á tuyß╗ân dß╗Ñng sß║╜ ─æß╗ìc. AI sß║╜ viß║┐t theo g├│c nh├¼n <strong>ng├┤i thß╗⌐ nhß║Ñt</strong>, n├¬u bß║¡t thß║┐ mß║ính cß╗ºa bß║ín.</span>
                  </div>
                  <textarea
                    className="pb-form-textarea"
                    value={info.bio}
                    onChange={e => setInfo({ ...info, bio: e.target.value })}
                    onBlur={handleSaveProfile}
                    placeholder="VD: T├┤i l├á sinh vi├¬n ng├ánh Hß╗ç thß╗æng th├┤ng tin quß║ún l├╜ vß╗¢i ─æam m├¬ x├óy dß╗▒ng ß╗⌐ng dß╗Ñng web..."
                    rows={4}
                  />
                </div>
              </SectionRow>

              {/* Kß╗╣ n─âng */}
              <SectionRow
                dot="#f59e0b"
                title="Kß╗╣ n─âng cß╗æt l├╡i"
                subtitle={skills.length > 0 ? `${skills.length} kß╗╣ n─âng ─æ├ú x├íc thß╗▒c` : 'Ch╞░a c├│ kß╗╣ n─âng ΓÇö th├¬m v├áo ngay!'}
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
                    placeholder="Th├¬m kß╗╣ n─âng (Enter ─æß╗â x├íc nhß║¡n)..."
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                  />
                  <button className="pb-add-skill-btn" onClick={addSkill}>Th├¬m</button>
                </div>
              </SectionRow>

              {/* Dß╗▒ ├ín */}
              <SectionRow
                dot="#8b5cf6"
                title="Dß╗▒ ├ín ti├¬u biß╗âu"
                subtitle={projects.length > 0 ? `${projects.length} dß╗▒ ├ín` : 'Ch╞░a c├│ dß╗▒ ├ín ΓÇö th├¬m ngay!'}
                sectionRef={projectsRef}
              >
                <button
                  className={`pb-ai-optimize-btn ${!aiOn ? 'disabled' : ''}`}
                  onClick={handleOptimizeProjects}
                  disabled={isOptimizing || !aiOn || projects.length === 0}
                  title={!aiOn ? 'Bß║¡t Tß╗æi ╞░u AI ─æß╗â sß╗¡ dß╗Ñng t├¡nh n─âng n├áy' : ''}
                >
                  <FaWandMagicSparkles />
                  {isOptimizing ? '─Éang tß╗æi ╞░u...' : !aiOn ? 'Tß╗æi ╞░u AI (─æang tß║»t)' : 'Tß╗æi ╞░u tß║Ñt cß║ú m├┤ tß║ú bß║▒ng AI STAR'}
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
                          <span>Nhß║Ñn ─æß╗â th├¬m ß║únh thumbnail</span>
                        </>
                      )}
                      <input
                        id={`img-upload-${p.id}`}
                        type="file"
                        accept="image/*"
                        onChange={e => handleProjectImageUpload(p.id, e.target.files[0])}
                      />
                    </div>

                    <label className="pb-form-label">T├¬n dß╗▒ ├ín</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} value={p.title} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, title: e.target.value } : x))} />
                    <label className="pb-form-label">C├┤ng nghß╗ç / Kß╗╣ n─âng</label>
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
                      <label className="pb-form-label">M├┤ tß║ú chi tiß║┐t</label>
                      {aiOn && (
                        <button className="pb-copilot-trigger" onClick={() => handleOpenCopilot(p.id)}>
                          <FaWandMagicSparkles style={{ fontSize: 10 }} /> STAR rewrite
                        </button>
                      )}
                    </div>
                    <textarea
                      className="pb-form-textarea"
                      style={{ minHeight: 60 }}
                      placeholder="M├┤ tß║ú theo STAR: Situation ΓåÆ Task ΓåÆ Action ΓåÆ Result..."
                      value={p.desc}
                      onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, desc: e.target.value } : x))}
                    />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setProjects([...projects, { id: Date.now(), title: 'Dß╗▒ ├ín mß╗¢i', desc: '', tech: '', link: '', github: '', image: null }])}>
                  <FaPlus /> Th├¬m dß╗▒ ├ín
                </button>
              </SectionRow>

              {/* Th├ánh tß╗▒u */}
              <SectionRow
                dot="#10b981"
                title="Th├ánh tß╗▒u & Giß║úi th╞░ß╗ƒng"
                subtitle={awards.length > 0 ? awards[0]?.title : 'Th├¬m th├ánh tß╗▒u ─æß║ºu ti├¬n cß╗ºa bß║ín!'}
                sectionRef={awardsRef}
              >
                {awards.length === 0 && (
                  <div className="pb-empty-state-cta">
                    <FaTrophy style={{ fontSize: 28, color: '#d1d5db', marginBottom: 8 }} />
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#374151', fontSize: 13 }}>Chß╗⌐ng chß╗ë, giß║úi th╞░ß╗ƒng, hß╗ìc bß╗òng...</p>
                    <p style={{ margin: '0 0 12px', color: '#9ca3af', fontSize: 12 }}>Th├¬m th├ánh tß╗▒u gi├║p profile cß╗ºa bß║ín nß╗òi bß║¡t h╞ín 3x so vß╗¢i ß╗⌐ng vi├¬n kh├íc</p>
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
                      <label className="pb-form-label">T├¬n giß║úi th╞░ß╗ƒng / Chß╗⌐ng chß╗ë</label>
                      <input className="pb-form-input" value={a.title} onChange={e => setAwards(awards.map(x => x.id === a.id ? { ...x, title: e.target.value } : x))} />
                    </div>
                    <label className="pb-form-label">Tß╗ò chß╗⌐c cß║Ñp & N─âm nhß║¡n</label>
                    <input className="pb-form-input" placeholder="VD: Google - 2025" value={a.org} onChange={e => setAwards(awards.map(x => x.id === a.id ? { ...x, org: e.target.value } : x))} />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setAwards([...awards, { id: Date.now(), title: 'Giß║úi th╞░ß╗ƒng mß╗¢i', org: '' }])}>
                  <FaPlus /> Th├¬m giß║úi th╞░ß╗ƒng
                </button>
              </SectionRow>
            </div>

            {/* ΓöÇΓöÇ AI Insight Panel (shows critique text here, NOT in public bio) ΓöÇΓöÇ */}
            {showInsightPanel && (
              <div className="pb-ai-insight">
                <div className="pb-ai-insight-icon">
                  <FaLightbulb style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <div className="pb-ai-insight-body">
                  <p className="pb-ai-insight-label">
                    AI Insight
                    <span className="pb-insight-private-badge">Ri├¬ng t╞░</span>
                  </p>
                  <p className="pb-ai-insight-text">{insightText}</p>
                  <button className="pb-ai-insight-cta" onClick={handleInsightCTA}>
                    Cß║úi thiß╗çn ngay <FaArrowRight style={{ fontSize: 10 }} />
                  </button>
                </div>
              </div>
            )}
            {aiOn && insightText === '─Éang ph├ón t├¡ch...' && (
              <div className="pb-ai-insight pb-ai-analyzing">
                <div className="pb-ai-insight-icon pb-ai-pulse">
                  <FaRobot style={{ color: 'white', fontSize: '14px' }} />
                </div>
                <div>
                  <p className="pb-ai-insight-label">AI ─æang ph├ón t├¡ch...</p>
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
                  <p className="pb-ai-insight-label" style={{ color: '#9ca3af' }}>Tß╗æi ╞░u AI ─æang tß║»t</p>
                  <p className="pb-ai-insight-text" style={{ color: '#9ca3af' }}>Bß║¡t toggle "Tß╗æi ╞░u AI" ph├¡a tr├¬n ─æß╗â nhß║¡n ph├ón t├¡ch tß╗½ AI.</p>
                </div>
              </div>
            )}

            {/* ΓöÇΓöÇ Bottom Actions ΓöÇΓöÇ */}
            <div className="pb-actions-bar">
              <button className="pb-btn-extract" onClick={handleExtractCV} disabled={isExtracting || !userId}>
                <FaWandMagicSparkles />
                {isExtracting ? '─Éang ─æß╗ìc CV...' : 'Auto ─æiß╗ün tß╗½ CV'}
              </button>
            </div>
          </div>

          {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ RIGHT PREVIEW ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
          <div className="pb-preview">

            {/* Toolbar */}
            <div className="pb-preview-toolbar">
              <div className="pb-device-switch">
                {[['desktop', 'Desktop', <FaDesktop />], ['mobile', 'Mobile', <FaMobileScreen />]].map(([d, label, icon]) => (
                  <button
                    key={d}
                    className={`pb-device-btn ${device === d ? 'active' : ''}`}
                    onClick={() => setDevice(d)}
                    aria-label={`Chß║┐ ─æß╗Ö xem ${label}`}
                  >
                    {icon} <span>{label}</span>
                  </button>
                ))}
              </div>
              <button className="pb-btn-pdf" onClick={handleDownloadPDF}>
                <FaDownload /> Tß║úi PDF
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
                  <span className="pb-save-spinner" style={{ width: '8px', height: '8px', border: '1.5px solid #d1d5db', borderTopColor: '#4f6ef7', borderRadius: '50%', display: 'inline-block', animation: 'pbSpinner 0.8s linear infinite' }} /> ─æang l╞░u...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="pb-save-indicator saved" style={{ fontSize: '11px', color: '#10b981', marginRight: '8px', fontWeight: 600 }}>
                  Γ£ô ─É├ú l╞░u thay ─æß╗òi v├áo hß╗ç thß╗æng
                </span>
              )}
              <button className="pb-star-btn" title="L╞░u trang">
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
