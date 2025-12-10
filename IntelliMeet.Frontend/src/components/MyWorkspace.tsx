import React, { useState } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const MyWorkspace: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [workspaceName, setWorkspaceName] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [teams, setTeams] = useState<string[]>(['Design Team']);
    const [email, setEmail] = useState('hipixem@gmail.com');
    const [selectedTeam, setSelectedTeam] = useState('Select team');
    const [selectedUser, setSelectedUser] = useState('Select User');
    const [automaticNotes, setAutomaticNotes] = useState(true);
    const [transcriptionNotes, setTranscriptionNotes] = useState(true);
    const [sendRecaps, setSendRecaps] = useState(true);
    const [googleCalendar, setGoogleCalendar] = useState(true);
    const [zoom, setZoom] = useState(true);
    const [gmail, setGmail] = useState(true);
    const [googleMeet, setGoogleMeet] = useState(true);
    const [slack, setSlack] = useState(true);
    const [microsoftTeams, setMicrosoftTeams] = useState(true);
    const [jira, setJira] = useState(true);
    const [trello, setTrello] = useState(true);
    const [asana, setAsana] = useState(true);
    const [workspaceCompleted, setWorkspaceCompleted] = useState(false);
    const [activeTab, setActiveTab] = useState('teams');

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
                    <SearchBar />
                </div>

                {/* Conditional Rendering: Workspace Management or Creation Flow */}
                {workspaceCompleted ? (
                    <>
                        {/* Page Header */}
                        <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                            <div className="flex gap-3 items-center w-full">
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                    Create Workspace
                                </h1>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 pt-4">
                            <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 px-5 py-4 flex gap-5 items-center">
                                <button
                                    onClick={() => setActiveTab('teams')}
                                    className={`flex gap-1 items-center justify-center relative cursor-pointer ${activeTab === 'teams' ? 'text-text-primary' : 'text-text-secondary'
                                        }`}
                                >
                                    <span className="font-inter font-medium text-sm tracking-[-0.084px]">Teams</span>
                                    {activeTab === 'teams' && (
                                        <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('people')}
                                    className={`flex gap-1 items-center justify-center relative cursor-pointer ${activeTab === 'people' ? 'text-text-primary' : 'text-text-secondary'
                                        }`}
                                >
                                    <span className="font-inter font-medium text-sm tracking-[-0.084px]">People</span>
                                    {activeTab === 'people' && (
                                        <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`flex gap-1 items-center justify-center relative cursor-pointer ${activeTab === 'settings' ? 'text-text-primary' : 'text-text-secondary'
                                        }`}
                                >
                                    <span className="font-inter font-medium text-sm tracking-[-0.084px]">Settings</span>
                                    {activeTab === 'settings' && (
                                        <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('permissions')}
                                    className={`flex gap-1 items-center justify-center relative cursor-pointer ${activeTab === 'permissions' ? 'text-text-primary' : 'text-text-secondary'
                                        }`}
                                >
                                    <span className="font-inter font-medium text-sm tracking-[-0.084px]">Permissions</span>
                                    {activeTab === 'permissions' && (
                                        <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500"></div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Workspace Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-4">
                            <div className="flex gap-4">
                                {/* Left Panel - Teams List */}
                                <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <h2 className="font-inter-tight font-medium text-xl leading-8 text-text-primary m-0">
                                                {workspaceName || 'Pixem Studio'}
                                            </h2>
                                            <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                                {teams.length} team{teams.length !== 1 ? 's' : ''} in this Workspace
                                            </p>
                                        </div>
                                        <button className="bg-primary-500 text-white rounded-8 px-3 py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] hover:bg-primary-600">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                                                <path d="M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            New Team
                                        </button>
                                    </div>

                                    {/* Teams Table */}
                                    <div className="border border-stroke-primary rounded-8 overflow-hidden">
                                        <div className="bg-bg-surface-lv1 border-b border-stroke-primary grid grid-cols-3 gap-4 px-4 py-2">
                                            <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Team Name</div>
                                            <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Team Member</div>
                                            <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Manager(s)</div>
                                        </div>
                                        {teams.map((team, index) => (
                                            <div key={index} className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-stroke-primary last:border-b-0">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-stroke-secondary cursor-pointer" />
                                                    <span className="font-inter font-normal text-sm text-text-primary">{team || `Team ${index + 1}`}</span>
                                                </div>
                                                <div className="font-inter font-normal text-sm text-text-secondary">{24 - index * 2} Member</div>
                                                <div className="font-inter font-normal text-sm text-text-secondary">12:10 PM</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Panel - Members List */}
                                <div className="w-[414px] bg-bg-surface-pure border border-stroke-primary rounded-12 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <h2 className="font-inter-tight font-medium text-xl leading-8 text-text-primary m-0">
                                            {workspaceName || 'Pixem Studio'}
                                        </h2>
                                    </div>
                                    <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] mb-4">
                                        Member 10
                                    </p>

                                    {/* Members List */}
                                    <div className="space-y-2 mb-4">
                                        {['Danial Vactory', 'Devid Lee', 'Adam Smith', 'Eleanor Pena', 'Savannah Nguyen', 'Kristin Watson', 'Annette Black', 'Williams Jonsson', 'Jerome Bell', 'Richard Johnson'].map((name, index) => (
                                            <div key={index} className="flex items-center gap-3 px-3 py-2 border border-stroke-primary rounded-8">
                                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
                                                    {name.charAt(0)}
                                                </div>
                                                <span className="font-inter font-normal text-sm text-text-primary">{name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="bg-primary-500 text-white rounded-8 px-3 py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] hover:bg-primary-600 w-full">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1">
                                            <path d="M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Add members
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Page Header */}
                        <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                            <div className="flex gap-3 items-center w-full">
                                <button className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                    Create Workspace
                                </h1>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-4 max-w-[1106px] w-full mx-auto">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-16 shadow-card flex flex-col gap-4 p-4">
                        {/* Step Indicator */}
                        <div className="flex gap-2 items-center">
                            <button 
                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 18L9 12L15 6" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <span className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                Step {currentStep} of 5
                            </span>
                        </div>

                        {/* Step 1 Content */}
                        {currentStep === 1 && (
                            <>
                                {/* Content Card */}
                                <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                            Create a workspace
                                        </h2>
                                        <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            Workspaces allow companies to build holistic views of metrics, and allow for custom permissions across teams and individuals.
                                        </p>
                                    </div>
                                </div>

                                {/* Input Field */}
                                <div className="flex flex-col gap-1">
                                    <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                        Name your new organization
                                    </label>
                                    <input
                                        type="text"
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)}
                                        placeholder="Your workspace name, e.g., Acme Inc..."
                                        className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] outline-none focus:border-primary-500"
                                    />
                                </div>

                                {/* Checkbox */}
                                <div className="flex gap-2 items-start">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="w-5 h-5 rounded border-stroke-secondary border-2 bg-bg-surface-pure shadow-[0px_1px_2px_0px_rgba(6,27,22,0.06)] cursor-pointer accent-primary-500"
                                    />
                                    <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                        I have read and agree to the{' '}
                                        <span className="text-primary-500 cursor-pointer hover:underline">Data Processing and Agreement</span>
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!workspaceName || !agreedToTerms}
                                        className={`rounded-8 px-[10px] py-2 flex items-center justify-center font-inter font-medium text-sm tracking-[-0.084px] ${
                                            workspaceName && agreedToTerms
                                                ? 'bg-primary-100 text-white cursor-pointer hover:bg-primary-200'
                                                : 'bg-primary-100 text-white opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        Next step
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 2 Content */}
                        {currentStep === 2 && (
                            <>
                                {/* Content */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                            Create teams in your organization
                                        </h2>
                                        <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            Teams allow your organization to customize settings for different groups of people
                                        </p>
                                    </div>
                                </div>

                                {/* Team Input Fields */}
                                <div className="flex flex-col gap-3">
                                    {teams.map((team, index) => (
                                        <div key={index} className="flex flex-col gap-1">
                                            <input
                                                type="text"
                                                value={team}
                                                onChange={(e) => {
                                                    const newTeams = [...teams];
                                                    newTeams[index] = e.target.value;
                                                    setTeams(newTeams);
                                                }}
                                                className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] outline-none focus:border-primary-500"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Add Another Team */}
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => setTeams([...teams, ''])}
                                        className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 4V16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4 10H16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setTeams([...teams, ''])}
                                        className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] cursor-pointer hover:text-text-primary transition-colors bg-transparent border-none p-0"
                                    >
                                        Add another team
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        Skip for now
                                    </button>
                                    <button 
                                        onClick={() => setCurrentStep(3)}
                                        className="bg-primary-500 rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-600"
                                    >
                                        Next Step
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3 Content */}
                        {currentStep === 3 && (
                            <>
                                {/* Content */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                            Invite people to join your Workspace
                                        </h2>
                                        <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            Invited members will need to accept the Workspace invitation before joining.
                                        </p>
                                    </div>
                                </div>

                                {/* Add email input */}
                                <div className="flex flex-col gap-1">
                                    <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                        Add email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="hipixem@gmail.com"
                                        className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px] outline-none focus:border-primary-500"
                                    />
                                </div>

                                {/* Select team dropdown */}
                                <div className="flex flex-col gap-1">
                                    <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                        Select team
                                    </label>
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer">
                                        <span className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                            {selectedTeam}
                                        </span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Select User dropdown */}
                                <div className="flex flex-col gap-1">
                                    <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                        Select User
                                    </label>
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer">
                                        <span className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                            {selectedUser}
                                        </span>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="flex gap-1 items-center">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="7" stroke="#2b3d39" strokeWidth="1.5" />
                                            <path d="M8 5V8M8 11H8.01" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            All licenses (1) are in use.{' '}
                                            <span className="text-primary-500 underline cursor-pointer hover:no-underline">Add additional licenses</span>
                                            {' '}to invite people to your Workspace.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]">
                                        Skip for now
                                    </button>
                                    <button 
                                        onClick={() => setCurrentStep(4)}
                                        className="bg-primary-500 rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-600"
                                    >
                                        Send invites
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 4 Content */}
                        {currentStep === 4 && (
                            <>
                                {/* Content */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                            Review Workspace default settings
                                        </h2>
                                        <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                            We copied some settings from your account to use in your Workspace. please confirm that every in your Workspace should use these default settings:
                                        </p>
                                    </div>
                                </div>

                                {/* Report settings section */}
                                <div className="flex flex-col gap-2">
                                    <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        Report settings
                                    </p>
                                    
                                    {/* Read join preferences card */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                        <div className="flex gap-3 items-start">
                                            <div className="bg-[#d1f1eb] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 2C10.34 2 9 3.34 9 5V7C7.84 7.27 7 8.55 7 10V14L5 16V17H19V16L17 14V10C17 8.55 16.16 7.27 15 7V5C15 3.34 13.66 2 12 2Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Read join preferences
                                                </p>
                                                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                    Which meetings should Read Assistant automatically join to generate meeting reports?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                Join all meetings
                                            </p>
                                            <span className="font-inter font-normal text-xs leading-4 text-primary-500 cursor-pointer hover:underline">
                                                Edit
                                            </span>
                                        </div>
                                    </div>

                                    {/* Automatic Meeting Notes card */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                        <div className="flex gap-3 items-start">
                                            <div className="bg-[#d1f1eb] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M14 2V8H20" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Automatic Meeting Notes
                                                </p>
                                                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                    Automatically generate AI-powered summaries, chapters, action items, and key questions.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                Enabled (recommended)
                                            </p>
                                            <button
                                                onClick={() => setAutomaticNotes(!automaticNotes)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${automaticNotes ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${automaticNotes ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meeting transcription and notes card */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                        <div className="flex gap-3 items-start">
                                            <div className="bg-[#d1f1eb] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 9Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M8 3V7" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16 3V7" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3 13H21" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Meeting transcription and notes
                                                </p>
                                                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                    Enable transcripts, meeting summary, topics, action items, and kew questions in reports.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                Enabled (recommended)
                                            </p>
                                            <button
                                                onClick={() => setTranscriptionNotes(!transcriptionNotes)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${transcriptionNotes ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${transcriptionNotes ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Share section */}
                                <div className="flex flex-col gap-2">
                                    <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        Report Share
                                    </p>
                                    
                                    {/* Send meeting recaps card */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                        <div className="flex gap-3 items-start">
                                            <div className="bg-[#d1f1eb] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M22 6L12 13L2 6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Send meeting recaps
                                                </p>
                                                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                    Who should be sent recaps after a meeting via distribution channels like email, Sack, or Teams?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                Enabled (recommended)
                                            </p>
                                            <button
                                                onClick={() => setSendRecaps(!sendRecaps)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${sendRecaps ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${sendRecaps ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Access section */}
                                <div className="flex flex-col gap-2">
                                    <p className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        Access
                                    </p>
                                    
                                    {/* Team report access card */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                        <div className="flex gap-3 items-start">
                                            <div className="bg-[#d1f1eb] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Team report access
                                                </p>
                                                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                    Should people in a team automatically have access to everyone else's reports?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                No, don't automatically share
                                            </p>
                                            <span className="font-inter font-normal text-xs leading-4 text-primary-500 cursor-pointer hover:underline">
                                                Edit
                                            </span>
                                        </div>
                                    </div>

                                    {/* Member settings card */}
                                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                        <div className="flex gap-3 items-start">
                                            <div className="bg-[#d1f1eb] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Member settings
                                                </p>
                                                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                    Allow members to update their settings?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                                                Yes' only to more restrictive options
                                            </p>
                                            <span className="font-inter font-normal text-xs leading-4 text-primary-500 cursor-pointer hover:underline">
                                                Edit
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setCurrentStep(3)}
                                        className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-1">
                                            <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Back
                                    </button>
                                    <button 
                                        onClick={() => setCurrentStep(5)}
                                        className="bg-primary-500 rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-600"
                                    >
                                        Next step
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 5 Content */}
                        {currentStep === 5 && (
                            <>
                                {/* Content */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                            Enable Integrations
                                        </h2>
                                        <p className="font-inter font-normal text-sm leading-5 text-[#5d6b68] tracking-[-0.084px] m-0">
                                            Read integrations with may platforms to streamline workflows and make meeting notes accessible. Enable the integrations you want available to your workspace members.
                                        </p>
                                    </div>
                                </div>

                                {/* Integrations Grid */}
                                <div className="flex flex-col gap-2">
                                    {/* Row 1 */}
                                    <div className="flex gap-3">
                                        {/* Google Calendar */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="6" y="6" width="20" height="20" rx="2" fill="white" />
                                                        <path d="M10 2V8M22 2V8M6 12H26" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Google Calendar
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setGoogleCalendar(!googleCalendar)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${googleCalendar ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${googleCalendar ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>

                                        {/* Zoom */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <circle cx="16" cy="16" r="14" fill="white" />
                                                        <path d="M16 8V16L20 20" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Zoom
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setZoom(!zoom)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${zoom ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${zoom ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="flex gap-3">
                                        {/* Gmail */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="4" y="6" width="24" height="20" rx="2" fill="white" />
                                                        <path d="M4 10L16 18L28 10" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Gmail
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setGmail(!gmail)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${gmail ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${gmail ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>

                                        {/* Google Meet */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="4" y="8" width="24" height="16" rx="2" fill="white" />
                                                        <circle cx="12" cy="16" r="2" fill="#16a34a" />
                                                        <circle cx="20" cy="16" r="2" fill="#16a34a" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Google meet
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setGoogleMeet(!googleMeet)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${googleMeet ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${googleMeet ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Row 3 */}
                                    <div className="flex gap-3">
                                        {/* Slack */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="4" y="4" width="24" height="24" rx="2" fill="white" />
                                                        <path d="M12 12H20M12 16H20M12 20H16" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Slack
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSlack(!slack)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${slack ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${slack ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>

                                        {/* Microsoft Teams */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="4" y="4" width="24" height="24" rx="2" fill="white" />
                                                        <circle cx="12" cy="12" r="2" fill="#16a34a" />
                                                        <circle cx="20" cy="12" r="2" fill="#16a34a" />
                                                        <path d="M8 20L12 16L16 20L24 12" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Microsoft Teams
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setMicrosoftTeams(!microsoftTeams)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${microsoftTeams ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${microsoftTeams ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Row 4 */}
                                    <div className="flex gap-3">
                                        {/* Jira */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="4" y="4" width="24" height="24" rx="2" fill="white" />
                                                        <path d="M10 10H22M10 16H22M10 22H18" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Jira
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setJira(!jira)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${jira ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${jira ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>

                                        {/* Trello */}
                                        <div className="flex-1 bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <rect x="4" y="4" width="24" height="24" rx="2" fill="white" />
                                                        <rect x="8" y="8" width="6" height="16" rx="1" fill="#16a34a" />
                                                        <rect x="16" y="8" width="6" height="12" rx="1" fill="#16a34a" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Trello
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setTrello(!trello)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${trello ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${trello ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Row 5 */}
                                    <div className="flex gap-3">
                                        {/* Asana */}
                                        <div className="w-[324px] bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-center justify-between">
                                            <div className="flex gap-3 items-center">
                                                <div className="bg-[#e8f2f2] border border-stroke-primary rounded-8 p-[7px] flex items-center justify-center shadow-[0px_1px_2px_0px_rgba(6,27,22,0.04)]">
                                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                        <circle cx="16" cy="16" r="12" fill="white" />
                                                        <path d="M12 16L16 12L20 16L16 20L12 16Z" fill="#16a34a" />
                                                    </svg>
                                                </div>
                                                <p className="font-inter font-normal text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                                    Assana
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setAsana(!asana)}
                                                className={`relative w-11 h-6 rounded-full transition-colors ${asana ? 'bg-primary-500' : 'bg-neutral-300'}`}
                                            >
                                                <div className={`absolute top-0 left-0 w-6 h-6 bg-white border-2 rounded-full transition-transform ${asana ? 'translate-x-5 border-primary-400' : 'translate-x-0 border-neutral-300'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setCurrentStep(4)}
                                        className="bg-bg-surface-lv1 border border-bg-surface-pure rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-1">
                                            <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Back
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setWorkspaceCompleted(true);
                                        }}
                                        className="bg-primary-500 rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-white tracking-[-0.084px] hover:bg-primary-600"
                                    >
                                        Finish
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyWorkspace;

