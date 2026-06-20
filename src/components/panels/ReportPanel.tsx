import React, { useState, useMemo } from 'react';
import {
  FileText, Calendar, Download, TrendingUp, BarChart3, FileSpreadsheet, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { getFutureDemand, getQualityLabel, getQualityColor } from '@/utils/helpers';
import { GlowCard } from '@/components/common/GlowCard';
import { StatusBadge } from '@/components/common/StatusBadge';

export const ReportPanel: React.FC = () => {
  const materials = useAppStore(s => s.materials);
  const dailyReports = useAppStore(s => s.dailyReports);
  const generateDailyReport = useAppStore(s => s.generateDailyReport);
  const exportExcelReport = useAppStore(s => s.exportExcelReport);
  const setError = useAppStore(s => s.setError);

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const demandData = useMemo(() => getFutureDemand(), []);

  const dateError = useMemo(() => {
    if (!startDate || !endDate) return '请选择完整的开始日期和结束日期';
    if (startDate > endDate) return '开始日期不能晚于结束日期';
    return '';
  }, [startDate, endDate]);

  const handleExport = () => {
    if (dateError) {
      setError(dateError);
      return;
    }
    exportExcelReport(startDate, endDate);
  };

  const inventorySummary = materials.map(m => ({
    name: m.name,
    stock: m.stock,
    threshold: m.safetyThreshold,
    status: m.qualityStatus,
  }));

  return (
    <GlowCard className="w-[420px] h-full flex flex-col gap-3 overflow-y-auto" color="blue">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-neon-blue" />
        <h3 className="text-sm font-bold text-neon-blue glow-text-blue">报表中心</h3>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 flex-1">
            <Calendar className="w-3.5 h-3.5 text-white/50" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`flex-1 px-2 py-1 rounded-md bg-white/5 border text-[11px] text-white focus:outline-none focus:border-neon-blue/50 ${
                dateError ? 'border-neon-red/60' : 'border-white/10'
              }`}
            />
            <span className="text-white/40 text-xs">至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`flex-1 px-2 py-1 rounded-md bg-white/5 border text-[11px] text-white focus:outline-none focus:border-neon-blue/50 ${
                dateError ? 'border-neon-red/60' : 'border-white/10'
              }`}
            />
          </div>
        </div>
        {dateError && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-red/10 border border-neon-red/30 text-neon-red text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            {dateError}
          </div>
        )}
      </div>

      <GlowCard className="p-3 space-y-2" color="green">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-neon-green flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            物料库存汇总预览
          </div>
          <button
            onClick={handleExport}
            disabled={!!dateError}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors ${
              dateError
                ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                : 'bg-neon-green/20 border-neon-green/50 text-neon-green hover:bg-neon-green/30'
            }`}
          >
            <Download className="w-3 h-3" />
            导出Excel
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto rounded-md border border-white/10">
          <table className="w-full text-[10px]">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-2 py-1.5 text-white/60 font-normal">物料名称</th>
                <th className="text-right px-2 py-1.5 text-white/60 font-normal">库存</th>
                <th className="text-right px-2 py-1.5 text-white/60 font-normal">阈值</th>
                <th className="text-center px-2 py-1.5 text-white/60 font-normal">状态</th>
              </tr>
            </thead>
            <tbody>
              {inventorySummary.map((item, idx) => (
                <tr key={idx} className="border-t border-white/5">
                  <td className="px-2 py-1.5 text-white whitespace-nowrap">{item.name}</td>
                  <td className="px-2 py-1.5 text-right text-neon-blue font-mono">{item.stock}</td>
                  <td className="px-2 py-1.5 text-right text-white/60 font-mono">{item.threshold}</td>
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: getQualityColor(item.status) }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>

      <GlowCard className="p-3 space-y-2">
        <div className="flex items-center gap-1 text-xs text-neon-yellow">
          <TrendingUp className="w-3.5 h-3.5" />
          7日需求预测
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 179, 255, 0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15, 31, 56, 0.95)', border: '1px solid rgba(0, 179, 255, 0.3)', borderRadius: '4px', fontSize: '12px' }}
              />
              <Bar dataKey="demand" radius={[4, 4, 0, 0]}>
                {demandData.map((_, index) => (
                  <Cell key={index} fill={index < 2 ? '#FF4757' : index < 4 ? '#FFB020' : '#00B3FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlowCard>

      <div className="space-y-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/60 flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3" />
            日报列表
          </div>
          <button
            onClick={generateDailyReport}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-blue/20 border border-neon-blue/50 text-neon-blue text-[10px] font-medium hover:bg-neon-blue/30 transition-colors"
          >
            <FileText className="w-3 h-3" />
            生成日报
          </button>
        </div>
        <div className="space-y-1.5">
          {dailyReports.map(report => (
            <div key={report.id} className="p-2.5 rounded-md bg-white/5 border border-white/10 hover:border-neon-blue/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neon-blue" />
                  <span className="text-xs text-white font-medium">{report.date} 物料日报</span>
                </div>
                <StatusBadge status="green" text="已生成" className="text-[9px]" />
              </div>
              <div className="flex gap-2 text-[10px] text-white/50">
                {report.zoneConsumptions.map(zc => (
                  <span key={zc.zone}>{zc.zone}: {zc.materials.length}项</span>
                ))}
              </div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">生成于 {report.generatedAt}</div>
            </div>
          ))}
          {dailyReports.length === 0 && (
            <div className="text-[11px] text-white/30 text-center py-4">暂无日报记录</div>
          )}
        </div>
      </div>
    </GlowCard>
  );
};
