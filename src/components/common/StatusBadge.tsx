import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'green' | 'yellow' | 'red' | 'blue';
  text: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, className = '' }) => {
  const colors = {
    green: 'bg-neon-green/20 text-neon-green border-neon-green/50',
    yellow: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50',
    red: 'bg-neon-red/20 text-neon-red border-neon-red/50',
    blue: 'bg-neon-blue/20 text-neon-blue border-neon-blue/50',
  };

  const dotColors = {
    green: 'bg-neon-green',
    yellow: 'bg-neon-yellow',
    red: 'bg-neon-red',
    blue: 'bg-neon-blue',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium',
      colors[status],
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full pulse-glow', dotColors[status])}></span>
      {text}
    </span>
  );
};
