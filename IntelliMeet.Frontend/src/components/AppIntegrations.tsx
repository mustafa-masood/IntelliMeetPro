import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    isConnected: boolean;
    category: 'recommended' | 'connected' | 'disconnected';
}

const AppIntegrations: React.FC = () => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<'all' | 'connected' | 'disconnected'>('all');

    const integrations: Integration[] = [
        { id: '1', name: 'Zoom', description: 'joining your work meeting on zoom', icon: 'zoom', isConnected: false, category: 'recommended' },
        { id: '2', name: 'Microsoft Teams', description: 'joining your work meeting on teams', icon: 'teams', isConnected: false, category: 'recommended' },
        { id: '3', name: 'Google meet', description: 'joining your work meeting on meet', icon: 'meet', isConnected: false, category: 'recommended' },
        { id: '4', name: 'Slack', description: 'Seamless integration designed to unify processes and reduce manual effort.', icon: 'slack', isConnected: true, category: 'connected' },
        { id: '5', name: 'Google Calendar', description: 'Connect your platform with calendar to join automatically and save time.', icon: 'calendar', isConnected: true, category: 'connected' },
        { id: '6', name: 'Gmail', description: 'Simplify your work with integrations that bring all your tools into one place.', icon: 'gmail', isConnected: true, category: 'connected' },
        { id: '7', name: 'Asana', description: 'Unlock the power of automation with smart integrations for your team.', icon: 'asana', isConnected: false, category: 'disconnected' },
        { id: '8', name: 'Jira', description: 'Make work easier with integrations that adapt to your processes and preferences.', icon: 'jira', isConnected: false, category: 'disconnected' },
        { id: '9', name: 'Trello', description: 'Enhance connectivity and achieve more with integrations that work seamlessly.', icon: 'trello', isConnected: false, category: 'disconnected' },
    ];

    const recommendedIntegrations = integrations.filter(i => i.category === 'recommended');
    const connectedIntegrations = integrations.filter(i => i.category === 'connected');
    const disconnectedIntegrations = integrations.filter(i => i.category === 'disconnected');

    const renderIntegrationCard = (integration: Integration, showActions: boolean = true) => (
        <div key={integration.id} className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card flex flex-col gap-3 p-4 flex-1 relative">
            <div className="flex items-center justify-between">
                <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 p-2">
                    <div className="w-8 h-8 bg-bg-surface-lv2 rounded-8 flex items-center justify-center">
                        <span className="text-xs font-bold text-text-secondary">{integration.name.charAt(0)}</span>
                    </div>
                </div>
                <div className={`h-6 rounded-[1000px] w-11 relative ${integration.isConnected ? 'bg-primary-500' : 'bg-bg-surface-lv2'}`}>
                    <div className={`absolute w-6 h-6 rounded-full top-0 border-2 ${integration.isConnected ? 'bg-white border-primary-400 left-5' : 'bg-white border-stroke-primary left-0'}`} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className={`font-inter leading-6 text-text-primary tracking-[-0.176px] m-0 ${
                    integration.category === 'connected' ? 'font-medium text-sm' : 'font-normal text-base'
                }`}>
                    {integration.name}
                </h3>
                <p className="font-inter font-normal text-xs leading-4 text-text-secondary m-0">
                    {integration.description}
                </p>
            </div>
            <div className="h-px bg-stroke-primary w-full" />
            {showActions && (
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(`/app-integrations/${integration.id}`)}
                        className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-2.5 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px]"
                    >
                        View integration
                    </button>
                    <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-2.5 flex items-center justify-center cursor-pointer font-inter font-medium text-sm text-[#ea580c] tracking-[-0.084px]">
                        Remove
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Topbar */}
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 flex items-center gap-2 w-[238px]">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 14L11.1 11.1" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <input
                            type="text"
                            className="flex-1 border-none outline-none font-inter text-sm text-text-secondary tracking-[-0.084px] bg-transparent placeholder:text-text-secondary"
                            placeholder="Search"
                        />
                        <div className="border border-stroke-primary rounded-[7px] px-[6px] py-0 font-inter text-sm text-text-secondary tracking-[-0.084px] leading-5">⌘ 1</div>
                    </div>
                </div>

                {/* Page Header */}
                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                    <div className="flex gap-3 items-center justify-between w-full">
                        <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                            App & Integrations
                        </h1>
                        <button className="bg-primary-500 flex gap-1 items-center justify-center px-[10px] py-2 rounded-8 cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 4V16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M4 10H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="font-inter font-medium text-sm text-white tracking-[-0.084px]">Add Integration</span>
                        </button>
                    </div>

                    <div className="flex gap-3 items-center w-full">
                        <div className="flex gap-2 items-start">
                            <div className="border border-stroke-primary rounded-8 shadow-[0px_1px_2px_0px_rgba(6,27,22,0.05)] overflow-hidden">
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className={`border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] leading-5 ${
                                        activeFilter === 'all' 
                                            ? 'bg-primary-500 text-white' 
                                            : 'bg-bg-surface-pure text-text-secondary'
                                    }`}
                                >
                                    All App
                                </button>
                            </div>
                            <button
                                onClick={() => setActiveFilter('connected')}
                                className={`border border-stroke-primary rounded-8 px-3 py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.084px] leading-5 ${
                                    activeFilter === 'connected' 
                                        ? 'bg-primary-500 text-white' 
                                        : 'bg-bg-surface-pure text-text-secondary'
                                }`}
                            >
                                Connected
                            </button>
                        </div>
                        <button
                            onClick={() => setActiveFilter('disconnected')}
                            className={`border border-stroke-primary rounded-8 px-[10px] py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm tracking-[-0.07px] leading-5 ${
                                activeFilter === 'disconnected' 
                                    ? 'bg-primary-500 text-white' 
                                    : 'bg-bg-surface-pure text-text-secondary'
                            }`}
                        >
                            Disconnected
                        </button>
                        <button className="bg-bg-surface-pure border border-stroke-secondary rounded-8 px-[10px] py-2 flex items-center gap-1 cursor-pointer font-inter font-medium text-sm text-text-secondary tracking-[-0.084px] leading-5">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M8.33333 15V10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.33333 5V8.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 12.5V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M15 5V8.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 10V15" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 5V6.66667" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.6667 5H8.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13.3333 10H10" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.66667 12.5H5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Filter</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M5 7.5L10 12.5L15 7.5" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-8 py-4 max-w-[1106px] w-full mx-auto">
                    <div className="bg-bg-surface-pure rounded-12 shadow-card flex flex-col gap-4 p-4">
                        {/* Recommended to Connect Section */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                    Recommended to Connect
                                </h2>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    Experience a seamless integration that streamlines workflows, empowering your team to achieve optimal results and make the most out of every task.
                                </p>
                            </div>
                            <div className="flex gap-5">
                                {recommendedIntegrations.map(integration => renderIntegrationCard(integration))}
                            </div>
                        </div>

                        {/* Connected Section */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                    Connected
                                </h2>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    Enjoy effortless integration that enhances workflows, enabling your team to excel and maximize productivity with every task.
                                </p>
                            </div>
                            <div className="flex gap-5">
                                {connectedIntegrations.map(integration => renderIntegrationCard(integration))}
                            </div>
                        </div>

                        {/* Disconnected Section */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <h2 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">
                                    Disconnected
                                </h2>
                                <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                    Discover smooth integration that simplifies workflows, boosting your team's efficiency and helping them excel with every task.
                                </p>
                            </div>
                            <div className="flex gap-5">
                                {disconnectedIntegrations.map(integration => renderIntegrationCard(integration, false))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppIntegrations;

