import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const IntegrationDetails: React.FC = () => {
    const navigate = useNavigate();
    const { integrationId } = useParams<{ integrationId: string }>();
    const [workspace] = useState('My Team');
    const [project] = useState('Project Management');
    const [list] = useState('Select List');
    const [createAITasks, setCreateAITasks] = useState(true);
    const [autoAssignTasks, setAutoAssignTasks] = useState(true);

    // TODO(Mustafa): remove legacy integration metadata; keep record so old deep links stay compilable.
    const integrations: Record<string, { name: string; description: string; status: string; icon: string }> = {
        '4': { name: 'Slack Integrations', description: 'Seamless integration designed to unify processes and reduce manual effort.', status: 'active', icon: 'S' },
        '5': { name: 'Google Calendar Integrations', description: 'Connect your platform with calendar to join automatically and save time.', status: 'active', icon: 'C' },
        '7': { name: 'Asana Integrations', description: 'Unlock the power of automation with smart integrations for your team.', status: 'active', icon: 'A' },
        '8': { name: 'Jira Integrations', description: 'Create tasks in Jira from AI assisted meeting action items or using voice commands.', status: 'active', icon: 'J' },
        '9': { name: 'Trello Integrations', description: 'Enhance connectivity and achieve more with integrations that work seamlessly.', status: 'active', icon: 'T' },
    };

    const integration = integrationId ? integrations[integrationId] || integrations['7'] : integrations['7'];

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-0 md:ml-[270px] flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card shrink-0 z-100">
                    <SearchBar />
                </div>

                {/* Page Header */}
                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto shrink-0">
                    <div className="flex gap-3 items-center w-full">
                        <button
                            onClick={() => navigate('/deferred/app-integrations')}
                            className="p-1 hover:bg-bg-surface-lv1 rounded-4 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M12.5 5L7.5 10L12.5 15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="flex-1 flex flex-col">
                            <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                App & Integrations
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-8 py-4 max-w-[1106px] w-full mx-auto">
                    <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col gap-4 p-4">
                        {/* Integration Header */}
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3 items-center">
                                <div className="bg-bg-surface-lv2 p-4 rounded-full flex items-center justify-center relative">
                                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {integration.icon}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                        {integration.name}
                                    </h2>
                                    <div className="bg-[#d1f1eb] flex items-center justify-center px-[10px] py-[5px] rounded-8">
                                        <span className="font-inter font-medium text-sm text-[#1d584c] tracking-[-0.084px]">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="font-inter font-medium text-base leading-6 text-text-secondary tracking-[-0.176px] m-0">
                                {integration.description}
                            </p>
                            <div className="flex gap-3">
                                <button className="bg-primary-500 flex items-center justify-center px-[10px] py-2 rounded-8 cursor-pointer">
                                    <span className="font-inter font-medium text-sm text-white tracking-[-0.084px]">
                                        Disconnected
                                    </span>
                                </button>
                                <button className="bg-[#d1f1eb] flex items-center justify-center px-[10px] py-2 rounded-8 cursor-pointer">
                                    <span className="font-inter font-medium text-sm text-[#1d584c] tracking-[-0.084px]">
                                        Learn more
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="bg-bg-surface-pure border border-stroke-primary rounded-16 shadow-card flex flex-col gap-4 p-4">
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-3 items-center">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 2C9.5 2 9 2.5 9 3V4C8.5 4 8 4.5 8 5V7C8 7.5 7.5 8 7 8H3C2.5 8 2 8.5 2 9V17C2 17.5 2.5 18 3 18H17C17.5 18 18 17.5 18 17V9C18 8.5 17.5 8 17 8H13C12.5 8 12 7.5 12 7V5C12 4.5 11.5 4 11 4V3C11 2.5 10.5 2 10 2Z" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10 10V14" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 12H12" stroke="#243632" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <h3 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                        Settings
                                    </h3>
                                </div>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    Automatically create tasks on Jira from AI assisted meeting action items or using voice commands.
                                </p>
                            </div>

                            {/* Select Workspace */}
                            <div className="flex flex-col gap-1">
                                <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                    Select Workspace
                                </label>
                                <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer">
                                    <span className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        {workspace}
                                    </span>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Select Project */}
                            <div className="flex flex-col gap-1">
                                <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                    Select Project
                                </label>
                                <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer">
                                    <span className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        {project}
                                    </span>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Select List */}
                            <div className="flex flex-col gap-1">
                                <label className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px]">
                                    Select List
                                </label>
                                <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-between cursor-pointer">
                                    <span className="font-inter font-normal text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        {list}
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
                                        <span className="text-primary-500 underline cursor-pointer">Add additional licenses</span>
                                        {' '}to invite people to your Workspace.
                                    </p>
                                </div>
                            </div>

                            {/* Create AI Assisted tasks toggle */}
                            <div className="bg-bg-surface-lv2 border border-stroke-primary rounded-8 px-3 py-3 flex items-center justify-between">
                                <span className="font-inter font-medium text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                    Create AI Assisted tasks from Action items
                                </span>
                                <div
                                    onClick={() => setCreateAITasks(!createAITasks)}
                                    className={`h-6 rounded-[1000px] w-11 relative cursor-pointer ${createAITasks ? 'bg-primary-500' : 'bg-bg-surface-lv2'}`}
                                >
                                    <div className={`absolute w-6 h-6 rounded-full top-0 border-2 transition-all ${createAITasks
                                        ? 'bg-white border-primary-400 left-5'
                                        : 'bg-white border-stroke-primary left-0'
                                        }`} />
                                </div>
                            </div>

                            {/* Auto-Assign Tasks toggle */}
                            <div className="flex flex-col gap-1">
                                <div className="bg-bg-surface-lv2 border border-stroke-primary rounded-8 px-3 py-3 flex items-center justify-between">
                                    <span className="font-inter font-medium text-base leading-6 text-text-secondary tracking-[-0.176px]">
                                        Auto-Assign Tasks
                                    </span>
                                    <div
                                        onClick={() => setAutoAssignTasks(!autoAssignTasks)}
                                        className={`h-6 rounded-[1000px] w-11 relative cursor-pointer ${autoAssignTasks ? 'bg-primary-500' : 'bg-bg-surface-lv2'}`}
                                    >
                                        <div className={`absolute w-6 h-6 rounded-full top-0 border-2 transition-all ${autoAssignTasks
                                            ? 'bg-white border-primary-400 left-5'
                                            : 'bg-white border-stroke-primary left-0'
                                            }`} />
                                    </div>
                                </div>
                                <div className="flex gap-1 items-start">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5">
                                        <circle cx="8" cy="8" r="7" stroke="#2b3d39" strokeWidth="1.5" />
                                        <path d="M8 5V8M8 11H8.01" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                        Enable this to automatically assign tasks to users who already have access to the board. When disabled, tasks will be created but will remains unassigned.
                                    </p>
                                </div>
                            </div>

                            {/* Save Settings Button */}
                            <button className="bg-primary-500 flex items-center justify-center px-[10px] py-2 rounded-8 cursor-pointer self-start">
                                <span className="font-inter font-medium text-sm text-white tracking-[-0.084px]">
                                    Save Settings
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationDetails;

