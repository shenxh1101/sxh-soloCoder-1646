import React from 'react';
import { Bell, X, AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlowCard } from '@/components/common/GlowCard';
import { cn } from '@/lib/utils';

interface NotifItem {
  id: string;
  type: 'alert' | 'report' | 'info';
  title: string;
  message: string;
  time: string;
}

export const NotificationPanel: React.FC = () => {
  const showNotification = useAppStore(s => s.showNotification);
  const notificationMessage = useAppStore(s => s.notificationMessage);
  const setNotification = useAppStore(s => s.setNotification);
  const rectifications = useAppStore(s => s.rectifications);
  const dailyReports = useAppStore(s => s.dailyReports);
  const operationLogs = useAppStore(s => s.operationLogs);

  const notifs: NotifItem[] = [];

  if (notificationMessage) {
    notifs.push({
      id: 'current',
      type: 'info',
      title: '系统通知',
      message: notificationMessage,
      time: '刚刚',
    });
  }

  rectifications
    .filter(r => r.status !== 'completed')
    .slice(0, 3)
    .forEach(r => {
      notifs.push({
        id: r.id,
        type: 'alert',
        title: '整改通知待处理',
        message: r.description.slice(0, 40) + (r.description.length > 40 ? '...' : ''),
        time: r.createdAt,
      });
    });

  dailyReports.slice(0, 2).forEach(rep => {
    notifs.push({
      id: rep.id,
      type: 'report',
      title: `${rep.date} 物料日报已生成`,
      message: `包含 ${rep.zoneConsumptions.length} 个作业区的物料消耗数据`,
      time: rep.generatedAt,
    });
  });

  operationLogs.slice(0, 3).forEach(log => {
    notifs.push({
      id: log.id,
      type: 'info',
      title: `${log.userName} - ${log.action}`,
      message: log.details.slice(0, 40) + (log.details.length > 40 ? '...' : ''),
      time: log.timestamp,
    });
  });

  const iconMap: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    alert: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-neon-red',
      bg: 'bg-neon-red/20',
    },
    report: {
      icon: <FileText className="w-4 h-4" />,
      color: 'text-neon-blue',
      bg: 'bg-neon-blue/20',
    },
    info: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-neon-green',
      bg: 'bg-neon-green/20',
    },
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-6 z-50 w-80">
      <GlowCard className="p-0 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neon-yellow/20 bg-neon-yellow/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-neon-yellow" />
            <h3 className="text-sm font-bold text-neon-yellow">通知中心</h3>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-neon-red/20 text-neon-red text-[10px] font-bold">
              {notifs.length}
            </span>
          </div>
          <button
            onClick={() => setNotification(false)}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              暂无通知
            </div>
          ) : (
            notifs.map(n => {
              const cfg = iconMap[n.type];
              return (
                <div
                  key={n.id}
                  className={cn(
                    'px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer',
                    n.id === 'current' && 'bg-neon-green/5'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg, cfg.color)}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white">{n.title}</div>
                      <p className="text-[11px] text-white/60 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-white/40">
                        <Clock className="w-2.5 h-2.5" />
                        {n.time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/5 bg-white/5">
          <button
            onClick={() => setNotification(false)}
            className="w-full py-1.5 text-[11px] text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            标记全部已读
          </button>
        </div>
      </GlowCard>
    </div>
  );
};
