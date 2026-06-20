import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { X, Star, Phone, Building2, Award, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getQualityLabel, getQualityColor, getZoneLabel } from '@/utils/helpers';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';

export const MaterialDetail: React.FC = () => {
  const selectedMaterialId = useAppStore(s => s.selectedMaterialId);
  const selectMaterial = useAppStore(s => s.selectMaterial);
  const materials = useAppStore(s => s.materials);
  const suppliers = useAppStore(s => s.suppliers);
  const consumptionData = useAppStore(s => s.consumptionData);

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

  const consumptionChart = consumptionData
    .filter(c => c.materialId === material.id)
    .map(c => ({ hour: `${c.hour}:00`, amount: c.amount }));

  const stockData = [
    { name: '当前库存', value: material.stock },
    { name: '安全阈值', value: material.safetyThreshold },
  ];

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
        <div className="text-xs text-white/60 font-mono">
          当前: {material.stock}{material.unit} | 安全线: {material.safetyThreshold}{material.unit}
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
    </GlowCard>
  );
};
