import React from 'react';
import { Notification } from '../types';
import { Bell, Megaphone, UserCheck, Calendar, Check, Trash2, ShieldAlert } from 'lucide-react';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export default function NotificationsPage({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications
}: NotificationsPageProps) {
  
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'challenge':
        return <Calendar size={18} className="text-[#5C6FFF]" />;
      case 'announcement':
        return <Megaphone size={18} className="text-amber-500" />;
      case 'approval':
        return <UserCheck size={18} className="text-[#22C55E]" />;
      default:
        return <Bell size={18} className="text-[#888888]" />;
    }
  };

  const getTimeString = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <div className="space-y-6" id="notifications-page-root">
      {/* Header Panel */}
      <div className="bg-[#FFFFFF] border border-[#E2E2E2] p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="notifications-header">
        <div>
          <h2 className="text-xl font-display font-bold text-[#111111]" id="notifications-title">
            Alert Logs & Live Notifications
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Stay up to date with historical milestones, daily tasks, deadline warnings, notice board logs, and member workspace arrivals.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={onMarkAllAsRead}
            disabled={notifications.every(n => n.read)}
            className="px-3.5 py-1.5 bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] hover:bg-[#FFFFFF] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            id="mark-all-read-btn"
          >
            <Check size={14} />
            <span>Mark All Read</span>
          </button>
          
          <button
            onClick={onClearNotifications}
            disabled={notifications.length === 0}
            className="px-3.5 py-1.5 bg-rose-50 border border-rose-100 text-[#EF4444] hover:bg-rose-100/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            id="clear-all-notifs-btn"
          >
            <Trash2 size={14} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Main Alerts Feed */}
      <div className="bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg shadow-sm overflow-hidden" id="notifications-list-container">
        {notifications.length === 0 ? (
          <div className="p-16 text-center text-[#888888]" id="no-notifications-fallback">
            <div className="w-12 h-12 rounded-full bg-[#F7F7F7] border border-[#E2E2E2] flex items-center justify-center mx-auto mb-4 text-[#888888]">
              <Bell size={20} />
            </div>
            <h3 className="text-sm font-display font-bold text-[#111111]">No Notifications Yet</h3>
            <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto leading-relaxed">
              You are completely caught up! We will alert you here as soon as a coordinator issues new challenges or makes batch announcements.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E2E2]" id="notifications-feed">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-5 flex items-start gap-4 transition duration-150 relative ${
                  notif.read ? 'bg-[#FFFFFF]' : 'bg-indigo-50/10'
                }`}
                id={`notif-item-${notif.id}`}
              >
                {/* Unread Glowing Dot */}
                {!notif.read && (
                  <span className="absolute top-5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#5C6FFF] animate-pulse" />
                )}

                {/* Category Icon */}
                <div className="w-9 h-9 rounded-lg bg-[#F7F7F7] border border-[#E2E2E2] flex items-center justify-center shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Text Context */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className={`text-sm text-[#111111] leading-none ${notif.read ? 'font-medium' : 'font-bold'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#888888] font-mono whitespace-nowrap">
                      {getTimeString(notif.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#888888] leading-relaxed pr-12">
                    {notif.content}
                  </p>
                </div>

                {/* Individual Action item */}
                {!notif.read && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-1 text-[#888888] hover:text-[#22C55E] hover:bg-[#F7F7F7] border border-transparent hover:border-[#E2E2E2] rounded transition cursor-pointer"
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Static Tips block */}
      <div className="bg-[#F7F7F7] border border-[#E2E2E2] p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert size={16} className="text-[#5C6FFF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#111111] block">Verification & Real-Time Alerts</span>
          <p className="text-[11px] text-[#888888] leading-relaxed">
            By default, all notifications logged here persist locally in the session. You can filter and dismiss individual entries or clear the entire alert register for a distraction-free experience.
          </p>
        </div>
      </div>
    </div>
  );
}
