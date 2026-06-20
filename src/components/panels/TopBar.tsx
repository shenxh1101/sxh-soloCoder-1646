import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Construction } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getRoleLabel } from '@/utils/helpers';
import { StatusBadge } from '@/components/common/StatusBadge';

export const TopBar: React.FC = () => {
  const currentUser = useAppStore(s => s.currentUser);
  const logout = useAppStore(s => s.logout);
  const setNotification = useAppStore(s => s.setNotification);
  const showNotification = useAppStore(s => s.showNotification);
  const rectifications = useAppStore(s => s.rectifications);
  const purchaseRequests = useAppStore(s => s.purchaseRequests);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const alertCount = rectifications.filter(r => r.status !== 'completed').length
    + purchaseRequests.filter(p => p.status === 'pending').length;

  const formatTime = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return (
    <div className="h-14 glass-panel flex items-center justify-between px-6 border-b border-neon-blue/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue/30 to-neon-green/30 flex items-center justify-center glow-border-blue">
          <Construction className="w-6 h-6 text-neon-blue" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wider glow-text-blue font-orbitron">
            智慧工地管理平台
          </h1>
          <div className="text-[10px] text-neon-blue/60 font-mono tracking-widest">
            SMART CONSTRUCTION MANAGEMENT SYSTEM
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm font-mono text-neon-green glow-text-green">
          {formatTime(now)}
        </div>

        <button
          onClick={() => setNotification(!showNotification)}
          className="relative w-10 h-10 rounded-lg glass-panel flex items-center justify-center hover:bg-neon-yellow/10 transition-colors"
        >
          <Bell className="w-5 h-5 text-neon-yellow" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-red text-white text-[10px] font-bold flex items-center justify-center pulse-glow">
              {alertCount}
            </span>
          )}
        </button>

        {currentUser && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg glass-panel">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{currentUser.name}</div>
              <StatusBadge status="blue" text={getRoleLabel(currentUser.role)} className="text-[10px]" />
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue/40 to-neon-green/40 flex items-center justify-center text-white font-bold text-sm border border-neon-blue/30">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neon-red/30 text-neon-red hover:bg-neon-red/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">退出</span>
        </button>
      </div>
    </div>
  );
};
