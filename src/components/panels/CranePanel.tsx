import React, { useState } from 'react';
import {
  Truck, MapPin, Clock, AlertCircle, ChevronDown, ChevronUp, Zap, Gauge,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getPriorityLabel, getPriorityColor, getZoneLabel } from '@/utils/helpers';
import type { CraneTask } from '@/types';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

const priorityConfig: Record<string, { label: string; color: 'green' | 'blue' | 'yellow' | 'red' }> = {
  low: { label: '低', color: 'blue' },
  normal: { label: '普通', color: 'green' },
  high: { label: '高', color: 'yellow' },
  urgent: { label: '紧急', color: 'red' },
};

const statusConfig: Record<string, { label: string; color: 'green' | 'yellow' | 'blue' }> = {
  queued: { label: '排队中', color: 'yellow' },
  executing: { label: '执行中', color: 'green' },
  completed: { label: '已完成', color: 'blue' },
};

export const CranePanel: React.FC = () => {
  const craneTasks = useAppStore(s => s.craneTasks);
  const completeCraneTask = useAppStore(s => s.completeCraneTask);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeTasks = craneTasks.filter(t => t.status !== 'completed');
  const executingTask = craneTasks.find(t => t.status === 'executing');

  const hasConflict = activeTasks.some(t => t.priority === 'urgent') && executingTask;

  const formatEstimatedTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s}秒`;
  };

  const sortedTasks = [...activeTasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <GlowCard className="w-96 h-full flex flex-col gap-3 overflow-y-auto" color="yellow">
      <div className="flex items-center gap-2">
        <Truck className="w-5 h-5 text-neon-yellow" />
        <h3 className="text-sm font-bold text-neon-yellow glow-text-yellow">塔吊任务调度</h3>
        <StatusBadge status="yellow" text={activeTasks.length + '项活跃'} className="ml-auto" />
      </div>

      {hasConflict && (
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-neon-red/10 border border-neon-red/30">
          <AlertCircle className="w-4 h-4 text-neon-red shrink-0 mt-0.5" />
          <div className="text-[11px] text-neon-red">
            <div className="font-semibold">任务冲突预警</div>
            <div className="text-neon-red/80 mt-0.5">存在紧急任务等待执行，建议优先调度</div>
          </div>
        </div>
      )}

      {executingTask && (
        <GlowCard className="p-3 space-y-2" color="green">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green pulse-glow" />
            <span className="text-xs font-semibold text-neon-green">当前执行任务</span>
            <StatusBadge
              status={priorityConfig[executingTask.priority].color}
              text={'优先' + priorityConfig[executingTask.priority].label}
              className="ml-auto text-[9px]"
            />
          </div>
          <div className="text-sm font-medium text-white">{executingTask.materialName}</div>
          <div className="flex items-center gap-3 text-[11px] text-white/70">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neon-green" />
              <span>{getZoneLabel(executingTask.fromZone)}</span>
            </div>
            <span className="text-neon-yellow">→</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-neon-blue" />
              <span>{getZoneLabel(executingTask.toZone)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/50">
            <Clock className="w-3 h-3" />
            <span>预计耗时: {formatEstimatedTime(executingTask.estimatedTime)}</span>
          </div>
          <button
            onClick={() => completeCraneTask(executingTask.id)}
            className="w-full py-1.5 mt-1 rounded-md bg-neon-green/20 border border-neon-green/50 text-neon-green text-xs font-medium hover:bg-neon-green/30 transition-colors"
          >
            标记完成
          </button>
        </GlowCard>
      )}

      <div className="space-y-2 flex-1 overflow-y-auto">
        <div className="text-xs text-white/60 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          任务队列 (按优先级)
        </div>
        {sortedTasks.map(task => {
          const isExpanded = expandedId === task.id;
          const prioCfg = priorityConfig[task.priority];
          const statCfg = statusConfig[task.status];
          return (
            <div
              key={task.id}
              className={cn(
                'rounded-lg border overflow-hidden transition-colors',
                task.status === 'executing'
                  ? 'bg-neon-green/5 border-neon-green/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              )}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : task.id)}
                className="w-full p-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <span className="text-xs font-medium text-white flex-1 truncate">{task.materialName}</span>
                  <StatusBadge status={prioCfg.color} text={'P' + prioCfg.label} className="text-[9px]" />
                  {task.status === 'executing' && (
                    <StatusBadge status={statCfg.color} text={statCfg.label} className="text-[9px]" />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-white/50" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-2.5 pb-2.5 space-y-2 border-t border-white/5 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div className="text-white/40 mb-0.5">起吊区域</div>
                      <div className="flex items-center gap-1 text-white">
                        <MapPin className="w-3 h-3 text-neon-green" />
                        {getZoneLabel(task.fromZone)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 mb-0.5">目的区域</div>
                      <div className="flex items-center gap-1 text-white">
                        <MapPin className="w-3 h-3 text-neon-blue" />
                        {getZoneLabel(task.toZone)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 mb-0.5">塔吊编号</div>
                      <div className="text-neon-yellow font-mono">{task.craneId}</div>
                    </div>
                    <div>
                      <div className="text-white/40 mb-0.5">预计耗时</div>
                      <div className="flex items-center gap-1 text-white">
                        <Clock className="w-3 h-3 text-neon-yellow" />
                        {formatEstimatedTime(task.estimatedTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <Gauge className="w-3 h-3" />
                    创建时间: {task.createdAt}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sortedTasks.length === 0 && (
          <div className="text-xs text-white/30 text-center py-8">暂无活跃任务</div>
        )}
      </div>
    </GlowCard>
  );
};
