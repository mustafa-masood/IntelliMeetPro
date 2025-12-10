import React from 'react';
import './RecentMeetingsTable.css';

interface Meeting {
  id: string;
  name: string;
  duration: string;
  creator: string;
  date: string;
  icon: 'mic' | 'doc' | 'video' | 'zoom' | 'meet';
}

const RecentMeetingsTable: React.FC = () => {
  const meetings: Meeting[] = [
    { id: '1', name: 'React components', duration: '1hours 30min', creator: 'Thomas L. Fletcher', date: '28 Oct 2025, 08:43 AM', icon: 'mic' },
    { id: '2', name: 'Starting New component', duration: '1hours 30min', creator: 'Julius Lias', date: '28 Oct 2025, 10:43 AM', icon: 'doc' },
    { id: '3', name: 'AI Meeting', duration: '1hours 30min', creator: 'Grace Berg', date: '28 Oct 2025, 05:42 PM', icon: 'video' },
    { id: '4', name: 'New ideas for user forms', duration: '1.30 Hours', creator: 'Allen Paul', date: '27 Oct 2025, 02:33 PM', icon: 'meet' },
    { id: '5', name: 'Quick guide: get transcription and AI summary', duration: '1.30 Hours', creator: 'Jhon Smith', date: '27 Oct 2025, 09:33 AM', icon: 'meet' },
    { id: '6', name: 'Backend improvements', duration: '1.30 Hours', creator: 'Samuel Dong', date: '27 Oct 2025, 02:33 PM', icon: 'zoom' },
    { id: '7', name: 'Figma designs upgrade', duration: '1.30 Hours', creator: 'Brian Zim', date: '26 Oct 2025, 10:53 AM', icon: 'meet' },
    { id: '8', name: 'Onboarding new team', duration: '1.30 Hours', creator: 'Jhon Smith', date: '12 Oct 2025, 06:33 PM', icon: 'mic' },
    { id: '9', name: 'Bug issues resolving team', duration: '1.30 Hours', creator: 'Tally Hue', date: '10 Oct 2025, 02:40 PM', icon: 'zoom' },
    { id: '10', name: 'FYP discussion items to tell', duration: '1.30 Hours', creator: 'Farah Shing', date: '14 Sept 2025, 07:12 AM', icon: 'mic' },
    { id: '11', name: 'Getting budget statements', duration: '1.30 Hours', creator: 'Jing Mi', date: '10 Sept 2025, 11:33 AM', icon: 'video' },
  ];

  const getIcon = (icon: Meeting['icon']) => {
    switch (icon) {
      case 'mic':
        return '🎤';
      case 'doc':
        return '📄';
      case 'video':
        return '📹';
      case 'zoom':
        return '💻';
      case 'meet':
        return '📞';
      default:
        return '📹';
    }
  };

  return (
    <div className="meetings-table-container">
      <div className="table-header">
        <div className="tab-menu active">
          <span className="tab-text">Recent Meetings</span>
        </div>
        <button className="see-more-button">See more</button>
      </div>

      <div className="table-wrapper">
        <table className="meetings-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Duration</th>
              <th className="table-header-cell">Creator</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell"></th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="table-row">
                <td className="table-cell">
                  <div className="table-cell-name">
                    <div className={`meeting-icon ${meeting.icon === 'mic' ? 'orange' : ''}`}>
                      {getIcon(meeting.icon)}
                    </div>
                    <span>{meeting.name}</span>
                  </div>
                </td>
                <td className="table-cell">{meeting.duration}</td>
                <td className="table-cell">{meeting.creator}</td>
                <td className="table-cell">{meeting.date}</td>
                <td className="table-cell">
                  <div className="menu-button">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="4" r="1.5" fill="#2b3d39"/>
                      <circle cx="8" cy="8" r="1.5" fill="#2b3d39"/>
                      <circle cx="8" cy="12" r="1.5" fill="#2b3d39"/>
                    </svg>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-group">
          <span className="pagination-info">Showing 1-20 entries</span>
          <div className="pagination-buttons">
            <button className="pagination-button">Previous</button>
            <button className="pagination-button active">1</button>
            <button className="pagination-button">2</button>
            <button className="pagination-button">3</button>
            <button className="pagination-button">...</button>
            <button className="pagination-button">17</button>
            <button className="pagination-button">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentMeetingsTable;

