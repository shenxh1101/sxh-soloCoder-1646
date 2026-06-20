import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { X, Star, Phone, Building2, Award, BarChart3, ArrowUpDown, ChevronDown, ChevronRight, Lock, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getQualityLabel, getQualityColor, getZoneLabel } from '@/utils/helpers';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';

function getLifecycleLabel(tx: { type: string; reason: string }, isFirstStockIn: boolean): string {
  if (tx.type === 'stock_in' && isFirstStockIn) return '进场';
  if (tx.type === 'stock_out' && tx.reason.includes('质检')) return '质检';
  if (tx.type === 'stock_out' && tx.reason.includes('吊运')) return '吊运消耗';
  if (tx.type === 'stock_in') return '入库';
  return '出库';
}

export const MaterialDetail: React.FC = () => {
  const selectedMaterialId = useAppStore(s => s.selectedMaterialId);
  const selectMaterial = useAppStore(s => s.selectMaterial);
  const materials = useAppStore(s => s.materials);
  const suppliers = useAppStore(s => s.suppliers);
  const consumptionData = useAppStore(s => s.consumptionData);
  const inventoryTransactions = useAppStore(s => s.inventoryTransactions);

  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});

  const material = materials.find(m => m.id === selectedMaterialId);
  const supplier = material ? suppliers.find(s => s.id === material.supplierId) : null;

  if (!material) {
    return (
      <GlowCard className="w-80 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
          请选择一个材料查看详情
        </div>
      </GlowCard>
    );
  }

  const availableStock = material.stock - material.lockedStock;
  const availableColor = availableStock >= material.safetyThreshold ? 'text-neon-green' : availableStock > 0 ? 'text-yellow-400' : 'text-red-400';

  const consumptionChart = consumptionData
    .filter(c => c.materialId === material.id)
    .map(c => ({ hour: `${c.hour}:00`, amount: c.amount }));

  const stockData = [
    { name: '当前库存', value: material.stock },
    { name: '安全阈值', value: material.safetyThreshold },
  ];

  const txList = inventoryTransactions
    .filter(tx => tx.materialId === material.id);

  const batchMap = new Map<string, typeof txList>();
  txList.forEach(tx => {
    const key = tx.batchId || 'default';
    if (!batchMap.has(key)) batchMap.set(key, []);
    batchMap.get(key)!.push(tx);
  });

  const batchEntries = Array.from(batchMap.entries()).map(([batchId, transactions]) => {
    const sorted = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const totalIn = sorted.filter(t => t.type === 'stock_in').reduce((s, t) => s + t.quantity, 0);
    const totalOut = sorted.filter(t => t.type === 'stock_out').reduce((s, t) => s + t.quantity, 0);
    const remaining = totalIn - totalOut;
    return { batchId, transactions: sorted, totalIn, totalOut, remaining };
  });

  const toggleBatch = (batchId: string) => {
    setExpandedBatches(prev => ({ ...prev, [batchId]: !prev[batchId] }));
  };

  const totalIn = txList.filter(t => t.type === 'stock_in').reduce((s, t) => s + t.quantity, 0);
  const totalOut = txList.filter(t => t.type === 'stock_out').reduce((s, t) => s + t.quantity, 0);

  return (
    <GlowCard className="w-80 h-full flex flex-col gap-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-neon-blue glow-text-blue">材料详情</h3>
        <button
          onClick={() => selectMaterial(null)}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-xs text-white/50 mb-1">名称</div>
          <div className="text-base font-semibold text-white">{material.name}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-white/50">分类:</span>
            <span className="ml-1 text-white">{material.category}</span>
          </div>
          <div>
            <span className="text-white/50">批次:</span>
            <span className="ml-1 text-neon-yellow font-mono">{material.batch}</span>
          </div>
          <div>
            <span className="text-white/50">到货日期:</span>
            <span className="ml-1 text-white">{material.arrivalDate}</span>
          </div>
          <div>
            <span className="text-white/50">存放区域:</span>
            <span className="ml-1 text-white">{getZoneLabel(material.zone)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">质量状态:</span>
          <StatusBadge status={material.qualityStatus} text={getQualityLabel(material.qualityStatus)} />
          {material.isLocked && (
            <StatusBadge status="red" text="已锁定" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs text-neon-blue">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>库存与安全阈值对比</span>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={10} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 31, 56, 0.95)', border: '1px solid rgba(0, 179, 255, 0.3)', borderRadius: '4px', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {stockData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? getQualityColor(material.qualityStatus) : '#FFB020'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1">
          <div className={`text-xs font-mono ${availableColor}`}>
            可用库存: {availableStock} {material.unit}
          </div>
          {material.lockedStock > 0 && (
            <div className="text-xs font-mono text-orange-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              锁定库存: {material.lockedStock} {material.unit}
            </div>
          )}
          <div className="text-xs font-mono text-white/60">
            总库存: {material.stock} {material.unit}
          </div>
          <div className="text-xs text-white/40 font-mono">
            安全线: {material.safetyThreshold}{material.unit}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-neon-green">24小时消耗量趋势</div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={consumptionChart}>
              <defs>
                <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C48C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00C48C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" fontSize={9} interval={5} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 31, 56, 0.95)', border: '1px solid rgba(0, 179, 255, 0.3)', borderRadius: '4px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#00C48C" strokeWidth={2} fill="url(#consumptionGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {supplier && (
        <GlowCard color="green" className="p-3 space-y-2">
          <div className="flex items-center gap-1 text-xs text-neon-green font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>供应商信息</span>
          </div>
          <div className="text-sm font-medium text-white">{supplier.name}</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1 text-white/70">
              <Phone className="w-3 h-3 text-neon-blue" />
              <span>{supplier.contact}</span>
            </div>
            <div className="text-white/70 font-mono">{supplier.phone}</div>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-neon-yellow" />
            <span className="text-[10px] text-white/60">资质:</span>
            <span className="text-[10px] text-white">{supplier.qualification.join('、')}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-white/60">评分:</span>
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className="w-3 h-3"
                fill={i <= Math.floor(supplier.rating) ? '#FFB020' : 'transparent'}
                stroke={i <= Math.ceil(supplier.rating) ? '#FFB020' : 'rgba(255,255,255,0.2)'}
              />
            ))}
            <span className="text-[10px] text-neon-yellow ml-1 font-mono">{supplier.rating}</span>
          </div>
        </GlowCard>
      )}

      <GlowCard color="blue" className="p-3 space-y-2">
        <div className="flex items-center gap-1 text-xs text-neon-blue font-semibold">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>出入库流水</span>
        </div>
        {txList.length === 0 ? (
          <div className="text-xs text-white/40">暂无出入库记录</div>
        ) : (
          <>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {batchEntries.map(({ batchId, transactions, totalIn: batchIn, totalOut: batchOut, remaining }) => {
                const isExpanded = expandedBatches[batchId] !== false;
                const firstStockInIdx = transactions.findIndex(t => t.type === 'stock_in');
                return (
                  <div key={batchId} className="rounded border border-white/10 overflow-hidden">
                    <button
                      onClick={() => toggleBatch(batchId)}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        {isExpanded ? <ChevronDown className="w-3 h-3 text-neon-blue" /> : <ChevronRight className="w-3 h-3 text-neon-blue" />}
                        <Package className="w-3 h-3 text-neon-yellow" />
                        <span className="text-white/80 font-mono">{batchId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-neon-green">+{batchIn}</span>
                        <span className="text-red-400">-{batchOut}</span>
                        <span className={remaining > 0 ? 'text-white/70' : 'text-red-400'}>余{remaining}</span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-2 py-1 space-y-1">
                        {transactions.map((tx, idx) => {
                          const isFirstStockIn = idx === firstStockInIdx;
                          const label = getLifecycleLabel(tx, isFirstStockIn);
                          const isStockIn = tx.type === 'stock_in';
                          return (
                            <div key={tx.id} className="flex items-start gap-1.5 text-xs">
                              <div className="flex flex-col items-center mt-0.5">
                                <div className={`w-2 h-2 rounded-full ${isStockIn ? 'bg-neon-green' : 'bg-red-400'}`} />
                                {idx < transactions.length - 1 && <div className="w-px h-4 bg-white/10" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`font-medium ${isStockIn ? 'text-neon-green' : 'text-red-400'}`}>
                                    {label} {isStockIn ? `+${tx.quantity}` : `-${tx.quantity}`}{tx.unit}
                                  </span>
                                  <span className="text-white/30 shrink-0 ml-1">{tx.timestamp.slice(5, 16)}</span>
                                </div>
                                <div className="text-white/50 truncate">{tx.reason}</div>
                                <div className="text-white/30">{tx.operatorName}</div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                          <span className="text-white/50">剩余</span>
                          <span className={remaining > 0 ? 'text-neon-green font-mono' : 'text-red-400 font-mono'}>
                            {remaining} {material.unit}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] pt-1 border-t border-white/10">
              <span className="text-neon-green">累计入库: {totalIn}{material.unit}</span>
              <span className="text-red-400">累计出库: {totalOut}{material.unit}</span>
            </div>
          </>
        )}
      </GlowCard>
    </GlowCard>
  );
};
