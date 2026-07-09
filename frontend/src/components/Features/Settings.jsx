import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import { updateUser, changePassword, getUser, CURRENT_USER_ID, uploadAvatar, getLoginSessions, getLoginHistory, revokeOtherSessions } from '../../services/api';
import './Settings.css';
import {
  FaUser, FaPalette, FaBell, FaShieldHalved, FaLock,
  FaEye, FaLink, FaGlobe, FaCircleInfo,
  FaSun, FaMoon, FaDesktop, FaGoogle, FaGithub,
  FaLinkedin, FaTrashCan, FaDownload, FaKey,
  FaClockRotateLeft, FaMobileScreen, FaRightFromBracket,
  FaCheck, FaXmark
} from 'react-icons/fa6';

/* ─── Danh sách tab sidebar ─── */
const TABS = [
  { id: 'general',    icon: <FaUser />,          label: 'Tổng quan' },
  { id: 'appearance', icon: <FaPalette />,        label: 'Giao diện' },
  { id: 'notif',      icon: <FaBell />,           label: 'Thông báo' },
  { id: 'security',   icon: <FaShieldHalved />,   label: 'Bảo mật' },
  { id: 'privacy',    icon: <FaEye />,            label: 'Quyền riêng tư' },
  { id: 'accounts',   icon: <FaLink />,           label: 'Tài khoản liên kết' },
  { id: 'region',     icon: <FaGlobe />,          label: 'Ngôn ngữ & Khu vực' },
  { id: 'about',      icon: <FaCircleInfo />,     label: 'Giới thiệu' },
];

