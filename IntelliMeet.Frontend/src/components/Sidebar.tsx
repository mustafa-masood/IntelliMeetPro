import React from 'react';
import './Sidebar.css';

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
}

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  userName = 'Mustafa Masood',
  userEmail = 'Personal Account',
  userAvatar
}) => {
  const navItems: NavItem[] = [
    { icon: '🏢', label: 'My Workspace' },
    { icon: '📊', label: 'Dashboard', active: true },
    { icon: '📹', label: 'Meetings' },
    { icon: '📅', label: 'Calendar' },
    { icon: '✅', label: "To-do's" },
    { icon: '❓', label: 'Ask AI' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">i</div>
          <span className="logo-text">IntelliMeet</span>
        </div>
        <div className="notification-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C8.9 2 8 2.9 8 4V5.58C6.84 6.27 6 7.55 6 9V13L4 15V16H16V15L14 13V9C14 7.55 13.16 6.27 12 5.58V4C12 2.9 11.1 2 10 2ZM10 17C8.9 17 8 16.1 8 15H12C12 16.1 11.1 17 10 17Z" fill="white"/>
          </svg>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="divider" />
        
        <div className="nav-section">
          {navItems.map((item, index) => (
            <div
              key={index}
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-text">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="nav-section">
          <div className="nav-section-title">PREFERENCE</div>
          <div className="nav-item">
            <div className="nav-icon">⚙️</div>
            <span className="nav-text">App & Integrations</span>
          </div>
        </div>
      </div>

      <div className="enterprise-card">
        <div className="enterprise-header">
          <div className="enterprise-icon">🚀</div>
          <span className="enterprise-text">Enterprise</span>
        </div>
        <div className="enterprise-countdown">
          <div className="countdown-box">06</div>
          <span>days</span>
          <div className="countdown-box">23</div>
          <span>hours</span>
        </div>
        <button className="upgrade-button">
          <span className="upgrade-icon">⭐</span>
          <span className="upgrade-button-text">Upgrade</span>
        </button>
      </div>

      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-content">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="profile-info">
              <div className="profile-name">{userName}</div>
              <div className="profile-account">{userEmail}</div>
            </div>
          </div>
          <div className="profile-arrow">↑</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

