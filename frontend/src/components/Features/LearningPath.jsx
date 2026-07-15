import React, { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import './LearningPath.css';
import html2pdf from 'html2pdf.js';

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
    'udemy': `https://www.udemy.com/courses/search/?q=${encodedTitle}`,
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

  // 3. Fallback
  return `https://www.coursera.org/search?query=${encodedTitle}`;
};

const CAREER_TARGETS = [
  'Senior Data Analyst', 'Data Scientist', 'Machine Learning Engineer',
  'Fullstack Developer', 'Backend Developer', 'Frontend Developer',
  'DevOps Engineer', 'Product Manager', 'Business Analyst',
  'UX/UI Designer', 'Cloud Architect', 'Cybersecurity Engineer',
];

// Helper to map courses consistently
const mapCourses = (goals) => {
  return (goals || []).flatMap((g, gi) => {
    let parsed = [];
    try { parsed = JSON.parse(g.suggested_courses) || []; } catch { parsed = []; }

    return parsed.map((c, ci) => {
      const rawType = c.type || 'course';
      let typeText = 'Khóa học';
      let badgeClass = 'lp-badge-course';
      let icon = 'fa-graduation-cap';

      if (rawType === 'article') {
        typeText = 'Tài liệu';
        badgeClass = 'lp-badge-article';
        icon = 'fa-book-open';
      } else if (rawType === 'video') {
        typeText = 'Video ngắn';
        badgeClass = 'lp-badge-video';
        icon = 'fa-circle-play';
      }

      const levelText = g.target_month === 1 ? 'CƠ BẢN' : g.target_month === 2 ? 'TRUNG CẤP' : 'NÂNG CAO';

      return {
        id: `${g.goal_id}-${ci}`,
        title: c.name,
        desc: c.platform,
        platform: c.platform,
        url: c.url || getPlatformUrl(c.platform, c.name),
        hours: rawType === 'course' ? 12 : rawType === 'video' ? 2 : 1,
        level: levelText,
        type: typeText,
        rawType: rawType,
        badgeClass,
        icon,
        goalMonth: g.target_month,
        completed: !!c.completed,
      };
    });
  });
};

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
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');

  // Diverse Resource Type & Bookmark States
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [bookmarks, setBookmarks] = useState([]);
  const [localNotes, setLocalNotes] = useState({});

  // Quiz Modal States
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizSkillName, setQuizSkillName] = useState('');
  const [quizMonth, setQuizMonth] = useState(1);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Custom Roadmap Form States
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customGoals, setCustomGoals] = useState([
    { target_month: 1, skill_name: '', courses: [{ name: '', platform: 'Udemy' }, { name: '', platform: 'Coursera' }] },
    { target_month: 2, skill_name: '', courses: [{ name: '', platform: 'Udemy' }, { name: '', platform: 'Coursera' }] },
    { target_month: 3, skill_name: '', courses: [{ name: '', platform: 'Udemy' }, { name: '', platform: 'Coursera' }] },
  ]);

  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('career_user'));
    return user ? user.user_id : 19;
  };

  const trackOutboundLinkClick = (courseTitle, platform) => {
    console.log(`[Event Tracking - outbound_click]: User clicked "Học ngay" for course "${courseTitle}" on ${platform}. Target: ${getPlatformUrl(platform, courseTitle)}`);
    try {
      const logs = JSON.parse(localStorage.getItem('career_outbound_clicks') || '[]');
      logs.push({
        courseTitle,
        platform,
        timestamp: new Date().toISOString(),
        userId: getUser(),
      });
      localStorage.setItem('career_outbound_clicks', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store outbound click log', e);
    }
  };

  const fetchBookmarks = (userId) => {
    fetch(`http://localhost:5000/api/bookmarks/${userId}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setBookmarks(json.data || []);
        }
      })
      .catch(console.error);
  };

  const fetchRoadmap = () => {
    const userId = getUser();
    setLoading(true);
    fetchBookmarks(userId);
    Promise.all([
      fetch(`http://localhost:5000/api/roadmap/${userId}`).then(r => r.json()),
      fetch(`http://localhost:5000/api/skills/${userId}`).then(r => r.json()),
    ])
      .then(([rmJson, skJson]) => {
        if (rmJson.success) {
          setRoadmap(rmJson.data);
          const mapped = mapCourses(rmJson.data.goals);
          setCourses(mapped);

          // Tự động kích hoạt tab của tháng đang học
          const activeGoal = (rmJson.data.goals || []).find(g => g.status === 'in_progress');
          if (activeGoal) {
            setSelectedMonthFilter(activeGoal.target_month);
          } else {
            setSelectedMonthFilter('all');
          }
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

  const handleCreateCustomRoadmap = async () => {
    if (!customTitle.trim()) { alert('Vui lòng nhập tên lộ trình!'); return; }

    // Kiểm tra các tháng có kỹ năng
    const validGoals = customGoals.filter(g => g.skill_name.trim());
    if (validGoals.length === 0) {
      alert('Vui lòng điền kỹ năng cho ít nhất một tháng!');
      return;
    }

    // Định dạng dữ liệu và loại bỏ khóa học trống
    const formattedGoals = validGoals.map((g, idx) => {
      const filteredCourses = g.courses.filter(c => c.name.trim());
      if (filteredCourses.length === 0) {
        filteredCourses.push({ name: `Tài liệu tự học ${g.skill_name}`, platform: 'YouTube' });
      }
      return {
        target_month: idx + 1,
        skill_name: g.skill_name.trim(),
        courses: filteredCourses
      };
    });

    setGenerating(true);
    setShowCustomModal(false);
    const userId = getUser();

    try {
      const res = await fetch('http://localhost:5000/api/roadmap/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: customTitle.trim(),
          total_months: formattedGoals.length,
          goals: formattedGoals
        })
      });
      const result = await res.json();
      if (result.success) {
        fetchRoadmap();
      } else {
        alert(result.message || 'Tạo lộ trình thất bại.');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối server.');
    }
    setGenerating(false);
    setCustomTitle('');
    setCustomGoals([
      { target_month: 1, skill_name: '', courses: [{ name: '', platform: 'Udemy' }, { name: '', platform: 'Coursera' }] },
      { target_month: 2, skill_name: '', courses: [{ name: '', platform: 'Udemy' }, { name: '', platform: 'Coursera' }] },
      { target_month: 3, skill_name: '', courses: [{ name: '', platform: 'Udemy' }, { name: '', platform: 'Coursera' }] },
    ]);
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

    // Calculate new goal progress
    const total = parsedCourses.length;
    const completedCount = parsedCourses.filter(c => c.completed).length;
    const pct = Math.round((completedCount / total) * 100);
    // Keep as in_progress if fully checked but not completed via Quiz
    const newStatus = pct >= 100 ? (goal.status === 'completed' ? 'completed' : 'in_progress') : (pct > 0 ? 'in_progress' : 'pending');

    // Optimistically update frontend state
    const goalsToUpdateInBackend = [];

    const updatedGoals = roadmap.goals.map(g => {
      if (g.goal_id === goal.goal_id) {
        const updatedG = {
          ...g,
          suggested_courses: JSON.stringify(parsedCourses),
          progress_percentage: pct,
          status: newStatus
        };
        goalsToUpdateInBackend.push(updatedG);
        return updatedG;
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

    const mapped = mapCourses(updatedGoals);
    setCourses(mapped);

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
      fetchRoadmap();
    }
  };

  const handleToggleCourseByTitle = (goalMonth, courseTitle) => {
    if (!roadmap || !roadmap.goals) return;
    const goal = roadmap.goals.find(g => g.target_month === goalMonth);
    if (!goal) return;
    let parsedCourses = [];
    try { parsedCourses = JSON.parse(goal.suggested_courses) || []; } catch { parsedCourses = []; }
    const courseIndex = parsedCourses.findIndex(c => c.name === courseTitle);
    if (courseIndex !== -1) {
      handleToggleCourse(goal, courseIndex);
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

  const handleToggleBookmark = async (c) => {
    const userId = getUser();
    try {
      const res = await fetch('http://localhost:5000/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: c.title,
          platform: c.platform,
          url: c.url,
          type: c.rawType
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchBookmarks(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNoteChange = (c, value) => {
    setLocalNotes(prev => ({
      ...prev,
      [c.title + '_' + c.platform]: value
    }));
  };

  const handleSaveNote = async (c) => {
    const key = c.title + '_' + c.platform;
    const noteText = localNotes[key] !== undefined ? localNotes[key] : c.note;
    const userId = getUser();
    try {
      const res = await fetch('http://localhost:5000/api/bookmarks/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: c.title,
          platform: c.platform,
          url: c.url,
          type: c.rawType,
          note: noteText
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchBookmarks(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartQuiz = async (goal) => {
    setQuizSkillName(goal.skill_name);
    setQuizMonth(goal.target_month);
    setQuizLoading(true);
    setShowQuizModal(true);
    setCurrentQuizQuestionIndex(0);
    setSelectedQuizAnswers({});
    setQuizResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_name: goal.skill_name,
          target_month: goal.target_month
        })
      });
      const json = await res.json();
      if (json.success && json.data.questions) {
        setQuizQuestions(json.data.questions);
      } else {
        alert(json.message || 'Không thể tạo câu hỏi Quiz.');
        setShowQuizModal(false);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối máy chủ để sinh Quiz.');
      setShowQuizModal(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.correct_index) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = scorePct >= 80;

    setQuizResult({
      score: correctCount,
      scorePct,
      passed
    });

    if (passed) {
      const userId = getUser();
      try {
        const res = await fetch('http://localhost:5000/api/quiz/unlock-skill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            skill_name: quizSkillName,
            target_month: quizMonth,
            score_pct: scorePct
          })
        });
        const json = await res.json();
        if (json.success) {
          fetchRoadmap();
        } else {
          alert(json.message);
        }
      } catch (e) {
        console.error(e);
      }
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

  const enrichedCourses = courses.map(c => {
    const bookmark = bookmarks.find(b => b.title === c.title && b.platform === c.platform);
    return {
      ...c,
      isBookmarked: bookmark ? !!bookmark.is_bookmarked : false,
      note: bookmark ? bookmark.note || '' : '',
    };
  });

  const filteredCourses = enrichedCourses.filter(c => {
    if (selectedMonthFilter === 'favorites') {
      if (!c.isBookmarked && !c.note.trim()) return false;
    } else if (selectedMonthFilter !== 'all') {
      if (c.goalMonth !== Number(selectedMonthFilter)) return false;
    }

    if (selectedResourceType !== 'all') {
      if (c.rawType !== selectedResourceType) return false;
    }

    return true;
  });

  return (
    <DashboardLayout>
      <div className="lp-page">

        {/* ── TARGET MODAL (AI) ── */}
        {showTargetModal && (
          <div className="lp-modal-overlay" onClick={() => setShowTargetModal(false)}>
            <div className="lp-modal" onClick={e => e.stopPropagation()}>
              <div className="lp-modal-header">
                <div className="lp-modal-title">
                  <i className="fa-solid fa-bullseye" style={{ color: 'var(--primary-color, #3b5bdb)', marginRight: 8 }}></i>
                  Chọn mục tiêu nghề nghiệp
                </div>
                <button className="lp-modal-close" onClick={() => setShowTargetModal(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
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
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }}></i>
                  Tạo lộ trình AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOM ROADMAP MODAL ── */}
        {showCustomModal && (
          <div className="lp-modal-overlay" onClick={() => setShowCustomModal(false)}>
            <div className="lp-modal lp-modal-lg" onClick={e => e.stopPropagation()}>
              <div className="lp-modal-header">
                <div className="lp-modal-title">
                  <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary-color, #3b5bdb)', marginRight: 8 }}></i>
                  Tự thiết kế lộ trình học tập
                </div>
                <button className="lp-modal-close" onClick={() => setShowCustomModal(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <p className="lp-modal-sub">Điền các kỹ năng và khóa học bạn muốn tự học trong 3 tháng tới. AI sẽ không can thiệp vào lộ trình này.</p>

              <div className="lp-custom-form-scroll">
                <div className="lp-form-group">
                  <label className="lp-form-label">Tên lộ trình học tập</label>
                  <input
                    className="lp-custom-target-input"
                    placeholder="Ví dụ: Lộ trình trở thành Senior React Developer..."
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                  />
                </div>

                {[1, 2, 3].map(monthNum => {
                  const goalIndex = monthNum - 1;
                  return (
                    <div key={monthNum} className="lp-form-month-section">
                      <h4 className="lp-form-month-title">Tháng {monthNum}</h4>

                      <div className="lp-form-group">
                        <label className="lp-form-label">Kỹ năng chính cần học</label>
                        <input
                          className="lp-custom-target-input"
                          placeholder="Ví dụ: Học React Core, Node.js API..."
                          value={customGoals[goalIndex].skill_name}
                          onChange={e => {
                            const newGoals = [...customGoals];
                            newGoals[goalIndex].skill_name = e.target.value;
                            setCustomGoals(newGoals);
                          }}
                        />
                      </div>

                      <div className="lp-form-courses-row">
                        <div className="lp-form-course-col">
                          <label className="lp-form-label-sub">Khóa Đề xuất (Khóa 1)</label>
                          <input
                            className="lp-custom-target-input lp-input-sm"
                            placeholder="Tên khóa học 1..."
                            value={customGoals[goalIndex].courses[0].name}
                            onChange={e => {
                              const newGoals = [...customGoals];
                              newGoals[goalIndex].courses[0].name = e.target.value;
                              setCustomGoals(newGoals);
                            }}
                          />
                          <select
                            className="lp-custom-select lp-select-sm"
                            value={customGoals[goalIndex].courses[0].platform}
                            onChange={e => {
                              const newGoals = [...customGoals];
                              newGoals[goalIndex].courses[0].platform = e.target.value;
                              setCustomGoals(newGoals);
                            }}
                          >
                            <option value="Udemy">Udemy</option>
                            <option value="Coursera">Coursera</option>
                            <option value="YouTube">YouTube</option>
                            <option value="freeCodeCamp">freeCodeCamp</option>
                          </select>
                        </div>

                        <div className="lp-form-course-col">
                          <label className="lp-form-label-sub">Khóa Thực tế (Khóa 2)</label>
                          <input
                            className="lp-custom-target-input lp-input-sm"
                            placeholder="Tên khóa học 2..."
                            value={customGoals[goalIndex].courses[1].name}
                            onChange={e => {
                              const newGoals = [...customGoals];
                              newGoals[goalIndex].courses[1].name = e.target.value;
                              setCustomGoals(newGoals);
                            }}
                          />
                          <select
                            className="lp-custom-select lp-select-sm"
                            value={customGoals[goalIndex].courses[1].platform}
                            onChange={e => {
                              const newGoals = [...customGoals];
                              newGoals[goalIndex].courses[1].platform = e.target.value;
                              setCustomGoals(newGoals);
                            }}
                          >
                            <option value="Coursera">Coursera</option>
                            <option value="Udemy">Udemy</option>
                            <option value="YouTube">YouTube</option>
                            <option value="freeCodeCamp">freeCodeCamp</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lp-modal-actions">
                <button className="lp-modal-cancel" onClick={() => setShowCustomModal(false)}>Huỷ</button>
                <button
                  className="lp-modal-confirm"
                  onClick={handleCreateCustomRoadmap}
                  disabled={!customTitle.trim()}
                >
                  <i className="fa-solid fa-check" style={{ marginRight: 6 }}></i>
                  Tạo lộ trình tự thiết kế
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
                  <i className="fa-solid fa-trash-can" style={{ marginRight: 8 }}></i> Xoá lộ trình hiện tại?
                </div>
              </div>
              <p className="lp-modal-sub">Bạn có chắc chắn muốn xóa lộ trình 3 tháng này không? Hành động này không thể hoàn tác.</p>
              <div className="lp-modal-actions">
                <button className="lp-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>Huỷ</button>
                <button className="lp-modal-delete" onClick={handleDeleteRoadmap}>
                  <i className="fa-solid fa-trash-can" style={{ marginRight: 6 }}></i> Xác nhận xóa
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
                  handleSyncSkills();
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
              <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '12px', marginRight: '6px' }}></i>
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
            <div className="lp-hero-actions" style={{ display: 'flex', gap: '10px' }}>
              <button className="lp-btn-primary" disabled={!roadmap} onClick={handleDownloadPDF}>
                <i className="fa-solid fa-file-pdf" style={{ marginRight: '6px' }}></i> Xuất lộ trình PDF
              </button>
              {!roadmap && (
                <>
                  <button className="lp-btn-outline" onClick={() => setShowTargetModal(true)} disabled={generating}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '6px' }}></i>
                    {generating ? 'Đang tạo...' : 'Tạo lộ trình AI'}
                  </button>
                  <button className="lp-btn-outline" onClick={() => setShowCustomModal(true)} disabled={generating}>
                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i>
                    Tự thiết kế lộ trình
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="lp-hero-progress">
            <div className="lp-circle-wrap">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={completionRate > 0 ? "var(--primary-color, #3b5bdb)" : "transparent"}
                  strokeWidth="10" strokeLinecap="round"
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
                  <i className="fa-solid fa-route" style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '18px' }}></i>
                </div>
                <div>
                  <h2 className="lp-journey-title">Hành trình chinh phục</h2>
                  <p className="lp-journey-sub">Nhấn vào từng tháng để xem chi tiết nội dung học và đánh dấu tiến độ</p>
                </div>
              </div>
              <div className="lp-journey-date">
                <i className="fa-solid fa-calendar-day" style={{ marginRight: '6px' }}></i>
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
                              alert('Vui lòng hoàn thành lộ trình tháng trước để mở khóa tháng này!');
                              return;
                            }
                            setExpandedGoal(isExpanded ? null : g.goal_id);
                          }}
                          style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.6 : 1 }}
                        >
                          <div className={`lp-timeline-dot ${dotClass}`}>
                            {g.status === 'completed' ? <i className="fa-solid fa-check" style={{ color: 'white', fontSize: '14px' }}></i> :
                              g.status === 'in_progress' ? <i className="fa-solid fa-bolt" style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '14px' }}></i> :
                                <i className="fa-solid fa-lock" style={{ color: '#d1d5db', fontSize: '12px' }}></i>}
                          </div>
                          <p className={`lp-step-month ${dotClass !== 'upcoming' ? 'active-label' : ''}`}>
                            THÁNG {g.target_month}
                          </p>
                          <p className={`lp-step-name ${dotClass !== 'upcoming' ? 'active-label' : ''}`}>
                            {g.skill_name || 'Kỹ năng mới'}
                          </p>
                          <p className="lp-step-desc">{parsedCourses.length} khóa học</p>
                          <div className="lp-step-expand-icon">
                            {isExpanded ? <i className="fa-solid fa-chevron-up" style={{ fontSize: '10px' }}></i> : <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px' }}></i>}
                          </div>
                        </div>
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
                  <i className="fa-solid fa-route" style={{ fontSize: 32, color: '#d1d5db', marginBottom: 12 }}></i>
                  <p>Chưa có lộ trình cụ thể.</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button className="lp-btn-outline" onClick={() => setShowTargetModal(true)}>
                      <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }}></i> Tạo lộ trình AI ngay
                    </button>
                    <button className="lp-btn-outline" onClick={() => setShowCustomModal(true)}>
                      <i className="fa-solid fa-pen-to-square" style={{ marginRight: 6 }}></i> Tự thiết kế lộ trình
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DETAIL PANEL - RENDERED FULL WIDTH UNDER TIMELINE ROW */}
            {roadmap?.goals?.map(g => {
              if (expandedGoal !== g.goal_id) return null;
              const parsedCourses = getParsedCourses(g);
              const dotClass = g.status === 'completed' ? 'done' : g.status === 'in_progress' ? 'active' : 'upcoming';
              return (
                <div key={`detail-${g.goal_id}`} className="lp-goal-detail">
                  <div className="lp-goal-detail-header">
                    <span className={`lp-goal-status-badge ${dotClass}`}>
                      {g.status === 'completed' ? 'Hoàn thành' :
                        g.status === 'in_progress' ? 'Đang học' : 'Chưa mở khóa'}
                    </span>
                    <span className="lp-goal-progress">{g.progress_percentage || 0}% tiến độ</span>
                  </div>
                  <h4 className="lp-goal-detail-title">Nội dung học Tháng {g.target_month}: {g.skill_name}</h4>
                  <div className="lp-goal-courses">
                    {parsedCourses.length > 0 ? parsedCourses.map((c, ci) => {
                      return (
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
                              <span className="lp-type-tag-sub" style={{ marginLeft: 8, fontSize: 11, color: '#6b7280' }}>
                                ({c.type === 'video' ? 'Video ngắn' : c.type === 'article' ? 'Bài viết/Tài liệu' : 'Khóa học'})
                              </span>
                            </p>
                          </div>
                          <button
                            className="lp-goal-course-btn"
                            onClick={() => {
                              trackOutboundLinkClick(c.name, c.platform);
                              window.open(c.url || getPlatformUrl(c.platform, c.name), '_blank');
                            }}
                          >
                            Học ngay →
                          </button>
                        </div>
                      );
                    }) : (
                      <p style={{ color: '#9ca3af', fontSize: 14 }}>Chưa có tài nguyên cụ thể.</p>
                    )}
                  </div>

                  {/* Banner Quiz Đánh giá */}
                  <div className="lp-goal-quiz-section">
                    {g.status === 'completed' ? (
                      <div className="lp-quiz-unlocked-banner">
                        <div className="lp-quiz-banner-icon">🎉</div>
                        <div className="lp-quiz-banner-info">
                          <p className="lp-quiz-banner-title">Kỹ năng "{g.skill_name}" đã được mở khóa!</p>
                          <p className="lp-quiz-banner-desc">Bạn đã hoàn thành bài đánh giá kiến thức và được xác nhận năng lực.</p>
                        </div>
                        <button className="lp-btn-outline lp-btn-sm" onClick={() => handleStartQuiz(g)}>
                          <i className="fa-solid fa-rotate-left"></i> Làm lại Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="lp-quiz-locked-banner">
                        <div className="lp-quiz-banner-icon">
                          <i className="fa-solid fa-award" style={{ color: 'var(--primary-color, #3b5bdb)' }}></i>
                        </div>
                        <div className="lp-quiz-banner-info">
                          <p className="lp-quiz-banner-title">Mở khóa kỹ năng "{g.skill_name}"</p>
                          <p className="lp-quiz-banner-desc">
                            {g.progress_percentage >= 100
                              ? "Bạn đã hoàn tất học tập! Hãy làm bài trắc nghiệm ngắn (5 câu, đạt từ 80%) để xác minh năng lực."
                              : "Hoàn thành 100% tài nguyên của tháng để tham gia làm bài đánh giá mở khóa kỹ năng."}
                          </p>
                        </div>
                        <button
                          className="lp-btn-primary lp-btn-sm"
                          disabled={g.progress_percentage < 100}
                          onClick={() => handleStartQuiz(g)}
                        >
                          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }}></i>
                          Làm Quiz mở khóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 2-COL ── */}
          <div className="lp-two-col">
            {/* LEFT – Courses */}
            <div className="lp-resources-section">
              <div className="lp-section-header">
                <div className="lp-section-header-left">
                  <i className="fa-solid fa-book-open" style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '18px' }}></i>
                  <h3 className="lp-section-title">
                    Tài nguyên học tập{roadmap ? ` — ${roadmap.total_months} tháng` : ''}
                  </h3>
                </div>
              </div>

              {roadmap && (
                <>
                  <div className="lp-month-tabs">
                    {roadmap.goals?.map(g => {
                      const isActive = g.status === 'in_progress';
                      const isCompleted = g.status === 'completed';
                      let statusText = 'Chưa học';
                      let statusClass = 'pending';
                      if (isCompleted) {
                        statusText = 'Hoàn thành';
                        statusClass = 'done';
                      } else if (isActive) {
                        statusText = 'Đang học';
                        statusClass = 'active';
                      }
                      return (
                        <button
                          key={g.target_month}
                          className={`lp-month-tab ${selectedMonthFilter === g.target_month ? 'active' : ''}`}
                          onClick={() => setSelectedMonthFilter(g.target_month)}
                        >
                          Tháng {g.target_month}
                          <span className={`lp-tab-status ${statusClass}`}>{statusText}</span>
                        </button>
                      );
                    })}
                    <button
                      className={`lp-month-tab ${selectedMonthFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedMonthFilter('all')}
                    >
                      Tất cả tháng
                    </button>
                    <button
                      className={`lp-month-tab lp-month-tab-favorites ${selectedMonthFilter === 'favorites' ? 'active' : ''}`}
                      onClick={() => setSelectedMonthFilter('favorites')}
                    >
                      ⭐ Tài liệu yêu thích
                    </button>
                  </div>

                  {/* Bộ lọc loại tài nguyên */}
                  <div className="lp-resource-type-tabs">
                    <button
                      className={`lp-type-tab ${selectedResourceType === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedResourceType('all')}
                    >
                      Tất cả tài nguyên
                    </button>
                    <button
                      className={`lp-type-tab lp-type-tab-course ${selectedResourceType === 'course' ? 'active' : ''}`}
                      onClick={() => setSelectedResourceType('course')}
                    >
                      <i className="fa-solid fa-graduation-cap"></i> Khóa học
                    </button>
                    <button
                      className={`lp-type-tab lp-type-tab-article ${selectedResourceType === 'article' ? 'active' : ''}`}
                      onClick={() => setSelectedResourceType('article')}
                    >
                      <i className="fa-solid fa-book-open"></i> Bài viết & Tài liệu
                    </button>
                    <button
                      className={`lp-type-tab lp-type-tab-video ${selectedResourceType === 'video' ? 'active' : ''}`}
                      onClick={() => setSelectedResourceType('video')}
                    >
                      <i className="fa-solid fa-circle-play"></i> Video ngắn
                    </button>
                  </div>
                </>
              )}

              {filteredCourses.length > 0 ? (
                <div className="lp-courses-grid">
                  {filteredCourses.map(c => (
                    <div key={c.id} className={`lp-course-card ${c.completed ? 'completed' : ''}`}>
                      <div className="lp-course-card-top">
                        <div className="lp-course-icon">
                          {c.completed ? (
                            <i className="fa-solid fa-check" style={{ color: 'var(--primary-color, #3b5bdb)' }}></i>
                          ) : (
                            <i className={`fa-solid ${c.icon}`}></i>
                          )}
                        </div>
                        <span className={`lp-course-badge ${c.badgeClass}`}>
                          {c.type}
                        </span>
                        <button
                          className={`lp-course-bookmark-btn ${c.isBookmarked ? 'bookmarked' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleToggleBookmark(c); }}
                          title={c.isBookmarked ? "Xóa khỏi tài liệu yêu thích" : "Lưu vào tài liệu yêu thích"}
                        >
                          <i className={c.isBookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
                        </button>
                      </div>
                      <div className="lp-course-month-tag">Tháng {c.goalMonth}</div>
                      <h4 className="lp-course-name">{c.title}</h4>
                      <div className="lp-course-meta">
                        <span className="lp-meta-tag lp-platform-badge">{c.platform}</span>
                        <span className="lp-meta-tag lp-duration-badge">
                          <i className="fa-regular fa-clock" style={{ marginRight: '4px' }}></i> {c.hours} giờ
                        </span>
                        <span className="lp-meta-tag lp-level-badge">
                          <i className="fa-regular fa-star" style={{ marginRight: '4px' }}></i> {c.level}
                        </span>
                      </div>
                      <div className="lp-course-card-actions">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lp-course-btn"
                          onClick={() => trackOutboundLinkClick(c.title, c.platform)}
                        >
                          Bắt đầu học ngay <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft: '4px', fontSize: '11px' }}></i>
                        </a>
                        <button
                          className={`lp-course-complete-btn ${c.completed ? 'completed' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCourseByTitle(c.goalMonth, c.title);
                          }}
                        >
                          {c.completed ? (
                            <>
                              <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i> Đã hoàn thành
                            </>
                          ) : (
                            <>
                              <i className="fa-regular fa-circle" style={{ marginRight: '6px' }}></i> Đánh dấu hoàn thành
                            </>
                          )}
                        </button>
                      </div>

                      {/* Hộp Ghi chú nhanh */}
                      <div className="lp-course-note-box">
                        <div className="lp-note-header">
                          <i className="fa-solid fa-pen-to-square"></i> Ghi chú nhanh
                        </div>
                        <textarea
                          className="lp-note-textarea"
                          placeholder="Ghi lại kiến thức quan trọng ở đây..."
                          value={localNotes[c.title + '_' + c.platform] !== undefined ? localNotes[c.title + '_' + c.platform] : c.note || ''}
                          onChange={(e) => handleNoteChange(c, e.target.value)}
                          onBlur={() => handleSaveNote(c)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="lp-empty-courses">
                  <p>Chưa có tài nguyên học tập phù hợp với bộ lọc hiện tại. Hãy kiểm tra lại hoặc tạo lộ trình học tập mới!</p>
                </div>
              )}

              {/* AI Insight */}
              <div className="lp-skill-gap-box">
                <h4 className="lp-skill-gap-title">
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6, color: 'var(--primary-color, #3b5bdb)' }}></i>
                  Phân tích lộ trình bằng AI
                </h4>
                <p className="lp-skill-gap-desc">{aiInsight}</p>
                <button className="lp-skill-gap-link" onClick={generateAIInsight} disabled={generatingInsight || !roadmap}>
                  {generatingInsight ? 'Đang phân tích...' : 'Lấy gợi ý AI mới'}
                  <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
                </button>
              </div>

              {/* ── DANGER ZONE ── */}
              {roadmap && (
                <div className="lp-danger-zone">
                  <div className="lp-danger-zone-header">
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444', marginRight: '8px', fontSize: '18px' }}></i>
                    <h4 className="lp-danger-zone-title">Vùng nguy hiểm</h4>
                  </div>
                  <p className="lp-danger-zone-desc">
                    Hành động này sẽ xóa vĩnh viễn lộ trình <strong>"{roadmap.title}"</strong> hiện tại và toàn bộ tiến độ.
                  </p>
                  <button className="lp-btn-danger-subtle" onClick={() => setShowDeleteConfirm(true)}>
                    <i className="fa-solid fa-trash-can" style={{ marginRight: '6px' }}></i> Xoá & tạo lộ trình mới
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT – Sidebar */}
            <div className="lp-sidebar">
              <div className="lp-skill-card">
                <h3 className="lp-skill-card-title">
                  <i className="fa-solid fa-chart-simple" style={{ color: 'var(--primary-color, #3b5bdb)', fontSize: '16px' }}></i>
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
                    <p style={{ color: '#9ca3af', fontSize: 13, margin: '10px 0', lineHeight: '1.5' }}>
                      Chưa có dữ liệu kỹ năng. Hãy hoàn thành bài test nhanh hoặc bắt đầu lộ trình học dưới đây để kích hoạt phân tích kỹ năng.
                    </p>
                  )}
                </div>

                <div className="lp-readiness">
                  <div className="lp-readiness-circle">
                    <svg width="110" height="110" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                      <circle cx="50" cy="50" r="44" fill="none"
                        stroke={completionRate > 0 ? "var(--primary-color, #3b5bdb)" : "transparent"}
                        strokeWidth="12" strokeLinecap="round"
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
                  <i className="fa-solid fa-file-arrow-up" style={{ color: 'white', fontSize: '20px' }}></i>
                </div>
                <h3 className="lp-sync-title">Đồng bộ kỹ năng vào CV</h3>
                <p className="lp-sync-desc">Tự động cập nhật các chứng chỉ và kỹ năng mới vào hồ sơ chuyên môn của bạn.</p>
                {skills.length === 0 ? (
                  <p className="lp-sync-notice-text">
                    Hãy hoàn thành bài test nhanh hoặc bắt đầu lộ trình học dưới đây để kích hoạt phân tích kỹ năng.
                  </p>
                ) : (
                  <button
                    className="lp-sync-btn"
                    onClick={handleSyncSkills}
                    disabled={completionRate === 0}
                    style={completionRate === 0 ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                  >
                    {completionRate === 0 ? 'Bắt đầu học để tích lũy kỹ năng' : 'Cập nhật CV ngay'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>



        {/* ── QUIZ ASSESSMENT MODAL ── */}
        {showQuizModal && (
          <div className="lp-modal-overlay" onClick={() => setShowQuizModal(false)}>
            <div className="lp-modal lp-modal-quiz" onClick={e => e.stopPropagation()}>
              <div className="lp-modal-header">
                <div className="lp-modal-title">
                  <i className="fa-solid fa-circle-question" style={{ color: 'var(--primary-color, #3b5bdb)', marginRight: 8 }}></i>
                  Đánh giá năng lực: {quizSkillName} (Tháng {quizMonth})
                </div>
                <button className="lp-modal-close" onClick={() => setShowQuizModal(false)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {quizLoading ? (
                <div className="lp-quiz-loading">
                  <div className="lp-spinner"></div>
                  <p>AI đang biên soạn câu hỏi kiểm tra kiến thức...</p>
                </div>
              ) : quizResult ? (
                <div className="lp-quiz-result-screen">
                  {quizResult.passed ? (
                    <div className="lp-result-success">
                      <div className="lp-result-badge">🎉</div>
                      <h3 className="lp-result-title">Chúc mừng! Bạn đã vượt qua bài đánh giá!</h3>
                      <p className="lp-result-score">Kết quả: <strong>{quizResult.score}/5 câu đúng</strong> ({quizResult.scorePct}%)</p>
                      <p className="lp-result-desc">
                        Kỹ năng <strong>"{quizSkillName}"</strong> của bạn đã được chính thức mở khóa và lưu vào hồ sơ năng lực.
                      </p>
                      <button className="lp-btn-primary" style={{ margin: '20px auto 0 auto' }} onClick={() => setShowQuizModal(false)}>
                        Tuyệt vời
                      </button>
                    </div>
                  ) : (
                    <div className="lp-result-fail">
                      <div className="lp-result-badge fail">😢</div>
                      <h3 className="lp-result-title">Rất tiếc, bạn chưa vượt qua bài đánh giá!</h3>
                      <p className="lp-result-score">Kết quả: <strong>{quizResult.score}/5 câu đúng</strong> ({quizResult.scorePct}%)</p>
                      <p className="lp-result-desc">
                        Bạn cần đạt ít nhất 80% (4/5 câu đúng) để mở khóa kỹ năng này. Hãy ôn lại tài nguyên và thử lại nhé!
                      </p>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
                        <button className="lp-btn-outline" onClick={() => setShowQuizModal(false)}>Huỷ</button>
                        <button className="lp-btn-primary" onClick={() => handleStartQuiz({ skill_name: quizSkillName, target_month: quizMonth })}>
                          Làm lại Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="lp-quiz-question-screen">
                  <div className="lp-quiz-progress-bar">
                    <div className="lp-quiz-progress-fill" style={{ width: `${((currentQuizQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
                  </div>
                  <div className="lp-quiz-meta">
                    <span>Câu hỏi {currentQuizQuestionIndex + 1} / {quizQuestions.length}</span>
                  </div>

                  {quizQuestions[currentQuizQuestionIndex] && (
                    <div className="lp-quiz-question-body">
                      <h4 className="lp-quiz-question-text">{quizQuestions[currentQuizQuestionIndex].question}</h4>
                      <div className="lp-quiz-options">
                        {quizQuestions[currentQuizQuestionIndex].options.map((opt, oIdx) => {
                          const isSelected = selectedQuizAnswers[currentQuizQuestionIndex] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              className={`lp-quiz-option-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedQuizAnswers({
                                  ...selectedQuizAnswers,
                                  [currentQuizQuestionIndex]: oIdx
                                });
                              }}
                            >
                              <span className="lp-option-letter">{['A', 'B', 'C', 'D'][oIdx]}.</span> {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="lp-quiz-navigation">
                    <button
                      className="lp-btn-outline lp-btn-sm"
                      disabled={currentQuizQuestionIndex === 0}
                      onClick={() => setCurrentQuizQuestionIndex(currentQuizQuestionIndex - 1)}
                    >
                      ← Câu trước
                    </button>

                    {currentQuizQuestionIndex < quizQuestions.length - 1 ? (
                      <button
                        className="lp-btn-primary lp-btn-sm"
                        disabled={selectedQuizAnswers[currentQuizQuestionIndex] === undefined}
                        onClick={() => setCurrentQuizQuestionIndex(currentQuizQuestionIndex + 1)}
                      >
                        Câu tiếp theo →
                      </button>
                    ) : (
                      <button
                        className="lp-btn-primary lp-btn-sm btn-submit-quiz"
                        disabled={Object.keys(selectedQuizAnswers).length < quizQuestions.length}
                        onClick={handleSubmitQuiz}
                      >
                        <i className="fa-solid fa-check-double"></i> Nộp bài
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
