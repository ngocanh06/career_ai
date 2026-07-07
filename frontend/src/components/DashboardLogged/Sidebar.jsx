import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTableCellsLarge, 
  FaFileLines, 
  FaBriefcase, 
  FaEarthAmericas, 
  FaChartSimple, 
  FaGear, 
  FaCircleQuestion, 
  FaWandMagicSparkles 
} from "react-icons/fa6";
import './DashboardLayout.css';

const mainNav = [
  { icon: <FaTableCellsLarge />,      label: 'Trang chủ',                path: '/dashboard' },
  { icon: <FaFileLines />,            label: 'Phân tích CV',             path: '/ai-cv' },
  { icon: <FaBriefcase />,            label: 'Xây dựng Portfolio',       path: '/portfolio' },
  { icon: <FaEarthAmericas />,        label: 'Định hướng nghề nghiệp',   path: '/career' },
  { icon: <FaChartSimple />,          label: 'Lộ trình học tập',         path: '/learning-path' },
];

const bottomNav = [
  { icon: <FaGear />,                 label: 'Cài đặt', path: '/settings' },
  { icon: <FaCircleQuestion />,       label: 'Hỗ trợ',  path: '/support' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
        <div className="sidebar-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 8.5 12 15 2 8.5 12 2"/>
            <polyline points="2 15.5 12 22 22 15.5"/>
            <polyline points="2 12 12 18.5 22 12"/>
          </svg>
        </div>
        <span className="sidebar-logo-text">CareerAI</span>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              'sidebar-nav-item' + (isActive ? ' active' : '')
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* CTA */}
      <div className="sidebar-cta">
        <button className="sidebar-cta-btn" onClick={() => navigate('/ai-cv')}>
          <FaWandMagicSparkles /> Phân tích CV mới
        </button>
      </div>

      {/* Bottom nav */}
      <nav className="sidebar-bottom">
        {bottomNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              'sidebar-nav-item' + (isActive ? ' active' : '')
            }
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}