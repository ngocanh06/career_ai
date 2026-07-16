import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../DashboardLogged/DashboardLayout";
import "./AdminDashboard.css";
import {
  FaEdit, FaTrash, FaTimes, FaSave, FaSearch,
  FaEye, FaEyeSlash, FaFileAlt, FaBriefcase, FaCode, FaHistory,
  FaFilePdf, FaGlobe, FaLock, FaUserShield, FaUsers, FaRoute,
  FaPhone, FaEnvelope, FaBirthdayCake, FaShieldAlt, FaCalendarAlt, FaClock, FaFilter, FaUndo,
} from "react-icons/fa";

const API = "http://localhost:5000/api";

/* ── Utilities ─────────────────────────────────────────────────────────────── */
function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase() || "?";
}
function avatarColor(name = "") {
  const p = ["#3b5bdb","#10b981","#f59e0b","#8b5cf6","#ec4899","#0ea5e9","#14b8a6","#f97316"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function AdminUsers() {
  const adminUser = JSON.parse(localStorage.getItem("career_user") || "{}");
  const headers   = { "Content-Type": "application/json", "X-Admin-User-Id": adminUser?.user_id };

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  /* Edit modal */
  const [editingUser,  setEditingUser]  = useState(null);
  const [editErrors,   setEditErrors]   = useState({});

  /* View Details modal */
  const [viewingUser,   setViewingUser]   = useState(null);
  const [detailsLoading, setDL]          = useState(false);
  const [showPw,         setShowPw]       = useState(false);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/users`, { headers });
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = users.filter((u) => {
    const matchSearch = (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
                        (u.full_name || "").toLowerCase().includes(search.toLowerCase());
    let matchType = true;
    if (filterType === "active") matchType = u.status === "active";
    else if (filterType === "has_roadmap") matchType = u.has_roadmap === 1;
    else if (filterType === "has_cv") matchType = u.has_cv === 1;
    else if (filterType === "has_published_portfolio") matchType = u.has_published_portfolio === 1;

    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchStatus = filterStatus === "all" || u.status === filterStatus;

    return matchSearch && matchType && matchRole && matchStatus;
  });

  /* ── Edit handlers ─────────────────────────────────────────────────────── */
  const openEdit = (user) => {
    setEditErrors({});
    setEditingUser({ ...user, password: user.password_hash || "", dob: user.dob || "", phone: user.phone || "", bio: user.bio || "" });
  };

  const validateEdit = () => {
    const errors = {};
    if (!editingUser.full_name?.trim()) errors.full_name = "Họ và tên không được để trống.";
    if (editingUser.phone?.trim() && !/^[0-9]{10,11}$/.test(editingUser.phone.trim()))
      errors.phone = "Số điện thoại phải có 10-11 chữ số.";
    if (editingUser.dob) {
      const dob = new Date(editingUser.dob); const today = new Date();
      if (dob >= today) errors.dob = "Ngày sinh không được là ngày hiện tại hoặc tương lai.";
      else if (today.getFullYear() - dob.getFullYear() < 10) errors.dob = "Người dùng phải ít nhất 10 tuổi.";
    }
    const isSSO = editingUser.password === "google_sso";
    if (!isSSO && editingUser.password?.trim().length > 0
      && editingUser.password !== editingUser.password_hash
      && editingUser.password.trim().length < 6)
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveEdit = async () => {
    if (!editingUser || !validateEdit()) return;
    try {
      const res  = await fetch(`${API}/admin/users/${editingUser.user_id}`, {
        method: "PUT", headers,
        body: JSON.stringify({ role: editingUser.role, status: editingUser.status, full_name: editingUser.full_name.trim(),
          password: editingUser.password, dob: editingUser.dob, phone: editingUser.phone?.trim() || "", bio: editingUser.bio }),
      });
      const json = await res.json();
      if (json.success) { setEditingUser(null); setEditErrors({}); fetchData(); }
      else alert(json.message || "Cập nhật thất bại");
    } catch { alert("Lỗi kết nối máy chủ"); }
  };

  /* ── View Details handler ───────────────────────────────────────────────── */
  const openDetails = async (user) => {
    setDL(true); setShowPw(false);
    setViewingUser({ basic: user, details: null });
    try {
      const res  = await fetch(`${API}/admin/users/${user.user_id}/details`, { headers });
      const json = await res.json();
      if (json.success) setViewingUser({ basic: user, details: json.data });
      else { alert(json.message); setViewingUser(null); }
    } catch { alert("Lỗi kết nối máy chủ"); setViewingUser(null); }
    setDL(false);
  };

  /* ── Delete ─────────────────────────────────────────────────────────────── */
  const deleteUser = async (uid, email) => {
    if (!window.confirm(`Xóa vĩnh viễn tài khoản ${email}?`)) return;
    try {
      const res  = await fetch(`${API}/admin/users/${uid}`, { method: "DELETE", headers });
      const json = await res.json();
      if (json.success) fetchData(); else alert(json.message);
    } catch { alert("Lỗi kết nối máy chủ"); }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="admin-container">
        <h1 className="admin-title">
          <FaUserShield style={{ marginRight: 10, color: "#3b5bdb" }} />
          Quản lý dữ liệu người dùng
        </h1>

        {/* Users Table */}
        <div className="admin-table-container">
          <div className="table-header">
            <h2>Danh sách người dùng</h2>
          </div>

          {/* Filter Bar */}
          <div className="admin-filters-bar">
            <span className="filters-label">
              <FaFilter /> Lọc theo:
            </span>
            <div className="filters-selects">
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="admin-filter-select">
                <option value="all">Tất cả điều kiện</option>
                <option value="active">Đang hoạt động</option>
                <option value="has_roadmap">Có lộ trình</option>
                <option value="has_cv">Đã tải CV</option>
                <option value="has_published_portfolio">Có portfolio công khai</option>
              </select>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="admin-filter-select">
                <option value="all">Tất cả vai trò</option>
                <option value="user">Thành viên (User)</option>
                <option value="admin">Quản trị (Admin)</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-filter-select">
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động (Active)</option>
                <option value="inactive">Ngừng (Inactive)</option>
              </select>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Tìm kiếm email, tên..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            {(filterType !== "all" || filterRole !== "all" || filterStatus !== "all" || search) && (
              <button
                className="btn-reset-filter"
                onClick={() => { setFilterType("all"); setFilterRole("all"); setFilterStatus("all"); setSearch(""); }}
                title="Xóa tất cả bộ lọc"
              >
                <FaUndo style={{ fontSize: 11 }} />
                Đặt lại
              </button>
            )}
          </div>
          {loading ? <div className="admin-loading">Đang tải dữ liệu...</div> : (
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Họ Tên</th><th>Email</th><th>Mật khẩu</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.user_id}>
                    <td>{user.user_id}</td>
                    <td>{user.full_name || "—"}</td>
                    <td>{user.email}</td>
                    <td><code style={{ fontSize: 11, color: "#ef4444", background: "#fff5f5", padding: "2px 6px", borderRadius: 4 }}>{user.password_hash || "—"}</code></td>
                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                    <td><span className={`status-badge ${user.status}`}>{user.status}</span></td>
                    <td>{user.created_at?.split(" ")[0] || "—"}</td>
                    <td>
                      <button className="admin-btn-icon admin-btn-view" onClick={() => openDetails(user)} title="Xem hồ sơ"><FaEye /></button>
                      <button className="admin-btn-icon admin-btn-edit" onClick={() => openEdit(user)}    title="Chỉnh sửa"><FaEdit /></button>
                      <button className="admin-btn-icon admin-btn-delete"
                        onClick={() => deleteUser(user.user_id, user.email)}
                        disabled={user.user_id === adminUser.user_id} title="Xóa người dùng"><FaTrash /></button>
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

        {/* ═══════════ EDIT MODAL ═══════════ */}
        {editingUser && (
          <div className="admin-modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Chỉnh sửa người dùng</h3>
                <button className="btn-close" onClick={() => setEditingUser(null)}><FaTimes /></button>
              </div>
              <div className="admin-modal-body">
                <Field label="Email (không thể thay đổi)">
                  <input type="text" value={editingUser.email} readOnly className="admin-disabled-input" style={{ background: "#f5f5f5", cursor: "not-allowed" }} />
                </Field>
                <Field label="Họ và Tên">
                  <input type="text" value={editingUser.full_name || ""}
                    onChange={(e) => { setEditingUser({ ...editingUser, full_name: e.target.value }); setEditErrors((p) => ({ ...p, full_name: "" })); }}
                    style={editErrors.full_name ? { borderColor: "#ef4444" } : {}} />
                  {editErrors.full_name && <span className="form-error">{editErrors.full_name}</span>}
                </Field>
                <Field label="Ngày sinh">
                  <input type="date" value={editingUser.dob || ""}
                    onChange={(e) => { setEditingUser({ ...editingUser, dob: e.target.value }); setEditErrors((p) => ({ ...p, dob: "" })); }}
                    style={editErrors.dob ? { borderColor: "#ef4444" } : {}} />
                  {editErrors.dob && <span className="form-error">{editErrors.dob}</span>}
                </Field>
                <Field label="Số điện thoại">
                  <input type="text" value={editingUser.phone || ""} placeholder="VD: 0912345678"
                    className="input-placeholder-light"
                    onChange={(e) => { setEditingUser({ ...editingUser, phone: e.target.value }); setEditErrors((p) => ({ ...p, phone: "" })); }}
                    style={editErrors.phone ? { borderColor: "#ef4444" } : {}} />
                  {editErrors.phone && <span className="form-error">{editErrors.phone}</span>}
                </Field>
                <Field label="Bio">
                  <textarea rows={2} value={editingUser.bio || ""} onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })} />
                </Field>
                <div style={{ display: "flex", gap: 12 }}>
                  <Field label="Vai trò" style={{ flex: 1 }}>
                    <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                      <option value="user">user</option><option value="admin">admin</option>
                    </select>
                  </Field>
                  <Field label="Trạng thái" style={{ flex: 1 }}>
                    <select value={editingUser.status} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}>
                      <option value="active">active</option><option value="inactive">inactive</option>
                    </select>
                  </Field>
                </div>
                <Field label="Mật khẩu">
                  {editingUser.password === "google_sso" ? (
                    <div className="sso-notice"><FaGlobe style={{ color: "#10b981", marginRight: 7 }} />Đăng nhập bằng Google — Không thể đổi mật khẩu</div>
                  ) : (
                    <>
                      <input type="text" value={editingUser.password || ""} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        className="input-placeholder-light"
                        onChange={(e) => { setEditingUser({ ...editingUser, password: e.target.value }); setEditErrors((p) => ({ ...p, password: "" })); }}
                        style={editErrors.password ? { borderColor: "#ef4444" } : {}} />
                      {editErrors.password && <span className="form-error">{editErrors.password}</span>}
                    </>
                  )}
                </Field>
              </div>
              <div className="admin-modal-footer">
                <button className="btn-cancel" onClick={() => setEditingUser(null)}>Hủy</button>
                <button className="btn-save" onClick={saveEdit}><FaSave style={{ marginRight: 6 }} /> Lưu thay đổi</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ VIEW DETAILS MODAL — NO TABS, FULL EXPAND ═══════════ */}
        {viewingUser && (() => {
          const d     = viewingUser.details || viewingUser.basic;
          const name  = d.full_name || "—";
          const col   = avatarColor(name);
          const isSSO = d.password_hash === "google_sso";
          return (
            <div className="prof-overlay" onClick={() => setViewingUser(null)}>
              <div className="prof-modal" onClick={(e) => e.stopPropagation()}>

                {/* Hero */}
                <div className="prof-hero" style={{ background: `linear-gradient(135deg, ${col}22 0%, #f8fafc 100%)` }}>
                  <button className="prof-close" onClick={() => setViewingUser(null)}><FaTimes /></button>
                  <div className="prof-hero-avatar" style={{ background: col }}>{getInitials(name)}</div>
                  <div className="prof-hero-info">
                    <h2 className="prof-hero-name">{name}</h2>
                    <p className="prof-hero-email"><FaEnvelope style={{ marginRight: 5 }} />{d.email}</p>
                    <div className="prof-hero-badges">
                      <span className={`role-badge ${d.role}`}>{d.role === "admin" ? "🛡 Admin" : "👤 User"}</span>
                      <span className={`status-badge ${d.status}`}>{d.status === "active" ? "● Hoạt động" : "● Ngừng"}</span>
                      {isSSO && <span className="google-sso-tag"><FaGlobe style={{ marginRight: 4 }} />Google SSO</span>}
                    </div>
                  </div>
                </div>

                {/* Body */}
                {detailsLoading && !viewingUser.details ? (
                  <div className="prof-body"><div className="admin-loading">Đang tải dữ liệu...</div></div>
                ) : viewingUser.details ? (
                  <div className="prof-body">

                    {/* Section 1: Thông tin cơ bản */}
                    <ProfSection icon={<FaUsers />} title="Thông tin cơ bản">
                      <div className="prof-info-grid">
                        <ProfField icon={<FaBirthdayCake />} label="Ngày sinh"      value={viewingUser.details.dob} />
                        <ProfField icon={<FaPhone />}         label="Số điện thoại"  value={viewingUser.details.phone} />
                        <ProfField icon={<FaCalendarAlt />}  label="Ngày tạo"        value={viewingUser.details.created_at} />
                        <ProfField icon={<FaClock />}         label="Đăng nhập cuối" value={viewingUser.details.last_login} />
                      </div>
                      {viewingUser.details.bio && (
                        <div className="prof-bio"><span className="prof-bio-label">Bio</span>{viewingUser.details.bio}</div>
                      )}
                    </ProfSection>

                    {/* Section 2: Bảo mật */}
                    <ProfSection icon={<FaShieldAlt />} title="Bảo mật & Tài khoản">
                      <div className="prof-security-row">
                        <span className="prof-sec-label">Mật khẩu</span>
                        {isSSO ? (
                          <span className="google-sso-tag"><FaGlobe style={{ marginRight: 5 }} />Liên kết tài khoản Google</span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <code className="password-hash" style={{ letterSpacing: 2 }}>
                              {showPw ? viewingUser.details.password_hash : "••••••••••••"}
                            </code>
                            <button className="btn-toggle-pw" onClick={() => setShowPw((v) => !v)} title={showPw ? "Ẩn" : "Hiện"}>
                              {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </span>
                        )}
                      </div>
                    </ProfSection>

                    {/* Section 3: CV */}
                    <ProfSection icon={<FaFileAlt />} title={`CV đã tải lên${viewingUser.details.cvs?.length > 0 ? ` (${viewingUser.details.cvs.length})` : ""}`}>
                      {viewingUser.details.cvs?.length > 0 ? (
                        <div className="prof-card-list">
                          {viewingUser.details.cvs.map((cv, i) => (
                            <div className="prof-item-card" key={cv.cv_id}>
                              <div className="prof-item-icon" style={{ background: "#fee2e2", color: "#ef4444" }}><FaFilePdf /></div>
                              <div className="prof-item-body">
                                <div className="prof-item-title">{cv.file_type || `CV #${i + 1}`}</div>
                                <div className="prof-item-meta">
                                  {cv.ats_score != null && <span className="prof-ats-badge">{Math.round(cv.ats_score)}/100 ATS</span>}
                                  <span className={`status-badge ${cv.status === "analyzed" ? "active" : "inactive"}`} style={{ fontSize: 11 }}>{cv.status}</span>
                                  <span style={{ color: "#9ca3af", fontSize: 12 }}>{cv.upload_date}</span>
                                </div>
                              </div>
                              <a href={cv.file_path} target="_blank" rel="noreferrer" className="prof-link-btn">Mở</a>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyState text="Chưa tải CV nào lên" />}
                    </ProfSection>

                    {/* Section 4: Portfolio */}
                    <ProfSection icon={<FaBriefcase />} title={`Portfolio${viewingUser.details.portfolios?.length > 0 ? ` (${viewingUser.details.portfolios.length})` : ""}`}>
                      {viewingUser.details.portfolios?.length > 0 ? (
                        <div className="prof-card-list">
                          {viewingUser.details.portfolios.map((p) => (
                            <div className="prof-item-card" key={p.portfolio_id}>
                              <div className="prof-item-icon" style={{ background: p.is_published ? "#d1fae5" : "#f3f4f6", color: p.is_published ? "#10b981" : "#6b7280" }}>
                                {p.is_published ? <FaGlobe /> : <FaLock />}
                              </div>
                              <div className="prof-item-body">
                                <div className="prof-item-title">{p.title || "Portfolio không tên"}</div>
                                <div className="prof-item-meta">
                                  <code style={{ fontSize: 11, color: "#6b7280" }}>{p.slug}</code>
                                  <span style={{ color: "#9ca3af", fontSize: 12 }}>👁 {p.view_count} lượt xem</span>
                                  <span style={{ color: "#9ca3af", fontSize: 12 }}>{p.created_at}</span>
                                </div>
                              </div>
                              <span className={`status-badge ${p.is_published ? "active" : "inactive"}`} style={{ fontSize: 11, flexShrink: 0 }}>
                                {p.is_published ? "Công khai" : "Riêng tư"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyState text="Chưa có portfolio" />}
                    </ProfSection>

                    {/* Section 5: Roadmap */}
                    <ProfSection icon={<FaRoute />} title={`Lộ trình học tập${viewingUser.details.roadmaps?.length > 0 ? ` (${viewingUser.details.roadmaps.length})` : ""}`}>
                      {viewingUser.details.roadmaps?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {viewingUser.details.roadmaps.map((r) => (
                            <div className="prof-roadmap-card" key={r.roadmap_id}>
                              <div className="prof-roadmap-top">
                                <span className="prof-item-title">{r.title || "Lộ trình không tên"}</span>
                                <span className={`status-badge ${r.status === "completed" ? "active" : r.status === "in_progress" ? "status-inprogress" : "inactive"}`} style={{ fontSize: 11 }}>{r.status}</span>
                              </div>
                              <div className="roadmap-meta" style={{ marginBottom: 8 }}>{r.total_months} tháng · Tạo: {r.created_at}</div>
                              <div className="progress-bar-wrap">
                                <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${r.completion_rate}%` }} /></div>
                                <span className="progress-pct">{Math.round(r.completion_rate)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyState text="Chưa có lộ trình" />}
                    </ProfSection>

                    {/* Section 6: Skills */}
                    <ProfSection icon={<FaCode />} title={`Kỹ năng${viewingUser.details.skills?.length > 0 ? ` (${viewingUser.details.skills.length})` : ""}`}>
                      {viewingUser.details.skills?.length > 0 ? (
                        <div className="skills-wrap">
                          {viewingUser.details.skills.map((s, i) => (
                            <span key={i} className={`mp-skill-badge mp-skill-badge--${s.proficiency_level || "beginner"}`}>
                              {s.skill_name} <small>({s.proficiency_level})</small>
                            </span>
                          ))}
                        </div>
                      ) : <EmptyState text="Chưa có kỹ năng" />}
                    </ProfSection>

                    {/* Section 7: Activity */}
                    <ProfSection icon={<FaHistory />} title={`Nhật ký hoạt động${viewingUser.details.sessions?.length > 0 ? ` (${viewingUser.details.sessions.length})` : ""}`}>
                      {viewingUser.details.sessions?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {viewingUser.details.sessions.map((s, i) => (
                            <div className="prof-session-row" key={i}>
                              <div className="prof-session-dot" style={{ background: s.is_current ? "#10b981" : "#d1d5db" }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                                  {s.last_active}
                                  {s.is_current && <span className="current-session-badge" style={{ marginLeft: 8 }}>Hiện tại</span>}
                                </div>
                                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{s.ip_address} · {s.location || "Unknown"}</div>
                                <div style={{ fontSize: 11, color: "#c4c9d4", marginTop: 2 }}>{s.device_info}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <EmptyState text="Chưa có lịch sử hoạt động" />}
                    </ProfSection>

                  </div>
                ) : (
                  <div className="prof-body"><div className="admin-loading">Lỗi khi tải dữ liệu.</div></div>
                )}

                <div className="prof-footer">
                  <button className="btn-cancel" onClick={() => setViewingUser(null)}>Đóng hồ sơ</button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </DashboardLayout>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */
function Field({ label, children, style }) {
  return (
    <div className="admin-form-group" style={style}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ProfSection({ icon, title, children }) {
  return (
    <div className="prof-section">
      <div className="prof-section-title">
        <span className="prof-section-icon">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function ProfField({ icon, label, value }) {
  return (
    <div className="prof-field">
      <div className="prof-field-label"><span className="prof-field-icon">{icon}</span>{label}</div>
      <div className="prof-field-value">{value || <span style={{ color: "#c4c9d4" }}>Chưa cập nhật</span>}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="prof-empty">
      <span>🗂</span>
      <span>{text}</span>
    </div>
  );
}
