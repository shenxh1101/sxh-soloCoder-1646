import React from 'react';
import {
  Package, ShieldCheck, Truck, FileText, ShoppingCart, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ActivePanelType } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  key: ActivePanelType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const navItems: NavItem[] = [
  { key: 'materials', label: '材料管理', icon: <Package className="w-5 h-5" />, color: 'neon-blue' },
  { key: 'inspection', label: '质量检测', icon: <ShieldCheck className="w-5 h-5" />, color: 'neon-green' },
  { key: 'crane', label: '塔吊调度', icon: <Truck className="w-5 h-5" />, color: 'neon-yellow' },
  { key: 'reports', label: '报表中心', icon: <FileText className="w-5 h-5" />, color: 'neon-blue' },
  { key: 'purchase', label: '采购申请', icon: <ShoppingCart className="w-5 h-5" />, color: 'neon-green' },
  { key: 'rectification', label: '整改通知', icon: <AlertTriangle className="w-5 h-5" />, color: 'neon-red' },
];

export const SideNav: React.FC = () => {
  const activePanel = useAppStore(s => s.activePanel);
  const setActivePanel = useAppStore(s => s.setActivePanel);
  const rectifications = useAppStore(s => s.rectifications);

  const pendingRectifications = rectifications.filter(r => r.status !== 'completed').length;

  const colorClasses: Record<string, { active: string; text: string; bg: string }> = {
    'neon-blue': {
      active: 'bg-neon-blue/20 border-neon-blue/50',
      text: 'text-neon-blue',
      bg: 'bg-neon-blue',
    },
    'neon-green': {
      active: 'bg-neon-green/20 border-neon-green/50',
      text: 'text-neon-green',
      bg: 'bg-neon-green',
    },
    'neon-yellow': {
      active: 'bg-neon-yellow/20 border-neon-yellow/50',
      text: 'text-neon-yellow',
      bg: 'bg-neon-yellow',
    },
    'neon-red': {
      active: 'bg-neon-red/20 border-neon-red/50',
      text: 'text-neon-red',
      bg: 'bg-neon-red',
    },
  };

  return (
    <div className="w-20 glass-panel h-full flex flex-col py-4 border-r border-neon-blue/20">
      <div className="flex-1 flex flex-col items-center gap-2 px-2">
        {navItems.map(item => {
          const isActive = activePanel === item.key;
          const colors = colorClasses[item.color];
          return (
            <button
              key={item.key}
              onClick={() => setActivePanel(isActive ? null : item.key)}
              className={cn(
                'w-full flex flex-col items-center gap-1 py-3 px-2 rounded-lg border transition-all duration-200 group relative',
                isActive
                  ? `${colors.active} border shadow-lg`
                  : 'border-transparent hover:bg-white/5 hover:border-white/10'
              )}
            >
              <div className={cn(isActive ? colors.text : 'text-white/60 group-hover:text-white/90', 'transition-colors')}>
                {item.icon}
              </div>
              <span className={cn(
                'text-[10px] font-medium tracking-wide transition-colors',
                isActive ? colors.text : 'text-white/50 group-hover:text-white/80'
              )}>
                {item.label}
              </span>
              {isActive && (
                <ChevronRight className={cn('w-4 h-4 absolute right-1 top-1/2 -translate-y-1/2', colors.text)} />
              )}
              {item.key === 'rectification' && pendingRectifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-red text-white text-[10px] font-bold flex items-center justify-center pulse-glow">
                  {pendingRectifications}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-2">
        <div className="text-center text-[9px] text-white/30 font-mono tracking-wider">
          v1.0.0
        </div>
      </div>
    </div>
  );
};
