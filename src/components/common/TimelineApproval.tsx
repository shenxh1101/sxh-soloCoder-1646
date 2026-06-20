import React from 'react';
import { Check, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '../../types';
import { getRoleLabel } from '../../utils/helpers';

interface ApprovalStep {
  role: UserRole;
  completed: boolean;
  rejected?: boolean;
  time?: string;
  comment?: string;
}

interface TimelineApprovalProps {
  steps: ApprovalStep[];
}

export const TimelineApproval: React.FC<TimelineApprovalProps> = ({ steps }) => {
  return (
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={idx} className="relative flex gap-3">
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'absolute left-[15px] top-8 w-0.5 h-8',
                step.completed && !step.rejected ? 'bg-neon-green/50' : 'bg-white/10'
              )}
            />
          )}
          <div
            className={cn(
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0',
              step.rejected
                ? 'bg-neon-red/20 border-neon-red text-neon-red'
                : step.completed
                ? 'bg-neon-green/20 border-neon-green text-neon-green'
                : 'bg-industrial-800 border-white/20 text-white/40'
            )}
          >
            {step.rejected ? (
              <X className="w-4 h-4" />
            ) : step.completed ? (
              <Check className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 pb-6">
            <div className="flex items-center justify-between mb-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  step.rejected
                    ? 'text-neon-red'
                    : step.completed
                    ? 'text-neon-green'
                    : 'text-white/60'
                )}
              >
                {getRoleLabel(step.role)}
              </span>
              {step.time && (
                <span className="text-xs text-white/40 font-mono">{step.time}</span>
              )}
            </div>
            {step.comment && (
              <div className="text-xs text-white/50 bg-industrial-800/50 rounded p-2">
                {step.comment}
              </div>
            )}
            {!step.completed && !step.rejected && (
              <div className="text-xs text-white/30">等待审批...</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
