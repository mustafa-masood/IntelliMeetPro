import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  iconType: 'dashboard' | 'meetings' | 'calendar' | 'todos' | 'ask-ai';
}

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

// Icon Components
const DashboardIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    {isActive ? (
      <path d="M10 2L3 7V18H8V12H12V18H17V7L10 2Z" fill="white" />
    ) : (
      <path d="M10 2L3 7V18H8V12H12V18H17V7L10 2Z" stroke="#c1c6c5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    )}
  </svg>
);

const MeetingsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M18.3333 6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V15C1.66667 15.9205 2.41286 16.6667 3.33333 16.6667H16.6667C17.5871 16.6667 18.3333 15.9205 18.3333 15V6.66667Z" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.66667 10H18.3333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 5V3.33333C6.66667 2.41286 7.41286 1.66667 8.33333 1.66667H11.6667C12.5871 1.66667 13.3333 2.41286 13.3333 3.33333V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.3333 1.66667V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 1.66667V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 8.33333H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TodosIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 4.16667H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 10H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 15.8333H12.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.8333 15.8333L17.5 17.5L20 15" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AskAIIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 6.66667C10.4602 6.66667 10.8333 7.03976 10.8333 7.5C10.8333 7.96024 10.4602 8.33333 10 8.33333C9.53976 8.33333 9.16667 7.96024 9.16667 7.5C9.16667 7.03976 9.53976 6.66667 10 6.66667Z" fill={isActive ? 'white' : '#c1c6c5'} />
    <path d="M10 11.6667V10" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 13.3333H10.0083" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BuildingIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 17.5H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.16667 17.5V7.5C4.16667 6.57953 4.91286 5.83333 5.83333 5.83333H9.16667C10.0871 5.83333 10.8333 6.57953 10.8333 7.5V17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.3333 17.5V11.6667C13.3333 10.7462 14.0795 10 15 10H15.8333C16.7538 10 17.5 10.7462 17.5 11.6667V17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 10H8.33333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 13.3333H8.33333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 13.3333H16.6667" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="2.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 2.5V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 15V17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.22656 4.22656L6.06656 6.06656" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.9333 13.9333L15.7733 15.7733" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 10H5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 10H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.22656 15.7733L6.06656 13.9333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.9333 6.06656L15.7733 4.22656" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({
  userName = 'Mustafa Masood',
  userEmail = 'Personal Account',
  userAvatar
}) => {
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', iconType: 'dashboard' },
    { label: 'Meetings', path: '/meetings', iconType: 'meetings' },
    { label: 'Calendar', path: '/calendar', iconType: 'calendar' },
    { label: "To-do's", path: '/todos', iconType: 'todos' },
    { label: 'Ask AI', path: '/ask-ai', iconType: 'ask-ai' },
  ];

  const renderIcon = (iconType: string, isActive: boolean) => {
    switch (iconType) {
      case 'dashboard':
        return <DashboardIcon isActive={isActive} />;
      case 'meetings':
        return <MeetingsIcon isActive={isActive} />;
      case 'calendar':
        return <CalendarIcon isActive={isActive} />;
      case 'todos':
        return <TodosIcon isActive={isActive} />;
      case 'ask-ai':
        return <AskAIIcon isActive={isActive} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        profileButtonRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isProfileDropdownOpen) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileDropdownOpen]);

  return (
    <div className="w-[270px] bg-neutral-900 flex flex-col h-screen fixed left-0 top-0 z-[1000]">
      <div className="flex items-center justify-between px-6 py-5 h-[72px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-8 flex items-center justify-center text-white font-bold text-xl">i</div>
          <span className="font-inter font-semibold text-2xl text-text-white tracking-[-0.48px]">IntelliMeet</span>
        </div>
        <div className="w-8 h-8 bg-white/5 rounded-[366px] flex items-center justify-center relative border border-white/6 cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C8.9 2 8 2.9 8 4V5.58C6.84 6.27 6 7.55 6 9V13L4 15V16H16V15L14 13V9C14 7.55 13.16 6.27 12 5.58V4C12 2.9 11.1 2 10 2ZM10 17C8.9 17 8 16.1 8 15H12C12 16.1 11.1 17 10 17Z" fill="white" />
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 py-1 px-4 pb-5 overflow-y-auto scrollbar-hide">
        <div className="h-px bg-neutral-400 opacity-20 w-full" />

        <div className="flex flex-col gap-1">
          <Link
            to="/my-workspace"
            className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit ${location.pathname === '/my-workspace'
              ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
              : 'hover:bg-white/5'
              }`}
          >
            <BuildingIcon isActive={location.pathname === '/my-workspace'} />
            <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${location.pathname === '/my-workspace' ? 'text-white' : 'text-neutral-300'
              }`}>My Workspace</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2V14" stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 8H14" stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit relative ${isActive
                  ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
                  : 'hover:bg-white/5'
                  }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {renderIcon(item.iconType, isActive)}
                </div>
                <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${isActive ? 'text-white' : 'text-neutral-300'
                  }`}>{item.label}</span>
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.06)] rounded-8" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="h-px bg-neutral-400 opacity-20 w-full" />

        <div className="flex flex-col">
          <div className="font-inter font-medium text-xs text-neutral-400 tracking-[0.48px] uppercase px-3 py-1 pb-2">PREFERENCE</div>
          <Link
            to="/app-integrations"
            className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit ${location.pathname === '/app-integrations'
              ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
              : 'hover:bg-white/5'
              }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <SettingsIcon isActive={location.pathname === '/app-integrations'} />
            </div>
            <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${location.pathname === '/app-integrations' ? 'text-white' : 'text-neutral-300'
              }`}>App & Integrations</span>
          </Link>
        </div>
      </div>

      <div className="bg-transparent border border-white/12 rounded-12 p-4 flex flex-col gap-3 mx-4">
        <div className="flex items-center gap-2">
          {/* <div className="text-xl">🚀</div> */}
          <span className="font-inter font-medium text-base text-text-white tracking-[-0.176px] leading-6">Enterprise</span>
        </div>
        <div className="flex items-center gap-2 font-inter font-normal text-xs text-text-white leading-4">
          <div className="bg-white/5 border border-white/6 rounded-4 px-2 h-5 flex items-center justify-center text-xs text-text-white">06</div>
          <span>days</span>
          <div className="bg-white/5 border border-white/6 rounded-4 px-2 h-5 flex items-center justify-center text-xs text-text-white">23</div>
          <span>hours</span>
        </div>
        <button className="border border-[#009f6d] rounded-8 bg-gradient-to-b from-[rgba(0,159,109,0)] to-[rgba(0,159,109,0.05)] bg-gradient-to-r from-white/4 to-white/4 p-2 w-full flex items-center justify-center gap-1 cursor-pointer shadow-[inset_0px_0px_12px_0px_rgba(0,159,109,0.08)] transition-opacity hover:opacity-90">
          {/* <span className="text-xl">⭐</span> */}
          <span className="font-inter font-medium text-sm text-text-white tracking-[-0.084px]">Upgrade</span>
        </button>
      </div>

      <div className="p-5 px-4 bg-neutral-900 relative">
        <div
          ref={profileButtonRef}
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="border border-neutral-700 rounded-12 p-3 flex items-center justify-between bg-gradient-to-b from-transparent to-white/5 bg-gradient-to-r from-white/4 to-white/4 shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.08)] cursor-pointer transition-opacity hover:opacity-90"
        >
          <div className="flex items-center gap-3 flex-1">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-base">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <div className="font-inter font-normal text-base text-text-white tracking-[-0.176px] leading-6">{userName}</div>
              <div className="font-inter font-normal text-xs text-neutral-300 leading-4">{userEmail}</div>
            </div>
          </div>
          <div className="text-neutral-300 text-base">↑</div>
        </div>

        {/* Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div
            ref={profileDropdownRef}
            className="absolute bottom-[88px] left-4 right-4 bg-white border border-stroke-primary rounded-12 shadow-lg z-1001 overflow-hidden"
          >
            <div className="flex flex-col">
              <Link
                to="/account-settings"
                onClick={() => setIsProfileDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-bg-surface-lv1 transition-colors cursor-pointer border-b border-stroke-primary no-underline text-inherit"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="2.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 2.5V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 15V17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.22656 4.22656L6.06656 6.06656" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.9333 13.9333L15.7733 15.7733" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 10H5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 10H17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.22656 15.7733L6.06656 13.9333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.9333 6.06656L15.7733 4.22656" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">Account Settings</span>
              </Link>
              <button className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-lv1 transition-colors cursor-pointer border-b border-stroke-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2.5L12.5 8.5L19 9.5L14 14L15 20.5L10 17L5 20.5L6 14L1 9.5L7.5 8.5L10 2.5Z" fill="#2b3d39" />
                </svg>
                <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">Plan & Billings</span>
              </button>
              {/* <button className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-lv1 transition-colors cursor-pointer border-b border-stroke-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="2.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 2.5V5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 15V17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.22656 4.22656L6.06656 6.06656" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.9333 13.9333L15.7733 15.7733" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 10H5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 10H17.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.22656 15.7733L6.06656 13.9333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.9333 6.06656L15.7733 4.22656" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">Workspace Settings</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-lv1 transition-colors cursor-pointer border-b border-stroke-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 6.66667C10.4602 6.66667 10.8333 7.03976 10.8333 7.5C10.8333 7.96024 10.4602 8.33333 10 8.33333C9.53976 8.33333 9.16667 7.96024 9.16667 7.5C9.16667 7.03976 9.53976 6.66667 10 6.66667Z" fill="#2b3d39" />
                  <path d="M10 11.6667V10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 13.3333H10.0083" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">Help</span>
              </button> */}
              <button className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-lv1 transition-colors cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5H7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.3333 14.1667L17.5 10L13.3333 5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 10H7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
