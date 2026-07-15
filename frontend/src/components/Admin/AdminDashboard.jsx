import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardLogged/DashboardLayout";
import "./AdminDashboard.css";
import {
  FaUsers, FaChartLine, FaRoute,
  FaTimes, FaEye, FaEyeSlash,
  FaFileAlt, FaBriefcase, FaCode, FaHistory,
  FaFilePdf, FaGlobe, FaLock, FaUserShield,
  FaPhone, FaEnvelope, FaBirthdayCake, FaShieldAlt,
  FaCalendarAlt, FaClock, FaArrowRight,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const API = "http://localhost:5000/api";

/* ── Utilities ───────────────────────────────────────────────────────────── */
function getInitials(name = "") {
  return (
    name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase() || "?"
  );
}

function avatarColor(name = "") {
  const p = ["#3b5bdb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#0ea5e9", "#14b8a6", "#f97316"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return p[Math.abs(h) % p.length];
}

function buildGrowthData(users) {
  const map = {};
  let minDate = "9999-99";
  let maxDate = "0000-00";

  users.forEach((u) => {
    const rawDate = u.createdAt || u.created_at || "";
    const dateStr = rawDate.split(" ")[0]; // YYYY-MM-DD
    if (!dateStr || dateStr.length < 7) return;
    const key = dateStr.substring(0, 7); // YYYY-MM
    map[key] = (map[key] || 0) + 1;
    if (key < minDate) minDate = key;
    if (key > maxDate) maxDate = key;
  });

  if (minDate === "9999-99") return [];

  const result = [];
  let [currY, currM] = minDate.split("-").map(Number);
  const [endY, endM] = maxDate.split("-").map(Number);

  while (currY < endY || (currY === endY && currM <= endM)) {
    const key = `${currY}-${String(currM).padStart(2, "0")}`;
    result.push({
      month: `${String(currM).padStart(2, "0")}/${String(currY).slice(2)}`,
      "Người dùng mới": map[key] || 0,
    });
    currM++;
    if (currM > 12) {
      currM = 1;
      currY++;
    }
  }

  return result.slice(-8);
}

/* ── Skeletons CSS fallback version ──────────────────────────────────────── */
function ChartSkeleton() {
  return (
    <div className="skeleton-chart-container skeleton-pulse">
      <div className="skeleton-chart-bar" style={{ height: "20%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "40%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "30%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "60%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "50%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "80%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "75%" }}></div>
      <div className="skeleton-chart-bar" style={{ height: "95%" }}></div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="skeleton-list-container skeleton-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-list-item" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div className="skeleton-avatar-circle"></div>
          <div className="skeleton-text-block">
            <div className="skeleton-text-line" style={{ width: "35%" }}></div>
            <div className="skeleton-text-line" style={{ width: "55%", height: 10 }}></div>
          </div>
          <div className="skeleton-badge-pill"></div>
          <div className="skeleton-icon-btn"></div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("career_user") || "{}");
  const headers = { "Content-Type": "application/json", "X-Admin-User-Id": adminUser?.user_id };

  const [stats, setStats]               = useState({ total_users: 20, active_users: 18, total_roadmaps: 24, total_cvs: 33, published_portfolios: 5 });
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [viewingUser, setViewingUser]   = useState(null);
  const [detailsLoading, setDL]         = useState(false);
  const [showPw, setShowPw]             = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sR, uR] = await Promise.all([
        fetch(`${API}/admin/stats`, { headers }),
        fetch(`${API}/admin/users`, { headers }),
      ]);
      const sJ = await sR.json();
      const uJ = await uR.json();
      if (sJ.success) {
        setStats({
          total_users: sJ.data.totalUsers ?? sJ.data.total_users ?? 20,
          active_users: sJ.data.activeUsers ?? sJ.data.active_users ?? 18,
          total_roadmaps: sJ.data.roadmapsCreated ?? sJ.data.total_roadmaps ?? 24,
          total_cvs: sJ.data.cvUploaded ?? sJ.data.total_cvs ?? 33,
          published_portfolios: sJ.data.publicPortfolios ?? sJ.data.published_portfolios ?? 5,
        });
      }
      if (uJ.success) {
        setUsers(uJ.data);
      }
    } catch (e) {
      console.error("Lỗi khi fetch dữ liệu:", e);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        const dateA = a.createdAt || a.created_at || "";
        const dateB = b.createdAt || b.created_at || "";
        return dateB.localeCompare(dateA);
      })
      .slice(0, 5);
  }, [users]);

  const growthData = useMemo(() => buildGrowthData(users), [users]);

  const openDetails = async (user) => {
    setDL(true);
    setShowPw(false);
    setViewingUser({ basic: user, details: null });
    const targetId = user.id || user.user_id;
    try {
      const res = await fetch(`${API}/admin/users/${targetId}/details`, { headers });
      const json = await res.json();
      if (json.success) {
        setViewingUser({ basic: user, details: json.data });
      } else {
        alert(json.message);
        setViewingUser(null);
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
      setViewingUser(null);
    } finally {
      setDL(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-container">
        <h1 className="admin-title">
          <FaUserShield style={{ marginRight: 10, color: "#3b5bdb" }} />
          Theo dõi dữ liệu người dùng
        </h1>

        {/* Global Stats Cards */}
        <div className="admin-stats-grid">
          {[
            { label: "Tổng người dùng",     key: "total_users",          color: "#3b5bdb", icon: <FaUsers /> },
            { label: "Đang hoạt động",      key: "active_users",         color: "#10b981", icon: <FaChartLine /> },
            { label: "Lộ trình tạo",        key: "total_roadmaps",       color: "#f59e0b", icon: <FaRoute /> },
            { label: "CV đã tải lên",       key: "total_cvs",            color: "#8b5cf6", icon: <FaFileAlt /> },
            { label: "Portfolio công khai", key: "published_portfolios", color: "#ec4899", icon: <FaBriefcase /> },
          ].map((s) => (
            <div className="admin-stat-card" key={s.key}>
              <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <h3>{s.label}</h3>
                <p>{stats[s.key] ?? 0}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2 Column CSS Grid (using .dash-grid style) */}
        <div className="dash-grid" style={{ marginTop: 24 }}>
          
          {/* CỘT TRÁI: Biểu đồ AreaChart */}
          <div className="dash-chart-card">
            <div className="dash-chart-header" style={{ marginBottom: 20 }}>
              <span className="dash-chart-title">Xu hướng tăng trưởng người dùng mới</span>
              <span className="dash-chart-sub">Dựa theo ngày tạo tài khoản</span>
            </div>

            {loading ? (
              <ChartSkeleton />
            ) : growthData.length === 0 ? (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontStyle: "italic", fontSize: 14 }}>
                Chưa có đủ dữ liệu để hiển thị biểu đồ.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }} 
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "#ffffff", 
                      border: "1px solid #f1f5f9", 
                      borderRadius: "10px", 
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                      fontSize: "12px",
                      color: "#1e293b"
                    }} 
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar 
                    dataKey="Người dùng mới" 
                    fill="#3b5bdb" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* CỘT PHẢI: Đăng ký mới nhất */}
          <div className="dash-recent-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div className="dash-recent-header" style={{ marginBottom: 0 }}>
                <span className="dash-chart-title">Đăng ký mới nhất</span>
                <span className="dash-chart-sub">Top 5 tài khoản gần đây</span>
              </div>
              <button onClick={() => navigate("/admin")} className="view-all-btn">
                <span>Xem tất cả</span>
                <FaArrowRight style={{ fontSize: 10 }} />
              </button>
            </div>

            {loading ? (
              <ListSkeleton />
            ) : recentUsers.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontStyle: "italic", fontSize: 14 }}>
                Chưa có tài khoản nào đăng ký.
              </div>
            ) : (
              <div className="dash-recent-list">
                {recentUsers.map((user) => {
                  const id = user.id || user.user_id;
                  const name = user.name || user.full_name || "—";
                  const email = user.email || "—";
                  const status = user.status || "inactive";
                  const color = avatarColor(name);
                  return (
                    <div className="recent-user-row" key={id}>
                      {/* Avatar hình tròn */}
                      <div className="recent-avatar" style={{ backgroundColor: color }}>
                        {getInitials(name)}
                      </div>

                      {/* Họ tên & Email */}
                      <div className="recent-info">
                        <div className="recent-name">{name}</div>
                        <div className="recent-email">{email}</div>
                      </div>

                      {/* Badge trạng thái */}
                      <span className={`status-badge ${status}`} style={{ fontSize: 11, flexShrink: 0 }}>
                        {status === "active" ? "Hoạt động" : "Ngừng"}
                      </span>

                      {/* Icon Xem */}
                      <button 
                        onClick={() => openDetails(user)}
                        className="admin-btn-icon admin-btn-view"
                        title="Xem chi tiết hồ sơ"
                      >
                        <FaEye />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ DETAILED PROFILE MODAL (NO TABS, FULL EXPAND) ═══════════ */}
        {viewingUser && (() => {
          const d = viewingUser.details || viewingUser.basic;
          const name = d.name || d.full_name || "—";
          const col = avatarColor(name);
          const isSSO = d.password === "google_sso" || d.password_hash === "google_sso";
          return (
            <div className="prof-overlay" onClick={() => setViewingUser(null)}>
              <div className="prof-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Hero Header */}
                <div className="prof-hero" style={{ background: `linear-gradient(135deg, ${col}22 0%, #f8fafc 100%)` }}>
                  <button className="prof-close" onClick={() => setViewingUser(null)}>
                    <FaTimes />
                  </button>
                  <div className="prof-hero-avatar" style={{ backgroundColor: col }}>
                    {getInitials(name)}
                  </div>
                  <div className="prof-hero-info">
                    <h2 className="prof-hero-name">{name}</h2>
                    <p className="prof-hero-email">
                      <FaEnvelope style={{ marginRight: 6, display: "inline-block" }} />
                      {d.email}
                    </p>
                    <div className="prof-hero-badges">
                      <span className={`role-badge ${d.role || "user"}`}>
                        {d.role === "admin" ? "🛡 Quản trị viên" : "👤 Thành viên"}
                      </span>
                      <span className={`status-badge ${d.status || "inactive"}`}>
                        {d.status === "active" ? "● Hoạt động" : "● Ngừng"}
                      </span>
                      {isSSO && (
                        <span className="google-sso-tag">
                          <FaGlobe style={{ marginRight: 4 }} />
                          Google SSO
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                {detailsLoading && !viewingUser.details ? (
                  <div className="prof-body">
                    <div className="admin-loading">Đang tải hồ sơ từ hệ thống...</div>
                  </div>
                ) : viewingUser.details ? (
                  <div className="prof-body">
                    
                    {/* Section 1: Thông tin cơ bản */}
                    <ProfSection icon={<FaUsers />} title="Thông tin cá nhân">
                      <div className="prof-info-grid">
                        <ProfField icon={<FaBirthdayCake />} label="Ngày sinh" value={viewingUser.details.birthday || viewingUser.details.dob} />
                        <ProfField icon={<FaPhone />} label="Số điện thoại" value={viewingUser.details.phone} />
                        <ProfField icon={<FaCalendarAlt />} label="Ngày tạo tài khoản" value={viewingUser.details.createdAt || viewingUser.details.created_at} />
                        <ProfField icon={<FaClock />} label="Đăng nhập cuối" value={viewingUser.details.last_login} />
                      </div>
                      {viewingUser.details.bio && (
                        <div className="prof-bio">
                          <span className="prof-bio-label">Tiểu sử (Bio)</span>
                          {viewingUser.details.bio}
                        </div>
                      )}
                    </ProfSection>

                    {/* Section 2: Bảo mật & Mật khẩu */}
                    <ProfSection icon={<FaShieldAlt />} title="Bảo mật & Tài khoản">
                      <div className="prof-security-row">
                        <span className="prof-sec-label">Mật khẩu</span>
                        {isSSO ? (
                          <span className="google-sso-tag">
                            <FaGlobe style={{ marginRight: 5 }} />
                            Liên kết tài khoản Google (Đăng nhập SSO)
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <code className="password-hash" style={{ letterSpacing: 2 }}>
                              {showPw ? (viewingUser.details.password || viewingUser.details.password_hash) : "••••••••••••"}
                            </code>
                            <button 
                              className="btn-toggle-pw" 
                              onClick={() => setShowPw((v) => !v)}
                              title={showPw ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                            >
                              {showPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </span>
                        )}
                      </div>
                    </ProfSection>

                    {/* Section 3: CV đã tải lên */}
                    <ProfSection icon={<FaFileAlt />} title={`Hồ sơ CV đã tải lên (${viewingUser.details.cvs?.length || 0})`}>
                      {viewingUser.details.cvs?.length > 0 ? (
                        <div className="prof-card-list">
                          {viewingUser.details.cvs.map((cv, i) => (
                            <div className="prof-item-card" key={cv.cv_id}>
                              <div className="prof-item-icon" style={{ background: "#fee2e2", color: "#ef4444" }}>
                                <FaFilePdf />
                              </div>
                              <div className="prof-item-body">
                                <div className="prof-item-title">{cv.file_type || `CV Bản số #${i + 1}`}</div>
                                <div className="prof-item-meta">
                                  {cv.ats_score != null && (
                                    <span className="prof-ats-badge">{Math.round(cv.ats_score)}/100 ATS</span>
                                  )}
                                  <span className={`status-badge ${cv.status === "analyzed" ? "active" : "inactive"}`} style={{ fontSize: 11 }}>
                                    {cv.status === "analyzed" ? "Đã phân tích" : cv.status}
                                  </span>
                                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{cv.upload_date}</span>
                                </div>
                              </div>
                              <a href={cv.file_path} target="_blank" rel="noreferrer" className="prof-link-btn">Xem CV</a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="Người dùng này chưa tải lên CV nào." />
                      )}
                    </ProfSection>

                    {/* Section 4: Portfolios */}
                    <ProfSection icon={<FaBriefcase />} title={`Trang Portfolio cá nhân (${viewingUser.details.portfolios?.length || 0})`}>
                      {viewingUser.details.portfolios?.length > 0 ? (
                        <div className="prof-card-list">
                          {viewingUser.details.portfolios.map((p) => (
                            <div className="prof-item-card" key={p.portfolio_id}>
                              <div className="prof-item-icon" style={{ background: p.is_published ? "#d1fae5" : "#f1f5f9", color: p.is_published ? "#10b981" : "#64748b" }}>
                                {p.is_published ? <FaGlobe /> : <FaLock />}
                              </div>
                              <div className="prof-item-body">
                                <div className="prof-item-title">{p.title || "Portfolio chưa đặt tiêu đề"}</div>
                                <div className="prof-item-meta">
                                  <code className="text-slate-500 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{p.slug}</code>
                                  <span style={{ color: "#94a3b8", fontSize: 12 }}>👁 {p.view_count || 0} lượt xem</span>
                                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{p.created_at}</span>
                                </div>
                              </div>
                              <span className={`status-badge ${p.is_published ? "active" : "inactive"}`} style={{ fontSize: 11, flexShrink: 0 }}>
                                {p.is_published ? "Công khai" : "Riêng tư"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="Người dùng này chưa xuất bản trang portfolio nào." />
                      )}
                    </ProfSection>

                    {/* Section 5: Roadmap Lộ trình */}
                    <ProfSection icon={<FaRoute />} title={`Lộ trình học tập & Sự nghiệp (${viewingUser.details.roadmaps?.length || 0})`}>
                      {viewingUser.details.roadmaps?.length > 0 ? (
                        <div className="space-y-3">
                          {viewingUser.details.roadmaps.map((r) => (
                            <div className="prof-roadmap-card" key={r.roadmap_id}>
                              <div className="prof-roadmap-top">
                                <span className="prof-item-title">{r.title || "Lộ trình không tên"}</span>
                                <span className={`status-badge ${r.status === "completed" ? "active" : r.status === "in_progress" ? "status-inprogress" : "inactive"}`} style={{ fontSize: 11 }}>
                                  {r.status === "completed" ? "Hoàn thành" : r.status === "in_progress" ? "Đang tiến hành" : r.status}
                                </span>
                              </div>
                              <div className="roadmap-meta" style={{ marginBottom: 8, fontSize: 12, color: "#94a3b8" }}>
                                Thời gian: {r.total_months} tháng · Ngày tạo: {r.created_at}
                              </div>
                              <div className="progress-bar-wrap">
                                <div className="progress-bar-track">
                                  <div className="progress-bar-fill" style={{ width: `${r.completion_rate}%` }} />
                                </div>
                                <span className="progress-pct">{Math.round(r.completion_rate)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="Chưa khởi tạo lộ trình học tập nào." />
                      )}
                    </ProfSection>

                    {/* Section 6: Kỹ năng */}
                    <ProfSection icon={<FaCode />} title={`Bộ kỹ năng ghi nhận (${viewingUser.details.skills?.length || 0})`}>
                      {viewingUser.details.skills?.length > 0 ? (
                        <div className="skills-wrap">
                          {viewingUser.details.skills.map((s, i) => (
                            <span key={i} className={`mp-skill-badge mp-skill-badge--${s.proficiency_level || "beginner"}`}>
                              {s.skill_name} <small>({s.proficiency_level})</small>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="Chưa có thông tin kỹ năng nào được cập nhật." />
                      )}
                    </ProfSection>

                    {/* Section 7: Hoạt động */}
                    <ProfSection icon={<FaHistory />} title={`Nhật ký phiên đăng nhập gần đây (${viewingUser.details.sessions?.length || 0})`}>
                      {viewingUser.details.sessions?.length > 0 ? (
                        <div className="space-y-3">
                          {viewingUser.details.sessions.map((s, i) => (
                            <div className="prof-session-row" key={i}>
                              <div className="prof-session-dot" style={{ backgroundColor: s.is_current ? "#10b981" : "#cbd5e1" }} />
                              <div className="flex-1">
                                <div className="text-[13px] font-semibold text-slate-800">
                                  Thời gian hoạt động: {s.last_active}
                                  {s.is_current && <span className="current-session-badge" style={{ marginLeft: 8 }}>Hiện tại</span>}
                                </div>
                                <div className="text-[12px] text-slate-500 mt-1">
                                  Địa chỉ IP: {s.ip_address} · Vị trí: {s.location || "Không xác định"}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">{s.device_info}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState text="Chưa có nhật ký hoạt động nào được ghi nhận." />
                      )}
                    </ProfSection>

                  </div>
                ) : (
                  <div className="prof-body">
                    <div className="admin-loading">Không thể tải thông tin hồ sơ chi tiết.</div>
                  </div>
                )}

                <div className="prof-footer">
                  <button className="btn-cancel" onClick={() => setViewingUser(null)}>
                    Đóng hồ sơ
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </DashboardLayout>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */
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
      <div className="prof-field-label">
        <span className="prof-field-icon">{icon}</span>
        {label}
      </div>
      <div className="prof-field-value">
        {value || <span className="text-slate-300 italic">Chưa cập nhật</span>}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="prof-empty">
      <span className="text-slate-400">🗂</span>
      <span className="text-slate-400 text-[13px]">{text}</span>
    </div>
  );
}
