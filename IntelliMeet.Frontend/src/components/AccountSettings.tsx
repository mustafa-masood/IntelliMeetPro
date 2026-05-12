import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const settingsTabs = [
    { id: 'profile', label: 'Profile & Account' },
    { id: 'assistant', label: 'Meeting Assistant' },
    { id: 'insights', label: 'Meeting Insights' },
    { id: 'vocabulary', label: 'Custom Vocabulary' },
    { id: 'email', label: 'Email' },
    { id: 'advanced', label: 'Advanced' },
  ];

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />

      <div className="ml-0 md:ml-[270px] flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
        {/* Topbar */}
        <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card shrink-0 z-100">
          <SearchBar />
        </div>

        {/* Page Header */}
        <div className="px-8 pt-[10px] flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">Account Settings</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex gap-8 px-8 pt-4 pb-8 overflow-y-auto overflow-x-hidden">
          {/* Left Sidebar - Settings Navigation */}
          <div className="w-[394px] flex-shrink-0">
            <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-4 flex flex-col gap-3">
              <div className="flex gap-2 items-center pb-3 border-b border-stroke-primary">
                <button className="flex-1 border border-stroke-secondary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] bg-bg-surface-pure">
                  <span>Search integrations</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="border border-stroke-secondary rounded-8 px-3 py-2 flex items-center gap-2 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] bg-bg-surface-pure">
                  <span>Show filter</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2 py-2 rounded-8 text-left font-inter font-normal text-sm text-text-primary tracking-[-0.084px] transition-colors ${
                      activeTab === tab.id
                        ? 'bg-bg-surface-lv2 border border-stroke-primary'
                        : 'bg-bg-surface-pure border border-stroke-primary hover:bg-bg-surface-lv1'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4 flex flex-col gap-4">
              {/* Tab Header */}
              <div className="flex gap-2 items-center">
                <div className="bg-state-success-lighter border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#1d584c" />
                    <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#1d584c" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-inter font-medium text-lg text-text-secondary tracking-[-0.27px] m-0">Profile & Account</h2>
                  <p className="font-inter font-normal text-xs text-text-secondary m-0">Manage name, role, email, password, and SSO settings.</p>
                </div>
              </div>

              {/* Your Account Section */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="2.5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 2.5V5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 15V17.5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4.22656 4.22656L6.06656 6.06656" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.9333 13.9333L15.7733 15.7733" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2.5 10H5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15 10H17.5" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4.22656 15.7733L6.06656 13.9333" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.9333 6.06656L15.7733 4.22656" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3 className="font-inter-tight font-medium text-2xl text-text-primary m-0">Your Account</h3>
                  </div>
                  <p className="font-inter font-normal text-xs text-text-secondary">Manage personal details, primary email, and password.</p>
                </div>

                {/* Profile Section */}
                <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-xl shrink-0">
                    DL
                  </div>
                  <button className="border border-stroke-secondary rounded-8 px-[10px] py-2 flex items-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] bg-bg-surface-pure">
                    Upload a photo
                  </button>
                  <button className="bg-state-warning-lighter rounded-8 px-[10px] py-2 flex items-center cursor-pointer font-inter font-medium text-sm text-state-warning-dark tracking-[-0.084px]">
                    Delete
                  </button>
                </div>

                {/* Personal Details Section */}
                <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-inter font-medium text-lg text-text-secondary tracking-[-0.27px] m-0">Personal Details</h4>
                    <button className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Name</label>
                      <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2">
                        <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">John Doe</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Job title</label>
                      <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2">
                        <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">Produt Designer</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Role level</label>
                      <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2">
                        <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">Other</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Department</label>
                      <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2">
                        <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">Design</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Primary Email</label>
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2">
                      <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">stodiopixem@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Password</label>
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2">
                      <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">*********</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-inter font-medium text-base text-text-primary tracking-[-0.176px]">Default Language</label>
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between">
                      <span className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">English</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* SSO Section */}
                <div className="flex flex-col gap-2">
                  <p className="font-inter font-normal text-base text-text-secondary tracking-[-0.176px]">Single Sign-On (SSO)</p>
                  
                  <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <path d="M16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16Z" fill="#4285F4" />
                          <path d="M16 18.6667C10.6667 18.6667 6.66667 22.6667 6.66667 28H25.3333C25.3333 22.6667 21.3333 18.6667 16 18.6667Z" fill="#34A853" />
                          <path d="M16 4V18.6667C21.3333 18.6667 25.3333 22.6667 25.3333 28H28C28 22.6667 24 18.6667 18.6667 18.6667V4H16Z" fill="#FBBC04" />
                          <path d="M4 28C4 22.6667 8 18.6667 13.3333 18.6667V4H10.6667C5.33333 4 1.33333 8 1.33333 13.3333V28H4Z" fill="#EA4335" />
                        </svg>
                      </div>
                      <p className="font-inter font-normal text-base text-text-primary tracking-[-0.176px]">Sign-in with Google in enabled</p>
                    </div>
                    <button className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6L18 18" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <circle cx="16" cy="16" r="14" fill="#00AFF0" />
                          <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8Z" fill="white" />
                          <path d="M16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12Z" fill="#00AFF0" />
                        </svg>
                      </div>
                      <p className="font-inter font-normal text-base text-text-primary tracking-[-0.176px]">Sign-in with Skype is enabled</p>
                    </div>
                    <button className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 6L18 18" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button className="bg-primary-500 rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] self-start">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

