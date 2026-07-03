import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

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
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  const displayName = user?.name || 'Ngọc Anh';
  const avatarInitial = displayName.charAt(displayName.length - 1).toUpperCase();

  return (
    <header className="topbar">
      {/* Left: Search bar */}
      <div className="topbar-left">
        <div className="topbar-search">
          <svg className="topbar-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="topbar-search-input"
            type="text"
            placeholder="Tìm kiếm tính từ sự CV..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="topbar-right">
        {/* Notification bell */}
        <button className="topbar-icon-btn" aria-label="Thông báo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="topbar-badge">3</span>
        </button>

        {/* User avatar dropdown */}
        <div className="topbar-user" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="topbar-avatar">{avatarInitial}</div>
          <span className="topbar-username">{displayName}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>

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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Hồ sơ của tôi
              </button>
              <button className="topbar-dropdown-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
                </svg>
                Cài đặt
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item topbar-dropdown-logout">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
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
