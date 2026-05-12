import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { isClerkConfigured } from '../config/clerk';
import { imApi, type OnboardingMeDto } from '../api/intellimeet';

interface NavItem {
  label: string;
  path: string;
  iconType: 'dashboard' | 'meetings' | 'calendar' | 'todos' | 'ask-ai';
}

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

// Icon Components
const DashboardIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    {isActive ? (
      <path d="M10 2L3 7V18H8V12H12V18H17V7L10 2Z" fill="white" />
    ) : (
      <path d="M10 2L3 7V18H8V12H12V18H17V7L10 2Z" stroke="#c1c6c5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    )}
  </svg>
);

const MeetingsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M18.3333 6.66667C18.3333 5.74619 17.5871 5 16.6667 5H3.33333C2.41286 5 1.66667 5.74619 1.66667 6.66667V15C1.66667 15.9205 2.41286 16.6667 3.33333 16.6667H16.6667C17.5871 16.6667 18.3333 15.9205 18.3333 15V6.66667Z" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.66667 10H18.3333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 5V3.33333C6.66667 2.41286 7.41286 1.66667 8.33333 1.66667H11.6667C12.5871 1.66667 13.3333 2.41286 13.3333 3.33333V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.3333 1.66667V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 1.66667V5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 8.33333H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TodosIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2.5 4.16667H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 10H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 15.8333H12.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.8333 15.8333L17.5 17.5L20 15" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AskAIIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 6.66667C10.4602 6.66667 10.8333 7.03976 10.8333 7.5C10.8333 7.96024 10.4602 8.33333 10 8.33333C9.53976 8.33333 9.16667 7.96024 9.16667 7.5C9.16667 7.03976 9.53976 6.66667 10 6.66667Z" fill={isActive ? 'white' : '#c1c6c5'} />
    <path d="M10 11.6667V10" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 13.3333H10.0083" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BuildingIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2.5 17.5H17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.16667 17.5V7.5C4.16667 6.57953 4.91286 5.83333 5.83333 5.83333H9.16667C10.0871 5.83333 10.8333 6.57953 10.8333 7.5V17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.3333 17.5V11.6667C13.3333 10.7462 14.0795 10 15 10H15.8333C16.7538 10 17.5 10.7462 17.5 11.6667V17.5" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 10H8.33333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.66667 13.3333H8.33333" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 13.3333H16.6667" stroke={isActive ? 'white' : '#c1c6c5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
  userAvatar,
  isMobileOpen = false,
  onMobileClose
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const clerkEnabled = isClerkConfigured();
  const clerk = clerkEnabled ? useClerk() : null;
  const user = clerkEnabled ? useUser() : null;
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const [isEnterprise, setIsEnterprise] = useState<boolean>(!clerkEnabled);
  const [me, setMe] = useState<OnboardingMeDto | null>(null);

  const displayName = useMemo(() => {
    if (user?.isLoaded && user.user) {
      return user.user.fullName || user.user.firstName || user.user.username || 'Account';
    }
    return userName;
  }, [user?.isLoaded, user?.user, userName]);

  const displayEmail = useMemo(() => {
    if (user?.isLoaded && user.user) {
      return user.user.primaryEmailAddress?.emailAddress || '';
    }
    return userEmail;
  }, [user?.isLoaded, user?.user, userEmail]);

  useEffect(() => {
    if (!clerkEnabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const me = await imApi.onboardingMe();
        if (cancelled) return;
        setMe(me);
        const plan = (me.currentPlan ?? '').toLowerCase();
        const status = (me.subscriptionStatus ?? '').toLowerCase();
        setIsEnterprise(plan === 'enterprise' && status === 'active');
      } catch {
        if (!cancelled) setIsEnterprise(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clerkEnabled]);

  const planBadge = useMemo(() => {
    if (!clerkEnabled || !me) return null;
    const plan = me.currentPlan || '—';
    const end = me.planEndDateUtc ? new Date(me.planEndDateUtc) : null;
    if (!end || Number.isNaN(end.getTime())) return `Plan: ${plan}`;
    const msLeft = end.getTime() - Date.now();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const timeLeft = daysLeft >= 1 ? `${daysLeft}d left` : 'renews soon';
    return `Plan: ${plan} • ${timeLeft}`;
  }, [clerkEnabled, me]);

  const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', iconType: 'dashboard' },
    { label: 'Meetings', path: '/meetings', iconType: 'meetings' },
    { label: 'Calendar', path: '/calendar', iconType: 'calendar' },
    { label: "To-do's", path: '/todos', iconType: 'todos' },
    { label: 'Ask AI (Experimental)', path: '/experimental/ask-ai', iconType: 'ask-ai' },
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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname, onMobileClose]);

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
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-[1000] 
          w-[270px] h-screen 
          bg-neutral-900 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 h-[72px] shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/intellimeet-logo-light.png"
              alt="IntelliMeet Logo"
              className="w-8 h-8 rounded-8 object-contain self-center"
            />
            <span className="font-inter font-semibold text-xl sm:text-2xl text-text-white tracking-[-0.48px] flex items-center h-8 mt-1">
              IntelliMeet
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 py-1 px-4 pb-5 overflow-y-auto scrollbar-hide">
          <div className="h-px bg-neutral-400 opacity-20 w-full" />

          <div className="flex flex-col gap-1">
            {isEnterprise && (
              <Link
                to="/my-workspace"
                className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit ${
                  location.pathname === '/my-workspace'
                    ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
                    : 'hover:bg-white/5'
                }`}
                onClick={onMobileClose}
              >
                <BuildingIcon isActive={location.pathname === '/my-workspace'} />
                <span
                  className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${
                    location.pathname === '/my-workspace' ? 'text-white' : 'text-neutral-300'
                  }`}
                >
                  My Workspace
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 2V14"
                    stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 8H14"
                    stroke={location.pathname === '/my-workspace' ? 'white' : '#c1c6c5'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={onMobileClose}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {renderIcon(item.iconType, isActive)}
                  </div>
                  <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${
                    isActive ? 'text-white' : 'text-neutral-300'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.06)] rounded-8" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="h-px bg-neutral-400 opacity-20 w-full" />

          <div className="flex flex-col">
            <div className="font-inter font-medium text-xs text-neutral-400 tracking-[0.48px] uppercase px-3 py-1 pb-2">
              PREFERENCE
            </div>
            <Link
              to="/deferred/app-integrations"
              className={`flex items-center gap-3 h-10 px-3 rounded-8 cursor-pointer transition-colors no-underline text-inherit ${
                location.pathname.startsWith('/deferred/app-integrations')
                  ? 'bg-gradient-to-r from-[rgba(0,168,121,0.24)] to-transparent border border-white/6'
                  : 'hover:bg-white/5'
              }`}
              onClick={onMobileClose}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <SettingsIcon isActive={location.pathname.startsWith('/deferred/app-integrations')} />
              </div>
              <span className={`flex-1 font-inter font-medium text-sm tracking-[-0.084px] ${
                location.pathname.startsWith('/deferred/app-integrations') ? 'text-white' : 'text-neutral-300'
              }`}>
                App & Integrations
              </span>
            </Link>
          </div>
        </nav>

        {/* Plan Card */}
        {planBadge ? (
          <div className="bg-transparent border border-white/12 rounded-12 p-4 flex flex-col gap-2 mx-4 mb-4">
            <div className="font-inter font-medium text-base text-text-white tracking-[-0.176px] leading-6">
              {planBadge}
            </div>
            {me?.role ? (
              <div className="font-inter font-normal text-xs text-neutral-300 leading-4">Role: {me.role}</div>
            ) : null}
          </div>
        ) : null}

        {/* Profile Section */}
        <div className="p-4 sm:p-5 px-4 bg-neutral-900 relative shrink-0">
          <div
            ref={profileButtonRef}
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="border border-neutral-700 rounded-12 p-3 flex items-center justify-between bg-gradient-to-b from-transparent to-white/5 bg-gradient-to-r from-white/4 to-white/4 shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.08)] cursor-pointer transition-opacity hover:opacity-90"
            role="button"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-full object-cover shrink-0" 
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-base shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="font-inter font-normal text-sm sm:text-base text-text-white tracking-[-0.176px] leading-6 truncate">
                  {displayName}
                </div>
                <div className="font-inter font-normal text-xs text-neutral-300 leading-4 truncate">
                  {displayEmail}
                </div>
              </div>
            </div>
            <div className="text-neutral-300 text-base ml-2 shrink-0" aria-hidden="true">
              ↑
            </div>
          </div>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div
              ref={profileDropdownRef}
              className="absolute bottom-[88px] left-4 right-4 bg-white border border-stroke-primary rounded-12 shadow-lg z-[1001] overflow-hidden"
              role="menu"
            >
              <div className="flex flex-col">
                <Link
                  to="/account-settings"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onMobileClose?.();
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-bg-surface-lv1 transition-colors cursor-pointer border-b border-stroke-primary no-underline text-inherit"
                  role="menuitem"
                >
                  <SettingsIcon isActive={false} />
                  <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">
                    Account Settings
                  </span>
                </Link>
                <Link
                  to="/deferred/plan-billing"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onMobileClose?.();
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-lv1 transition-colors cursor-pointer border-b border-stroke-primary no-underline text-inherit"
                  role="menuitem"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 2.5L12.5 8.5L19 9.5L14 14L15 20.5L10 17L5 20.5L6 14L1 9.5L7.5 8.5L10 2.5Z" fill="#2b3d39" />
                  </svg>
                  <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">
                    Plan & Billings
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onMobileClose?.();
                    if (clerkEnabled && clerk) {
                      void clerk.signOut(() => navigate('/', { replace: true }));
                      return;
                    }
                    navigate('/signin', { replace: true });
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface-lv1 transition-colors cursor-pointer text-left w-full border-0 bg-transparent"
                  role="menuitem"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M7.5 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5H7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.3333 14.1667L17.5 10L13.3333 5.83333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17.5 10H7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">
                    Sign out
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