/* ─── Toggle component tái sử dụng ─── */
function Toggle({ checked, onChange }) {
  return (
    <button
      className={`stg-toggle ${checked ? 'stg-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      type="button"
    >
      <span className="stg-toggle-knob" />
    </button>
  );
}

/* ─── Row item tái sử dụng ─── */
function SettingRow({ label, desc, children }) {
  return (
    <div className="stg-row">
      <div className="stg-row-label">
        <span className="stg-row-title">{label}</span>
        {desc && <span className="stg-row-desc">{desc}</span>}
      </div>
      <div className="stg-row-control">{children}</div>
    </div>
  );
}

/* ─── Section card tái sử dụng ─── */
function Section({ title, children }) {
  return (
    <div className="stg-section">
      {title && <h3 className="stg-section-title">{title}</h3>}
      <div className="stg-section-body">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TAB: GENERAL
══════════════════════════════════════════════════ */
function TabGeneral() {
  const user = JSON.parse(localStorage.getItem('career_user') || '{}');
  const userId = user.user_id || CURRENT_USER_ID;
  const [name, setName] = useState(user.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError('File ảnh không được vượt quá 2MB');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await uploadAvatar(userId, file);
      setAvatarUrl(res.avatar_url);
      
      const updatedUser = { ...user, avatar_url: res.avatar_url };
      localStorage.setItem('career_user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUser(userId, { full_name: name });
      
      // Update local storage so changes persist across reloads
      const updatedUser = { ...user, full_name: name };
      localStorage.setItem('career_user', JSON.stringify(updatedUser));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <Section title="Thông tin tài khoản">
        {/* Avatar */}
        <div className="stg-avatar-row">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="stg-avatar-circle" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="stg-avatar-circle">{initials}</div>
          )}
          <div>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/gif" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange}
            />
            <button 
              className="stg-btn-outline stg-btn-sm" 
              onClick={() => fileInputRef.current.click()} 
              disabled={loading}
            >
              Thay đổi ảnh
            </button>
            <p className="stg-hint">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
          </div>
        </div>

        <SettingRow label="Tên hiển thị" desc="Tên này sẽ xuất hiện trên hồ sơ của bạn.">
          <input
            className="stg-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nhập tên của bạn"
            disabled={loading}
          />
        </SettingRow>

        <SettingRow label="Email" desc="Email đăng nhập không thể thay đổi.">
          <input
            className="stg-input stg-input--readonly"
            value={user.email || 'user@example.com'}
            readOnly
          />
        </SettingRow>
      </Section>
      
      {error && <div className="stg-warning-box" style={{margin: '0 24px'}}>{error}</div>}

      <div className="stg-footer-actions">
        <button className="stg-btn-primary" onClick={handleSave} disabled={loading || !name.trim()}>
          {loading ? 'Đang lưu...' : saved ? <><FaCheck /> Đã lưu</> : 'Lưu thay đổi'}
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   TAB: APPEARANCE
══════════════════════════════════════════════════ */
function TabAppearance() {
  const [theme, setTheme] = useState(localStorage.getItem('career_theme') || 'light');
  const [fontSize, setFontSize] = useState(localStorage.getItem('career_font_size') || 'medium');
  const [compact, setCompact] = useState(localStorage.getItem('career_compact') === 'true');
  const [color, setColor] = useState(localStorage.getItem('career_color') || '#3b5bdb');

  React.useEffect(() => {
    localStorage.setItem('career_theme', theme);
    if (theme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('career_color', color);
    document.documentElement.style.setProperty('--primary-color', color);
  }, [color]);

  React.useEffect(() => {
    localStorage.setItem('career_font_size', fontSize);
    if (fontSize === 'small') document.documentElement.style.fontSize = '14px';
    else if (fontSize === 'large') document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';
  }, [fontSize]);

  React.useEffect(() => {
    localStorage.setItem('career_compact', compact);
    if (compact) document.body.classList.add('compact-mode');
    else document.body.classList.remove('compact-mode');
  }, [compact]);

  const themes = [
    { id: 'light',  icon: <FaSun />,     label: 'Light' },
    { id: 'dark',   icon: <FaMoon />,    label: 'Dark' },
    { id: 'system', icon: <FaDesktop />, label: 'System' },
  ];

  const colors = ['#3b5bdb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <>
      <Section title="Chế độ hiển thị">
        <div className="stg-theme-grid">
          {themes.map(t => (
            <button
              key={t.id}
              className={`stg-theme-card ${theme === t.id ? 'stg-theme-card--active' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <span className="stg-theme-icon">{t.icon}</span>
              <span className="stg-theme-label">{t.label}</span>
              {theme === t.id && <span className="stg-theme-check"><FaCheck /></span>}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Màu chủ đạo">
        <div className="stg-color-row">
          {colors.map(c => (
            <button
              key={c}
              className={`stg-color-dot ${color === c ? 'stg-color-dot--active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={c}
            >
              {color === c && <FaCheck style={{ color: '#fff', fontSize: 10 }} />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Cỡ chữ">
        <SettingRow label="Font Size" desc="Ảnh hưởng đến toàn bộ giao diện.">
          <select className="stg-select" value={fontSize} onChange={e => setFontSize(e.target.value)}>
            <option value="small">Nhỏ</option>
            <option value="medium">Vừa (mặc định)</option>
            <option value="large">Lớn</option>
          </select>
        </SettingRow>
        <SettingRow label="Compact Mode" desc="Giảm khoảng cách giữa các phần tử.">
          <Toggle checked={compact} onChange={setCompact} />
        </SettingRow>
      </Section>
    </>
  );
}

/* ══════════════════════════════════════════════════
   TAB: NOTIFICATIONS
══════════════════════════════════════════════════ */
function TabNotifications() {
  const [notifs, setNotifs] = useState({
    email: true,
    push: false,
    job: true,
    system: true,
  });

  const toggle = key => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: 'email',  label: 'Email Notifications',  desc: 'Nhận thông báo qua email.' },
    { key: 'push',   label: 'Push Notifications',   desc: 'Thông báo trên trình duyệt.' },
    { key: 'job',    label: 'Job Notifications',     desc: 'Thông báo về cơ hội việc làm mới.' },
    { key: 'system', label: 'System Notifications',  desc: 'Cập nhật hệ thống và bảo mật.' },
  ];

  return (
    <Section title="Tùy chỉnh thông báo">
      {items.map(item => (
        <SettingRow key={item.key} label={item.label} desc={item.desc}>
          <Toggle checked={notifs[item.key]} onChange={() => toggle(item.key)} />
        </SettingRow>
      ))}
    </Section>
  );
}

/* ══════════════════════════════════════════════════
   TAB: SECURITY
══════════════════════════════════════════════════ */
function TabSecurity() {
  const [show2FA, setShow2FA] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('career_user') || '{}');
    const userId = user.user_id || CURRENT_USER_ID;
    
    getLoginSessions(userId).then(res => {
      if(res.success) setSessions(res.data);
    }).catch(console.error);

    getLoginHistory(userId).then(res => {
      if(res.success) setHistory(res.data);
    }).catch(console.error);
  }, []);

  const handleRevokeSessions = async () => {
    if(!window.confirm('Bạn có chắc muốn đăng xuất khỏi tất cả các thiết bị khác không?')) return;
    const user = JSON.parse(localStorage.getItem('career_user') || '{}');
    const userId = user.user_id || CURRENT_USER_ID;
    try {
      await revokeOtherSessions(userId);
      const res = await getLoginSessions(userId);
      if(res.success) setSessions(res.data);
      alert('Đã đăng xuất các thiết bị khác thành công!');
    } catch(err) {
      alert(err.message || 'Lỗi khi đăng xuất');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    const user = JSON.parse(localStorage.getItem('career_user') || '{}');
    const userId = user.user_id || CURRENT_USER_ID;

    try {
      await changePassword(userId, { 
        current_password: currentPassword, 
        new_password: newPassword 
      });
      
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err) {
      setPasswordError(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Section title="Mật khẩu">
        <SettingRow label="Thay đổi mật khẩu" desc="Cập nhật mật khẩu định kỳ để bảo mật.">
          <button 
            className="stg-btn-outline" 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            <FaKey /> Đổi mật khẩu
          </button>
        </SettingRow>
        
        {showPasswordChange && (
          <div className="stg-section-body" style={{ padding: '16px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            {passwordError && <div className="stg-warning-box">{passwordError}</div>}
            {passwordSuccess && <div className="stg-info-box" style={{margin: '0 0 12px', background: '#dcfce7', borderColor: '#86efac', color: '#166534'}}><FaCheck style={{marginRight: '8px'}}/> Đổi mật khẩu thành công!</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="stg-input" 
                  style={{ width: '100%' }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading || passwordSuccess}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="stg-input" 
                  style={{ width: '100%' }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading || passwordSuccess}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#374151' }}>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  className="stg-input" 
                  style={{ width: '100%' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading || passwordSuccess}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button 
                  className="stg-btn-outline" 
                  onClick={() => setShowPasswordChange(false)}
                  disabled={passwordLoading}
                >
                  Hủy
                </button>
                <button 
                  className="stg-btn-primary" 
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || passwordSuccess || !currentPassword || !newPassword || !confirmPassword}
                >
                  {passwordLoading ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section title="Xác thực 2 lớp (2FA)">
        <SettingRow
          label="Two-Factor Authentication"
          desc="Thêm lớp bảo mật khi đăng nhập."
        >
          <Toggle checked={twoFA} onChange={v => { setTwoFA(v); setShow2FA(v); }} />
        </SettingRow>
        {show2FA && (
          <div className="stg-info-box">
            <FaMobileScreen className="stg-info-icon" />
            <span>Quét mã QR bằng ứng dụng xác thực (Google Authenticator, Authy…) để kích hoạt 2FA.</span>
          </div>
        )}
      </Section>

      <Section title="Phiên đăng nhập">
        <div className="stg-sessions-list">
          {sessions.map((s, i) => (
            <div key={i} className="stg-session-item">
              <FaDesktop className="stg-session-icon" />
              <div className="stg-session-info">
                <span className="stg-session-device">{s.device_info || 'Unknown Device'}</span>
                <span className="stg-session-meta">{s.location || 'Không xác định'} · {s.last_active}</span>
              </div>
              {s.is_current
                ? <span className="stg-badge stg-badge--green">Hiện tại</span>
                : <button className="stg-btn-danger-text" onClick={handleRevokeSessions}>Thu hồi</button>
              }
            </div>
          ))}
          {sessions.length === 0 && <div className="stg-info-box">Chưa có thông tin phiên đăng nhập</div>}
        </div>
        <div className="stg-footer-actions stg-footer-actions--left">
          <button className="stg-btn-danger" onClick={handleRevokeSessions}>
            <FaRightFromBracket /> Đăng xuất tất cả thiết bị khác
          </button>
        </div>
      </Section>

      <Section title="Lịch sử đăng nhập">
        <div className="stg-history-list">
          {history.map((h, i) => (
            <div key={i} className="stg-history-item">
              <FaClockRotateLeft className="stg-history-icon" />
              <div className="stg-session-info">
                <span className="stg-session-device">{h.time}</span>
                <span className="stg-session-meta">IP: {h.ip_address} · {h.device_info || 'Unknown Device'}</span>
              </div>
              <span className={`stg-badge ${h.status === 'Thành công' ? 'stg-badge--green' : 'stg-badge--red'}`}>
                {h.status}
              </span>
            </div>
          ))}
          {history.length === 0 && <div className="stg-info-box">Chưa có thông tin lịch sử đăng nhập</div>}
        </div>
      </Section>
    </>
  );
}

/* ══════════════════════════════════════════════════
   TAB: PRIVACY
══════════════════════════════════════════════════ */
function TabPrivacy() {
  const [publicProfile, setPublicProfile] = useState(true);
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  return (
    <>
      <Section title="Quyền riêng tư hồ sơ">
        <SettingRow label="Hồ sơ công khai" desc="Cho phép mọi người xem hồ sơ của bạn.">
          <Toggle checked={publicProfile} onChange={setPublicProfile} />
        </SettingRow>
        <SettingRow label="Hiển thị với nhà tuyển dụng" desc="Nhà tuyển dụng có thể tìm thấy bạn.">
          <Toggle checked={recruiterVisible} onChange={setRecruiterVisible} />
        </SettingRow>
      </Section>

      <Section title="Dữ liệu của bạn">
        <SettingRow label="Tải xuống dữ liệu" desc="Xuất toàn bộ dữ liệu tài khoản của bạn.">
          <button className="stg-btn-outline">
            <FaDownload /> Tải xuống
          </button>
        </SettingRow>
      </Section>

      <Section title="Vùng nguy hiểm">
        <SettingRow
          label="Xóa tài khoản"
          desc="Hành động này không thể hoàn tác. Toàn bộ dữ liệu sẽ bị xóa vĩnh viễn."
        >
          <button className="stg-btn-danger" onClick={() => setShowDeleteModal(true)}>
            <FaTrashCan /> Xóa tài khoản
          </button>
        </SettingRow>
      </Section>

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="stg-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="stg-modal" onClick={e => e.stopPropagation()}>
            <div className="stg-modal-header">
              <h3 className="stg-modal-title">Xác nhận xóa tài khoản</h3>
              <button className="stg-modal-close" onClick={() => setShowDeleteModal(false)}>
                <FaXmark />
              </button>
            </div>
            <div className="stg-modal-body">
              <div className="stg-warning-box">
                ⚠️ Hành động này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu, CV, lộ trình học tập và lịch sử sẽ bị xóa vĩnh viễn.
              </div>
              <p className="stg-modal-hint">
                Nhập <strong>DELETE</strong> để xác nhận:
              </p>
              <input
                className="stg-input"
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
              />
            </div>
            <div className="stg-modal-footer">
              <button className="stg-btn-outline" onClick={() => setShowDeleteModal(false)}>Hủy</button>
              <button
                className="stg-btn-danger"
                disabled={deleteConfirm !== 'DELETE'}
                style={{ opacity: deleteConfirm !== 'DELETE' ? 0.4 : 1 }}
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════
   TAB: CONNECTED ACCOUNTS
══════════════════════════════════════════════════ */
function TabAccounts() {
  const [connected, setConnected] = useState({ google: true, linkedin: false, github: false });

  const accounts = [
    { key: 'google',   icon: <FaGoogle />,   label: 'Google',   color: '#ea4335', desc: 'Đăng nhập và đồng bộ dữ liệu Google.' },
    { key: 'linkedin', icon: <FaLinkedin />, label: 'LinkedIn', color: '#0a66c2', desc: 'Nhập hồ sơ và kết nối nghề nghiệp.' },
    { key: 'github',   icon: <FaGithub />,   label: 'GitHub',   color: '#24292e', desc: 'Liên kết dự án và portfolio kỹ thuật.' },
  ];

  return (
    <Section title="Tài khoản liên kết">
      {accounts.map(acc => (
        <div key={acc.key} className="stg-account-card">
          <div className="stg-account-icon" style={{ color: acc.color }}>{acc.icon}</div>
          <div className="stg-account-info">
            <span className="stg-account-name">{acc.label}</span>
            <span className="stg-account-desc">{acc.desc}</span>
          </div>
          {connected[acc.key]
            ? (
              <div className="stg-account-actions">
                <span className="stg-badge stg-badge--green">Đã kết nối</span>
                <button
                  className="stg-btn-danger-text"
                  onClick={() => setConnected(p => ({ ...p, [acc.key]: false }))}
                >
                  Hủy liên kết
                </button>
              </div>
            )
            : (
              <button
                className="stg-btn-outline stg-btn-sm"
                onClick={() => setConnected(p => ({ ...p, [acc.key]: true }))}
              >
                Kết nối
              </button>
            )
          }
        </div>
      ))}
    </Section>
  );
}

/* ══════════════════════════════════════════════════
   TAB: LANGUAGE & REGION
══════════════════════════════════════════════════ */
function TabRegion() {
  const [lang, setLang] = useState('vi');
  const [tz, setTz] = useState('Asia/Ho_Chi_Minh');
  const [dateFmt, setDateFmt] = useState('DD/MM/YYYY');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Section title="Ngôn ngữ & Khu vực">
        <SettingRow label="Ngôn ngữ" desc="Ngôn ngữ hiển thị của giao diện.">
          <select className="stg-select" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="vi">Tiếng Việt</option>
          </select>
        </SettingRow>

        <SettingRow label="Múi giờ" desc="Ảnh hưởng đến hiển thị thời gian.">
          <select className="stg-select" value={tz} onChange={e => setTz(e.target.value)}>
            <option value="Asia/Ho_Chi_Minh">Indochina (UTC+7) — Hà Nội, TP.HCM</option>
            <option value="Asia/Tokyo">Japan (UTC+9) — Tokyo</option>
            <option value="America/New_York">Eastern (UTC-5) — New York</option>
            <option value="Europe/London">GMT (UTC+0) — London</option>
          </select>
        </SettingRow>

        <SettingRow label="Định dạng ngày" desc="Cách hiển thị ngày tháng.">
          <select className="stg-select" value={dateFmt} onChange={e => setDateFmt(e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </SettingRow>
      </Section>

      <div className="stg-footer-actions">
        <button className="stg-btn-primary" onClick={handleSave}>
          {saved ? <><FaCheck /> Đã lưu</> : 'Lưu thay đổi'}
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   TAB: ABOUT
══════════════════════════════════════════════════ */
function TabAbout() {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedback, setFeedback] = useState('');

  return (
    <>
      <Section title="Thông tin ứng dụng">
        <SettingRow label="Phiên bản" desc="CareerAI Platform">
          <span className="stg-badge stg-badge--blue">v1.0.0</span>
        </SettingRow>
        <SettingRow label="Cập nhật lần cuối" desc="">
          <span className="stg-text-muted">09/07/2026</span>
        </SettingRow>
      </Section>

      <Section title="Pháp lý & Hỗ trợ">
        {[
          { label: 'Chính sách bảo mật', href: '#' },
          { label: 'Điều khoản sử dụng', href: '#' },
          { label: 'Trung tâm hỗ trợ', href: '#' },
        ].map(link => (
          <SettingRow key={link.label} label={link.label}>
            <a href={link.href} className="stg-link">Xem →</a>
          </SettingRow>
        ))}
      </Section>

      <Section title="Gửi phản hồi">
        <textarea
          className="stg-textarea"
          placeholder="Chia sẻ ý kiến của bạn về CareerAI..."
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={4}
        />
        <div className="stg-footer-actions stg-footer-actions--left">
          <button
            className="stg-btn-primary"
            disabled={!feedback.trim()}
            onClick={() => { setFeedbackSent(true); setFeedback(''); setTimeout(() => setFeedbackSent(false), 3000); }}
          >
            {feedbackSent ? <><FaCheck /> Đã gửi!</> : 'Gửi phản hồi'}
          </button>
        </div>
      </Section>
    </>
  );
}

/* ══════════════════════════════════════════════════
   MAIN SETTINGS PAGE
══════════════════════════════════════════════════ */
const TAB_COMPONENTS = {
  general:    <TabGeneral />,
  appearance: <TabAppearance />,
  notif:      <TabNotifications />,
  security:   <TabSecurity />,
  privacy:    <TabPrivacy />,
  accounts:   <TabAccounts />,
  region:     <TabRegion />,
  about:      <TabAbout />,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <DashboardLayout>
      <div className="stg-page">
        {/* Page header */}
        <div className="stg-page-header">
          <h1 className="stg-page-title">Settings</h1>
          <p className="stg-page-subtitle">Quản lý tài khoản và tùy chỉnh trải nghiệm của bạn.</p>
        </div>

        <div className="stg-layout">
          {/* Sidebar nav */}
          <aside className="stg-sidebar">
            <nav className="stg-nav">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`stg-nav-item ${activeTab === tab.id ? 'stg-nav-item--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="stg-nav-icon">{tab.icon}</span>
                  <span className="stg-nav-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content panel */}
          <main className="stg-content">
            <div className="stg-content-header">
              <h2 className="stg-content-title">{currentTab?.label}</h2>
            </div>
            <div className="stg-content-body" key={activeTab}>
              {TAB_COMPONENTS[activeTab]}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
