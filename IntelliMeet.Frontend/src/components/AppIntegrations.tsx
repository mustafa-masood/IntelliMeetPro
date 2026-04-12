import React, { useState } from 'react';
import Sidebar from './Sidebar';

import { FaSlack, FaGoogle, FaTrello, } from "react-icons/fa";
import { SiZoom } from "react-icons/si";
import { SiJira, SiAsana } from "react-icons/si";

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    isConnected: boolean;
    category: 'recommended' | 'connected' | 'disconnected';
}

const AppIntegrations: React.FC = () => {
    const [activeFilter, setActiveFilter] =
        useState<'all' | 'connected' | 'disconnected'>('all');

    const [integrations, setIntegrations] = useState<Integration[]>([
        { id: '1', name: 'Zoom', description: 'Joining your work meeting on Zoom', icon: 'zoom', isConnected: false, category: 'recommended' },
        { id: '2', name: 'Microsoft Teams', description: 'Joining your work meeting on Teams', icon: 'teams', isConnected: false, category: 'recommended' },
        { id: '3', name: 'Google Meet', description: 'Joining your work meeting on Meet', icon: 'meet', isConnected: false, category: 'recommended' },

        { id: '4', name: 'Slack', description: 'Seamless integration to unify workflows', icon: 'slack', isConnected: true, category: 'connected' },
        { id: '5', name: 'Google Calendar', description: 'Auto join meetings via calendar sync', icon: 'calendar', isConnected: true, category: 'connected' },
        { id: '6', name: 'Gmail', description: 'Bring communication into one place', icon: 'gmail', isConnected: true, category: 'connected' },

        { id: '7', name: 'Asana', description: 'Automation for task management', icon: 'asana', isConnected: false, category: 'disconnected' },
        { id: '8', name: 'Jira', description: 'Adapt workflows for agile teams', icon: 'jira', isConnected: false, category: 'disconnected' },
        { id: '9', name: 'Trello', description: 'Visual project collaboration tools', icon: 'trello', isConnected: false, category: 'disconnected' },
    ]);

    const toggleIntegration = (id: string) => {
        setIntegrations(integrations.map(integration =>
            integration.id === id
                ? { ...integration, isConnected: !integration.isConnected }
                : integration
        ));
    };

    const iconMap: Record<string, React.ReactNode> = {
        zoom: <SiZoom />,
        slack: <FaSlack />,
        meet: <FaGoogle />,
        teams: <FaGoogle />,
        calendar: <FaGoogle />,
        gmail: <FaGoogle />,
        trello: <FaTrello />,
        jira: <SiJira />,
        asana: <SiAsana />
    };

    const getFilteredIntegrations = () => {
        if (activeFilter === 'connected') {
            return integrations.filter(i => i.isConnected);
        }
        if (activeFilter === 'disconnected') {
            return integrations.filter(i => !i.isConnected);
        }
        return integrations;
    };

    const visibleIntegrations = getFilteredIntegrations();

    const renderIntegrationCard = (integration: Integration) => (
        <div
            key={integration.id}
            className="bg-bg-surface-pure border border-stroke-primary rounded-12 shadow-card flex flex-col gap-2 md:gap-3 p-3 md:p-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-base md:text-lg text-text-secondary bg-bg-surface-lv2 rounded-8">
                    {iconMap[integration.icon] || integration.name.charAt(0)}
                </div>

                <button
                    onClick={() => toggleIntegration(integration.id)}
                    className={`h-6 w-11 rounded-full relative transition cursor-pointer ${integration.isConnected
                        ? 'bg-primary-500'
                        : 'bg-bg-surface-lv2'
                    }`}
                >
                    <div
                        className={`absolute w-6 h-6 rounded-full top-0 border-2 transition ${integration.isConnected
                            ? 'left-5 bg-white border-primary-400'
                            : 'left-0 bg-white border-stroke-primary'
                        }`}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
                <h3 className="font-inter font-medium text-sm md:text-base text-text-primary">
                    {integration.name}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2">
                    {integration.description}
                </p>
            </div>

            {/* Divider */}
            {/* <div className="h-px bg-stroke-primary w-full" /> */}

            {/* Actions */}
            {/* <div className="flex gap-3">
                <button
                    onClick={() => navigate(`/app-integrations/${integration.id}`)}
                    className="px-3 py-2 rounded-8 border border-stroke-secondary text-sm text-text-secondary"
                >
                    View integration
                </button>

                <button className="px-3 py-2 rounded-8 border border-stroke-secondary text-sm text-[#ea580c]">
                    Remove
                </button>
            </div> */}
        </div>
    );

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-0 md:ml-[270px] flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-4 md:px-8 mt-4 md:mt-6 max-w-[1106px] mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-xl md:text-2xl font-medium text-text-primary">
                        App & Integrations
                    </h1>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'connected', 'disconnected'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-3 py-2 rounded-8 text-xs md:text-sm font-medium transition ${activeFilter === filter
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-bg-surface-pure text-text-secondary'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 max-w-[1106px] mx-auto w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                        {visibleIntegrations.map(renderIntegrationCard)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppIntegrations;