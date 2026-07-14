import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaMagnifyingGlass, 
  FaBell, 
  FaChevronDown, 
  FaUser, 
  FaGear,
} from "react-icons/fa6";

const pageTitles = {
  '/dashboard': 'Trang chủ',
  '/ai-cv': 'Phân tích CV',
  '/portfolio': 'Xây dựng Portfolio',
  '/career': 'Định hướng nghề nghiệp',
  '/learning-path': 'Lộ trình học tập',
  '/settings': 'Cài đặt',
  '/profile': 'Hồ sơ của tôi',
  '/support': 'Hỗ trợ',
};

export default function Topbar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debounceTimer = useRef(null);

  // ── Fix #1: Parse an toàn, tránh lỗi nếu dữ liệu localStorage bị rác ──
  let localUser = {};
  try {
    localUser = JSON.parse(localStorage.getItem('career_user')) || {};
  } catch {
    localUser = {};
  }

  const displayName = localUser.full_name || user?.name || 'Người dùng';
  const displayEmail = localUser.email || 'user@example.com';

  // ── Fix #2: Dùng .trim() trước khi split để tránh phần tử rỗng
  //    khi tên có khoảng trắng thừa ở cuối (ví dụ: "John ") ──
  const nameParts = displayName.trim().split(/\s+/);
  const avatarInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase() || '?';

  // ── Fix #3: Logout dùng replace để chặn Back-button quay lại Dashboard ──
  const handleLogout = () => {
    localStorage.removeItem('career_user');
    // Redirect to landing page, replace history so Back button doesn't return to dashboard
    navigate('/', { replace: true });
  };

  // ── Fix #4: Debounce search (400ms) + xử lý Enter để tránh "Broken Feature" ──
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Hủy timer cũ nếu người dùng đang gõ
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Chờ 400ms sau lần gõ cuối rồi mới kích hoạt tìm kiếm
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        // TODO: Kết nối với trang tìm kiếm/filter thực — hiện tại navigate đến /career với query
        navigate(`/career?q=${encodeURIComponent(value.trim())}`);
      }
    }, 400);
  }, [navigate]);

  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      // Hủy debounce, thực thi ngay khi nhấn Enter
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      navigate(`/career?q=${encodeURIComponent(searchValue.trim())}`);
    }
  }, [navigate, searchValue]);

  // Dọn dẹp timer khi component unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <header className="topbar">
      {/* Left: Search bar */}
      <div className="topbar-left">
        <div className="topbar-search">
          <FaMagnifyingGlass className="topbar-search-icon" style={{ left: '16px', fontSize: '14px' }} />
          <input
            id="topbar-search-input"
            className="topbar-search-input"
            type="text"
            placeholder="Tìm kiếm vị trí, kỹ năng..."
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            aria-label="Tìm kiếm"
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="topbar-right">
        {/* Notification bell */}
        <button className="topbar-icon-btn" aria-label="Thông báo">
          <FaBell />
          <span className="topbar-badge">3</span>
        </button>

        {/* User avatar dropdown */}
        <div className="topbar-user" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="topbar-avatar">{avatarInitial}</div>
          <span className="topbar-username">{displayName}</span>
          <FaChevronDown style={{ fontSize: '12px', color: '#64748b' }} />

          {showDropdown && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <div className="topbar-dropdown-avatar">{avatarInitial}</div>
                <div>
                  <p className="topbar-dropdown-name">{displayName}</p>
                  <p className="topbar-dropdown-email">{displayEmail}</p>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item" onClick={() => { setShowDropdown(false); navigate('/profile'); }}>
                <FaUser /> Hồ sơ của tôi
              </button>
              <button className="topbar-dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings'); }}>
                <FaGear /> Cài đặt
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item topbar-dropdown-logout" onClick={handleLogout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}