import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import SearchBar from './SearchBar';
import { imApi, type TodoItemDto } from '../api/intellimeet';

const Todos: React.FC = () => {
    const [items, setItems] = useState<TodoItemDto[]>([]);
    const [err, setErr] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const stats = useMemo(() => {
        const open = items.filter((i) => i.status !== 1).length;
        const done = items.length - open;
        return { open, done, total: items.length };
    }, [items]);

    const visible = useMemo(() => {
        if (filter === 'open') return items.filter((i) => i.status !== 1);
        if (filter === 'done') return items.filter((i) => i.status === 1);
        return items;
    }, [items, filter]);

    const formatDue = (iso?: string | null) => {
        if (!iso) return null;
        try {
            return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return iso;
        }
    };

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 flex flex-col min-h-0 h-full overflow-hidden ml-0 md:ml-[270px] transition-all duration-300">
                <div className="bg-bg-surface-pure/90 backdrop-blur-md border-b border-stroke-primary h-14 flex items-center px-4 sm:px-8 shrink-0">
                    <SearchBar placeholder="Search to-dos…" className="sm:w-72" />
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
                        <header>
                            <p className="text-[11px] font-inter font-semibold uppercase tracking-wider text-text-tertiary m-0 mb-1">
                                Workspace
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div>
                                    <h1 className="font-inter-tight font-medium text-2xl sm:text-3xl text-text-primary m-0 tracking-tight">
                                        To-Dos
                                    </h1>
                                    <p className="text-sm text-text-secondary font-inter m-0 mt-2 max-w-lg">
                                        Tasks promoted from meeting action items stay linked to their source. Toggle status to track what is
                                        still open.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void load()}
                                    className="self-start px-4 py-2 rounded-10 border border-stroke-secondary bg-bg-surface-pure text-sm font-inter font-medium text-text-primary hover:bg-bg-surface-lv1 transition-colors"
                                >
                                    Refresh
                                </button>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { label: 'Open', value: stats.open, accent: 'border-l-primary-500' },
                                { label: 'Done', value: stats.done, accent: 'border-l-text-tertiary' },
                                { label: 'Total', value: stats.total, accent: 'border-l-stroke-secondary' },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className={`rounded-12 border border-stroke-primary bg-bg-surface-pure p-4 shadow-sm border-l-4 ${s.accent}`}
                                >
                                    <p className="text-xs font-inter font-medium text-text-tertiary m-0">{s.label}</p>
                                    <p className="text-2xl font-inter-tight font-semibold text-text-primary m-0 mt-1">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    ['all', 'All'],
                                    ['open', 'Open'],
                                    ['done', 'Done'],
                                ] as const
                            ).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setFilter(id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-inter font-medium transition-all ${
                                        filter === id
                                            ? 'bg-primary-500 text-white shadow-sm'
                                            : 'bg-bg-surface-pure border border-stroke-primary text-text-secondary hover:border-stroke-secondary'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {err && (
                            <div className="rounded-12 border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-text-primary font-inter">
                                {err}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pb-10">
                            {visible.length === 0 && !err && (
                                <div className="rounded-12 border border-dashed border-stroke-secondary bg-bg-surface-pure/80 px-6 py-12 text-center">
                                    <p className="font-inter font-medium text-text-primary m-0">Nothing here yet</p>
                                    <p className="text-sm text-text-secondary font-inter m-0 mt-2 max-w-md mx-auto">
                                        Open a meeting, then check an action item to send it to this list.
                                    </p>
                                </div>
                            )}
                            {visible.map((item) => {
                                const done = item.status === 1;
                                const due = formatDue(item.dueDate);
                                return (
                                    <div
                                        key={item.id}
                                        className={`group rounded-12 border border-stroke-primary bg-bg-surface-pure p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow ${
                                            done ? 'opacity-80' : ''
                                        }`}
                                    >
                                        <div className="flex gap-4 items-start">
                                            <button
                                                type="button"
                                                disabled={busyId === item.id}
                                                onClick={async () => {
                                                    const next = done ? 0 : 1;
                                                    setBusyId(item.id);
                                                    try {
                                                        await imApi.patchTodo(item.id, { status: next });
                                                        await load();
                                                    } catch {
                                                        /* keep UI stable */
                                                    } finally {
                                                        setBusyId(null);
                                                    }
                                                }}
                                                className={`mt-0.5 w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                                                    done
                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                        : 'border-stroke-secondary hover:border-primary-500'
                                                } disabled:opacity-50`}
                                                aria-pressed={done}
                                                aria-label={done ? 'Mark as open' : 'Mark as done'}
                                            >
                                                {done && (
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                                                        <path
                                                            d="M11.5 3.5L5.5 10L2.5 7"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`font-inter font-semibold text-base m-0 ${
                                                        done ? 'text-text-tertiary line-through' : 'text-text-primary'
                                                    }`}
                                                >
                                                    {item.title}
                                                </p>
                                                {item.description && (
                                                    <p className="font-inter text-sm text-text-secondary leading-6 m-0 mt-1">{item.description}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-3 items-center">
                                                    <span
                                                        className={`text-[11px] font-inter font-medium px-2 py-0.5 rounded-8 border ${
                                                            done
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-amber-50 text-amber-800 border-amber-200'
                                                        }`}
                                                    >
                                                        {done ? 'Done' : 'Open'}
                                                    </span>
                                                    <span className="text-[11px] font-inter font-medium px-2 py-0.5 rounded-8 bg-primary-50 text-primary-500 border border-primary-100">
                                                        {item.type}
                                                    </span>
                                                    {due && (
                                                        <span className="text-xs font-inter text-text-tertiary flex items-center gap-1">
                                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                                                                <path
                                                                    d="M8 2V5M8 8H11M3 3H13C13.5523 3 14 3.44772 14 4V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V4C2 3.44772 2.44772 3 3 3Z"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.2"
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            {due}
                                                        </span>
                                                    )}
                                                    {item.sourceMeetingId && (
                                                        <span className="text-[11px] font-inter text-text-disable">From meeting</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Todos;
