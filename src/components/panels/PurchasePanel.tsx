import React, { useState } from 'react';
import {
  ShoppingCart, AlertTriangle, Plus, CheckCircle, Clock, Package, X
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

export const PurchasePanel: React.FC = () => {
  const materials = useAppStore(s => s.materials);
  const purchaseRequests = useAppStore(s => s.purchaseRequests);
  const createPurchaseRequest = useAppStore(s => s.createPurchaseRequest);
  const approvePurchase = useAppStore(s => s.approvePurchase);
  const currentUser = useAppStore(s => s.currentUser);

  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const lowStockMaterials = materials.filter(m => m.stock < m.safetyThreshold);
  const pendingRequests = purchaseRequests.filter(p => p.status === 'pending');

  const canCreate = currentUser && ['worker', 'inspector', 'manager', 'director'].includes(currentUser.role);
  const canApprove = currentUser && ['manager', 'director'].includes(currentUser.role);

  const handleSubmit = () => {
    if (!selectedMaterialId || !quantity || !reason) return;
    createPurchaseRequest(selectedMaterialId, parseInt(quantity), reason);
    setSelectedMaterialId('');
    setQuantity('');
    setReason('');
    setShowForm(false);
  };

  return (
    <GlowCard className="w-96 h-full flex flex-col gap-3 overflow-y-auto" color="green">
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-neon-green" />
        <h3 className="text-sm font-bold text-neon-green glow-text-green">采购申请管理</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            'ml-auto w-7 h-7 rounded-md flex items-center justify-center transition-colors',
            showForm
              ? 'bg-neon-red/20 border border-neon-red/50 text-neon-red'
              : 'bg-neon-green/20 border border-neon-green/50 text-neon-green hover:bg-neon-green/30'
          )}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {showForm && canCreate && (
        <GlowCard className="p-3 space-y-2.5" color="blue">
          <div className="text-xs font-medium text-neon-blue flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            新建采购申请
          </div>
          <div>
            <div className="text-[10px] text-white/50 mb-1">选择物料</div>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-neon-green/50"
            >
              <option value="">-- 请选择物料 --</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (当前库存: {m.stock}{m.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-[10px] text-white/50 mb-1">申请数量</div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="请输入数量"
              min="1"
              className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-green/50"
            />
          </div>
          <div>
            <div className="text-[10px] text-white/50 mb-1">申请原因</div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请输入申请原因..."
              className="w-full h-14 px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-neon-green/50 resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedMaterialId || !quantity || !reason}
            className="w-full py-1.5 rounded-md bg-neon-green/20 border border-neon-green/50 text-neon-green text-xs font-medium hover:bg-neon-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交申请
          </button>
        </GlowCard>
      )}

      <div className="space-y-2">
        <div className="text-xs text-white/60 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-neon-yellow" />
          低库存预警 ({lowStockMaterials.length})
        </div>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {lowStockMaterials.map(m => (
            <div key={m.id} className="flex items-center justify-between p-2 rounded-md bg-neon-yellow/5 border border-neon-yellow/20">
              <div>
                <div className="text-xs text-white font-medium">{m.name}</div>
                <div className="text-[10px] text-white/50 font-mono">
                  {m.stock}/{m.safetyThreshold} {m.unit}
                </div>
              </div>
              <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-neon-yellow rounded-full"
                  style={{ width: `${Math.min(100, (m.stock / m.safetyThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {lowStockMaterials.length === 0 && (
            <div className="text-[11px] text-white/30 text-center py-2">暂无低库存物料</div>
          )}
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        <div className="text-xs text-white/60 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          待审批申请 ({pendingRequests.length})
        </div>
        <div className="space-y-1.5">
          {pendingRequests.map(pr => {
            const mat = materials.find(m => m.id === pr.materialId);
            return (
              <div key={pr.id} className="p-2.5 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-neon-blue" />
                    <span className="text-xs text-white font-medium">{mat?.name || pr.materialId}</span>
                  </div>
                  <StatusBadge status="blue" text={'数量: ' + pr.quantity} className="text-[9px]" />
                </div>
                <div className="text-[10px] text-white/60 mb-1.5 line-clamp-1">{pr.reason}</div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-white/40 font-mono">{pr.createdAt}</div>
                  {canApprove && (
                    <button
                      onClick={() => approvePurchase(pr.id)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neon-green/20 border border-neon-green/50 text-neon-green text-[10px] font-medium hover:bg-neon-green/30 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      批准
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {pendingRequests.length === 0 && (
            <div className="text-[11px] text-white/30 text-center py-4">暂无待审批申请</div>
          )}
        </div>
      </div>
    </GlowCard>
  );
};
