import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FaMagnifyingGlass, 
  FaBell, 
  FaChevronDown, 
  FaUser, 
  FaGear, 
  FaArrowRightFromBracket 
} from "react-icons/fa6";

const pageTitles = {
  '/dashboard': 'Trang chủ',
  '/ai-cv': 'Phân tích CV',
  '/portfolio': 'Xây dựng Portfolio',
  '/career': 'Định hướng nghề nghiệp',
  '/learning-path': 'Lộ trình học tập',
  '/settings': 'Cài đặt',
  '/support': 'Hỗ trợ',
};

export default function Topbar({ user }) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const displayName = user?.name || 'Ngọc Anh';
  const avatarInitial = displayName.charAt(displayName.length - 1).toUpperCase();

  return (
    <header className="topbar">
      {/* Left: Search bar */}
      <div className="topbar-left">
        <div className="topbar-search">
          <FaMagnifyingGlass className="topbar-search-icon" style={{ left: '16px', fontSize: '14px' }} />
          <input
            className="topbar-search-input"
            type="text"
            placeholder="Tìm kiếm..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
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
                  <p className="topbar-dropdown-email">ngocanhh@gmail.com</p>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item">
                <FaUser /> Hồ sơ của tôi
              </button>
              <button className="topbar-dropdown-item">
                <FaGear /> Cài đặt
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item topbar-dropdown-logout">
                <FaArrowRightFromBracket /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}