import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './PortfolioBuilder.css';
import Topbar from "../DashboardLogged/Topbar";
import { FaPen as EditIcon } from "react-icons/fa6"; // hoặc icon bút chỉnh sửa bạn muốn dùng

// Import toàn bộ FontAwesome Icons
import {
  FaPenToSquare,
  FaBolt,
  FaBriefcase,
  FaMedal,
  FaCheck,
  FaXmark,
  FaPlus,
  FaWandMagicSparkles,
  FaLightbulb,
  FaFloppyDisk,
  FaUpload,
  FaDesktop,
  FaMobileScreen,
  FaArrowsRotate,
  FaEye,
  FaTableCellsLarge,
  FaLink,
  FaGlobe,
  FaStar,
  FaDownload
} from "react-icons/fa6";

const THEMES = [
  { id: 'modern', name: 'Modern', colors: ['var(--primary-color, #3b5bdb)', '#6b8df7', '#eef0ff'] },
  { id: 'creative', name: 'Creative', colors: ['#7c3aed', '#a78bfa', '#f5f3ff'] },
  { id: 'minimal', name: 'Minimal', colors: ['#111827', '#6b7280', '#f3f4f6'] },
  { id: 'professional', name: 'Professional', colors: ['#0f766e', '#14b8a6', '#f0fdfa'] },
];

const FALLBACK_INFO = {
  name: '',
  title: '',
  bio: '',
  email: '',
  linkedin: '',
};

const DEFAULT_PROJECTS = [];

const DEFAULT_AWARDS = [];


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
        <button className="pb-section-row-edit" onClick={e => { e.stopPropagation(); setOpen(!open); }}>
          <FaPenToSquare style={{ fontSize: '14px' }} />
        </button>
      </div>
      {open && <div className="pb-section-row-body">{children}</div>}
    </div>
  );
}

function PortfolioPreview({ info, skills, projects, awards, theme }) {
  const t = THEMES.find(x => x.id === theme) || THEMES[0];
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
          <h2 className="pf-name">{info.name}</h2>
          <div className="pf-title-row">
            <div className="pf-title-line" style={{ background: t.colors[0] }} />
            <span className="pf-title-text" style={{ color: t.colors[0] }}>{info.title}</span>
            <div className="pf-title-line" style={{ background: t.colors[0] }} />
          </div>
          <p className="pf-bio">{info.bio}</p>
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
          <div className="pf-skill-pills">
            {skills.map(s => <span key={s} className="pf-skill-pill">{s}</span>)}
          </div>
        </div>
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
      </div>

      {/* Projects */}
      <div className="pf-section-divider" />
      <div className="pf-section">
        <p className="pf-section-title">Dự án tiêu biểu</p>
        {projects.map(p => (
          <div key={p.id} className="pf-project-item" style={{ marginBottom: 10 }}>
            <div className="pf-project-thumb" style={{ background: t.colors[2] }}>
              <FaBriefcase style={{ color: t.colors[0], fontSize: '18px' }} />
            </div>
            <div className="pf-project-body">
              <p className="pf-project-title">{p.title}</p>
              <p className="pf-project-desc">{p.desc}</p>
              {p.tech && <p className="pf-project-tech" style={{ fontSize: 11, color: t.colors[0], marginTop: 6, fontWeight: 600 }}>Công nghệ: {p.tech}</p>}
              {p.link && <a href={p.link} className="pf-project-link" style={{ fontSize: 11, color: '#6b7280', marginTop: 4, display: 'inline-block' }}>{p.link}</a>}
            </div>
          </div>
        ))}
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

function nameToSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');
}

