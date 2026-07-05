import React, { useState } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';
import './PortfolioBuilder.css';

const THEMES = [
  { id: 'modern',       name: 'Modern',       colors: ['#3b5bdb', '#6b8df7', '#eef0ff'] },
  { id: 'creative',     name: 'Creative',     colors: ['#7c3aed', '#a78bfa', '#f5f3ff'] },
  { id: 'minimal',      name: 'Minimal',      colors: ['#111827', '#6b7280', '#f3f4f6'] },
  { id: 'professional', name: 'Professional', colors: ['#0f766e', '#14b8a6', '#f0fdfa'] },
];

const DEFAULT_INFO = {
  name: 'Nguyễn Văn A',
  title: 'Senior Data Architect & AI Researcher',
  bio: 'Xây dựng giải pháp dữ liệu tối ưu và nghiên cứu các mô hình học máy ứng dụng thực tiễn, giúp doanh nghiệp bứt phá bằng sức mạnh của trí tuệ nhân tạo.',
  email: 'nguyenvana@email.com',
  linkedin: 'linkedin.com/in/nguyenvana',
};

const DEFAULT_SKILLS = ['Python', 'TensorFlow', 'SQL Expert', 'Cloud Architect'];

const DEFAULT_PROJECTS = [
  { id: 1, title: 'Hệ thống phân tích hành vi người dùng', desc: 'Sử dụng Deep Learning để dự đoán tỉ lệ rời bỏ của khách hàng với độ chính xác 92%.', tags: ['Python', 'ML', 'BigQuery'] },
  { id: 2, title: 'Real-time Data Pipeline', desc: 'Xây dựng pipeline xử lý 1M+ sự kiện/ngày với Apache Kafka.', tags: ['Kafka', 'Spark', 'GCP'] },
];

const DEFAULT_AWARDS = [
  { id: 1, title: 'Top 100 AI Researcher 2023', org: 'VietAI Summit' },
  { id: 2, title: 'Best Data Project', org: 'Google DevFest 2022' },
];

function Toggle({ checked, onChange }) {
  return (
    <label className="pb-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pb-toggle-slider" />
    </label>
  );
}

function SectionRow({ dot, title, subtitle, children, editIcon }) {
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
          {editIcon}
        </button>
      </div>
      {open && <div className="pb-section-row-body">{children}</div>}
    </div>
  );
}

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

