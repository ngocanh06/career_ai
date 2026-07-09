import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import {
  getUser, updateUser, uploadAvatar,
  getCareers, getRoadmap, getSkills,
  CURRENT_USER_ID
} from '../../services/api';
import {
  FaCamera, FaUser, FaBriefcase, FaCode, FaGraduationCap,
  FaEnvelope, FaPhone, FaPenToSquare, FaCheck, FaXmark,
  FaChartLine, FaRoute, FaIdCard, FaStar, FaSpinner
} from 'react-icons/fa6';
import './MyProfile.css';

/* ─── helpers ─── */
const initials = (name) =>
  (name || 'U').trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const BACKEND_BASE = 'http://localhost:5000';
const toAbsUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE}${url}`;
};

/* ─── StatCard ─── */
function StatCard({ icon, value, label, color }) {
  return (
    <div className="mp-stat-card" style={{ '--sc': color }}>
      <div className="mp-stat-icon">{icon}</div>
      <div className="mp-stat-val">{value}</div>
      <div className="mp-stat-lbl">{label}</div>
    </div>
  );
}

/* ─── Section ─── */
function Section({ title, action, children }) {
  return (
    <div className="mp-section">
      <div className="mp-section-header">
        <h3 className="mp-section-title">{title}</h3>
        {action}
      </div>
      <div className="mp-section-body">{children}</div>
    </div>
  );
}

/* ─── Inline editable field ─── */
function EditableField({ label, value, onSave, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="mp-field">
      <div className="mp-field-label">{label}</div>
      {editing ? (
        <div className="mp-field-edit">
          {multiline ? (
            <textarea
              className="mp-input mp-textarea"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={4}
              autoFocus
            />
          ) : (
            <input
              className="mp-input"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              autoFocus
            />
          )}
          <div className="mp-field-actions">
            <button className="mp-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <FaSpinner className="mp-spin" /> : <FaCheck />} Lưu
            </button>
            <button className="mp-btn-cancel" onClick={() => { setEditing(false); setDraft(value); }}>
              <FaXmark /> Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="mp-field-view" onClick={() => setEditing(true)}>
          <span className="mp-field-value">{value || <span className="mp-placeholder">Chưa cập nhật — click để chỉnh sửa</span>}</span>
          <FaPenToSquare className="mp-field-edit-icon" />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function MyProfile() {
  const storedUser = JSON.parse(localStorage.getItem('career_user') || '{}');
  const userId = storedUser.user_id || CURRENT_USER_ID;

  const [profile, setProfile] = useState(null);
  const [careers, setCareers] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  /* Load data */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, c, sk] = await Promise.allSettled([
          getUser(userId),
          getCareers(userId),
          getSkills(userId),
        ]);
        if (u.status === 'fulfilled') setProfile(u.value);
        if (c.status === 'fulfilled') setCareers(c.value || []);
        if (sk.status === 'fulfilled') setSkills(sk.value || []);
      } catch (_) {}

      // Roadmap separately (can 404)
      try { const r = await getRoadmap(userId); setRoadmap(r); } catch (_) {}
      setLoading(false);
    };
    load();
  }, [userId]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  /* Avatar upload */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File ảnh tối đa 2MB'); return; }
    setAvatarLoading(true);
    try {
      const res = await uploadAvatar(userId, file);
      const url = res.avatar_url;
      setProfile(p => ({ ...p, avatar_url: url }));
      const updated = { ...storedUser, avatar_url: url };
      localStorage.setItem('career_user', JSON.stringify(updated));
      showSuccess('Cập nhật ảnh đại diện thành công!');
    } catch (err) { alert(err.message || 'Lỗi khi tải ảnh'); }
    setAvatarLoading(false);
  };

  /* Field save */
  const handleSave = async (field, value) => {
    try {
      await updateUser(userId, { [field]: value });
      setProfile(p => ({ ...p, [field]: value }));
      const updated = { ...storedUser, [field]: value };
      localStorage.setItem('career_user', JSON.stringify(updated));
      showSuccess('Đã lưu thay đổi!');
    } catch (err) { alert(err.message || 'Lỗi khi lưu'); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mp-loading">
          <FaSpinner className="mp-spin-lg" />
          <p>Đang tải hồ sơ...</p>
        </div>
      </DashboardLayout>
    );
  }

  const avatarUrl = toAbsUrl(profile?.avatar_url);
  const displayName = profile?.full_name || storedUser.full_name || 'Người dùng';
  const email = profile?.email || storedUser.email || '';
  const completedSkills = skills.filter(s => s.proficiency_level === 'advanced' || s.proficiency_level === 'intermediate').length;
  const topCareer = careers[0];
  const roadmapPct = roadmap?.completion_rate || 0;

  return (
    <DashboardLayout>
      <div className="mp-page">

        {/* Success toast */}
        {successMsg && (
          <div className="mp-toast">
            <FaCheck /> {successMsg}
          </div>
        )}

        {/* ── Hero cover + avatar ── */}
        <div className="mp-hero">
          <div className="mp-cover" />
          <div className="mp-hero-content">
            <div className="mp-avatar-wrap">
              <div className="mp-avatar">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" className="mp-avatar-img" />
                  : <span className="mp-avatar-initials">{initials(displayName)}</span>
                }
                {avatarLoading && (
                  <div className="mp-avatar-overlay"><FaSpinner className="mp-spin" /></div>
                )}
              </div>
              <button
                className="mp-avatar-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={avatarLoading}
                title="Đổi ảnh đại diện"
              >
                <FaCamera />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>
            <div className="mp-hero-info">
              <h1 className="mp-hero-name">{displayName}</h1>
              <p className="mp-hero-role">{topCareer?.job_title || 'Chưa xác định nghề nghiệp'}</p>
              <div className="mp-hero-meta">
                <span><FaEnvelope /> {email}</span>
                {profile?.phone && <span><FaPhone /> {profile.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="mp-stats">
          <StatCard
            icon={<FaChartLine />}
            value={`${topCareer?.match_percentage ?? '–'}%`}
            label="Phù hợp nghề nghiệp"
            color="#3b5bdb"
          />
          <StatCard
            icon={<FaRoute />}
            value={`${Math.round(roadmapPct)}%`}
            label="Tiến độ lộ trình"
            color="#0ea5e9"
          />
          <StatCard
            icon={<FaCode />}
            value={skills.length}
            label="Kỹ năng đã học"
            color="#10b981"
          />
          <StatCard
            icon={<FaStar />}
            value={careers.length}
            label="Nghề nghiệp gợi ý"
            color="#f59e0b"
          />
        </div>

        <div className="mp-body">
          {/* LEFT COLUMN */}
          <div className="mp-col-left">

            {/* Thông tin cá nhân */}
            <Section title="Thông tin cá nhân">
              <EditableField
                label="Họ và tên"
                value={profile?.full_name || ''}
                onSave={v => handleSave('full_name', v)}
              />
              <EditableField
                label="Số điện thoại"
                value={profile?.phone || ''}
                onSave={v => handleSave('phone', v)}
              />
              <div className="mp-field">
                <div className="mp-field-label">Email</div>
                <div className="mp-field-view mp-field-view--readonly">
                  <span className="mp-field-value">{email}</span>
                </div>
              </div>
              <EditableField
                label="Giới thiệu bản thân"
                value={profile?.bio || ''}
                onSave={v => handleSave('bio', v)}
                multiline
              />
            </Section>

            {/* Nghề nghiệp gợi ý */}
            <Section title="Nghề nghiệp phù hợp">
              {careers.length > 0 ? (
                <div className="mp-career-list">
                  {careers.slice(0, 5).map((c, i) => (
                    <div key={i} className="mp-career-item">
                      <div className="mp-career-rank">#{i + 1}</div>
                      <div className="mp-career-info">
                        <div className="mp-career-title">{c.job_title}</div>
                        <div className="mp-career-bar">
                          <div
                            className="mp-career-fill"
                            style={{ width: `${c.match_percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="mp-career-pct">{c.match_percentage}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mp-empty">
                  <FaBriefcase className="mp-empty-icon" />
                  <p>Chưa có dữ liệu gợi ý nghề nghiệp.<br />Hãy phân tích CV để nhận gợi ý.</p>
                </div>
              )}
            </Section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="mp-col-right">

            {/* Lộ trình học tập */}
            <Section title="Lộ trình học tập">
              {roadmap ? (
                <div className="mp-roadmap">
                  <div className="mp-roadmap-header">
                    <div>
                      <div className="mp-roadmap-title">{roadmap.title}</div>
                      <div className="mp-roadmap-sub">{roadmap.total_months} tháng · {roadmap.status}</div>
                    </div>
                    <div className="mp-roadmap-pct">{Math.round(roadmapPct)}%</div>
                  </div>
                  <div className="mp-progress-bar">
                    <div className="mp-progress-fill" style={{ width: `${roadmapPct}%` }} />
                  </div>
                  {roadmap.goals && (
                    <div className="mp-goals">
                      {roadmap.goals.slice(0, 4).map((g, i) => (
                        <div key={i} className={`mp-goal ${g.status === 'completed' ? 'mp-goal--done' : ''}`}>
                          <div className="mp-goal-dot" />
                          <div className="mp-goal-body">
                            <div className="mp-goal-skill">{g.skill_name || `Mục tiêu ${i + 1}`}</div>
                            <div className="mp-goal-prog">{g.progress_percentage ?? 0}% · Tháng {g.target_month}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mp-empty">
                  <FaRoute className="mp-empty-icon" />
                  <p>Chưa có lộ trình học tập.<br />Hãy vào trang Lộ trình học tập để tạo mới.</p>
                </div>
              )}
            </Section>

            {/* Kỹ năng */}
            <Section title="Kỹ năng">
              {skills.length > 0 ? (
                <div className="mp-skills">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className={`mp-skill-badge mp-skill-badge--${s.proficiency_level || 'beginner'}`}
                    >
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mp-empty">
                  <FaCode className="mp-empty-icon" />
                  <p>Chưa có kỹ năng nào được ghi nhận.</p>
                </div>
              )}
            </Section>

            {/* CV nhanh */}
            <Section title="Hồ sơ năng lực">
              <div className="mp-cv-links">
                <a href="/ai-cv" className="mp-cv-card">
                  <FaIdCard className="mp-cv-icon" />
                  <div>
                    <div className="mp-cv-card-title">Phân tích CV</div>
                    <div className="mp-cv-card-sub">Xem điểm mạnh và gợi ý cải thiện</div>
                  </div>
                </a>
                <a href="/portfolio" className="mp-cv-card">
                  <FaGraduationCap className="mp-cv-icon" />
                  <div>
                    <div className="mp-cv-card-title">Portfolio</div>
                    <div className="mp-cv-card-sub">Xem hồ sơ dự án của bạn</div>
                  </div>
                </a>
                <a href="/career" className="mp-cv-card">
                  <FaBriefcase className="mp-cv-icon" />
                  <div>
                    <div className="mp-cv-card-title">Định hướng nghề nghiệp</div>
                    <div className="mp-cv-card-sub">Khám phá lộ trình phù hợp</div>
                  </div>
                </a>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
