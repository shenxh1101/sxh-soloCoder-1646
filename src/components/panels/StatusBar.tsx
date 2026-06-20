import React from 'react';
import { Package, Truck, Clock, AlertTriangle, Activity } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const StatusBar: React.FC = () => {
  const materials = useAppStore(s => s.materials);
  const craneTasks = useAppStore(s => s.craneTasks);
  const rectifications = useAppStore(s => s.rectifications);
  const purchaseRequests = useAppStore(s => s.purchaseRequests);

  const activeCraneCount = craneTasks.filter(t => t.status === 'executing' || t.status === 'queued').length;
  const pendingApprovals = purchaseRequests.filter(p => p.status === 'pending').length
    + rectifications.filter(r => r.status !== 'completed' && r.status !== 'rejected').length;
  const warningCount = materials.filter(m => m.qualityStatus === 'red' || m.qualityStatus === 'yellow').length
    + rectifications.filter(r => r.status !== 'completed').length;

  const items = [
    {
      icon: <Package className="w-4 h-4 text-neon-blue" />,
      label: '材料种类',
      value: materials.length,
      color: 'text-neon-blue',
    },
    {
      icon: <Truck className="w-4 h-4 text-neon-yellow" />,
      label: '活跃塔吊任务',
      value: activeCraneCount,
      color: 'text-neon-yellow',
    },
    {
      icon: <Clock className="w-4 h-4 text-neon-green" />,
      label: '待审批',
      value: pendingApprovals,
      color: 'text-neon-green',
    },
    {
      icon: <AlertTriangle className="w-4 h-4 text-neon-red" />,
      label: '预警警报',
      value: warningCount,
      color: warningCount > 0 ? 'text-neon-red' : 'text-white/50',
    },
  ];

  return (
    <div className="h-10 glass-panel flex items-center justify-between px-6 border-t border-neon-blue/20 text-xs">
      <div className="flex items-center gap-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.icon}
            <span className="text-white/50">{item.label}:</span>
            <span className={item.color + ' font-mono font-bold'}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-neon-green pulse-glow" />
        <span className="text-neon-green font-mono">系统正常运行</span>
        <span className="text-white/30 font-mono ml-2">|</span>
        <span className="text-white/40 font-mono ml-2">连接数: 24</span>
      </div>
    </div>
  );
};
