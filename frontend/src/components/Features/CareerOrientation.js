import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../DashboardLogged/DashboardLayout';
import Topbar from '../DashboardLogged/Topbar';
import './CareerOrientation.css';

// SVG Icons
const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="co-section-icon">
    <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2"/>
  </svg>
);

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const IconCloud = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
  </svg>
);

const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="co-section-icon">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const IconSwap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <path d="M7 23l-4-4 4-4"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const IconMessage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconVerify = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconLightbulb = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6m-3-15a7 7 0 0 1 7 7c0 2.5-2 4.85-3 6h-8c-1-1.15-3-3.5-3-6a7 7 0 0 1 7-7z"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
  </svg>
);

export default function CareerOrientation() {
  const [activeTab, setActiveTab] = useState('side-by-side');
  const [compareIndex, setCompareIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  // Suggested careers data
  const careers = [
    {
      title: "Senior Data Analyst",
      match: 94,
      level: "Rất cao",
      levelClass: "green",
      desc: "Phân tích dữ liệu kinh doanh & dự báo thị trường",
      skills: ["Python", "PowerBI", "SQL"],
      badge: "AI gợi ý",
      badgeClass: "blue",
      icon: <IconChart />,
      iconClass: "blue"
    },
    {
      title: "Product Owner",
      match: 87,
      level: "Cao",
      levelClass: "blue",
      desc: "Quản lý vòng đời sản phẩm số & UX Strategy",
      skills: ["Agile", "Scrum", "Strategy"],
      badge: "Hot Trend",
      badgeClass: "green",
      icon: <IconBriefcase />,
      iconClass: "green"
    },
    {
      title: "Cloud Solutions Architect",
      match: 82,
      level: "Trung bình",
      levelClass: "orange",
      desc: "Thiết kế hạ tầng điện toán đám mây cho doanh nghiệp",
      skills: ["AWS", "Docker", "K8s"],
      badge: null,
      icon: <IconCloud />,
      iconClass: "purple"
    }
  ];

  // Comparison role options (toggled with the Swap button)
  const comparisonPairs = [
    {
      left: {
        title: "Data Analyst",
        badge: "Top Choice",
        badgeClass: "blue",
        skills: ["Phân tích", "Excel", "Thống kê"],
        salary: "15M - 35M",
        potential: 8.5,
        pct: 85,
        colorClass: "blue"
      },
      right: {
        title: "Business Analyst",
        badge: "Strategic",
        badgeClass: "green",
        skills: ["Giao tiếp", "Agile", "UML"],
        salary: "18M - 40M",
        potential: 7.8,
        pct: 78,
        colorClass: "teal"
      }
    },
    {
      left: {
        title: "Data Engineer",
        badge: "Hot Growth",
        badgeClass: "blue",
        skills: ["Python", "Spark", "Hadoop"],
        salary: "22M - 45M",
        potential: 9.0,
        pct: 90,
        colorClass: "blue"
      },
      right: {
        title: "Cloud Architect",
        badge: "High Demand",
        badgeClass: "green",
        skills: ["AWS", "Docker", "Terraform"],
        salary: "30M - 60M",
        potential: 9.2,
        pct: 92,
        colorClass: "teal"
      }
    }
  ];

  const currentPair = comparisonPairs[compareIndex];

  // VN Market Trends
  const trends = [
    { num: "01", name: "Generative AI", change: "+ 24%" },
    { num: "02", name: "Cloud Native", change: "+ 18%" },
    { num: "03", name: "Cyber Security", change: "+ 15%" }
  ];

  // Chat message simulation state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Tuyệt vời! Tôi đã xem qua CV của bạn. Với nền tảng Toán học siêu "đỉnh" này, bạn đang có lợi thế cực lớn đấy! Bạn muốn tôi tư vấn sâu hơn về Data Analyst hay vị trí nào khác không?'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Tôi đang phân vân giữa Data Analyst và Business Analyst. Vị trí nào sẽ khai thác tốt nhất kỹ năng Python của tôi?'
    },
    {
      id: 3,
      sender: 'assistant',
      isAnalyzing: true
    }
  ]);

  // Handle auto-completion of the initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev => prev.map(m => m.isAnalyzing ? {
        id: 3,
        sender: 'assistant',
        text: 'Cả hai vai trò đều rất tiềm năng! Tuy nhiên, Data Analyst sẽ khai thác kỹ năng Python của bạn chuyên sâu hơn. Bạn sẽ sử dụng Python hàng ngày để xử lý dữ liệu (Pandas, NumPy), xây dựng mô hình dự báo và trực quan hóa dữ liệu. Trong khi đó, Business Analyst tập trung nhiều hơn vào quy trình nghiệp vụ và ít code trực tiếp hơn.'
      } : m));
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle custom text submit
  const handleSendText = (text) => {
    if (!text.trim()) return;

    const userMsgId = Date.now();
    const newUserMsg = { id: userMsgId, sender: 'user', text };
    const loadingMsgId = userMsgId + 1;
    const newLoadingMsg = { id: loadingMsgId, sender: 'assistant', isAnalyzing: true };

    setMessages(prev => [...prev, newUserMsg, newLoadingMsg]);
    setInputVal('');

    // Predefined answers based on prompt keywords
    let responseText = "Cảm ơn bạn đã hỏi! Với năng lực hiện tại của bạn, chuyên gia khuyên bạn nên tập trung củng cố kỹ năng SQL nâng cao và học thêm các mô hình học máy cơ bản để tăng khả năng cạnh tranh.";
    
    if (text.toLowerCase().includes("senior") || text.toLowerCase().includes("2 năm")) {
      responseText = "Để lên Senior DA trong 2 năm, bạn cần: 1. Nắm vững phân tích dữ liệu lớn & tối ưu SQL nâng cao. 2. Làm chủ ít nhất một công cụ BI (Power BI/Tableau) và viết công thức DAX phức tạp. 3. Nâng cao kỹ năng Business Domain để đưa ra đề xuất kinh doanh thực tế chứ không chỉ làm báo cáo.";
    } else if (text.toLowerCase().includes("chứng chỉ") || text.toLowerCase().includes("ai")) {
      responseText = "Các chứng chỉ AI giá trị nhất bao gồm: 1. TensorFlow Developer Certificate (Google). 2. AWS Certified Machine Learning - Specialty. 3. Azure AI Engineer Associate (Microsoft). Ngoài ra, các khóa học chuyên sâu về LLMs và Prompt Engineering cũng rất được săn đón.";
    }

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === loadingMsgId ? {
        id: loadingMsgId,
        sender: 'assistant',
        text: responseText
      } : m));
    }, 1200);
  };

  const handleSwapRoles = () => {
    setCompareIndex(prev => (prev + 1) % comparisonPairs.length);
  };

  return (
    <DashboardLayout>
      <Topbar user={{ name: 'Ngọc Anh' }} />
      
      <div className="co-page">
        {/* ================= SECTION 1: RECOMMENDATIONS ================= */}
        <div>
          <div className="co-section-header">
            <div className="co-section-title-wrapper">
              <IconSparkle />
              <h2 className="co-section-title">Đề xuất Nghề nghiệp Phù hợp</h2>
            </div>
            <a href="#xem-tat-ca" className="co-link-action" onClick={(e) => e.preventDefault()}>
              Xem tất cả →
            </a>
          </div>

          <div className="co-career-grid">
            {careers.map((career, i) => (
              <div key={i} className="co-career-card">
                <div className="co-card-top">
                  <div className={`co-card-icon-container ${career.iconClass}`}>
                    {career.icon}
                  </div>
                  {career.badge && (
                    <span className={`co-card-badge ${career.badgeClass}`}>
                      {career.badge}
                    </span>
                  )}
                </div>

                <h3 className="co-card-title">{career.title}</h3>
                <p className="co-card-desc">{career.desc}</p>

                <div className="co-card-stats">
                  <div className="co-card-stat-col">
                    <p className="co-card-stat-label">ĐỘ PHÙ HỢP</p>
                    <p className="co-card-stat-val green">{career.match}%</p>
                  </div>
                  <div className="co-card-stat-col">
                    <p className="co-card-stat-label">NHU CẦU</p>
                    <p className={`co-card-stat-val ${career.levelClass === 'green' ? 'green' : career.levelClass === 'blue' ? 'blue' : 'orange'}`}>
                      {career.level}
                    </p>
                  </div>
                </div>

                <div className="co-card-tags">
                  {career.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="co-tag">{skill}</span>
                  ))}
                </div>

                <button className="co-card-btn">Chi tiết lộ trình</button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= SECTION 2: COMPARISON & TRENDS ================= */}
        <div className="co-two-column-row">
          {/* Compare Card */}
          <div className="co-box-card">
            <div className="co-section-header">
              <div className="co-section-title-wrapper">
                <IconSparkle />
                <h2 className="co-section-title">So sánh Nghề nghiệp</h2>
              </div>
              <div className="co-tabs-container">
                <button
                  className={`co-tab-btn ${activeTab === 'side-by-side' ? 'active' : ''}`}
                  onClick={() => setActiveTab('side-by-side')}
                >
                  Side-by-side
                </button>
                <button
                  className={`co-tab-btn ${activeTab === 'deep-analysis' ? 'active' : ''}`}
                  onClick={() => setActiveTab('deep-analysis')}
                >
                  Phân tích sâu
                </button>
              </div>
            </div>

            {activeTab === 'side-by-side' ? (
              <>
                <div className="co-comparison-wrapper">
                  {/* Left Role Column */}
                  <div className="co-compare-col highlighted">
                    <div className="co-compare-header">
                      <div className="co-card-icon-container blue" style={{ width: '32px', height: '32px' }}>
                        <IconChart />
                      </div>
                      <div>
                        <h3 className="co-compare-title">{currentPair.left.title}</h3>
                        <span className={`co-compare-badge ${currentPair.left.badgeClass}`}>
                          {currentPair.left.badge}
                        </span>
                      </div>
                    </div>

                    <div className="co-compare-section">
                      <p className="co-compare-sec-label">KỸ NĂNG YÊU CẦU</p>
                      <div className="co-compare-skills-list">
                        {currentPair.left.skills.map((s, idx) => (
                          <span key={idx} className="co-compare-skill-item">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="co-compare-section">
                      <p className="co-compare-sec-label">MỨC LƯƠNG TB (VN)</p>
                      <p className="co-compare-salary">{currentPair.left.salary} <span>VND</span></p>
                    </div>

                    <div className="co-compare-section" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                      <p className="co-compare-sec-label">TIỀM NĂNG</p>
                      <div className="co-potential-bar-wrapper">
                        <div className="co-potential-bar-track">
                          <div
                            className={`co-potential-bar-fill ${currentPair.left.colorClass}`}
                            style={{ width: `${currentPair.left.pct}%` }}
                          />
                        </div>
                        <p className="co-potential-val">{currentPair.left.potential}/10</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Role Column */}
                  <div className="co-compare-col">
                    <div className="co-compare-header">
                      <div className="co-card-icon-container green" style={{ width: '32px', height: '32px' }}>
                        <IconBriefcase />
                      </div>
                      <div>
                        <h3 className="co-compare-title">{currentPair.right.title}</h3>
                        <span className={`co-compare-badge ${currentPair.right.badgeClass}`}>
                          {currentPair.right.badge}
                        </span>
                      </div>
                    </div>

                    <div className="co-compare-section">
                      <p className="co-compare-sec-label">KỸ NĂNG YÊU CẦU</p>
                      <div className="co-compare-skills-list">
                        {currentPair.right.skills.map((s, idx) => (
                          <span key={idx} className="co-compare-skill-item">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="co-compare-section">
                      <p className="co-compare-sec-label">MỨC LƯƠNG TB (VN)</p>
                      <p className="co-compare-salary">{currentPair.right.salary} <span>VND</span></p>
                    </div>

                    <div className="co-compare-section" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                      <p className="co-compare-sec-label">TIỀM NĂNG</p>
                      <div className="co-potential-bar-wrapper">
                        <div className="co-potential-bar-track">
                          <div
                            className={`co-potential-bar-fill ${currentPair.right.colorClass === 'blue' ? 'blue' : 'teal'}`}
                            style={{ width: `${currentPair.right.pct}%` }}
                          />
                        </div>
                        <p className="co-potential-val">{currentPair.right.potential}/10</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="co-compare-swap-btn" onClick={handleSwapRoles}>
                  <IconSwap />
                  Thay đổi vai trò so sánh
                </button>
              </>
            ) : (
              <div style={{ marginTop: '20px', padding: '30px 10px', textAlign: 'center', color: '#64748b' }}>
                <IconLightbulb />
                <h4 style={{ margin: '12px 0 6px 0', color: '#111827' }}>Phân tích sâu định hướng nghề nghiệp</h4>
                <p style={{ fontSize: '13px', margin: '0', lineHeight: '1.5' }}>
                  AI đang quét thị trường và phân tích cơ hội phát triển dài hạn. Tính năng báo cáo chi tiết đang được đồng bộ dữ liệu thực tế.
                </p>
              </div>
            )}
          </div>

          {/* Right column: Trends & Tip */}
          <div className="co-right-col">
            <div className="co-box-card" style={{ flex: '1' }}>
              <div className="co-section-header" style={{ marginBottom: '4px' }}>
                <div className="co-section-title-wrapper">
                  <IconTrend />
                  <h2 className="co-section-title">Xu hướng tại VN</h2>
                </div>
              </div>
              <p className="co-trend-subtitle">Kỹ năng tăng trưởng mạnh nhất quý</p>

              <div className="co-trend-list">
                {trends.map((t, idx) => (
                  <div key={idx} className="co-trend-item">
                    <div className="co-trend-left">
                      <span className="co-trend-num">{t.num}</span>
                      <span className="co-trend-name">{t.name}</span>
                    </div>
                    <span className="co-trend-pct">{t.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tip Card */}
            <div className="co-tip-card">
              <div className="co-tip-header">
                <div className="co-tip-title-row">
                  <IconSparkle />
                  <span>AI Tip</span>
                </div>
                <span className="co-tip-badge">Gợi ý</span>
              </div>
              <p className="co-tip-content">
                Học thêm <strong>Prompt Engineering</strong> có thể tăng <strong>15%</strong> khả năng được tuyển dụng cho vị trí Data Analyst.
              </p>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: AI CHATBOT ================= */}
        <div className="co-chat-card">
          {/* Left panel */}
          <div className="co-chat-left-panel">
            <div className="co-chat-intro">
              <div className="co-chat-icon-container">
                <IconMessage />
              </div>
              <h3 className="co-chat-title">Trò chuyện cùng Chuyên gia AI</h3>
              <p className="co-chat-subtitle">
                Tôi là trợ lý ảo đầy năng lượng của bạn. Hãy hỏi tôi bất cứ điều gì về lộ trình sự nghiệp nhé.
              </p>
            </div>

            <div className="co-chat-quick-section">
              <span className="co-chat-quick-label">Vẫn chưa bắt đầu?</span>
              <button
                className="co-chat-quick-btn"
                onClick={() => handleSendText("Làm sao để lên Senior DA trong 2 năm?")}
              >
                Làm sao để lên Senior DA trong 2 năm?
              </button>
              <button
                className="co-chat-quick-btn"
                onClick={() => handleSendText("Chứng chỉ AI nào giá trị nhất hiện nay?")}
              >
                Chứng chỉ AI nào giá trị nhất hiện nay?
              </button>
            </div>
          </div>

          {/* Right chat window */}
          <div className="co-chat-window">
            <div className="co-chat-messages-container">
              {messages.map((m, idx) => (
                <div key={m.id || idx} className={`co-msg-row ${m.sender === 'assistant' ? 'assistant' : 'user'}`}>
                  <div className={`co-chat-avatar ${m.sender === 'assistant' ? 'assistant' : 'user'}`}>
                    {m.sender === 'assistant' ? '🤖' : 'NA'}
                  </div>
                  <div className="co-msg-content-wrapper">
                    <span className="co-msg-sender-name">
                      {m.sender === 'assistant' ? 'Assistant' : 'Ngọc Anh'}
                      {m.sender === 'assistant' && (
                        <span className="co-verif-badge">
                          <IconVerify />
                        </span>
                      )}
                    </span>
                    
                    {m.isAnalyzing ? (
                      <div className="co-chat-bubble analyzing">
                        <span>ĐANG PHÂN TÍCH</span>
                        <span className="co-dot-flashing"></span>
                      </div>
                    ) : (
                      <div className={`co-chat-bubble ${m.sender === 'assistant' ? 'assistant' : 'user'}`}>
                        {m.text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="co-chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendText(inputVal);
              }}
            >
              <input
                type="text"
                className="co-chat-input-field"
                placeholder="Hỏi tôi về lộ trình của bạn..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <button type="submit" className="co-chat-send-btn">
                <IconSend />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
