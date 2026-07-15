import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './AdminDashboard.css';
import {
  FaUsers, FaChartLine, FaRoute, FaUserShield,
  FaEdit, FaTrash, FaTimes, FaSave, FaSearch,
  FaEye, FaFileAlt, FaBriefcase, FaCode, FaHistory,
  FaFilePdf, FaGlobe, FaLock
} from 'react-icons/fa';

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const adminUser = JSON.parse(localStorage.getItem('career_user') || '{}');
  const headers = { 'Content-Type': 'application/json', 'X-Admin-User-Id': adminUser?.user_id };

  const [stats, setStats] = useState({ total_users: 0, active_users: 0, total_roadmaps: 0, total_cvs: 0, published_portfolios: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('profile');

  // ── Fetch ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sR, uR] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
      ]);
      const sJ = await sR.json();
      const uJ = await uR.json();
      if (sJ.success) setStats(sJ.data);
      if (uJ.success) setUsers(uJ.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Edit Modal ───────────────────────────────────────────────────────
  const openEdit = (user) => setEditingUser({
    ...user,
    password: user.password_hash || '',
    dob: user.dob || '',
    phone: user.phone || '',
    bio: user.bio || '',
  });

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`${API}/admin/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          role: editingUser.role,
          status: editingUser.status,
          full_name: editingUser.full_name,
          password: editingUser.password,
          dob: editingUser.dob,
          phone: editingUser.phone,
          bio: editingUser.bio,
        }),
      });
      const json = await res.json();
      if (json.success) { setEditingUser(null); fetchData(); }
      else alert(json.message || 'Cap nhat that bai');
    } catch { alert('Loi ket noi may chu'); }
  };

  // ── View Details Modal ───────────────────────────────────────────────
  const openDetails = async (user) => {
    setDetailsLoading(true);
    setDetailTab('profile');
    setViewingUser({ basic: user, details: null });
    try {
      const res = await fetch(`${API}/admin/users/${user.user_id}/details`, { headers });
      const json = await res.json();
      if (json.success) setViewingUser({ basic: user, details: json.data });
      else { alert(json.message); setViewingUser(null); }
    } catch { alert('Loi ket noi may chu'); setViewingUser(null); }
    setDetailsLoading(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const deleteUser = async (uid, email) => {
    if (!window.confirm(`Xoa vinh vien tai khoan ${email}?`)) return;
    try {
      const res = await fetch(`${API}/admin/users/${uid}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (json.success) fetchData();
      else alert(json.message);
    } catch { alert('Loi ket noi may chu'); }
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="admin-container">
        <h1 className="admin-title">
          <FaUserShield style={{ marginRight: 10, color: '#3b5bdb' }} />
          Quản lý dữ liệu người dùng
        </h1>

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            { label: 'Tổng người dùng', key: 'total_users', color: '#3b5bdb', icon: <FaUsers /> },
            { label: 'Đang hoạt động', key: 'active_users', color: '#10b981', icon: <FaChartLine /> },
            { label: 'Lộ trình tạo', key: 'total_roadmaps', color: '#f59e0b', icon: <FaRoute /> },
            { label: 'CV đã tải lên', key: 'total_cvs', color: '#8b5cf6', icon: <FaFileAlt /> },
            { label: 'Portfolio công khai', key: 'published_portfolios', color: '#ec4899', icon: <FaBriefcase /> },
          ].map(s => (
            <div className="admin-stat-card" key={s.key}>
              <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div className="stat-info"><h3>{s.label}</h3><p>{loading ? '…' : stats[s.key] ?? 0}</p></div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="admin-table-container" style={{ marginTop: 24 }}>
          <div className="table-header">
            <h2>Danh sách người dùng</h2>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm email, tên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? <div className="admin-loading">Đang tải dữ liệu...</div> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ Tên</th>
                  <th>Email</th>
                  <th>Mật khẩu</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.full_name || '—'}</td>
                    <td>{user.email}</td>
                    <td><code style={{ fontSize: 11, color: '#ef4444', background: '#fff5f5', padding: '2px 6px', borderRadius: 4 }}>{user.password_hash || '—'}</code></td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                    <td>{user.created_at?.split(' ')[0] || '—'}</td>
                    <td>
                      <button className="admin-btn-icon admin-btn-view" onClick={() => openDetails(user)} title="Xem chi tiết"><FaEye /></button>
                      <button className="admin-btn-icon admin-btn-edit" onClick={() => openEdit(user)} title="Chỉnh sửa"><FaEdit /></button>
                      <button
                        className="admin-btn-icon admin-btn-delete"
                        onClick={() => deleteUser(user.user_id, user.email)}
                        disabled={user.user_id === adminUser.user_id}
                        title="Xóa người dùng"
                      ><FaTrash /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" className="admin-text-center" style={{ padding: 20 }}>Không tìm thấy người dùng nào.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>


        {/* ── Edit Modal ─────────────────────────────────────────────── */}
        {editingUser && (
          <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Chỉnh sửa người dùng</h3>
                <button className="btn-close" onClick={() => setEditingUser(null)}><FaTimes /></button>
              </div>
              <div className="admin-modal-body">
                <Field label="Email (không thể đổi)">
                  <input type="text" value={editingUser.email} disabled className="admin-disabled-input" />
                </Field>
                <Field label="Họ và Tên">
                  <input type="text" value={editingUser.full_name || ''} onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })} />
                </Field>
                <Field label="Ngày sinh">
                  <input type="date" value={editingUser.dob || ''} onChange={e => setEditingUser({ ...editingUser, dob: e.target.value })} />
                </Field>
                <Field label="Số điện thoại">
                  <input type="text" value={editingUser.phone || ''} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} />
                </Field>
                <Field label="Bio">
                  <textarea rows={2} value={editingUser.bio || ''} onChange={e => setEditingUser({ ...editingUser, bio: e.target.value })} />
                </Field>
                <Field label="Mật khẩu (sửa để đổi)">
                  <input type="text" value={editingUser.password || ''} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} />
                </Field>
              </div>
              <div className="admin-modal-footer">
                <button className="btn-cancel" onClick={() => setEditingUser(null)}>Hủy</button>
                <button className="btn-save" onClick={saveEdit}><FaSave style={{ marginRight: 6 }} /> Lưu thay đổi</button>
              </div>
            </div>
          </div>
        )}

        {/* ── View Details Modal ─────────────────────────────────────── */}
        {viewingUser && (
          <div className="admin-modal-overlay" onClick={() => setViewingUser(null)}>
            <div className="admin-modal admin-modal-xl" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Hồ sơ: {viewingUser.basic.email}</h3>
                <button className="btn-close" onClick={() => setViewingUser(null)}><FaTimes /></button>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                {[
                  { key: 'profile',   label: 'Hồ sơ',       icon: <FaUsers /> },
                  { key: 'cv',        label: 'CV',           icon: <FaFileAlt /> },
                  { key: 'portfolio', label: 'Portfolio',    icon: <FaBriefcase /> },
                  { key: 'roadmap',   label: 'Lộ trình',     icon: <FaRoute /> },
                  { key: 'skills',    label: 'Kỹ năng',      icon: <FaCode /> },
                  { key: 'activity',  label: 'Activity Log', icon: <FaHistory /> },
                ].map(t => (
                  <button
                    key={t.key}
                    className={`detail-tab ${detailTab === t.key ? 'active' : ''}`}
                    onClick={() => setDetailTab(t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="admin-modal-body detail-body">
                {detailsLoading && !viewingUser.details ? (
                  <div className="admin-loading">Dang tai du lieu...</div>
                ) : viewingUser.details ? (
                  <>
                    {/* PROFILE TAB */}
                    {detailTab === 'profile' && (
                      <div className="detail-grid-2">
                        <InfoSection title="Thông tin cơ bản">
                          <InfoRow label="Họ tên" value={viewingUser.details.full_name} />
                          <InfoRow label="Email" value={viewingUser.details.email} />
                          <InfoRow label="Ngày sinh" value={viewingUser.details.dob} />
                          <InfoRow label="Số điện thoại" value={viewingUser.details.phone} />
                          <InfoRow label="Bio" value={viewingUser.details.bio} />
                        </InfoSection>
                        <InfoSection title="Bảo mật & Tài khoản">
                          <InfoRow label="Vai trò" value={<span className={`role-badge ${viewingUser.details.role}`}>{viewingUser.details.role}</span>} />
                          <InfoRow label="Trạng thái" value={<span className={`status-badge ${viewingUser.details.status}`}>{viewingUser.details.status}</span>} />
                          <InfoRow label="Ngày tạo" value={viewingUser.details.created_at} />
                          <InfoRow label="Đăng nhập cuối" value={viewingUser.details.last_login} />
                          <InfoRow label="Mật khẩu (hash)" value={<code className="password-hash">{viewingUser.details.password_hash}</code>} />
                        </InfoSection>
                      </div>
                    )}

                    {/* CV TAB */}
                    {detailTab === 'cv' && (
                      <div>
                        <h4 className="detail-section-title"><FaFileAlt /> Danh sách CV đã tải lên</h4>
                        {viewingUser.details.cvs?.length > 0 ? (
                          <table className="admin-table">
                            <thead><tr><th>#</th><th>Loại file</th><th>Điểm ATS</th><th>Trạng thái</th><th>Ngày tải lên</th><th>Xem</th></tr></thead>
                            <tbody>
                              {viewingUser.details.cvs.map((cv, i) => (
                                <tr key={cv.cv_id}>
                                  <td>{i + 1}</td>
                                  <td><FaFilePdf style={{ color: '#ef4444', marginRight: 5 }} />{cv.file_type}</td>
                                  <td>{cv.ats_score != null ? <><strong>{Math.round(cv.ats_score)}</strong>/100</> : '—'}</td>
                                  <td><span className={`status-badge ${cv.status === 'analyzed' ? 'active' : 'inactive'}`}>{cv.status}</span></td>
                                  <td>{cv.upload_date}</td>
                                  <td><a href={cv.file_path} target="_blank" rel="noreferrer" className="detail-link">Mo file</a></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : <p className="no-data">Nguoi dung chua tai CV len.</p>}
                      </div>
                    )}

                    {/* PORTFOLIO TAB */}
                    {detailTab === 'portfolio' && (
                      <div>
                        <h4 className="detail-section-title"><FaBriefcase /> Portfolio</h4>
                        {viewingUser.details.portfolios?.length > 0 ? (
                          <table className="admin-table">
                            <thead><tr><th>#</th><th>Tiêu đề</th><th>Slug</th><th>Trạng thái</th><th>Lượt xem</th><th>Ngày tạo</th></tr></thead>
                            <tbody>
                              {viewingUser.details.portfolios.map((p, i) => (
                                <tr key={p.portfolio_id}>
                                  <td>{i + 1}</td>
                                  <td>{p.title || '—'}</td>
                                  <td><code>{p.slug}</code></td>
                                  <td>{p.is_published
                                    ? <span className="status-badge active"><FaGlobe style={{ marginRight: 4 }} />Công khai</span>
                                    : <span className="status-badge inactive"><FaLock style={{ marginRight: 4 }} />Riêng tư</span>}
                                  </td>
                                  <td>{p.view_count}</td>
                                  <td>{p.created_at}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : <p className="no-data">Nguoi dung chua co portfolio.</p>}
                      </div>
                    )}

                    {/* ROADMAP TAB */}
                    {detailTab === 'roadmap' && (
                      <div>
                        <h4 className="detail-section-title"><FaRoute /> Lộ trình học tập</h4>
                        {viewingUser.details.roadmaps?.length > 0 ? (
                          viewingUser.details.roadmaps.map(r => (
                            <div key={r.roadmap_id} className="roadmap-card">
                              <div className="roadmap-card-header">
                                <span className="roadmap-title">{r.title || 'Lo trinh khong ten'}</span>
                                <span className={`status-badge ${r.status === 'completed' ? 'active' : r.status === 'in_progress' ? 'status-inprogress' : 'inactive'}`}>{r.status}</span>
                              </div>
                              <div className="roadmap-meta">{r.total_months} tháng · Tạo: {r.created_at}</div>
                              <div className="progress-bar-wrap">
                                <div className="progress-bar-track">
                                  <div className="progress-bar-fill" style={{ width: `${r.completion_rate}%` }} />
                                </div>
                                <span className="progress-pct">{Math.round(r.completion_rate)}%</span>
                              </div>
                            </div>
                          ))
                        ) : <p className="no-data">Nguoi dung chua co lo trinh.</p>}
                      </div>
                    )}

                    {/* SKILLS TAB */}
                    {detailTab === 'skills' && (
                      <div>
                        <h4 className="detail-section-title"><FaCode /> Kỹ năng</h4>
                        {viewingUser.details.skills?.length > 0 ? (
                          <div className="skills-wrap">
                            {viewingUser.details.skills.map((s, i) => (
                              <span key={i} className={`mp-skill-badge mp-skill-badge--${s.proficiency_level || 'beginner'}`}>
                                {s.skill_name} <small>({s.proficiency_level})</small>
                              </span>
                            ))}
                          </div>
                        ) : <p className="no-data">Nguoi dung chua co ky nang.</p>}
                      </div>
                    )}

                    {/* ACTIVITY TAB */}
                    {detailTab === 'activity' && (
                      <div>
                        <h4 className="detail-section-title"><FaHistory /> Nhật ký hoạt động</h4>
                        {viewingUser.details.sessions?.length > 0 ? (
                          <table className="admin-table">
                            <thead><tr><th>Thời gian</th><th>Địa chỉ IP</th><th>Vị trí</th><th>Thiết bị</th></tr></thead>
                            <tbody>
                              {viewingUser.details.sessions.map((s, i) => (
                                <tr key={i}>
                                  <td>{s.last_active} {s.is_current ? <span className="current-session-badge">Hiện tại</span> : ''}</td>
                                  <td>{s.ip_address}</td>
                                  <td>{s.location || 'Unknown'}</td>
                                  <td style={{ fontSize: 12, maxWidth: 220, wordBreak: 'break-word' }}>{s.device_info}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : <p className="no-data">Chua co lich su hoat dong.</p>}
                      </div>
                    )}
                  </>
                ) : <div className="admin-loading">Loi khi tai du lieu.</div>}
              </div>
              <div className="admin-modal-footer">
                <button className="btn-cancel" onClick={() => setViewingUser(null)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <div className="stat-info"><h3>{label}</h3><p>{value}</p></div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="admin-form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div className="details-section">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p><strong>{label}:</strong> {value || <span style={{ color: '#9ca3af' }}>Chưa cập nhật</span>}</p>
  );
}
