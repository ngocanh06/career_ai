import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './LearningPath.css';
import html2pdf from 'html2pdf.js';
import {
  FaWandMagicSparkles, FaDownload, FaRoute, FaCalendarDay,
  FaCheck, FaBolt, FaLock, FaBookOpen, FaClock, FaStar,
  FaArrowRight, FaChartSimple, FaFileArrowUp, FaXmark,
  FaChevronDown, FaChevronUp, FaTrash, FaBullseye,
} from "react-icons/fa6";

const LEVEL_PCT = { expert: 100, advanced: 80, intermediate: 60, beginner: 30 };

/* Map platform name → URL thực */
const PLATFORM_URLS = {
  // Coding & Tech Practice
  'hackerrank': 'https://www.hackerrank.com',
  'leetcode': 'https://leetcode.com',
  'codewars': 'https://www.codewars.com',
  'kaggle': 'https://www.kaggle.com/learn',
  // Video Courses
  'coursera': 'https://www.coursera.org',
  'udemy': 'https://www.udemy.com',
  'edx': 'https://www.edx.org',
  'pluralsight': 'https://www.pluralsight.com',
  'linkedin learning': 'https://www.linkedin.com/learning',
  'skillshare': 'https://www.skillshare.com',
  'udacity': 'https://www.udacity.com',
  'datacamp': 'https://www.datacamp.com',
  // Free Resources
  'youtube': 'https://www.youtube.com',
  'freecodecamp': 'https://www.freecodecamp.org',
  'w3schools': 'https://www.w3schools.com',
  'mdn': 'https://developer.mozilla.org',
  'codecademy': 'https://www.codecademy.com',
  'theodinproject': 'https://www.theodinproject.com',
  // Cloud / Enterprise
  'aws training': 'https://aws.amazon.com/training',
  'google cloud': 'https://cloud.google.com/training',
  'microsoft learn': 'https://learn.microsoft.com',
  'azure': 'https://learn.microsoft.com/azure',
  // Vietnam
  'topdev': 'https://topdev.vn',
  'tek4': 'https://tek4.vn',
  'kteam': 'https://www.kteam.vn',
  'cybersoft': 'https://cybersoft.edu.vn',
};

/* Lấy URL thực từ tên platform kèm theo từ khóa tìm kiếm khóa học */
const getPlatformUrl = (platformName = '', courseTitle = '') => {
  if (!platformName) return '#';
  const key = platformName.toLowerCase().trim();
  // Udemy và một số trang dùng dấu '+' thay cho '%20'
  const encodedTitle = encodeURIComponent(courseTitle).replace(/%20/g, '+');

  // Mapping platform sang URL tìm kiếm thực tế (Deep links)
  const SEARCH_URLS = {
    'coursera': `https://www.coursera.org/search?query=${encodedTitle}`,
    'udemy': `https://www.coursera.org/search?query=${encodedTitle}`, // Chuyển sang Coursera theo yêu cầu
    'edx': `https://www.edx.org/search?q=${encodedTitle}`,
    'youtube': `https://www.youtube.com/results?search_query=${encodedTitle}`,
    'linkedin learning': `https://www.linkedin.com/learning/search?keywords=${encodedTitle}`,
    'pluralsight': `https://www.pluralsight.com/search?q=${encodedTitle}`,
    'skillshare': `https://www.skillshare.com/search?query=${encodedTitle}`,
    'datacamp': `https://www.datacamp.com/search?q=${encodedTitle}`,
    'codecademy': `https://www.codecademy.com/search?query=${encodedTitle}`,
    'hackerrank': 'https://www.hackerrank.com/domains',
    'leetcode': `https://leetcode.com/problemset/all/?search=${encodedTitle}`,
    'kaggle': `https://www.kaggle.com/search?q=${encodedTitle}`,
    'aws training': `https://explore.skillbuilder.aws/learn/catalog?search=${encodedTitle}`,
    'microsoft learn': `https://learn.microsoft.com/en-us/search/?terms=${encodedTitle}`,
    'google cloud': `https://www.cloudskillsboost.google/catalog?search=${encodedTitle}`,
    'freecodecamp': `https://www.freecodecamp.org/news/search/?query=${encodedTitle}`
  };

  // 1. Tìm exact match trong SEARCH_URLS
  if (SEARCH_URLS[key]) return SEARCH_URLS[key];

  // 2. Tìm partial match
  for (const [k, url] of Object.entries(SEARCH_URLS)) {
    if (key.includes(k) || k.includes(key)) return url;
  }

  // 3. Fallback: Nếu không tìm thấy trong danh sách, chuyển mặc định tất cả sang Coursera theo yêu cầu
  return `https://www.coursera.org/search?query=${encodedTitle}`;
};

