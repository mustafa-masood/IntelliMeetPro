import React, { useState } from 'react';
import Sidebar from './Sidebar';
import {
  ClipboardIcon,
  ArrowPathIcon,
  HandThumbUpIcon,
  PaperAirplaneIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const AskAI: React.FC = () => {
  const [message, setMessage] = useState('');

  const iconBtn =
    "p-1.5 hover:bg-bg-surface-lv1 rounded-md transition-colors cursor-pointer";

  return (
    <div className="flex w-full h-screen bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />

      <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-bg-surface-pure overflow-hidden">

          {/* Header */}
          <div className="bg-bg-surface-lv1 border-b border-stroke-primary px-5 py-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="font-inter-tight font-medium text-2xl text-text-primary m-0">
                Chat with IntelliMeet AI
              </h1>
              <p className="text-sm text-text-secondary m-0">
                Ask anything about your conversations
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-20 xl:px-32 py-8 flex flex-col items-center gap-4">

            {/* AI Message */}
            <div className="w-full max-w-[806px] border border-stroke-primary rounded-12 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  im
                </div>
                <span className="text-sm text-text-secondary">IntelliMeet AI</span>
              </div>

              <p className="text-sm text-text-secondary">
                IntelliMeet AI Chat generates answers from your meetings and notes.
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button className={iconBtn}>
                  <ClipboardIcon className="w-5 h-5" />
                </button>
                <button className={iconBtn}>
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button className={iconBtn}>
                  <HandThumbUpIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Message */}
            <div className="w-full max-w-[806px] border border-stroke-primary rounded-12 p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">
                    MM
                  </div>
                  <span className="text-sm text-text-secondary">
                    Mustafa Masood
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  04/01/2025, 4:30 PM
                </span>
              </div>

              <p className="text-sm text-text-secondary">
                Can you explain the significance of the automatic action item generation feature?
              </p>
            </div>

            {/* AI Response */}
            <div className="w-full max-w-[806px] border border-stroke-primary rounded-12 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  im
                </div>
                <span className="text-sm text-text-secondary">IntelliMeet AI</span>
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-sm text-text-secondary">
                <li>
                  <strong className="text-text-primary">Efficiency:</strong> Automatically tracks action items from meetings.
                </li>
                <li>
                  <strong className="text-text-primary">Clarity:</strong> Everyone knows their responsibilities.
                </li>
                <li>
                  <strong className="text-text-primary">Organization:</strong> Tasks are structured and easy to manage.
                </li>
              </ol>

              {/* Actions */}
              <div className="flex gap-2">
                <button className={iconBtn}>
                  <ClipboardIcon className="w-5 h-5" />
                </button>
                <button className={iconBtn}>
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button className={iconBtn}>
                  <HandThumbUpIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-stroke-primary px-4 md:px-10 lg:px-20 xl:px-32 py-4">
            <div className="border border-stroke-primary rounded-8 p-2 flex items-center justify-between">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask IntelliMeet anything"
                className="flex-1 bg-transparent outline-none text-sm px-2"
              />

              <div className="flex gap-2">
                <button className={iconBtn}>
                  <PlusIcon className="w-5 h-5" />
                </button>
                <button className={iconBtn}>
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AskAI;