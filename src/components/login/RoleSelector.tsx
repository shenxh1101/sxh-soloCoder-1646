import React from 'react';
import { User, Shield, Building2, Crown, ChevronRight } from 'lucide-react';
import type { UserRole } from '../../types';
import { getRoleLabel } from '../../utils/helpers';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

const roles: { role: UserRole; icon: React.ReactNode; desc: string; color: string }[] = [
  { role: 'worker', icon: <User className="w-8 h-8" />, desc: '物料查看与吊运执行', color: 'blue' },
  { role: 'inspector', icon: <Shield className="w-8 h-8" />, desc: '质量检测与一级审批', color: 'green' },
  { role: 'manager', icon: <Building2 className="w-8 h-8" />, desc: '项目管理与二级审批', color: 'yellow' },
  { role: 'director', icon: <Crown className="w-8 h-8" />, desc: '全局视图与三级审批', color: 'orange' },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelect }) => {
  const colorMap = {
    blue: 'hover:shadow-glow-blue hover:border-neon-blue/70 group-hover:text-neon-blue',
    green: 'hover:shadow-glow-green hover:border-neon-green/70 group-hover:text-neon-green',
    yellow: 'hover:shadow-glow-orange hover:border-neon-yellow/70 group-hover:text-neon-yellow',
    orange: 'hover:shadow-glow-orange hover:border-neon-orange/70 group-hover:text-neon-orange',
  };

  const iconColor = {
    blue: 'text-neon-blue',
    green: 'text-neon-green',
    yellow: 'text-neon-yellow',
    orange: 'text-neon-orange',
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
      {roles.map((r) => (
        <button
          key={r.role}
          onClick={() => onSelect(r.role)}
          className={`group glass-panel p-5 rounded-xl border border-white/10 transition-all duration-300 cursor-pointer text-left ${colorMap[r.color]}`}
        >
          <div className={`mb-3 ${iconColor[r.color]}`} style={{ filter: `drop-shadow(0 0 8px currentColor)` }}>
            {r.icon}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-base mb-0.5 group-hover:text-white transition-colors">
                {getRoleLabel(r.role)}
              </div>
              <div className="text-white/40 text-xs">{r.desc}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/80 transition-all transform group-hover:translate-x-1" />
          </div>
        </button>
      ))}
    </div>
  );
};
