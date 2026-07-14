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
        <img src="/logo.png" alt="CareerAI" className="sidebar-logo-img" />
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