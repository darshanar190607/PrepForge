import React, { useState } from 'react';
import { User } from '../types';
import { Users, CheckCircle2, XCircle, ShieldCheck, Trash2, Search, UserPlus } from 'lucide-react';

interface MemberManagementProps {
  users: User[];
  onApproveUser: (userId: string) => Promise<void>;
  onRejectUser: (userId: string) => Promise<void>;
  onToggleAdminRole: (userId: string) => Promise<void>;
  onRemoveUser: (userId: string) => Promise<void>;
}

export default function MemberManagement({ users, onApproveUser, onRejectUser, onToggleAdminRole, onRemoveUser }: MemberManagementProps) {
  const [tab, setTab] = useState<'active' | 'pending'>('pending');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const pending = users.filter(u => u.status === 'pending');
  const active = users.filter(u => u.status === 'active');

  const filtered = (tab === 'pending' ? pending : active).filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const withLoading = async (id: string, fn: () => Promise<void>) => {
    setActionLoading(id);
    try { await fn(); } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Student Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review enrollment requests and manage active students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['pending', 'active'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'pending' ? (
              <span className="flex items-center gap-2">
                Pending Requests
                {pending.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>}
              </span>
            ) : (
              <span className="flex items-center gap-2"><Users size={14} /> Active Students ({active.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white" />
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <UserPlus size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{tab === 'pending' ? 'No pending requests.' : 'No active students found.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(u => (
              <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{u.name}</p>
                    {u.role === 'admin' && (
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.department} · {u.year} Year · Joined {new Date(u.joinDate).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {tab === 'pending' ? (
                    <>
                      <button onClick={() => withLoading(u.id + '-approve', () => onApproveUser(u.id))}
                        disabled={actionLoading === u.id + '-approve'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50">
                        <CheckCircle2 size={13} /> {actionLoading === u.id + '-approve' ? '...' : 'Approve'}
                      </button>
                      <button onClick={() => withLoading(u.id + '-reject', () => onRejectUser(u.id))}
                        disabled={actionLoading === u.id + '-reject'}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50">
                        <XCircle size={13} /> {actionLoading === u.id + '-reject' ? '...' : 'Reject'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => withLoading(u.id + '-role', () => onToggleAdminRole(u.id))}
                        disabled={actionLoading === u.id + '-role'}
                        title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                        className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg transition cursor-pointer disabled:opacity-50">
                        <ShieldCheck size={15} />
                      </button>
                      <button onClick={() => {
                        if (confirm(`Remove ${u.name}? This cannot be undone.`))
                          withLoading(u.id + '-remove', () => onRemoveUser(u.id));
                      }}
                        disabled={actionLoading === u.id + '-remove'}
                        className="p-2 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-lg transition cursor-pointer disabled:opacity-50">
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
