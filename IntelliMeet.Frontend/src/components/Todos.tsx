import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import { imApi, type TodoItemDto } from '../api/intellimeet';

const Todos: React.FC = () => {
    const [items, setItems] = useState<TodoItemDto[]>([]);
    const [err, setErr] = useState<string | null>(null);

    const load = async () => {
        try {
            const list = await imApi.listTodos();
            setItems(list);
            setErr(null);
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Failed to load');
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const formatDue = (iso?: string | null) => {
        if (!iso) return '—';
        try {
            return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return iso;
        }
    };

    return (
        <div className="flex w-screen h-screen bg-bg-surface-lv1 overflow-hidden">
            <Sidebar />

            <div className="ml-[270px] flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="bg-bg-surface-alpha-90 backdrop-blur-[6px] border-b border-stroke-primary px-8 py-[13px] flex items-center justify-between shadow-card sticky top-0 z-100">
                    <SearchBar />
                </div>

                <div className="px-8 pt-[10px] flex flex-col gap-4 max-w-[1106px] w-full mx-auto">
                    <div className="flex items-center justify-between w-full">
                        <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">Notes</h1>
                        <button
                            type="button"
                            onClick={() => void load()}
                            className="text-sm font-inter text-primary-600 underline"
                        >
                            Refresh
                        </button>
                    </div>
                    {err && <p className="text-sm text-amber-700 font-inter">{err}</p>}
                </div>

                <div className="flex-1 px-8 py-4 max-w-[1106px] w-full mx-auto">
                    <div className="bg-bg-surface-pure border border-stroke-primary rounded-16 shadow-card flex flex-col gap-4 p-4 overflow-y-auto">
                        <div className="flex items-center gap-2 py-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4H20V20H4V4Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8H16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 12H16" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 16H12" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <h2 className="font-inter font-medium text-base leading-6 text-text-primary tracking-[-0.176px] m-0">
                                Your To-do&apos;s
                            </h2>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto">
                            {items.length === 0 && !err && (
                                <p className="text-sm text-text-secondary font-inter">No todos yet. Check an action item on a meeting to add one.</p>
                            )}
                            {items.map((item) => (
                                <div key={item.id} className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-3 flex items-start justify-between gap-3">
                                    <div className="flex flex-col gap-3 flex-1 max-w-[544px]">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-1"
                                                checked={item.status === 1}
                                                onChange={async () => {
                                                    const next = item.status === 1 ? 0 : 1;
                                                    try {
                                                        await imApi.patchTodo(item.id, { status: next });
                                                        await load();
                                                    } catch {
                                                        /* ignore */
                                                    }
                                                }}
                                            />
                                            <div className="flex flex-col gap-1">
                                                <p className="font-inter font-medium text-sm leading-5 text-text-primary tracking-[-0.084px] m-0">
                                                    {item.title}
                                                </p>
                                                {item.description && (
                                                    <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <div className="bg-[#d1f1eb] flex gap-0 items-center justify-center p-1 rounded-8">
                                                <span className="font-inter font-normal text-xs leading-4 text-text-primary px-1">{item.type}</span>
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M6.66667 2V5.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9.33333 2V5.33333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M2.66667 6.66667H13.3333" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3.33333 3.33333H12.6667C13.403 3.33333 14 3.93029 14 4.66667V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V4.66667C2 3.93029 2.59695 3.33333 3.33333 3.33333Z" stroke="#2b3d39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <span className="font-inter font-normal text-xs leading-4 text-text-secondary">{formatDue(item.dueDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Todos;
