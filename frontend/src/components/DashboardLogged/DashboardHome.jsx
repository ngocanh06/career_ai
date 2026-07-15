import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
  FaArrowTrendUp,
  FaChevronRight,
  FaCheck,
  FaCloudArrowUp,
  FaFileLines,
  FaBriefcase,
  FaCode,
  FaCertificate,
  FaLightbulb,
  FaArrowRight,
  FaPlus,
  FaSpinner,
  FaCircleExclamation,
} from "react-icons/fa6";
import './DashboardHome.css';
import '../Admin/AdminDashboard.css';
import { FaUsers, FaRoute, FaSearch, FaEye, FaTimes, FaFileAlt, FaHistory, FaCode as FaCodeR, FaGlobe, FaLock, FaFilePdf } from 'react-icons/fa';

/* ── Admin Stats View ── */
function AdminStats({ adminUser }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('profile');
  const H = { 'Content-Type': 'application/json', 'X-Admin-User-Id': adminUser.user_id };

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/admin/stats', { headers: H }).then(r => r.json()),
      fetch('http://localhost:5000/api/admin/users', { headers: H }).then(r => r.json()),
    ]).then(([s, u]) => {
      if (s.success) setStats(s.data);
      if (u.success) setUsers(u.data);
    }).finally(() => setLoading(false));
  }, [adminUser.user_id]);

  const openDetails = async (user) => {
    setDetailsLoading(true);
    setDetailTab('profile');
    setViewingUser({ basic: user, details: null });
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.user_id}/details`, { headers: H });
      const json = await res.json();
      if (json.success) setViewingUser({ basic: user, details: json.data });
      else setViewingUser(null);
    } catch { setViewingUser(null); }
    setDetailsLoading(false);
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const statItems = [
    { label: 'Tổng người dùng', key: 'total_users', color: '#3b5bdb', icon: <FaUsers /> },
    { label: 'Đang hoạt động', key: 'active_users', color: '#10b981', icon: <FaArrowTrendUp /> },
    { label: 'Lộ trình tạo', key: 'total_roadmaps', color: '#f59e0b', icon: <FaRoute /> },
    { label: 'CV đã tải lên', key: 'total_cvs', color: '#8b5cf6', icon: <FaFileLines /> },
    { label: 'Portfolio công khai', key: 'published_portfolios', color: '#ec4899', icon: <FaBriefcase /> },
  ];

  const TABS = [
    { key: 'profile', label: 'Hồ sơ' },
    { key: 'cv', label: 'CV' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'roadmap', label: 'Lộ trình' },
    { key: 'skills', label: 'Kỹ năng' },
    { key: 'activity', label: 'Activity Log' },
  ];

  return (
    <div className="admin-container" style={{ padding: '30px 40px' }}>
      <h1 className="admin-title">
        <FaArrowTrendUp style={{ marginRight: 10, color: '#3b5bdb' }} />
        Theo dõi dữ liệu người dùng
      </h1>

      <div className="admin-stats-grid">
        {statItems.map(s => (
          <div className="admin-stat-card" key={s.key}>
            <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.label}</h3><p>{loading ? '…' : stats?.[s.key] ?? 0}</p></div>
          </div>
        ))}
      </div>

      <div className="admin-table-container" style={{ marginTop: 28 }}>
        <div className="table-header">
          <h2>Danh sách người dùng</h2>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input placeholder="Tìm kiếm email, tên..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Đang tải...</div>
        ) : (
          <table className="admin-table">
            <thead><tr>
              <th>ID</th><th>Họ Tên</th><th>Email</th>
              <th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Xem</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td><strong>{u.full_name || '—'}</strong></td>
                  <td>{u.email}</td>
                  <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                  <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                  <td>{u.created_at?.split(' ')[0] || '—'}</td>
                  <td>
                    <button className="admin-btn-icon admin-btn-view" onClick={() => openDetails(u)} title="Xem chi tiết"><FaEye /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>Không tìm thấy người dùng nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* View Details Modal */}
      {viewingUser && (
        <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="admin-modal admin-modal-xl" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Hồ sơ: {viewingUser.basic.email}</h3>
              </div>
              <button className="btn-close" onClick={() => setViewingUser(null)}><FaTimes /></button>
            </div>

            <div className="detail-tabs">
              {TABS.map(t => (
                <button key={t.key} className={`detail-tab ${detailTab === t.key ? 'active' : ''}`} onClick={() => setDetailTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="admin-modal-body detail-body">
              {detailsLoading && !viewingUser.details ? (
                <div className="admin-loading">Đang tải dữ liệu...</div>
              ) : viewingUser.details ? (
                <>
                  {detailTab === 'profile' && (
                    <div className="detail-grid-2">
                      <div className="details-section">
                        <h4>Thông tin cơ bản</h4>
                        <IRow label="Họ tên" value={viewingUser.details.full_name} />
                        <IRow label="Email" value={viewingUser.details.email} />
                        <IRow label="Ngày sinh" value={viewingUser.details.dob} />
                        <IRow label="Số điện thoại" value={viewingUser.details.phone} />
                        <IRow label="Bio" value={viewingUser.details.bio} />
                      </div>
                      <div className="details-section">
                        <h4>Bảo mật &amp; Tài khoản</h4>
                        <IRow label="Vai trò" value={<span className={`role-badge ${viewingUser.details.role}`}>{viewingUser.details.role}</span>} />
                        <IRow label="Trạng thái" value={<span className={`status-badge ${viewingUser.details.status}`}>{viewingUser.details.status}</span>} />
                        <IRow label="Ngày tạo" value={viewingUser.details.created_at} />
                        <IRow label="Đăng nhập cuối" value={viewingUser.details.last_login} />
                        <IRow label="Mật khẩu (hash)" value={<code className="password-hash">{viewingUser.details.password_hash}</code>} />
                      </div>
                    </div>
                  )}
                  {detailTab === 'cv' && (
                    <div>
                      <h4 className="detail-section-title"><FaFileAlt /> Danh sách CV đã tải lên</h4>
                      {viewingUser.details.cvs?.length > 0 ? (
                        <table className="admin-table">
                          <thead><tr><th>#</th><th>Loại file</th><th>Điểm ATS</th><th>Trạng thái</th><th>Ngày tải lên</th><th>Xem</th></tr></thead>
                          <tbody>{viewingUser.details.cvs.map((cv, i) => (
                            <tr key={cv.cv_id}>
                              <td>{i+1}</td><td>{cv.file_type}</td>
                              <td>{cv.ats_score != null ? <><strong>{Math.round(cv.ats_score)}</strong>/100</> : '—'}</td>
                              <td><span className={`status-badge ${cv.status === 'analyzed' ? 'active' : 'inactive'}`}>{cv.status}</span></td>
                              <td>{cv.upload_date}</td>
                              <td><a href={cv.file_path} target="_blank" rel="noreferrer" className="detail-link">Mở file</a></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      ) : <p className="no-data">Người dùng chưa tải CV lên.</p>}
                    </div>
                  )}
                  {detailTab === 'portfolio' && (
                    <div>
                      <h4 className="detail-section-title"><FaBriefcase /> Portfolio</h4>
                      {viewingUser.details.portfolios?.length > 0 ? (
                        <table className="admin-table">
                          <thead><tr><th>#</th><th>Tiêu đề</th><th>Slug</th><th>Trạng thái</th><th>Lượt xem</th><th>Ngày tạo</th></tr></thead>
                          <tbody>{viewingUser.details.portfolios.map((p, i) => (
                            <tr key={p.portfolio_id}>
                              <td>{i+1}</td><td>{p.title||'—'}</td><td><code>{p.slug}</code></td>
                              <td><span className={`status-badge ${p.is_published ? 'active':'inactive'}`}>{p.is_published?'Công khai':'Riêng tư'}</span></td>
                              <td>{p.view_count}</td><td>{p.created_at}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      ) : <p className="no-data">Người dùng chưa có portfolio.</p>}
                    </div>
                  )}
                  {detailTab === 'roadmap' && (
                    <div>
                      <h4 className="detail-section-title"><FaRoute /> Lộ trình học tập</h4>
                      {viewingUser.details.roadmaps?.length > 0 ? viewingUser.details.roadmaps.map(r => (
                        <div key={r.roadmap_id} className="roadmap-card">
                          <div className="roadmap-card-header">
                            <span className="roadmap-title">{r.title||'Lộ trình không tên'}</span>
                            <span className={`status-badge ${r.status==='completed'?'active':r.status==='in_progress'?'status-inprogress':'inactive'}`}>{r.status}</span>
                          </div>
                          <div className="roadmap-meta">{r.total_months} tháng · Tạo: {r.created_at}</div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar-track"><div className="progress-bar-fill" style={{width:`${r.completion_rate}%`}} /></div>
                            <span className="progress-pct">{Math.round(r.completion_rate)}%</span>
                          </div>
                        </div>
                      )) : <p className="no-data">Người dùng chưa có lộ trình.</p>}
                    </div>
                  )}
                  {detailTab === 'skills' && (
                    <div>
                      <h4 className="detail-section-title"><FaCodeR /> Kỹ năng</h4>
                      {viewingUser.details.skills?.length > 0 ? (
                        <div className="skills-wrap">
                          {viewingUser.details.skills.map((s,i)=>(
                            <span key={i} className={`mp-skill-badge mp-skill-badge--${s.proficiency_level||'beginner'}`}>
                              {s.skill_name} <small>({s.proficiency_level})</small>
                            </span>
                          ))}
                        </div>
                      ) : <p className="no-data">Người dùng chưa có kỹ năng.</p>}
                    </div>
                  )}
                  {detailTab === 'activity' && (
                    <div>
                      <h4 className="detail-section-title"><FaHistory /> Nhật ký hoạt động</h4>
                      {viewingUser.details.sessions?.length > 0 ? (
                        <table className="admin-table">
                          <thead><tr><th>Thời gian</th><th>Địa chỉ IP</th><th>Vị trí</th><th>Thiết bị</th></tr></thead>
                          <tbody>{viewingUser.details.sessions.map((s,i)=>(
                            <tr key={i}>
                              <td>{s.last_active} {s.is_current?<span className="current-session-badge">Hiện tại</span>:''}</td>
                              <td>{s.ip_address}</td><td>{s.location||'Unknown'}</td>
                              <td style={{fontSize:12,maxWidth:220,wordBreak:'break-word'}}>{s.device_info}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      ) : <p className="no-data">Chưa có lịch sử hoạt động.</p>}
                    </div>
                  )}
                </>
              ) : <div className="admin-loading">Lỗi khi tải dữ liệu.</div>}
            </div>
            <div className="admin-modal-footer">
              <button className="btn-cancel" onClick={() => setViewingUser(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IRow({ label, value }) {
  return (
    <p><strong>{label}:</strong> {value || <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>}</p>
  );
}


/* ── Skeleton loader cho card ── */
function SkeletonCard({ height = 120 }) {
  return (
    <div className="home-card skeleton-card" style={{ minHeight: height }}>
      <div className="skeleton-line" style={{ width: '40%', height: 12, marginBottom: 10 }} />
      <div className="skeleton-line" style={{ width: '70%', height: 20, marginBottom: 8 }} />
      <div className="skeleton-line" style={{ width: '55%', height: 10 }} />
    </div>
  );
}

/* ── Trạng thái chưa có dữ liệu ── */
function EmptyState({ icon, title, desc, btnLabel, onClick }) {
  return (
    <div className="home-empty-state">
      <div className="home-empty-icon">{icon}</div>
      <p className="home-empty-title">{title}</p>
      <p className="home-empty-desc">{desc}</p>
      {btnLabel && (
        <button className="home-btn-primary home-empty-btn" onClick={onClick}>
          <FaPlus style={{ marginRight: 6 }} /> {btnLabel}
        </button>
      )}
    </div>
  );
}

export default function DashboardLogged() {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('career_user')) || {};
  const userId = localUser.user_id;
  const isAdmin = localUser.role === 'admin';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hook phải gọi trước mọi return có điều kiện
  useEffect(() => {
    if (isAdmin) { setLoading(false); return; }  // Admin không cần fetch dashboard user
    if (!userId) { setLoading(false); return; }

    const loadDashboard = () => {
      setLoading(true);
      fetch(`http://localhost:5000/api/dashboard/${userId}`)
        .then(r => r.json())
        .then(json => {
          if (json.success) setData(json.data);
          else setError(json.message || 'Không thể tải dữ liệu');
        })
        .catch(() => setError('Không thể kết nối đến máy chủ'))
        .finally(() => setLoading(false));
    };

    loadDashboard();

    const cvUpdatedAt = parseInt(localStorage.getItem('cv_updated_at') || '0', 10);
    const secondsSinceUpload = (Date.now() - cvUpdatedAt) / 1000;
    let retryTimer = null;
    if (cvUpdatedAt && secondsSinceUpload < 60) {
      localStorage.removeItem('cv_updated_at');
      setIsRefreshing(true);
      const delay = Math.max(5000 - (secondsSinceUpload * 1000), 1500);
      retryTimer = setTimeout(() => {
        setIsRefreshing(false);
        loadDashboard();
      }, delay);
    }

    window.addEventListener('cv-updated', loadDashboard);
    return () => {
      window.removeEventListener('cv-updated', loadDashboard);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [userId, isAdmin]);

  // Sau khi tất cả hooks được gọi, mới return có điều kiện cho admin
  if (isAdmin) {
    return (
      <DashboardLayout>
        <AdminStats adminUser={localUser} />
      </DashboardLayout>
    );
  }

  const fullName = data?.user?.full_name || localUser.full_name || 'Người dùng';
  const completion = data?.profile_completion ?? 0;
  const atsScore = data?.cv?.ats_score ? Math.round(data.cv.ats_score) : null;
  const hasCV = data?.has_cv;
  const hasRoadmap = data?.has_roadmap;
  const roadmap = data?.roadmap;
  const goals = data?.roadmap_goals || [];
  const missingSkills = data?.missing_skills || [];
  // Ưu tiên user_skills (kỹ năng thực từ DB), fallback sang strong_skills từ CV analysis
  const userSkills = data?.user_skills || [];
  const strongSkills = data?.strong_skills || [];

  /* Tạo dữ liệu "next steps" dựa trên trạng thái thực */
  const nextSteps = [];
  if (!hasCV) {
    nextSteps.push({
      icon: <FaFileLines style={{ color: 'var(--primary-color,#3b5bdb)' }} />,
      title: 'Tải lên CV của bạn',
      desc: 'AI sẽ phân tích và cho điểm hồ sơ',
      color: '#eff2ff',
      action: () => navigate('/ai-cv'),
    });
  } else if (missingSkills.length > 0) {
    nextSteps.push({
      icon: <FaLightbulb style={{ color: '#f59e0b' }} />,
      title: `Cải thiện ${missingSkills.length} kỹ năng còn thiếu`,
      desc: missingSkills.slice(0, 2).join(', ') + (missingSkills.length > 2 ? '...' : ''),
      color: '#fffbeb',
      action: () => navigate('/ai-cv'),
    });
  }
  if (!hasRoadmap) {
    nextSteps.push({
      icon: <FaArrowTrendUp style={{ color: '#0ea5e9' }} />,
      title: 'Tạo lộ trình học tập',
      desc: 'Nhận kế hoạch phát triển cá nhân từ AI',
      color: '#e0f2fe',
      action: () => navigate('/learning-path'),
    });
  }
  if (completion < 80) {
    nextSteps.push({
      icon: <FaBriefcase style={{ color: '#8b5cf6' }} />,
      title: 'Hoàn thiện hồ sơ của bạn',
      desc: `Hồ sơ mới đạt ${completion}% — thêm kinh nghiệm và học vấn`,
      color: '#f5f3ff',
      action: () => navigate('/profile'),
    });
  }
  /* Fallback nếu đã hoàn chỉnh */
  if (nextSteps.length === 0) {
    nextSteps.push({
      icon: <FaCertificate style={{ color: '#10b981' }} />,
      title: 'Khám phá cơ hội nghề nghiệp',
      desc: 'Hồ sơ của bạn đang ở trạng thái tốt!',
      color: '#ecfdf5',
      action: () => navigate('/career'),
    });
  }

  /* Roadmap steps hiển thị */
  const roadmapSteps = goals.length > 0
    ? goals.map(g => ({
        label: g.skill_name || `Tháng ${g.target_month}`,
        sub: g.status === 'completed' ? 'Hoàn thành'
           : g.status === 'in_progress' ? 'Đang học'
           : `Tháng ${g.target_month}`,
        done: g.status === 'completed',
        active: g.status === 'in_progress',
      }))
    : [
        { label: 'Foundation', sub: 'Chưa bắt đầu', done: false, active: false },
        { label: 'Specialization', sub: 'Mục tiêu', done: false, active: false },
      ];

  return (
    <DashboardLayout>
      <div className="home-page">

        {/* ── Hero ── */}
        <div className="home-hero">
          <div>
            <h1 className="home-greeting">
              {loading ? 'Đang tải...' : `Xin chào, ${fullName}!`}
            </h1>
            <p className="home-greeting-sub">
              {loading
                ? 'Đang lấy dữ liệu...'
                : hasCV
                  ? `Hồ sơ của bạn đang ở Top ${atsScore >= 80 ? '10%' : '25%'}. Tiếp tục cải thiện để tăng cơ hội được tuyển dụng.`
                  : 'Hãy bắt đầu bằng cách tải CV lên để AI phân tích và đưa ra gợi ý cá nhân hoá cho bạn.'
              }
            </p>
          </div>
          <div className="home-hero-actions">
            {hasCV ? (
              <>
                <button className="home-btn-primary" onClick={() => navigate('/career')}>
                  <FaBriefcase style={{ marginRight: 8 }} /> Xem cơ hội việc làm
                </button>
                <button className="home-btn-secondary" onClick={() => navigate('/ai-cv')}>
                  Tối ưu CV
                </button>
              </>
            ) : (
              <>
                <button className="home-btn-primary" onClick={() => navigate('/ai-cv')}>
                  <FaCloudArrowUp style={{ marginRight: 8 }} /> Tải CV lên ngay
                </button>
                <button className="home-btn-secondary" onClick={() => navigate('/profile')}>
                  Cập nhật hồ sơ
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="home-error-banner">
            <FaCircleExclamation />
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}

        {/* ── Refreshing banner ── */}
        {isRefreshing && (
          <div className="home-refreshing-banner" style={{
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: '#eff6ff', border: '1px solid #bfdbfe', 
            color: '#1d4ed8', padding: '12px 16px', borderRadius: '12px', 
            marginBottom: '20px', fontSize: '14px', fontWeight: '500'
          }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            <span>Đang đồng bộ dữ liệu với CV mới của bạn...</span>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="home-stats-row">

          {/* Profile completion */}
          {loading ? <SkeletonCard /> : (
            <div className="home-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              <div className="home-card-label">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                TRẠNG THÁI HỒ SƠ
              </div>
              <p className="home-profile-title">
                {completion > 0 ? `Hoàn thành ${completion}%` : 'Chưa cập nhật hồ sơ'}
              </p>
              <p className="home-profile-sub">
                {completion >= 80 ? 'Hồ sơ đầy đủ — sẵn sàng ứng tuyển!'
                  : completion > 40 ? 'Cần bổ sung thêm thông tin.'
                  : 'Hãy cập nhật hồ sơ để tăng cơ hội.'}
              </p>
              <div className="home-progress-track">
                <div className="home-progress-fill" style={{ width: `${completion}%` }} />
              </div>
              <div className="home-card-link">
                Cập nhật hồ sơ <FaChevronRight style={{ fontSize: 10 }} />
              </div>
            </div>
          )}

          {/* CV Score */}
          {loading ? <SkeletonCard /> : (
            <div className="home-card home-card-score" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai-cv')}>
              <div className="home-card-label">ĐIỂM CV</div>
              {hasCV ? (
                <>
                  <div className="home-score-circle">
                    <svg viewBox="0 0 100 100" width="90" height="90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e8edff" strokeWidth="9" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="var(--primary-color, #3b5bdb)" strokeWidth="9"
                        strokeDasharray={`${2 * Math.PI * 42 * (atsScore / 100)} ${2 * Math.PI * 42}`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <span className="home-score-number">{atsScore}</span>
                  </div>
                  <p className="home-score-sub">
                    {atsScore >= 80 ? 'Top 10% trong khu vực' : atsScore >= 60 ? 'Mức trung bình' : 'Cần cải thiện'}
                  </p>
                  <div className="home-card-link">
                    Xem phân tích chi tiết <FaChevronRight style={{ fontSize: 10 }} />
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<FaFileLines style={{ fontSize: 28, color: '#94a3b8' }} />}
                  title="Chưa có CV"
                  desc="Tải lên để nhận điểm ATS"
                  btnLabel="Tải CV lên"
                  onClick={() => navigate('/ai-cv')}
                />
              )}
            </div>
          )}

          {/* Career goal / Roadmap */}
          {loading ? <SkeletonCard /> : (
            <div className="home-card home-card-goal" style={{ cursor: 'pointer' }} onClick={() => navigate('/learning-path')}>
              <div className="home-card-goal-header">
                <span className="home-card-label">LỘ TRÌNH HỌC TẬP</span>
              </div>
              {hasRoadmap ? (
                <>
                  <p className="home-goal-title">{roadmap?.title || 'Lộ trình cá nhân'}</p>
                  <div className="home-goal-demand">
                    Tiến độ: <span className="home-goal-badge">{roadmap?.completion_rate ?? 0}%</span>
                  </div>
                  <div className="home-progress-track" style={{ marginTop: 8 }}>
                    <div className="home-progress-fill" style={{
                      width: `${roadmap?.completion_rate ?? 0}%`,
                      background: 'rgba(255,255,255,0.6)'
                    }} />
                  </div>
                  <button className="home-goal-btn" onClick={(e) => { e.stopPropagation(); navigate('/learning-path'); }}>
                    Tiếp tục học tập →
                  </button>
                </>
              ) : (
                <>
                  <p className="home-goal-title">Chưa có lộ trình</p>
                  <div className="home-goal-demand">AI sẽ tạo kế hoạch riêng cho bạn</div>
                  <button className="home-goal-btn" onClick={(e) => { e.stopPropagation(); navigate('/learning-path'); }}>
                    Tạo lộ trình ngay →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Two-column ── */}
        <div className="home-two-col">

          {/* Skills panel */}
          {loading ? (
            <SkeletonCard height={200} />
          ) : (
            <div className="home-card home-market-card">
              <div className="home-market-header">
                <span className="home-section-title">
                  {strongSkills.length > 0 ? 'Kỹ năng nổi bật của bạn' : 'Phân tích kỹ năng'}
                </span>
                <button
                  className="home-market-btn"
                  onClick={() => navigate('/ai-cv')}
                >
                  <FaArrowRight style={{ fontSize: 11 }} /> Xem chi tiết
                </button>
              </div>

              {hasCV && (userSkills.length > 0 || strongSkills.length > 0 || missingSkills.length > 0) ? (
                <>
                  {/* User skills từ DB (userskill table) */}
                  {userSkills.length > 0 && (
                    <div className="home-skills-list">
                      {userSkills.slice(0, 4).map((s, i) => {
                        const lvlMap = { expert: 95, advanced: 80, intermediate: 65, beginner: 40 };
                        const pct = lvlMap[s.proficiency_level] ?? 70;
                        const lvlLabel = {
                          expert: 'Thành thạo', advanced: 'Nâng cao',
                          intermediate: 'Trung bình', beginner: 'Cơ bản'
                        }[s.proficiency_level] || s.proficiency_level;
                        return (
                          <div key={i} className="home-skill-row">
                            <div className="home-skill-meta">
                              <span className="home-skill-name">{s.skill_name}</span>
                              <span className="home-skill-badge">{lvlLabel}</span>
                            </div>
                            <div className="home-skill-track">
                              <div className="home-skill-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="home-skill-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Nếu không có userSkills, hiển thị strongSkills từ CV analysis */}
                  {userSkills.length === 0 && strongSkills.length > 0 && (
                    <div className="home-skills-list">
                      {strongSkills.map((skill, i) => (
                        <div key={i} className="home-skill-row">
                          <div className="home-skill-meta">
                            <span className="home-skill-name">{skill}</span>
                            <span className="home-skill-badge">Ghi nhận từ CV</span>
                          </div>
                          <div className="home-skill-track">
                            <div className="home-skill-fill" style={{ width: `${85 - i * 10}%` }} />
                          </div>
                          <span className="home-skill-pct">{85 - i * 10}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {missingSkills.length > 0 && (
                    <div className="home-insight-box" style={{ marginTop: 12 }}>
                      <FaLightbulb style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <p>Cần bổ sung: <strong>{missingSkills.slice(0, 3).join(', ')}</strong></p>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={<FaCode style={{ fontSize: 28, color: '#94a3b8' }} />}
                  title="Chưa có dữ liệu kỹ năng"
                  desc="Tải CV lên để AI phân tích điểm mạnh của bạn"
                  btnLabel="Phân tích CV ngay"
                  onClick={() => navigate('/ai-cv')}
                />
              )}
            </div>
          )}

          {/* Next Steps */}
          {loading ? (
            <SkeletonCard height={200} />
          ) : (
            <div className="home-card home-nextsteps-card">
              <span className="home-section-title">Các bước tiếp theo</span>
              <div className="home-steps-list">
                {nextSteps.slice(0, 3).map((s, i) => (
                  <div key={i} className="home-step-item" onClick={s.action} style={{ cursor: 'pointer' }}>
                    <div className="home-step-icon" style={{ background: s.color }}>{s.icon}</div>
                    <div className="home-step-text">
                      <p className="home-step-title">{s.title}</p>
                      <p className="home-step-desc">{s.desc}</p>
                    </div>
                    <FaChevronRight style={{ color: '#d1d5db', fontSize: 13, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Roadmap ── */}
        {!loading && (
          <div className="home-card home-roadmap-card">
            <div className="home-roadmap-header">
              <span className="home-section-title">
                {hasRoadmap ? `Lộ trình: ${roadmap?.title}` : 'Lộ trình nghề nghiệp'}
              </span>
              <button className="home-roadmap-link" onClick={() => navigate('/learning-path')}>
                {hasRoadmap ? 'Xem chi tiết' : 'Tạo lộ trình'}
                <FaChevronRight style={{ fontSize: 11, marginLeft: 4 }} />
              </button>
            </div>
            {hasRoadmap
              ? <p className="home-roadmap-sub">Tiến độ tổng: {roadmap?.completion_rate ?? 0}% — {roadmap?.total_months} tháng</p>
              : <p className="home-roadmap-sub">AI sẽ vạch ra lộ trình học tập tối ưu dựa trên kỹ năng và mục tiêu của bạn.</p>
            }

            {hasRoadmap ? (
              <div className="home-roadmap-track">
                <div className="home-roadmap-line" />
                {roadmapSteps.map((step, i) => (
                  <div key={i} className="home-roadmap-step">
                    <div className={`home-roadmap-dot ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                      {step.done ? (
                        <FaCheck style={{ color: 'white', fontSize: 10 }} />
                      ) : step.active ? (
                        <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }} />
                      ) : null}
                    </div>
                    <div className="home-roadmap-label">
                      <span className={`home-roadmap-name ${step.active ? 'active-label' : ''}`}>{step.label}</span>
                      <span className="home-roadmap-sub-label">{step.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Không có roadmap → hướng dẫn nhìn lên nút "Tạo lộ trình" ở header card (tránh lặp CTA) */
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: 14 }}>
                Nhấn <strong style={{ color: 'var(--primary-color, #3b5bdb)' }}>"Tạo lộ trình"</strong> ở góc trên để bắt đầu.
              </div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
