import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, User, Clock, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { UserRole } from '@/types';
import { getRoleLabel } from '@/utils/helpers';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: 'green' | 'yellow' | 'red' | 'blue' }> = {
  pending_inspector: { label: '待质检员处理', color: 'yellow' },
  pending_worker: { label: '待施工员处理', color: 'yellow' },
  pending_manager: { label: '待经理审批', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
};

const stepOrder: UserRole[] = ['inspector', 'worker', 'manager'];

export const RectificationPanel: React.FC = () => {
  const rectifications = useAppStore(s => s.rectifications);
  const currentUser = useAppStore(s => s.currentUser);
  const approveRectification = useAppStore(s => s.approveRectification);
  const rejectRectification = useAppStore(s => s.rejectRectification);
  const materials = useAppStore(s => s.materials);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const getCurrentStep = (status: string): number => {
    if (status === 'completed') return 3;
    if (status === 'rejected') return -1;
    if (status === 'pending_inspector') return 0;
    if (status === 'pending_worker') return 1;
    if (status === 'pending_manager') return 2;
    return -1;
  };

  const canApproveCurrent = (status: string) => {
    if (!currentUser) return false;
    if (status === 'pending_inspector' && currentUser.role === 'inspector') return true;
    if (status === 'pending_worker' && currentUser.role === 'worker') return true;
    if (status === 'pending_manager' && currentUser.role === 'manager') return true;
    if (currentUser.role === 'director') return true;
    return false;
  };

  const handleApprove = (id: string) => {
    if (!currentUser) return;
    const roleMap: Record<string, UserRole> = {
      pending_inspector: 'inspector',
      pending_worker: 'worker',
      pending_manager: 'manager',
    };
    const rect = rectifications.find(r => r.id === id);
    if (!rect) return;
    const role = roleMap[rect.status] || currentUser.role;
    approveRectification(id, role, comment || '审核通过');
    setComment('');
    setExpandedId(null);
  };

  const handleReject = (id: string) => {
    if (!currentUser) return;
    const roleMap: Record<string, UserRole> = {
      pending_inspector: 'inspector',
      pending_worker: 'worker',
      pending_manager: 'manager',
    };
    const rect = rectifications.find(r => r.id === id);
    if (!rect) return;
    const role = roleMap[rect.status] || currentUser.role;
    rejectRectification(id, role, comment || '审核不通过');
    setComment('');
    setExpandedId(null);
  };

  return (
    <GlowCard className="w-96 h-full flex flex-col gap-3 overflow-y-auto" color="red">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-neon-red" />
        <h3 className="text-sm font-bold text-neon-red glow-text-red">整改通知单</h3>
        <StatusBadge status="red" text={rectifications.filter(r => r.status !== 'completed').length + '项待处理'} className="ml-auto" />
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {rectifications.map(rect => {
          const material = materials.find(m => m.id === rect.materialId);
          const cfg = statusConfig[rect.status];
          const currentStep = getCurrentStep(rect.status);
          const isExpanded = expandedId === rect.id;
          const canAct = canApproveCurrent(rect.status);

          return (
            <div key={rect.id} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : rect.id)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white truncate">
                        {material?.name || rect.materialId}
                      </span>
                      <StatusBadge status={cfg.color} text={cfg.label} className="text-[9px] shrink-0" />
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-2">{rect.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/40">
                      <Clock className="w-3 h-3" />
                      {rect.createdAt}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/50 shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-white/5">
                  <div className="pt-3">
                    <div className="text-[10px] text-white/50 mb-2">审批流程</div>
                    <div className="flex items-center gap-1">
                      {stepOrder.map((role, idx) => {
                        const isApproved = rect.approvals.some(a => a.role === role);
                        const isCurrent = idx === currentStep;
                        const isRejected = rect.status === 'rejected';
                        return (
                          <React.Fragment key={role}>
                            <div className="flex flex-col items-center gap-1 flex-1">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center border-2',
                                  isApproved
                                    ? 'bg-neon-green/20 border-neon-green'
                                    : isRejected
                                    ? 'bg-neon-red/20 border-neon-red'
                                    : isCurrent
                                    ? 'bg-neon-yellow/20 border-neon-yellow pulse-glow'
                                    : 'bg-white/5 border-white/20'
                                )}
                              >
                                <User
                                  className={cn(
                                    'w-4 h-4',
                                    isApproved ? 'text-neon-green' : isRejected ? 'text-neon-red' : isCurrent ? 'text-neon-yellow' : 'text-white/40'
                                  )}
                                />
                              </div>
                              <span className={cn(
                                'text-[9px] text-center',
                                isApproved ? 'text-neon-green' : isRejected ? 'text-neon-red' : isCurrent ? 'text-neon-yellow' : 'text-white/50'
                              )}>
                                {getRoleLabel(role)}
                              </span>
                              {isApproved && <CheckCircle className="w-3 h-3 text-neon-green" />}
                            </div>
                            {idx < stepOrder.length - 1 && (
                              <div className={cn(
                                'flex-1 h-px -mt-5',
                                idx < currentStep || isApproved ? 'bg-neon-green/50' : 'bg-white/10'
                              )} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {rect.approvals.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-white/50">审批记录</div>
                      {rect.approvals.map((ap, idx) => (
                        <div key={idx} className="p-2 rounded-md bg-white/5 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-neon-blue">{getRoleLabel(ap.role)}</span>
                            <span className="text-white/40 font-mono">{ap.time}</span>
                          </div>
                          <div className="text-white/70 mt-0.5">{ap.comment}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {canAct && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-1 text-[10px] text-white/50">
                        <MessageSquare className="w-3 h-3" />
                        审批意见
                      </div>
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="请输入审批意见..."
                        className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(rect.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-neon-red/20 border border-neon-red/50 text-neon-red text-xs font-medium hover:bg-neon-red/30 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          驳回
                        </button>
                        <button
                          onClick={() => handleApprove(rect.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-neon-green/20 border border-neon-green/50 text-neon-green text-xs font-medium hover:bg-neon-green/30 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          通过
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {rectifications.length === 0 && (
          <div className="text-xs text-white/30 text-center py-8">暂无整改通知</div>
        )}
      </div>
    </GlowCard>
  );
};