const CAREER_TARGETS = [
  'Senior Data Analyst', 'Data Scientist', 'Machine Learning Engineer',
  'Fullstack Developer', 'Backend Developer', 'Frontend Developer',
  'DevOps Engineer', 'Product Manager', 'Business Analyst',
  'UX/UI Designer', 'Cloud Architect', 'Cybersecurity Engineer',
];

export default function LearningPath() {
  const [roadmap, setRoadmap] = useState(null);
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState("Nhấn 'Lấy gợi ý AI mới' để nhận phân tích cá nhân hoá.");
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('career_user'));
    return user ? user.user_id : 19;
  };

  const fetchRoadmap = () => {
    const userId = getUser();
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/api/roadmap/${userId}`).then(r => r.json()),
      fetch(`http://localhost:5000/api/skills/${userId}`).then(r => r.json()),
    ])
      .then(([rmJson, skJson]) => {
        if (rmJson.success) {
          setRoadmap(rmJson.data);
          const ICONS = ['📊', '📉', '🤖', '☁️', '🎯', '🔥'];
          const TYPES = ['ĐỀ XUẤT', 'THỰC TẾ', 'CƠ BẢN', 'NÂNG CAO'];
          const BADGES = ['lp-badge-recommend', 'lp-badge-practice', 'lp-badge-recommend', 'lp-badge-practice'];
          const LEVELS = ['NÂNG CAO', 'TRUNG CẤP', 'CƠ BẢN', 'NÂNG CAO'];
          const mapped = (rmJson.data.goals || [])
            .flatMap((g, gi) => {
              let parsed = [];
              try { parsed = JSON.parse(g.suggested_courses); } catch { parsed = []; }
              return parsed.map((c, ci) => ({
                id: gi * 10 + ci,
                title: c.name,
                desc: `${c.platform}`,
                platform: c.platform,
                url: getPlatformUrl(c.platform, c.name),
                hours: 8 + gi * 4 + ci * 2,
                level: LEVELS[gi % LEVELS.length] || 'TRUNG CẤP',
                type: TYPES[ci % TYPES.length],
                badgeClass: BADGES[ci % BADGES.length],
                icon: ICONS[gi % ICONS.length],
                goalMonth: g.target_month,
                completed: c.completed,
              }));
            });
          setCourses(mapped);
        }
        if (skJson.success) {
          setSkills(skJson.data.map(s => ({
            name: s.skill_name,
            pct: LEVEL_PCT[s.proficiency_level] || 50,
            low: (LEVEL_PCT[s.proficiency_level] || 50) < 40,
          })));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleGenerateRoadmap = async (overrideTarget = null) => {
    const target = (typeof overrideTarget === 'string' ? overrideTarget : null) || selectedTarget || customTarget;
    if (!target) { setShowTargetModal(true); return; }
    setShowTargetModal(false);
    setGenerating(true);
    const userId = getUser();
    try {
      const res = await fetch('http://localhost:5000/api/roadmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, target_career: target })
      });
      await res.json();
      fetchRoadmap();
    } catch (e) { console.error(e); }
    setGenerating(false);
    setSelectedTarget('');
    setCustomTarget('');
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const target = queryParams.get('target');
    if (target) {
      window.history.replaceState({}, document.title, "/learning-path");
      handleGenerateRoadmap(target);
    } else {
      fetchRoadmap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteRoadmap = async () => {
    if (!roadmap) return;
    const userId = getUser();
    try {
      await fetch(`http://localhost:5000/api/roadmap/${roadmap.roadmap_id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      setRoadmap(null);
      setCourses([]);
      setShowDeleteConfirm(false);
    } catch (e) { console.error(e); }
  };

  const generateAIInsight = async () => {
    if (!roadmap) return;
    setGeneratingInsight(true);
    try {
      const res = await fetch('http://localhost:5000/api/roadmap/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmap, skills })
      });
      const json = await res.json();
      if (json.success) setAiInsight(json.data);
    } catch (e) { console.error(e); }
    setGeneratingInsight(false);
  };

  const handleToggleCourse = async (goal, courseIndex) => {
    let parsedCourses = [];
    try { parsedCourses = JSON.parse(goal.suggested_courses) || []; } catch { parsedCourses = []; }

    if (parsedCourses.length === 0) return;

    // Toggle completed state
    parsedCourses[courseIndex].completed = !parsedCourses[courseIndex].completed;

    // Calculate new goal progress and status
    const total = parsedCourses.length;
    const completedCount = parsedCourses.filter(c => c.completed).length;
    const pct = Math.round((completedCount / total) * 100);
    const newStatus = pct >= 100 ? 'completed' : pct > 0 ? 'in_progress' : 'pending';

    // Optimistically update frontend state with cascading reset
    let pastCurrentGoal = false;
    const goalsToUpdateInBackend = [];

    const updatedGoals = roadmap.goals.map(g => {
      if (g.goal_id === goal.goal_id) {
        pastCurrentGoal = true;
        const updatedG = {
          ...g,
          suggested_courses: JSON.stringify(parsedCourses),
          progress_percentage: pct,
          status: newStatus
        };
        goalsToUpdateInBackend.push(updatedG);
        return updatedG;
      }

      // Nếu mục tiêu hiện tại bị mất trạng thái hoàn thành (VD: bỏ tick) -> Reset các tháng sau
      if (pastCurrentGoal && newStatus !== 'completed') {
        let gParsed = [];
        try { gParsed = JSON.parse(g.suggested_courses) || []; } catch { gParsed = []; }
        const hasProgress = gParsed.some(c => c.completed) || g.progress_percentage > 0;

        if (hasProgress) {
          gParsed.forEach(c => c.completed = false);
          const resetG = {
            ...g,
            suggested_courses: JSON.stringify(gParsed),
            progress_percentage: 0,
            status: 'pending'
          };
          goalsToUpdateInBackend.push(resetG);
          return resetG;
        }
      }
      return g;
    });

    const totalProgress = updatedGoals.reduce((sum, g) => sum + (g.progress_percentage || 0), 0);
    const newCompletionRate = Math.round(totalProgress / updatedGoals.length);

    setRoadmap({
      ...roadmap,
      completion_rate: newCompletionRate,
      goals: updatedGoals
    });

    // Update courses list
    const ICONS = ['📊', '📉', '🤖', '☁️', '🎯', '🔥'];
    const TYPES = ['ĐỀ XUẤT', 'THỰC TẾ', 'CƠ BẢN', 'NÂNG CAO'];
    const BADGES = ['lp-badge-recommend', 'lp-badge-practice', 'lp-badge-recommend', 'lp-badge-practice'];
    const LEVELS = ['NÂNG CAO', 'TRUNG CẤP', 'CƠ BẢN', 'NÂNG CAO'];
    const mapped = updatedGoals.flatMap((g, gi) => {
      let parsed = [];
      try { parsed = JSON.parse(g.suggested_courses); } catch { parsed = []; }
      return parsed.map((c, ci) => ({
        id: gi * 10 + ci,
        title: c.name,
        desc: `${c.platform} — ${g.skill_name || ''}`,
        platform: c.platform,
        url: getPlatformUrl(c.platform, c.name),
        hours: 8 + gi * 4 + ci * 2,
        level: LEVELS[gi % LEVELS.length] || 'TRUNG CẤP',
        type: TYPES[ci % TYPES.length],
        badgeClass: BADGES[ci % BADGES.length],
        icon: ICONS[gi % ICONS.length],
        goalMonth: g.target_month,
        completed: c.completed
      }));
    });
    setCourses(mapped);

    // Kiểm tra nếu lộ trình vừa đạt 100%
    if (newCompletionRate === 100 && roadmap.completion_rate < 100) {
      setTimeout(() => {
        setShowCongratsModal(true);
      }, 500);
    }

    // Call backend
    try {
      await Promise.all(goalsToUpdateInBackend.map(gUpdate =>
        fetch(`http://localhost:5000/api/roadmap/goal/${gUpdate.goal_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suggested_courses: JSON.parse(gUpdate.suggested_courses) })
        })
      ));
    } catch (e) {
      console.error(e);
      // Revert if error occurs
      fetchRoadmap();
    }
  };

  const handleSyncSkills = async () => {
    if (!roadmap || !roadmap.goals) return;
    const uniqueSkills = [...new Set(roadmap.goals.map(g => g.skill_name).filter(Boolean))];
    if (uniqueSkills.length === 0) return;

    const userId = getUser();
    try {
      const res = await fetch('http://localhost:5000/api/roadmap/sync-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, skills: uniqueSkills })
      });
      const json = await res.json();
      alert(json.message);
      fetchRoadmap();
    } catch (e) {
      console.error(e);
      alert('Đồng bộ kỹ năng thất bại.');
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('learning-path-print-content');
    if (element) {
      const slug = roadmap ? `lp-${roadmap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'learning-path';
      html2pdf().set({
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `LearningPath_${slug}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }).from(element).save();
    }
  };

  const completionRate = roadmap ? Math.round(roadmap.completion_rate) : 0;

  const getParsedCourses = (goal) => {
    try { return JSON.parse(goal.suggested_courses) || []; }
    catch { return []; }
  };

  return (
    <DashboardLayout>
      <div className="lp-page">

        {/* ── TARGET MODAL ── */}
        {showTargetModal && (
          <div className="lp-modal-overlay" onClick={() => setShowTargetModal(false)}>
            <div className="lp-modal" onClick={e => e.stopPropagation()}>
              <div className="lp-modal-header">
                <div className="lp-modal-title">
                  <FaBullseye style={{ color: 'var(--primary-color, #3b5bdb)', marginRight: 8 }} />
                  Chọn mục tiêu nghề nghiệp
                </div>
                <button className="lp-modal-close" onClick={() => setShowTargetModal(false)}><FaXmark /></button>
              </div>
              <p className="lp-modal-sub">AI sẽ tạo lộ trình học tập cá nhân hoá dựa trên mục tiêu bạn chọn và kỹ năng hiện tại.</p>
              <div className="lp-target-grid">
                {CAREER_TARGETS.map(t => (
                  <button key={t} className={`lp-target-btn ${selectedTarget === t ? 'selected' : ''}`} onClick={() => { setSelectedTarget(t); setCustomTarget(''); }}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="lp-modal-divider">hoặc nhập thủ công</div>
              <input
                className="lp-custom-target-input"
                placeholder="Ví dụ: Senior iOS Developer..."
                value={customTarget}
                onChange={e => { setCustomTarget(e.target.value); setSelectedTarget(''); }}
              />
              <div className="lp-modal-actions">
                <button className="lp-modal-cancel" onClick={() => setShowTargetModal(false)}>Huỷ</button>
                <button
                  className="lp-modal-confirm"
                  onClick={handleGenerateRoadmap}
                  disabled={!selectedTarget && !customTarget.trim()}
                >
                  <FaWandMagicSparkles style={{ marginRight: 6 }} />
                  Tạo lộ trình AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM MODAL ── */}
        {showDeleteConfirm && (
          <div className="lp-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="lp-modal lp-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="lp-modal-header">
                <div className="lp-modal-title" style={{ color: '#ef4444' }}>
                  <FaTrash style={{ marginRight: 8 }} /> Xoá lộ trình hiện tại?
                </div>
              </div>
              <p className="lp-modal-sub">Thao tác này sẽ xoá vĩnh viễn lộ trình <strong>"{roadmap?.title}"</strong> và toàn bộ tiến độ của bạn. Sau đó bạn có thể tạo lộ trình mới với mục tiêu khác.</p>
              <div className="lp-modal-actions">
                <button className="lp-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>Huỷ</button>
                <button className="lp-modal-delete" onClick={handleDeleteRoadmap}>
                  <FaTrash style={{ marginRight: 6 }} /> Xoá lộ trình
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONGRATULATIONS MODAL ── */}
        {showCongratsModal && (
          <div className="lp-modal-overlay" onClick={() => setShowCongratsModal(false)}>
            <div className="lp-modal lp-modal-sm" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color, #3b5bdb)', marginBottom: '12px' }}>
                Chúc mừng!
              </h2>
              <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '24px', lineHeight: '1.5' }}>
                Bạn đã hoàn thành xuất sắc toàn bộ Lộ trình học tập! Giờ đây bạn đã sẵn sàng cho bước tiến mới trong sự nghiệp.<br /><br />
                Đừng quên bấm <strong>"Cập nhật CV ngay"</strong> để đồng bộ các kỹ năng mới vào hồ sơ nhé!
              </p>
              <button
                className="lp-btn-primary"
                style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onClick={() => {
                  setShowCongratsModal(false);
                  handleSyncSkills(); // Tự động đồng bộ luôn cũng được, hoặc để user tự bấm
                }}
              >
                Tuyệt vời! Đồng bộ CV ngay
              </button>
            </div>
          </div>
        )}

        {/* ── HERO CARD ── */}
        <div className="lp-hero-card">
          <div className="lp-hero-body">
            <div className="lp-hero-badge">
              <FaWandMagicSparkles style={{ fontSize: '14px', marginRight: '6px' }} />
              LỘ TRÌNH AI CÁ NHÂN HÓA
            </div>
            <h1 className="lp-hero-title">
              Mục tiêu: <span>{loading ? 'Đang tải...' : roadmap ? roadmap.title : 'Chưa có lộ trình'}</span>
            </h1>
            <p className="lp-hero-sub">
              {roadmap
                ? `Hành trình ${roadmap.total_months} tháng được thiết kế riêng để bạn chinh phục các kỹ năng còn thiếu và bứt phá sự nghiệp.`
                : 'Hãy tạo lộ trình học tập AI cá nhân hoá dựa trên kỹ năng và mục tiêu nghề nghiệp của bạn.'}
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn-primary" disabled={!roadmap} onClick={handleDownloadPDF}>
                <FaDownload style={{ marginRight: '6px' }} /> Xuất lộ trình PDF
              </button>
              {roadmap ? (
                <button className="lp-btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                  <FaTrash style={{ marginRight: '6px' }} /> Xoá & Tạo lại
                </button>
              ) : (
                <button className="lp-btn-outline" onClick={() => setShowTargetModal(true)} disabled={generating}>
                  <FaWandMagicSparkles style={{ marginRight: '6px' }} />
                  {generating ? 'Đang tạo...' : 'Tạo lộ trình AI'}
                </button>
              )}
            </div>
          </div>
          <div className="lp-hero-progress">
            <div className="lp-circle-wrap">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary-color, #3b5bdb)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42 * (completionRate / 100)} ${2 * Math.PI * 42}`}
                  transform="rotate(-90 50 50)" />
              </svg>
              <div className="lp-circle-inner">
                <span className="lp-circle-pct">{completionRate}%</span>
                <span className="lp-circle-label">HOÀN TẤT</span>
              </div>
            </div>
            <div className="lp-hero-badge-bottom">
              {roadmap ? `${roadmap.total_months} tháng học tập` : 'Chưa có lộ trình'}
            </div>
          </div>
        </div>

        {/* ── PRINT CONTENT CONTAINER ── */}
        <div id="learning-path-print-content">
          {/* ── JOURNEY TIMELINE ── */}
          <div className="lp-journey-card">
            <div className="lp-journey-header">
              <div className="lp-journey-header-left">
                <div className="lp-journey-icon">
                  <FaRoute style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '18px' }} />
                </div>
                <div>
                  <h2 className="lp-journey-title">Hành trình chinh phục</h2>
                  <p className="lp-journey-sub">Nhấn vào từng tháng để xem chi tiết nội dung học và đánh dấu tiến độ</p>
                </div>
              </div>
              <div className="lp-journey-date">
                <FaCalendarDay style={{ marginRight: '6px' }} />
                {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="lp-timeline">
              {loading ? (
                <div className="lp-timeline-empty">Đang tải lộ trình...</div>
              ) : roadmap?.goals?.length > 0 ? (
                roadmap.goals.map((g, idx) => {
                  const parsedCourses = getParsedCourses(g);
                  const isExpanded = expandedGoal === g.goal_id;
                  const dotClass = g.status === 'completed' ? 'done' : g.status === 'in_progress' ? 'active' : 'upcoming';
                  const isLocked = idx > 0 && roadmap.goals[idx - 1].status !== 'completed';
                  return (
                    <React.Fragment key={g.goal_id || idx}>
                      <div className="lp-timeline-step-wrapper">
                        <div
                          className={`lp-timeline-step ${isExpanded ? 'expanded' : ''} ${isLocked ? 'locked' : ''}`}
                          onClick={() => {
                            if (isLocked) {
                              alert('🔒 Vui lòng hoàn thành lộ trình tháng trước để mở khóa tháng này!');
                              return;
                            }
                            setExpandedGoal(isExpanded ? null : g.goal_id);
                          }}
                          style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.6 : 1 }}
                        >
                          <div className={`lp-timeline-dot ${dotClass}`}>
                            {g.status === 'completed' ? <FaCheck style={{ color: 'white', fontSize: '14px' }} /> :
                              g.status === 'in_progress' ? <FaBolt style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '14px' }} /> :
                                <FaLock style={{ color: '#d1d5db', fontSize: '12px' }} />}
                          </div>
                          <p className={`lp-step-month ${dotClass !== 'upcoming' ? 'active-label' : ''}`}>
                            THÁNG {g.target_month}
                          </p>
                          <p className={`lp-step-name ${dotClass !== 'upcoming' ? 'active-label' : ''}`}>
                            {g.skill_name || 'Kỹ năng mới'}
                          </p>
                          <p className="lp-step-desc">{parsedCourses.length} khóa học</p>
                          <div className="lp-step-expand-icon">
                            {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                          </div>
                        </div>

                        {/* ── DETAIL PANEL ── */}
                        {isExpanded && (
                          <div className="lp-goal-detail">
                            <div className="lp-goal-detail-header">
                              <span className={`lp-goal-status-badge ${dotClass}`}>
                                {g.status === 'completed' ? '✅ Hoàn thành' :
                                  g.status === 'in_progress' ? '🔥 Đang học' : '🔒 Chưa mở khóa'}
                              </span>
                              <span className="lp-goal-progress">{g.progress_percentage || 0}% tiến độ</span>
                            </div>
                            <h4 className="lp-goal-detail-title">Nội dung học Tháng {g.target_month}: {g.skill_name}</h4>
                            <div className="lp-goal-courses">
                              {parsedCourses.length > 0 ? parsedCourses.map((c, ci) => (
                                <div key={ci} className={`lp-goal-course-item ${c.completed ? 'completed' : ''}`}>
                                  <div className="lp-goal-course-num-check">
                                    <input
                                      type="checkbox"
                                      checked={!!c.completed}
                                      onChange={(e) => { e.stopPropagation(); handleToggleCourse(g, ci); }}
                                      className="lp-course-checkbox"
                                    />
                                  </div>
                                  <div className="lp-goal-course-info">
                                    <p className={`lp-goal-course-name ${c.completed ? 'line-through-text' : ''}`}>{c.name}</p>
                                    <p className="lp-goal-course-platform">
                                      <span className="lp-platform-tag">{c.platform}</span>
                                    </p>
                                  </div>
                                  <button className="lp-goal-course-btn" onClick={() => window.open(`https://www.coursera.org/search?query=${encodeURIComponent(c.name)}`, '_blank')}>Học ngay →</button>
                                </div>
                              )) : (
                                <p style={{ color: '#9ca3af', fontSize: 14 }}>Chưa có khóa học cụ thể.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {idx < roadmap.goals.length - 1 && (
                        <div className="lp-timeline-connector"
                          style={{ background: g.status === 'completed' ? 'var(--primary-color, #3b5bdb)' : '#e5e7eb' }} />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="lp-timeline-empty">
                  <FaRoute style={{ fontSize: 32, color: '#d1d5db', marginBottom: 12 }} />
                  <p>Chưa có lộ trình cụ thể.</p>
                  <button className="lp-btn-outline" style={{ marginTop: 12 }} onClick={() => setShowTargetModal(true)}>
                    <FaWandMagicSparkles style={{ marginRight: 6 }} /> Tạo lộ trình AI ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── 2-COL ── */}
          <div className="lp-two-col">
            {/* LEFT – Courses */}
            <div className="lp-resources-section">
              <div className="lp-section-header">
                <div className="lp-section-header-left">
                  <FaBookOpen style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '18px' }} />
                  <h3 className="lp-section-title">
                    Tài nguyên học tập{roadmap ? ` — ${roadmap.total_months} tháng` : ''}
                  </h3>
                </div>
              </div>

              {courses.length > 0 ? (
                <div className="lp-courses-grid">
                  {courses.map(c => (
                    <div key={c.id} className={`lp-course-card ${c.completed ? 'completed' : ''}`}>
                      <div className="lp-course-card-top">
                        <div className="lp-course-icon">{c.completed ? <FaCheck style={{ color: 'var(--primary-color, #3b5bdb)' }} /> : c.icon}</div>
                        <span className={`lp-course-badge ${c.badgeClass}`}>{c.type}</span>
                      </div>
                      <div className="lp-course-month-tag">Tháng {c.goalMonth}</div>
                      <h4 className="lp-course-name">{c.title}</h4>
                      <p className="lp-course-desc">{c.desc}</p>
                      <div className="lp-course-meta">
                        <div className="lp-course-meta-item">
                          <FaClock style={{ marginRight: '6px' }} />{c.hours} GIỜ
                        </div>
                        <div className="lp-course-level">
                          <FaStar style={{ marginRight: '4px' }} />{c.level}
                        </div>
                      </div>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lp-course-btn"
                      >
                        Bắt đầu học ngay
                      </a>
                    </div>

                  ))}
                </div>
              ) : (
                <div className="lp-empty-courses">
                  <p>Chưa có tài nguyên học tập. Hãy tạo lộ trình AI để nhận gợi ý khóa học!</p>
                </div>
              )}

              {/* AI Insight */}
              <div className="lp-skill-gap-box">
                <h4 className="lp-skill-gap-title">
                  <FaWandMagicSparkles style={{ marginRight: 6, color: 'var(--primary-color, #3b5bdb)' }} />
                  Phân tích lộ trình bằng AI
                </h4>
                <p className="lp-skill-gap-desc">{aiInsight}</p>
                <button className="lp-skill-gap-link" onClick={generateAIInsight} disabled={generatingInsight || !roadmap}>
                  {generatingInsight ? 'Đang phân tích...' : 'Lấy gợi ý AI mới'}
                  <FaArrowRight style={{ marginLeft: '6px' }} />
                </button>
              </div>
            </div>

            {/* RIGHT – Sidebar */}
            <div className="lp-sidebar">
              <div className="lp-skill-card">
                <h3 className="lp-skill-card-title">
                  <FaChartSimple style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '16px' }} />
                  Phân tích kỹ năng
                </h3>
                <div className="lp-skill-rows">
                  {skills.length > 0 ? skills.map(s => (
                    <div key={s.name} className="lp-skill-row">
                      <div className="lp-skill-row-header">
                        <span className="lp-skill-row-name">{s.name}</span>
                        <span className="lp-skill-row-pct">{s.pct}%</span>
                      </div>
                      <div className="lp-skill-track">
                        <div className="lp-skill-fill" style={{ width: `${s.pct}%`, background: s.low ? '#e5e7eb' : 'var(--primary-color, #3b5bdb)' }} />
                      </div>
                    </div>
                  )) : (
                    <p style={{ color: '#9ca3af', fontSize: 13 }}>Chưa có dữ liệu kỹ năng.</p>
                  )}
                </div>

                <div className="lp-readiness">
                  <div className="lp-readiness-circle">
                    <svg width="110" height="110" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle cx="50" cy="50" r="44" fill="none" stroke="var(--primary-color, #3b5bdb)" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44 * (completionRate / 100)} ${2 * Math.PI * 44}`}
                        transform="rotate(-90 50 50)" />
                    </svg>
                    <div className="lp-readiness-inner">
                      <span className="lp-readiness-pct">{completionRate}%</span>
                      <span className="lp-readiness-sub">Sẵn sàng<br />nghề nghiệp</span>
                    </div>
                  </div>
                  <p className="lp-readiness-desc">
                    {roadmap
                      ? <>Lộ trình <span>{roadmap.title}</span> đang tiến triển tốt!</>
                      : 'Tạo lộ trình để bắt đầu theo dõi tiến độ.'}
                  </p>
                </div>
              </div>

              <div className="lp-sync-card">
                <div className="lp-sync-icon">
                  <FaFileArrowUp style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <h3 className="lp-sync-title">Đồng bộ kỹ năng vào CV</h3>
                <p className="lp-sync-desc">Tự động cập nhật các chứng chỉ và kỹ năng mới vào hồ sơ chuyên môn của bạn.</p>
                <button className="lp-sync-btn" onClick={handleSyncSkills}>Cập nhật CV ngay</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
