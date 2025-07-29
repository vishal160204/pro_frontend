import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Sample data for the dashboard
  const stats = {
    confidenceScore: 78,
    confidenceImprovement: 12,
    totalSessions: 24,
    practiceTime: '6.2h',
    practiceTimeImprovement: '2.1h',
    achievements: 7
  };

  const skillsData = [
    { skill: 'Voice Clarity', percentage: 88 },
    { skill: 'Body Language', percentage: 72 },
    { skill: 'Content Flow', percentage: 78 },
    { skill: 'Eye Contact', percentage: 68 },
    { skill: 'Pace Control', percentage: 81 }
  ];

  const progressData = [
    { week: 'Week 1', score: 45 },
    { week: 'Week 2', score: 52 },
    { week: 'Week 3', score: 58 },
    { week: 'Week 4', score: 62 },
    { week: 'Week 5', score: 70 },
    { week: 'Week 6', score: 78 }
  ];

  const recentSessions = [
    {
      type: 'Job Interview',
      time: '2 hours ago',
      duration: '12 min',
      score: 82,
      improvement: '+6%',
      icon: '👔'
    },
    {
      type: 'Presentation',
      time: 'Yesterday',
      duration: '18 min',
      score: 76,
      improvement: '+3%',
      icon: '📊'
    },
    {
      type: 'Conversation',
      time: '2 days ago',
      duration: '8 min',
      score: 71,
      improvement: '+7%',
      icon: '💬'
    }
  ];

  const quickPracticeOptions = [
    {
      type: 'Job Interview',
      description: 'Practice common interview questions',
      icon: '👔',
      color: '#3b82f6'
    },
    {
      type: 'Presentation',
      description: 'Improve your public speaking',
      icon: '📊',
      color: '#10b981'
    },
    {
      type: 'Conversation',
      description: 'Practice everyday conversations',
      icon: '💬',
      color: '#8b5cf6'
    }
  ];

  const todaysGoal = {
    target: 2,
    completed: 1,
    percentage: 50
  };

  return (
    <div className="dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="dashboard-nav">
            <div className="dashboard-logo">
              <div className="logo-icon-dark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="white"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#1a202c" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="9" r="1" fill="#1a202c"/>
                  <circle cx="15" cy="9" r="1" fill="#1a202c"/>
                </svg>
              </div>
              <span className="dashboard-logo-text">FluentUp</span>
            </div>
            <nav className="dashboard-menu">
              <Link to="/dashboard" className="menu-item active">Dashboard</Link>
              <Link to="/practice" className="menu-item">Practice</Link>
              <Link to="/analytics" className="menu-item">Analytics</Link>
              <a href="/scenarios" className="menu-item">Scenario Library</a>
            </nav>
            <div className="dashboard-user">
              <div className="confidence-badge">
                <span className="confidence-label">Confidence:</span>
                <span className="confidence-value">82%</span>
              </div>
              <div className="notification-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="user-profile">
                <span className="user-name">
                  {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 
                   user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome back, {user?.first_name || user?.email || 'User'}! 👋</h1>
              <p className="welcome-subtitle">
                Ready to continue your communication journey? Your confidence score has improved by 12% this week!
              </p>
            </div>
            <Link to="/practice" className="start-practice-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
              Start Practice Session
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Confidence Score</div>
                <div className="stat-value">{stats.confidenceScore}%</div>
                <div className="stat-change positive">+{stats.confidenceImprovement}% this week</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Sessions</div>
                <div className="stat-value">{stats.totalSessions}</div>
                <div className="stat-period">This month</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Practice Time</div>
                <div className="stat-value">{stats.practiceTime}</div>
                <div className="stat-change positive">+{stats.practiceTimeImprovement} this week</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Achievements</div>
                <div className="stat-value">{stats.achievements}</div>
                <div className="stat-period">Badges earned</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Confidence Progress Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">📈 Confidence Score Progress</h3>
              </div>
              <div className="chart-container">
                <div className="line-chart">
                  <svg width="100%" height="200" viewBox="0 0 500 200">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1a202c" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#1a202c" stopOpacity="1"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <g stroke="#e2e8f0" strokeWidth="1">
                      <line x1="50" y1="20" x2="50" y2="160"/>
                      <line x1="50" y1="160" x2="450" y2="160"/>
                      <line x1="50" y1="120" x2="450" y2="120" strokeDasharray="2,2"/>
                      <line x1="50" y1="80" x2="450" y2="80" strokeDasharray="2,2"/>
                      <line x1="50" y1="40" x2="450" y2="40" strokeDasharray="2,2"/>
                    </g>
                    
                    {/* Y-axis labels */}
                    <g fill="#4a5568" fontSize="12" textAnchor="end">
                      <text x="45" y="165">0</text>
                      <text x="45" y="125">20</text>
                      <text x="45" y="85">40</text>
                      <text x="45" y="45">60</text>
                      <text x="45" y="25">80</text>
                    </g>
                    
                    {/* X-axis labels */}
                    <g fill="#4a5568" fontSize="12" textAnchor="middle">
                      <text x="80" y="180">Week 1</text>
                      <text x="150" y="180">Week 2</text>
                      <text x="220" y="180">Week 3</text>
                      <text x="290" y="180">Week 4</text>
                      <text x="360" y="180">Week 5</text>
                      <text x="430" y="180">Week 6</text>
                    </g>
                    
                    {/* Line path */}
                    <path
                      d="M 80 135 L 150 125 L 220 115 L 290 105 L 360 85 L 430 65"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    <g fill="#1a202c">
                      <circle cx="80" cy="135" r="4"/>
                      <circle cx="150" cy="125" r="4"/>
                      <circle cx="220" cy="115" r="4"/>
                      <circle cx="290" cy="105" r="4"/>
                      <circle cx="360" cy="85" r="4"/>
                      <circle cx="430" cy="65" r="5" fill="#1a202c"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Skills Breakdown</h3>
              </div>
              <div className="skills-chart">
                {skillsData.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-info">
                      <span className="skill-name">{skill.skill}</span>
                      <span className="skill-percentage">{skill.percentage}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-progress" 
                        style={{ width: `${skill.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Dashboard Sections */}
          <div className="additional-sections">
            {/* Recent Practice Sessions */}
            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">Recent Practice Sessions</h3>
              </div>
              <div className="sessions-list">
                {recentSessions.map((session, index) => (
                  <div key={index} className="session-item">
                    <div className="session-icon">{session.icon}</div>
                    <div className="session-content">
                      <div className="session-type">{session.type}</div>
                      <div className="session-meta">
                        <span className="session-time">{session.time}</span>
                        <span className="session-duration">• {session.duration}</span>
                      </div>
                    </div>
                    <div className="session-score">
                      <div className="score-value">{session.score}%</div>
                      <div className="score-improvement">{session.improvement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Practice & Today's Goal */}
            <div className="right-sections">
              {/* Quick Practice */}
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">Quick Practice</h3>
                </div>
                <div className="quick-practice-list">
                  {quickPracticeOptions.map((option, index) => (
                    <div key={index} className="practice-option">
                      <div className="practice-icon" style={{backgroundColor: `${option.color}20`, color: option.color}}>
                        {option.icon}
                      </div>
                      <div className="practice-content">
                        <div className="practice-type">{option.type}</div>
                        <div className="practice-description">{option.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Goal */}
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">Today's Goal</h3>
                </div>
                <div className="goal-content">
                  <div className="goal-description">
                    Complete {todaysGoal.target} practice sessions
                  </div>
                  <div className="goal-progress">
                    <div className="goal-bar">
                      <div 
                        className="goal-fill" 
                        style={{width: `${todaysGoal.percentage}%`}}
                      ></div>
                    </div>
                    <div className="goal-text">
                      {todaysGoal.completed} of {todaysGoal.target} sessions completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