export default function PortfolioBuilder() {
  const [theme, setTheme] = useState('modern');
  const [device, setDevice] = useState('desktop');
  const [aiOn, setAiOn] = useState(true);
  const [info, setInfo] = useState(FALLBACK_INFO);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState([]);
  const [awards, setAwards] = useState([]);
  const [aiInsight, setAiInsight] = useState({ insight: 'Đang phân tích Portfolio của bạn...', score: 95 });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  // Fetch user profile + skills + experience + certificates từ API
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('career_user'));
    const userId = user ? user.user_id : 19;

    // User profile
    fetch(`http://localhost:5000/api/user/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const d = json.data;
        setInfo({
          name: d.full_name || '',
          title: d.bio && d.bio.includes('||') ? d.bio.split('||')[0] : (d.bio ? d.bio.split('.')[0] : ''),
          bio: d.bio && d.bio.includes('||') ? d.bio.split('||')[1] : (d.bio || ''),
          email: d.email || '',
          linkedin: '',
        });
      })
      .catch(() => { });

    // Skills
    fetch(`http://localhost:5000/api/skills/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const mapped = json.data.map(s => s.skill_name);
        setSkills(mapped);
      })
      .catch(() => { });

    // Experience -> Projects
    fetch(`http://localhost:5000/api/experience/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const mapped = json.data.map(exp => ({
          id: exp.experience_id,
          title: `${exp.position} - ${exp.company}`,
          desc: exp.description || ''
        }));
        setProjects(mapped);
      })
      .catch(() => { });

    // Certificate -> Awards
    fetch(`http://localhost:5000/api/certificate/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const mapped = json.data.map(cert => ({
          id: cert.certificate_id,
          title: cert.name,
          org: cert.organization + (cert.issue_date ? ` (${cert.issue_date})` : '')
        }));
        setAwards(mapped);
      })
      .catch(() => { });
  }, []);

  // Fetch AI insight when skills or projects change
  useEffect(() => {
    if (skills.length === 0 && projects.length === 0) return;
    
    const timer = setTimeout(() => {
      setAiInsight(prev => ({ ...prev, insight: "Đang phân tích..." }));
      fetch('http://localhost:5000/api/portfolio/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, projects })
      })
      .then(r => r.json())
      .then(json => {
        if (json.success) setAiInsight({ insight: json.data.insight, score: json.data.score || 95 });
      })
      .catch(() => setAiInsight(prev => ({ ...prev, insight: "AI hiện không khả dụng." })));
    }, 2000);
    return () => clearTimeout(timer);
  }, [skills, projects]);

  const handleOptimizeProjects = async () => {
    if (projects.length === 0) return;
    setIsOptimizing(true);
    const newProjects = [...projects];
    
    for (let i = 0; i < newProjects.length; i++) {
      if (newProjects[i].desc) {
        try {
          const res = await fetch('http://localhost:5000/api/portfolio/optimize-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newProjects[i].desc })
          });
          const json = await res.json();
          if (json.success) {
            newProjects[i].desc = json.data;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    
    setProjects(newProjects);
    setIsOptimizing(false);
  };

  const handleExtractCV = async () => {
    setIsExtracting(true);
    const user = JSON.parse(localStorage.getItem('career_user'));
    const userId = user ? user.user_id : 19;
    try {
      const res = await fetch(`http://localhost:5000/api/portfolio/extract-cv/${userId}`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.skills) setSkills(prev => [...new Set([...prev, ...d.skills])]);
        if (d.projects) {
          const mappedProjs = d.projects.map((p, i) => ({
            id: Date.now() + i,
            title: p.title || 'Dự án mới',
            desc: p.desc || '',
            tech: p.tech || ''
          }));
          setProjects(prev => [...prev, ...mappedProjs]);
        }
        if (d.awards) {
          const mappedAwards = d.awards.map((a, i) => ({
            id: Date.now() + 100 + i,
            title: a.title || 'Giải thưởng',
            org: a.org || ''
          }));
          setAwards(prev => [...prev, ...mappedAwards]);
        }
        alert('Đã trích xuất thông tin từ CV thành công!');
      } else {
        alert(json.message || 'Lỗi trích xuất CV');
      }
    } catch (e) {
      alert('Không thể kết nối máy chủ để trích xuất CV');
    }
    setIsExtracting(false);
  };

  const handleSaveProfile = async () => {
    const user = JSON.parse(localStorage.getItem('career_user'));
    const userId = user ? user.user_id : 19;
    try {
      await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: info.name,
          bio: `${info.title}||${info.bio}`
        })
      });
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('portfolio-preview-content');
    if (element) {
      const opt = {
        margin:       [0, 0, 0, 0],
        filename:     `Portfolio_${nameToSlug(info.name) || 'career_ai'}.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const portfolioUrl = `portfolio.ai/u/${nameToSlug(info.name) || 'tendangnhap'}`;

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };


  return (
    <DashboardLayout>
      <div className="pb-page">
        <div className="pb-main">

          {/* ── LEFT PANEL ── */}
          <div className="pb-editor">

            {/* Theme selector */}
            <div className="pb-theme-bar">
              <div className="pb-theme-bar-row">
                <span className="pb-theme-bar-label">Chọn Giao diện</span>
                <button className="pb-theme-see-all">Xem tất cả</button>
              </div>
              <div className="pb-theme-cards">
                {THEMES.map(t => (
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
              <div className="pb-ai-toggle-row">
                Tối ưu AI <Toggle checked={aiOn} onChange={setAiOn} />
              </div>
            </div>

            {/* Section rows */}
            <div className="pb-sections-list">

              {/* Thông tin */}
              <SectionRow dot="var(--primary-color, #3b5bdb)" title="Thông tin cá nhân" subtitle={`${info.name} • ${info.title} Data Architect`}>
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
              <SectionRow dot="#f59e0b" title="Kỹ năng cốt lõi" subtitle={`${skills.length} kỹ năng đã được xác thực`}>
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
              <SectionRow dot="#8b5cf6" title="Dự án tiêu biểu" subtitle={`${projects.length} dự án cần tối ưu nội dung`}>
                <button className="pb-ai-optimize-btn" onClick={handleOptimizeProjects} disabled={isOptimizing}>
                  <FaWandMagicSparkles style={{ marginRight: '6px' }} />
                  {isOptimizing ? "Đang tối ưu bằng AI..." : "Tối ưu nội dung dự án bằng AI"}
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
                    
                    <label className="pb-form-label">Công nghệ / Kỹ năng sử dụng</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} placeholder="React, Node.js, Python..." value={p.tech || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, tech: e.target.value } : x))} />
                    
                    <label className="pb-form-label">Link dự án (Tuỳ chọn)</label>
                    <input className="pb-form-input" style={{ marginBottom: 10 }} placeholder="https://..." value={p.link || ''} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, link: e.target.value } : x))} />
                    
                    <label className="pb-form-label">Mô tả chi tiết</label>
                    <textarea className="pb-form-textarea" style={{ minHeight: 60 }} placeholder="Mô tả công việc bạn đã làm trong dự án này..." value={p.desc} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, desc: e.target.value } : x))} />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setProjects([...projects, { id: Date.now(), title: 'Dự án mới', desc: '', tags: [] }])}>
                  <FaPlus style={{ marginRight: '6px' }} />
                  Thêm dự án
                </button>
              </SectionRow>

              {/* Thành tựu */}
              <SectionRow dot="#10b981" title="Thành tựu & Giải thưởng" subtitle={awards[0]?.title || 'Chưa có thành tựu'} editIcon={<EditIcon />}>
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
                      <input
                        className="pb-form-input"
                        value={a.title}
                        onChange={e => setAwards(awards.map(x => x.id === a.id ? { ...x, title: e.target.value } : x))}
                      />
                    </div>
                    <label className="pb-form-label">Tổ chức cấp & Năm nhận</label>
                    <input
                      className="pb-form-input"
                      placeholder="VD: Google - 2025"
                      value={a.org}
                      onChange={e => setAwards(awards.map(x => x.id === a.id ? { ...x, org: e.target.value } : x))}
                    />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setAwards([...awards, { id: Date.now(), title: 'Giải thưởng mới', org: '' }])}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Thêm giải thưởng
                </button>
              </SectionRow>
            </div>

            {/* AI insight */}
            <div className="pb-ai-insight">
              <div className="pb-ai-insight-icon">
                <FaLightbulb style={{ color: 'white', fontSize: '14px' }} />
              </div>
              <div>
                <p className="pb-ai-insight-label">AI Insight</p>
                <p className="pb-ai-insight-text">{aiInsight.insight}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pb-actions-bar">
              <button className="pb-btn-save" onClick={handleExtractCV} disabled={isExtracting}>
                <FaWandMagicSparkles style={{ marginRight: '6px' }} />
                {isExtracting ? 'Đang đọc CV...' : 'Auto điền từ CV'}
              </button>
              <button className="pb-btn-publish" onClick={handleDownloadPDF}>
                <FaDownload style={{ marginRight: '6px' }} />
                Tải về thành PDF
              </button>
            </div>
          </div>

          {/* ── RIGHT PREVIEW ── */}
          <div className="pb-preview">
            {/* Toolbar row 1 */}
            <div className="pb-preview-toolbar">
              <div className="pb-device-switch">
                {[['desktop', 'Desktop'], ['mobile', 'Mobile']].map(([d, label]) => (
                  <button key={d} className={`pb-device-btn ${device === d ? 'active' : ''}`} onClick={() => setDevice(d)}>
                    {d === 'desktop' ? <FaDesktop style={{ marginRight: '4px' }} /> : <FaMobileScreen style={{ marginRight: '4px' }} />}
                    {label}
                  </button>
                ))}
              </div>
              <button className="pb-refresh-btn">
                <FaArrowsRotate />
              </button>
            </div>

            {/* Toolbar row 2 */}
            <div className="pb-preview-actions-bar">
              {[
                { label: 'Chỉ để xem trực tiếp', icon: <FaEye style={{ marginRight: '6px' }} /> },
                { label: 'Chỉnh sửa bố cục', icon: <FaTableCellsLarge style={{ marginRight: '6px' }} /> },
                { label: 'Sao chép liên kết', icon: <FaLink style={{ marginRight: '6px' }} /> },
              ].map(({ label, icon }) => (
                <button key={label} className="pb-action-btn">{icon}{label}</button>
              ))}
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
                {portfolioUrl}
              </div>
              <button className="pb-star-btn">
                <FaStar style={{ color: '#9ca3af' }} />
              </button>
            </div>

            {/* Preview frame */}
            <div className="pb-preview-frame">
              <div id="portfolio-preview-content" style={{ width: '100%', maxWidth: '640px', margin: '0 auto', background: 'transparent' }}>
                <PortfolioPreview info={{...info, score: aiInsight.score}} skills={skills} projects={projects} awards={awards} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}