function PortfolioPreview({ info, skills, projects, theme }) {
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
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill={t.colors[0]} stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </p>
          <div className="pf-skill-pills">
            {skills.map(s => <span key={s} className="pf-skill-pill">{s}</span>)}
          </div>
        </div>
        <div className="pf-score-card" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}>
          <p className="pf-score-card-label">Chỉ số ấn tượng</p>
          <div>
            <div className="pf-score-number">95%</div>
            <div className="pf-score-sub">Khả năng phù hợp với JD</div>
          </div>
          <div className="pf-score-bar-track">
            <div className="pf-score-bar-fill" style={{ width: '95%' }} />
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.colors[0]} strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div className="pf-project-body">
              <p className="pf-project-title">{p.title}</p>
              <p className="pf-project-desc">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioBuilder() {
  const [theme, setTheme] = useState('modern');
  const [device, setDevice] = useState('desktop');
  const [aiOn, setAiOn] = useState(true);
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [awards] = useState(DEFAULT_AWARDS);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  return (
    <DashboardLayout>
      <Topbar user={{ name: 'Ngọc Anh' }} />
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
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content header */}
            <div className="pb-content-header-bar">
              <span className="pb-content-header-bar-label">Khởi nội dung</span>
              <div className="pb-ai-toggle-row">
                Tối ưu AI <Toggle checked={aiOn} onChange={setAiOn} />
              </div>
            </div>

            {/* Section rows */}
            <div className="pb-sections-list">

              {/* Thông tin */}
              <SectionRow dot="#3b5bdb" title="Thông tin cá nhân" subtitle={`${info.name} • ${info.title.split(' ')[0]} Data Architect`} editIcon={<EditIcon />}>
                {['name','title','email','linkedin'].map(f => (
                  <div className="pb-form-group" key={f}>
                    <label className="pb-form-label">{{ name:'Họ và tên', title:'Chức danh', email:'Email', linkedin:'LinkedIn' }[f]}</label>
                    <input className="pb-form-input" value={info[f]} onChange={e => setInfo({ ...info, [f]: e.target.value })} />
                  </div>
                ))}
                <div className="pb-form-group">
                  <label className="pb-form-label">Giới thiệu</label>
                  <textarea className="pb-form-textarea" value={info.bio} onChange={e => setInfo({ ...info, bio: e.target.value })} />
                </div>
              </SectionRow>

              {/* Kỹ năng */}
              <SectionRow dot="#f59e0b" title="Kỹ năng cốt lõi" subtitle={`${skills.length} kỹ năng đã được xác thực`} editIcon={<EditIcon />}>
                <div className="pb-skills-tags">
                  {skills.map(s => (
                    <div key={s} className="pb-skill-tag">
                      {s}
                      <button className="pb-skill-remove" onClick={() => setSkills(skills.filter(x => x !== s))}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
              <SectionRow dot="#8b5cf6" title="Dự án tiêu biểu" subtitle={`${projects.length} dự án cần tối ưu nội dung`} editIcon={<EditIcon />}>
                <button className="pb-ai-optimize-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Tối ưu nội dung dự án bằng AI
                </button>
                {projects.map(p => (
                  <div key={p.id} className="pb-proj-card">
                    <div className="pb-proj-card-head">
                      <span className="pb-proj-card-title">{p.title}</span>
                      <button className="pb-proj-remove" onClick={() => setProjects(projects.filter(x => x.id !== p.id))}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                    <input className="pb-form-input" style={{ marginBottom: 6 }} value={p.title} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, title: e.target.value } : x))} />
                    <textarea className="pb-form-textarea" style={{ minHeight: 52 }} value={p.desc} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, desc: e.target.value } : x))} />
                  </div>
                ))}
                <button className="pb-add-item-btn" onClick={() => setProjects([...projects, { id: Date.now(), title: 'Dự án mới', desc: '', tags: [] }])}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Thêm dự án
                </button>
              </SectionRow>

              {/* Thành tựu */}
              <SectionRow dot="#10b981" title="Thành tựu & Giải thưởng" subtitle={awards[0]?.title} editIcon={<EditIcon />}>
                {awards.map(a => (
                  <div key={a.id} className="pb-proj-card">
                    <div className="pb-form-group" style={{ marginBottom: 6 }}>
                      <label className="pb-form-label">Tên giải thưởng</label>
                      <input className="pb-form-input" defaultValue={a.title} />
                    </div>
                    <label className="pb-form-label">Tổ chức / Năm</label>
                    <input className="pb-form-input" defaultValue={a.org} />
                  </div>
                ))}
                <button className="pb-add-item-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Thêm giải thưởng
                </button>
              </SectionRow>
            </div>

            {/* Add section */}
            <button className="pb-add-section-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Thêm nội dung mới
            </button>

            {/* AI insight */}
            <div className="pb-ai-insight">
              <div className="pb-ai-insight-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div>
                <p className="pb-ai-insight-label">AI Insight</p>
                <p className="pb-ai-insight-text">Bạn nên thêm chỉ số tăng trưởng 20% vào dự án AI. Phần tích hơn sẽ tăng độ tin cậy.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pb-actions-bar">
              <button className="pb-btn-save">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Lưu bản nháp
              </button>
              <button className="pb-btn-publish">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Xuất bản Portfolio
              </button>
            </div>
          </div>

          {/* ── RIGHT PREVIEW ── */}
          <div className="pb-preview">
            {/* Toolbar row 1 */}
            <div className="pb-preview-toolbar">
              <div className="pb-device-switch">
                {[['desktop','Desktop'], ['mobile','Mobile']].map(([d, label]) => (
                  <button key={d} className={`pb-device-btn ${device === d ? 'active' : ''}`} onClick={() => setDevice(d)}>
                    {d === 'desktop'
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                      : <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    }
                    {label}
                  </button>
                ))}
              </div>
              <button className="pb-refresh-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </button>
            </div>

            {/* Toolbar row 2 */}
            <div className="pb-preview-actions-bar">
              {[
                { label: 'Chỉ để xem trực tiếp', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
                { label: 'Chỉnh sửa bố cục', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                { label: 'Sao chép liên kết', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
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
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                portfolio.ai/u/nguyenvana
              </div>
              <button className="pb-star-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
            </div>

            {/* Preview frame */}
            <div className="pb-preview-frame">
              <div style={{ width: device === 'mobile' ? 375 : '100%', transition: 'width 0.3s ease' }}>
                <PortfolioPreview info={info} skills={skills} projects={projects} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
