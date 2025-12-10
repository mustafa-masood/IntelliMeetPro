import React, { useState } from 'react';
import './RightSidebar.css';

const RightSidebar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(16);

  const calendarDays = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="right-sidebar">
      <h2 className="sidebar-title">Upcoming Meetings</h2>

      {/* Calendar Card */}
      <div className="sidebar-card">
        <div className="calendar-section">
          <div className="calendar-header">
            <span className="calendar-month">January 2025</span>
            <div className="calendar-nav">
              <button className="calendar-nav-button">←</button>
              <button className="calendar-nav-button">→</button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {weekdays.map((day) => (
                <div key={day} className="calendar-weekday">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-days">
              {calendarDays.map((week, weekIndex) => (
                <div key={weekIndex} className="calendar-week">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`calendar-day ${
                        day === selectedDate ? 'active' : ''
                      } ${!day ? 'disabled' : ''}`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day}
                      {day === selectedDate && <span className="calendar-indicator">+</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Calendar Integration */}
        <div className="calendar-integration">
          <div className="integration-header">
            <div className="integration-logo">
              <div className="google-logo">G</div>
            </div>
            <div className="integration-info">
              <div className="integration-email">mdjubed30@gmail.com</div>
              <div className="integration-status">
                <span className="status-icon">✓</span>
                <span>Calendar Connected</span>
              </div>
            </div>
            <div className="integration-menu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="4" r="1.5" fill="#2b3d39"/>
                <circle cx="10" cy="10" r="1.5" fill="#2b3d39"/>
                <circle cx="10" cy="16" r="1.5" fill="#2b3d39"/>
              </svg>
            </div>
          </div>
          <div className="add-calendar-link">
            <span>+</span>
            <span>Add calendar account</span>
          </div>
        </div>

        {/* Meeting Details Card */}
        <div className="meeting-details-card">
          <div className="meeting-time-header">
            <span className="meeting-time">09:00 PM - 10:30 PM</span>
            <div className="meeting-duration">
              <span>🕐</span>
              <span>1:30 Hour</span>
            </div>
          </div>
          <div className="meeting-question">
            Are you scheduled to attend the meeting with Thomas Fletcher?
          </div>
          <div className="meeting-buttons">
            <button className="meeting-button primary">Yes</button>
            <button className="meeting-button">Don't know yet</button>
            <button className="meeting-button">No</button>
          </div>
        </div>
      </div>

      {/* Copy Meeting Link Card */}
      <div className="sidebar-card copy-meeting-card">
        <div className="copy-meeting-header">
          <div className="copy-icon">📋</div>
          <div>
            <div className="copy-meeting-title">Copy paste meeting link</div>
            <div className="copy-meeting-subtitle">
              Invite notetaker ad hoc to a specific meeting
            </div>
          </div>
        </div>
        <div className="copy-meeting-content">
          <input
            type="text"
            className="copy-meeting-input"
            placeholder="Paste conference link"
          />
          <div className="copy-meeting-actions">
            <button className="join-meeting-button">Join Meeting</button>
            <button className="join-meeting-icon-button">👥</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;

