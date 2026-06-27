import React from 'react';
import { Notification } from '../types';
import { Bell, CheckCheck, Trash2, BookOpen, Award, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  quiz:       { icon: <BookOpen size={14} />,    color: 'text-indigo-600', bg: 'bg-indigo-50' },
  result:     { icon: <TrendingUp size={14} />,  color: 'text-green-600',  bg: 'bg-green-50'  },
  badge:      { icon: <Award size={14} />,        color: 'text-amber-600',  bg: 'bg-amber-50'  },
  approval:   { icon: <ShieldCheck size={14} />, color: 'text-violet-600', bg: 'bg-violet-50' },
  leaderboard:{ icon: <Award size={14} />,        color: 'text-rose-600',   bg: 'bg-rose-50'   },
  general:    { icon: <Info size={14} />,         color: 'text-slate-600',  bg: 'bg-slate-100' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage({ notifications, onMarkAsRead, onMarkAllAsRead, onClearNotifications }: NotificationsPageProps) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell size={20} className="text-indigo-500" />
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer">
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={() => { if (confirm('Clear all notifications?')) onClearNotifications(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 text-xs font-semibold rounded-lg transition cursor-pointer">
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">You'll be notified when quizzes are published, results are ready, or badges are earned.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
              return (
                <div key={n.id}
                  onClick={() => !n.read && onMarkAsRead(n.id)}
                  className={`flex gap-4 px-5 py-4 cursor-pointer transition hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.content}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
