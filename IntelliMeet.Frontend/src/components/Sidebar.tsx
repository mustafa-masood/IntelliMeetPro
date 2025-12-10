import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
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
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '📹', label: 'Meetings', path: '/meetings' },
    { icon: '📅', label: 'Calendar', path: '/calendar' },
    { icon: '✅', label: "To-do's", path: '/todos' },
    { icon: '❓', label: 'Ask AI', path: '/ask-ai' },
  ];

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

      <div className="flex-1 flex flex-col gap-4 py-1 px-4 pb-5 overflow-y-auto">
        <div className="h-px bg-neutral-400 opacity-20 w-full" />

        <div className="flex flex-col gap-1">
          <Link
            to="/my-workspace"
            className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit ${location.pathname === '/my-workspace'
              ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
              : 'hover:bg-white/5'
              }`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5.83333C2.5 4.91286 3.24619 4.16667 4.16667 4.16667H7.5V2.5C7.5 1.57953 8.24619 0.833333 9.16667 0.833333H10.8333C11.7538 0.833333 12.5 1.57953 12.5 2.5V4.16667H15.8333C16.7538 4.16667 17.5 4.91286 17.5 5.83333V17.5C17.5 18.4205 16.7538 19.1667 15.8333 19.1667H4.16667C3.24619 19.1667 2.5 18.4205 2.5 17.5V5.83333Z" stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.16667 9.16667H10.8333" stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.16667 12.5H10.8333" stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.16667 15.8333H10.8333" stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
                className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit ${isActive
                  ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
                  : 'hover:bg-white/5'
                  }`}
              >
                <div className="w-5 h-5 flex items-center justify-center text-lg">{item.icon}</div>
                <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${isActive ? 'text-text-white' : 'text-neutral-300'
                  }`}>{item.label}</span>
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
            <div className="w-5 h-5 flex items-center justify-center text-lg">⚙️</div>
            <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${location.pathname === '/app-integrations' ? 'text-text-white' : 'text-neutral-300'
              }`}>App & Integrations</span>
          </Link>
        </div>
      </div>

      <div className="bg-transparent border border-white/12 rounded-12 p-4 flex flex-col gap-3 mx-4">
        <div className="flex items-center gap-2">
          <div className="text-xl">🚀</div>
          <span className="font-inter font-medium text-base text-text-white tracking-[-0.176px] leading-6">Enterprise</span>
        </div>
        <div className="flex items-center gap-2 font-inter font-normal text-xs text-text-white leading-4">
          <div className="bg-white/5 border border-white/6 rounded-4 px-2 h-5 flex items-center justify-center text-xs text-text-white">06</div>
          <span>days</span>
          <div className="bg-white/5 border border-white/6 rounded-4 px-2 h-5 flex items-center justify-center text-xs text-text-white">23</div>
          <span>hours</span>
        </div>
        <button className="border border-[#009f6d] rounded-8 bg-gradient-to-b from-[rgba(0,159,109,0)] to-[rgba(0,159,109,0.05)] bg-gradient-to-r from-white/4 to-white/4 p-2 w-full flex items-center justify-center gap-1 cursor-pointer shadow-[inset_0px_0px_12px_0px_rgba(0,159,109,0.08)] transition-opacity hover:opacity-90">
          <span className="text-xl">⭐</span>
          <span className="font-inter font-medium text-sm text-text-white tracking-[-0.084px]">Upgrade</span>
        </button>
      </div>

      <div className="p-5 px-4 bg-neutral-900">
        <div className="border border-neutral-700 rounded-12 p-3 flex items-center justify-between bg-gradient-to-b from-transparent to-white/5 bg-gradient-to-r from-white/4 to-white/4 shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.08)] cursor-pointer transition-opacity hover:opacity-90">
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
      </div>
    </div>
  );
};

export default Sidebar;
