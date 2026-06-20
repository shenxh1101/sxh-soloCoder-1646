import React, { useState } from 'react';
import { ScanLine, CheckCircle2, XCircle, ClipboardList, Clock, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Material, MaterialBatch } from '@/types';
import { getQualityLabel } from '@/utils/helpers';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

interface BatchWithMaterial {
  batch: MaterialBatch;
  material: Material;
}

export const InspectionPanel: React.FC = () => {
  const materials = useAppStore(s => s.materials);
  const inspections = useAppStore(s => s.inspections);
  const inspectBatch = useAppStore(s => s.inspectBatch);
  const currentUser = useAppStore(s => s.currentUser);

  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [result, setResult] = useState<'pass' | 'fail'>('pass');
  const [remark, setRemark] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const allBatches: BatchWithMaterial[] = materials.flatMap(m =>
    m.batches.map(b => ({ batch: b, material: m }))
  );

  const pendingBatches = allBatches.filter(
    item => item.batch.inspectionStatus === 'pending'
  );

  const displayBatches = activeTab === 'pending' ? pendingBatches : allBatches;

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  const selectedBatch = selectedMaterial?.batches.find(b => b.id === selectedBatchId);

  const canInspect = currentUser && ['inspector', 'manager', 'director'].includes(currentUser.role);

  const handleScan = (material: Material, batch: MaterialBatch) => {
    setIsScanning(true);
    setSelectedMaterialId(material.id);
    setSelectedBatchId(batch.id);
    setTimeout(() => setIsScanning(false), 1500);
  };

  const handleSubmit = () => {
    if (!selectedMaterialId || !selectedBatchId || !canInspect) return;
    inspectBatch(selectedMaterialId, selectedBatchId, result, remark);
    setSelectedMaterialId(null);
    setSelectedBatchId(null);
    setRemark('');
    setResult('pass');
  };

  const recentInspections = [...inspections]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <GlowCard className="w-96 h-full flex flex-col gap-3 overflow-y-auto" color="green">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-neon-green" />
        <h3 className="text-sm font-bold text-neon-green glow-text-green">质量检测面板</h3>
      </div>

      <div className="space-y-2">
        <div className="flex gap-1 p-0.5 bg-white/5 rounded-md">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
            'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
            activeTab === 'pending'
              ? 'bg-neon-green/20 text-neon-green'
              : 'text-white/50 hover:text-white/80'
          )}
          >
            待检批次 ({pendingBatches.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
            'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
            activeTab === 'all'
              ? 'bg-neon-green/20 text-neon-green'
              : 'text-white/50 hover:text-white/80'
          )}
          >
            全部批次 ({allBatches.length})
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1.5">
          {displayBatches.map(({ batch, material }) => (
            <div
              key={batch.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-md border transition-colors',
                selectedBatchId === batch.id
                  ? 'bg-neon-green/10 border-neon-green/40'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-medium truncate">{material.name}</div>
                <div className="text-[10px] text-neon-yellow font-mono">{batch.batchNo}</div>
                <div className="text-[10px] text-white/50">
                  {batch.quantity}
                  <span className="ml-0.5">{material.unit}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={batch.qualityStatus} text={getQualityLabel(batch.qualityStatus)} className="text-[9px]" />
                <button
                  onClick={() => handleScan(material, batch)}
                  className="w-7 h-7 rounded-md bg-neon-blue/20 flex items-center justify-center hover:bg-neon-blue/30 transition-colors"
                >
                  <ScanLine className="w-3.5 h-3.5 text-neon-blue" />
                </button>
              </div>
            </div>
          ))}
          {displayBatches.length === 0 && (
            <div className="text-xs text-white/30 text-center py-4">暂无批次</div>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="relative h-16 rounded-md overflow-hidden bg-neon-green/5 border border-neon-green/30">
          <div className="absolute inset-0 scan-line" />
          <div className="relative h-full flex items-center justify-center text-xs text-neon-green">
            <ScanLine className="w-4 h-4 mr-2 animate-pulse" />
            正在扫描物料信息...
          </div>
        </div>
      )}

      {selectedMaterial && selectedBatch && !isScanning && (
        <GlowCard className="p-3 space-y-3" color="blue">
          <div className="text-xs text-white/60">
            检测物料: <span className="text-white font-medium">{selectedMaterial.name}</span>
            <span className="text-neon-yellow font-mono ml-2">{selectedBatch.batchNo}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setResult('pass')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs font-medium transition-colors',
                result === 'pass'
                  ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              合格
            </button>
            <button
              onClick={() => setResult('fail')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border text-xs font-medium transition-colors',
                result === 'fail'
                  ? 'bg-neon-red/20 border-neon-red/50 text-neon-red'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              )}
            >
              <XCircle className="w-4 h-4" />
              不合格
            </button>
          </div>

          <div>
            <div className="text-xs text-white/50 mb-1">检测备注</div>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入检测备注..."
              className="w-full h-16 p-2 rounded-md bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canInspect || remark.trim() === ''}
            className="w-full py-2 rounded-md bg-neon-green/20 border border-neon-green/50 text-neon-green text-xs font-medium hover:bg-neon-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交检测结果
          </button>
        </GlowCard>
      )}

      <div className="space-y-2">
        <div className="text-xs text-white/60 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          最近检测记录
        </div>
        <div className="space-y-1.5">
          {recentInspections.map(ins => {
            const mat = materials.find(m => m.id === ins.materialId);
            const batchNo = mat?.batches.find(b => b.id === ins.batchId)?.batchNo || ins.batchId;
            return (
              <div key={ins.id} className="p-2 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-xs text-white font-medium">{mat?.name || ins.materialId}</span>
                    <span className="text-[10px] text-neon-yellow font-mono ml-1.5">{batchNo}</span>
                  </div>
                  {ins.result === 'pass' ? (
                    <StatusBadge status="green" text="合格" className="text-[9px]" />
                  ) : (
                    <StatusBadge status="red" text="不合格" className="text-[9px]" />
                  )}
                </div>
                <div className="text-[10px] text-white/50">{ins.remark}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-[10px] text-white/40">
                    <User className="w-3 h-3" />
                    {ins.inspectorId}
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">{ins.timestamp}</span>
                </div>
              </div>
            );
          })}
          {recentInspections.length === 0 && (
            <div className="text-xs text-white/30 text-center py-4">暂无检测记录</div>
          )}
        </div>
      </div>
    </GlowCard>
  );
};
