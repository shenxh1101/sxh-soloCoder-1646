import React from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange';
}

export const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', color = 'blue' }) => {
  const colorClasses = {
    blue: 'glow-border-blue',
    green: 'glow-border-green',
    red: 'glow-border-red',
    yellow: 'glow-border-yellow',
    orange: '',
  };

  return (
    <div className={cn(
      'glass-panel rounded-lg p-4',
      colorClasses[color],
      className
    )}>
      {children}
    </div>
  );
};
