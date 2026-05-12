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
  const profileButtonRef = useRef<HTMLButtonElement>(null);
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
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-[1000] 
          w-[270px] h-screen 
          flex flex-col border-r border-white/[0.06]
          bg-gradient-to-b from-neutral-900 via-neutral-900 to-[#030d0b]
          shadow-panel
          transform transition-transform duration-300 ease-out
          md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/intellimeet-logo-light.png"
              alt="IntelliMeet Logo"
              className="h-9 w-9 rounded-10 object-contain shadow-float ring-1 ring-white/10"
            />
            <span className="font-inter-tight mt-0.5 flex h-8 items-center text-xl font-semibold tracking-tight text-white sm:text-2xl">
              IntelliMeet
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-1 pb-5 scrollbar-hide">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="flex flex-col gap-0.5">
            {isEnterprise && (
              <Link
                to="/my-workspace"
                className={`flex h-10 cursor-pointer items-center gap-3 rounded-10 border px-3 no-underline text-inherit transition-all duration-200 ${
                  location.pathname === '/my-workspace'
                    ? 'border-white/10 bg-gradient-to-r from-primary-500/25 to-white/[0.03] shadow-[inset_3px_0_0_0_#16a34a]'
                    : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.05]'
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
                  className={`relative flex h-10 cursor-pointer items-center gap-3 rounded-10 border px-3 no-underline text-inherit transition-all duration-200 ${
                    isActive
                      ? 'border-white/10 bg-gradient-to-r from-primary-500/25 to-white/[0.03] shadow-[inset_3px_0_0_0_#16a34a]'
                      : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                  onClick={onMobileClose}
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    {renderIcon(item.iconType, isActive)}
                  </div>
                  <span
                    className={`flex-1 font-inter text-sm font-medium tracking-tight ${
                      isActive ? 'text-white' : 'text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="flex flex-col">
            <div className="px-3 pb-2 pt-1 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Preference
            </div>
            <Link
              to="/deferred/app-integrations"
              className={`flex h-10 cursor-pointer items-center gap-3 rounded-10 border px-3 no-underline text-inherit transition-all duration-200 ${
                location.pathname.startsWith('/deferred/app-integrations')
                  ? 'border-white/10 bg-gradient-to-r from-primary-500/25 to-white/[0.03] shadow-[inset_3px_0_0_0_#16a34a]'
                  : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.05]'
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
          <div className="mx-4 mb-4 flex flex-col gap-2 rounded-12 border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
            <div className="font-inter text-base font-medium leading-6 tracking-tight text-white">
              {planBadge}
            </div>
            {me?.role ? (
              <div className="font-inter font-normal text-xs text-neutral-300 leading-4">Role: {me.role}</div>
            ) : null}
          </div>
        ) : null}

        {/* Profile Section */}
        <div className="relative shrink-0 bg-neutral-900/80 px-4 py-4 sm:p-5">
          <button
            type="button"
            ref={profileButtonRef}
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsProfileDropdownOpen(false);
            }}
            className="flex w-full cursor-pointer items-center justify-between rounded-12 border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-3 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-white/15 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400/80"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="menu"
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              className={`ml-2 shrink-0 text-neutral-300 transition-transform duration-200 ${
                isProfileDropdownOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Profile Dropdown */}
          {isProfileDropdownOpen && (
            <div
              ref={profileDropdownRef}
              className="absolute bottom-[88px] left-4 right-4 z-[1001] overflow-hidden rounded-12 border border-stroke-primary bg-bg-surface-pure/95 shadow-panel backdrop-blur-md"
              role="menu"
            >
              <div className="flex flex-col">
                <Link
                  to="/account-settings"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onMobileClose?.();
                  }}
                  className="flex cursor-pointer items-center gap-3 border-b border-stroke-primary bg-bg-surface-pure px-4 py-3 no-underline text-inherit transition-colors hover:bg-bg-surface-lv1"
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
                  className="flex cursor-pointer items-center gap-3 border-b border-stroke-primary px-4 py-3 no-underline text-inherit transition-colors hover:bg-bg-surface-lv1"
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
                  className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3 text-left transition-colors hover:bg-bg-surface-lv1"
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
