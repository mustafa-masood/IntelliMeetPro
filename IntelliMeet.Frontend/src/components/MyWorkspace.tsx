import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import { imApi, type TeamRowDto, type WorkspaceSummary } from '../api/intellimeet';

type Tab = 'teams' | 'people';

const MyWorkspace: React.FC = () => {
  const [tab, setTab] = useState<Tab>('teams');
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [teams, setTeams] = useState<TeamRowDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTeamId, setInviteTeamId] = useState<string | null>(null);

  const membersByTeam = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of workspace?.members ?? []) {
      const key = m.teamId ?? '__none__';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [workspace?.members]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [ws, ts] = await Promise.all([imApi.getWorkspace(), imApi.listWorkspaceTeams()]);
      setWorkspace(ws);
      setTeams(ts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load workspace.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createTeam() {
    const name = newTeamName.trim();
    if (!name) return;
    try {
      await imApi.createWorkspaceTeam(name);
      setNewTeamName('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create team.');
    }
  }

  async function inviteMember() {
    const email = inviteEmail.trim();
    if (!email) return;
    try {
      await imApi.inviteWorkspaceMember(email, inviteTeamId);
      setInviteEmail('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to invite member.');
    }
  }

  async function assignTeam(userId: string, teamId: string | null) {
    try {
      await imApi.assignWorkspaceMemberTeam(userId, teamId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to assign team.');
    }
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-full bg-bg-surface-lv1 overflow-hidden">
      <Sidebar />
      <div className="ml-0 md:ml-[270px] flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
        <div className="px-8 pt-6 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-inter-tight font-medium text-2xl leading-8 text-text-primary m-0">My Workspace</h1>
              <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                {workspace?.name ?? '—'}
              </p>
            </div>
            <button
              className="bg-bg-surface-pure border border-stroke-primary rounded-8 px-3 py-2 cursor-pointer font-inter font-medium text-sm text-text-secondary hover:bg-bg-surface-lv1"
              onClick={() => void refresh()}
            >
              Refresh
            </button>
          </div>
          {error && (
            <div className="mt-4 rounded-12 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-inter">
              {error}
            </div>
          )}
        </div>

        <div className="px-8 pt-4 shrink-0">
          <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 px-5 py-4 flex gap-5 items-center">
            <button
              onClick={() => setTab('teams')}
              className={`flex gap-1 items-center justify-center relative cursor-pointer ${
                tab === 'teams' ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="font-inter font-medium text-sm tracking-[-0.084px]">Teams</span>
              {tab === 'teams' && <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500" />}
            </button>
            <button
              onClick={() => setTab('people')}
              className={`flex gap-1 items-center justify-center relative cursor-pointer ${
                tab === 'people' ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="font-inter font-medium text-sm tracking-[-0.084px]">People</span>
              {tab === 'people' && <div className="absolute bottom-[-14px] left-0 right-0 h-0.5 bg-primary-500" />}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-8 py-4">
          {loading ? (
            <div className="rounded-12 border border-stroke-primary bg-bg-surface-pure px-4 py-3 text-sm text-text-secondary font-inter">
              Loading…
            </div>
          ) : tab === 'teams' ? (
            <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-4">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="font-inter-tight font-medium text-xl leading-8 text-text-primary m-0">Teams</h2>
                  <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                    {teams.length} team{teams.length !== 1 ? 's' : ''} in this workspace
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="New team name"
                    className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-2 font-inter text-sm text-text-primary outline-none focus:border-primary-500"
                  />
                  <button
                    className="bg-primary-500 text-white rounded-8 px-3 py-2 flex items-center justify-center cursor-pointer font-inter font-medium text-sm hover:bg-primary-600"
                    onClick={() => void createTeam()}
                  >
                    New Team
                  </button>
                </div>
              </div>

              <div className="border border-stroke-primary rounded-8 overflow-hidden">
                <div className="bg-bg-surface-lv1 border-b border-stroke-primary grid grid-cols-2 gap-4 px-4 py-2">
                  <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Team</div>
                  <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Members</div>
                </div>
                {teams.map((t) => (
                  <div key={t.id} className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-stroke-primary last:border-b-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="font-inter font-medium text-sm text-primary-600">{t.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-inter font-medium text-sm text-text-primary tracking-[-0.084px]">{t.name}</span>
                    </div>
                    <div className="font-inter font-normal text-sm text-text-secondary tracking-[-0.084px] flex items-center">
                      {membersByTeam.get(t.id) ?? 0}
                    </div>
                  </div>
                ))}
                {teams.length === 0 && <div className="px-4 py-4 text-sm text-text-secondary font-inter">No teams yet.</div>}
              </div>
            </div>
          ) : (
            <div className="bg-bg-surface-pure border border-stroke-primary rounded-12 p-4">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="font-inter-tight font-medium text-xl leading-8 text-text-primary m-0">People</h2>
                  <p className="font-inter font-normal text-sm leading-5 text-text-secondary tracking-[-0.084px] m-0">
                    {workspace?.members.length ?? 0} members
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Invite by email"
                  className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-2 font-inter text-sm text-text-primary outline-none focus:border-primary-500"
                />
                <select
                  value={inviteTeamId ?? ''}
                  onChange={(e) => setInviteTeamId(e.target.value ? e.target.value : null)}
                  className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-3 py-2 font-inter text-sm text-text-primary outline-none focus:border-primary-500"
                >
                  <option value="">No team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-primary-500 text-white rounded-8 px-3 py-2 cursor-pointer font-inter font-medium text-sm hover:bg-primary-600"
                  onClick={() => void inviteMember()}
                >
                  Send invite
                </button>
              </div>

              <div className="border border-stroke-primary rounded-8 overflow-hidden">
                <div className="bg-bg-surface-lv1 border-b border-stroke-primary grid grid-cols-5 gap-4 px-4 py-2">
                  <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase col-span-2">Member</div>
                  <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Role</div>
                  <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Team</div>
                  <div className="font-inter font-medium text-xs text-text-secondary tracking-[0.48px] uppercase">Actions</div>
                </div>
                {(workspace?.members ?? []).map((m) => (
                  <div
                    key={m.userId}
                    className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-stroke-primary last:border-b-0 items-center"
                  >
                    <div className="col-span-2">
                      <div className="font-inter font-medium text-sm text-text-primary">{m.displayName || m.email}</div>
                      <div className="font-inter text-xs text-text-secondary">{m.email}</div>
                    </div>
                    <div className="font-inter text-sm text-text-secondary">{m.role}</div>
                    <div>
                      <select
                        value={m.teamId ?? ''}
                        onChange={(e) => void assignTeam(m.userId, e.target.value ? e.target.value : null)}
                        className="bg-bg-surface-lv1 border border-stroke-primary rounded-8 px-2 py-2 font-inter text-sm text-text-primary outline-none focus:border-primary-500 w-full"
                      >
                        <option value="">No team</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="font-inter text-xs text-text-secondary">—</div>
                  </div>
                ))}
                {(workspace?.members?.length ?? 0) === 0 && (
                  <div className="px-4 py-4 text-sm text-text-secondary font-inter">No members found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyWorkspace;
