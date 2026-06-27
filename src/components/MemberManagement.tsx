import React, { useState } from 'react';
import { User, Announcement } from '../types';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  ShieldAlert, 
  Mail, 
  Calendar, 
  Megaphone, 
  Plus, 
  Trash2, 
  Award, 
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface MemberManagementProps {
  users: User[];
  announcements: Announcement[];
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
  onToggleAdminRole: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onPostAnnouncement: (ann: Announcement) => void;
  onDeleteAnnouncement: (annId: string) => void;
}

export default function MemberManagement({
  users,
  announcements,
  onApproveUser,
  onRejectUser,
  onToggleAdminRole,
  onRemoveUser,
  onPostAnnouncement,
  onDeleteAnnouncement
}: MemberManagementProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'pending' | 'announcements'>('roster');
  
  // Post announcement states
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'important' | 'general' | 'resource'>('general');

  // Filter lists
  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');

  const handlePostAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle,
      content: annContent,
      author: 'Rahul Verma (Admin)',
      createdAt: new Date().toISOString(),
      category: annCategory
    };

    onPostAnnouncement(newAnn);
    setAnnTitle('');
    setAnnContent('');
    setAnnCategory('general');
  };

  return (
    <div className="space-y-6" id="member-management-root">
      {/* Tab bar header */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between" id="mgmt-header">
        <div className="flex bg-slate-50 p-1 rounded-lg m-4 border border-slate-100" id="mgmt-tabs">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'roster' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-roster-btn"
          >
            <Users size={14} />
            <span>Active Cohort ({activeUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer relative ${
              activeTab === 'pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-pending-btn"
          >
            <UserPlus size={14} />
            <span>Join Requests</span>
            {pendingUsers.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'announcements' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-ann-btn"
          >
            <Megaphone size={14} />
            <span>Announcements & Board</span>
          </button>
        </div>

        <div className="mx-6 text-xs text-slate-400 font-mono text-left py-2 md:py-0">
          Placement Coordinators Hub
        </div>
      </div>

      {/* Roster tab */}
      {activeTab === 'roster' && (
        <div className="space-y-4" id="cohort-roster">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-slate-800 font-bold text-base flex items-center gap-1.5">
                <Users className="text-indigo-500" size={18} />
                Manage Cohort Members
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Grant admin credentials to other batch representatives or manage student enrollments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="active-members-grid">
            {activeUsers.map(user => (
              <div 
                key={user.id} 
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between gap-4"
                id={`member-card-${user.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full border border-slate-200 object-cover" 
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-800 font-bold text-sm leading-tight">{user.name}</span>
                        {user.role === 'admin' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                            Coordinator
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-xs flex items-center gap-1 mt-1 font-mono">
                        <Mail size={11} /> {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1 font-mono">
                      <Flame size={12} /> {user.streak} days
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="border-r border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Problems Solved</span>
                    <span className="text-slate-800 font-mono font-bold text-sm mt-1 block">{user.solvedCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Joined On</span>
                    <span className="text-slate-600 font-mono text-xs mt-1 block">
                      {new Date(user.joinDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                    </span>
                  </div>
                </div>

                {/* Coordinator controls */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <button
                    onClick={() => onToggleAdminRole(user.id)}
                    className={`text-xs font-semibold flex items-center gap-1 py-1.5 px-3 rounded-lg transition cursor-pointer ${
                      user.role === 'admin' 
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-105 border border-indigo-200'
                    }`}
                    id={`toggle-role-btn-${user.id}`}
                  >
                    <ShieldAlert size={12} />
                    <span>{user.role === 'admin' ? 'Revoke Coordinator' : 'Make Coordinator'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to remove ${user.name} from the preparation cohort?`)) {
                        onRemoveUser(user.id);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-rose-200 transition cursor-pointer"
                    id={`remove-member-btn-${user.id}`}
                  >
                    <UserMinus size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending approvals tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4" id="pending-cohort">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-800 font-bold text-base flex items-center gap-1.5">
              <UserPlus className="text-indigo-500" size={18} />
              Review Batch Join Requests
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Verify batch records and approve college students requesting entrance to this workspace.
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center text-slate-500" id="no-pending-fallback">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-slate-800 font-bold text-sm">All Requests Cleared!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No students are currently waiting in the approval queue. Great job keeping it updated!
              </p>
            </div>
          ) : (
            <div className="space-y-3" id="pending-users-list">
              {pendingUsers.map(user => (
                <div 
                  key={user.id} 
                  className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  id={`pending-card-${user.id}`}
                >
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover" 
                    />
                    <div>
                      <h4 className="text-slate-800 font-bold text-sm leading-none">{user.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1">
                        <Mail size={11} /> {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-600">
                    <Calendar size={12} className="text-indigo-500" />
                    <span>Requested: {new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onRejectUser(user.id)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-2 px-4 rounded-lg border border-slate-200 transition cursor-pointer"
                      id={`reject-btn-${user.id}`}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => onApproveUser(user.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/10"
                      id={`approve-btn-${user.id}`}
                    >
                      <UserCheck size={13} />
                      <span>Approve Member</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Announcements log tab */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="announcements-management">
          {/* Left: Create announcement form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm p-5 h-fit space-y-4">
            <h3 className="text-slate-800 font-bold text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Megaphone className="text-indigo-500" size={16} />
              Publish Cohort Announcement
            </h3>

            <form onSubmit={handlePostAnnSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Title</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule for Mock Interviews"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none placeholder-slate-400 focus:border-indigo-500 focus:bg-white transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Announcement Category</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-850 py-2.5 px-3 rounded-lg text-xs outline-none cursor-pointer focus:border-indigo-500 focus:bg-white transition"
                >
                  <option value="general">General Update</option>
                  <option value="important">🚨 Important / Action Needed</option>
                  <option value="resource">📚 Preparation Resource</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notice Body</label>
                <textarea
                  rows={4}
                  placeholder="Post class lists, resource links, timing coordinates..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none placeholder-slate-400 focus:border-indigo-500 focus:bg-white transition"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                id="post-announcement-btn"
              >
                <Plus size={14} />
                <span>Publish Notice</span>
              </button>
            </form>
          </div>

          {/* Right: Active announcements list */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
              <h3 className="text-slate-800 font-bold text-sm">Active Bulletin Log</h3>
              <p className="text-slate-500 text-[11px]">Notice board visible to all members on their dashboards.</p>
            </div>

            <div className="space-y-3" id="active-announcements-list">
              {announcements.length === 0 ? (
                <div className="text-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-400 italic text-xs">
                  No announcements published yet. Write one to notify the cohort.
                </div>
              ) : (
                announcements.map(ann => (
                  <div 
                    key={ann.id} 
                    className={`bg-white border rounded-xl shadow-sm p-5 relative space-y-3 ${
                      ann.category === 'important' ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                    }`}
                    id={`ann-item-${ann.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono uppercase ${
                            ann.category === 'important' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                            ann.category === 'resource' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {ann.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-slate-850 font-bold text-sm">{ann.title}</h4>
                      </div>

                      <button
                        onClick={() => onDeleteAnnouncement(ann.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                        title="Delete Announcement"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>

                    <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 font-mono">
                      Published By: {ann.author}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
