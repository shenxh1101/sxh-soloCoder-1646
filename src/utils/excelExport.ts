import * as XLSX from 'xlsx';
import type { Material, Supplier, Inspection, DailyReport } from '../types';
import { getQualityLabel, getZoneLabel } from './helpers';

export interface ExportParams {
  date: string;
  materials: Material[];
  suppliers: Supplier[];
  inspections: Inspection[];
  dailyReports: DailyReport[];
}

export function exportMaterialReport(params: ExportParams): Blob {
  const { date, materials, suppliers, inspections, dailyReports } = params;

  const wb = XLSX.utils.book_new();

  const materialData = materials.map(m => {
    const supplier = suppliers.find(s => s.id === m.supplierId);
    const passCount = inspections.filter(i => i.materialId === m.id && i.result === 'pass').length;
    const totalCount = inspections.filter(i => i.materialId === m.id).length;
    const passRate = totalCount > 0 ? `${((passCount / totalCount) * 100).toFixed(1)}%` : '-';
    const dailyConsumption = dailyReports.flatMap(r =>
      r.zoneConsumptions.flatMap(z =>
        z.materials.filter(mat => mat.materialId === m.id).map(mat => mat.amount)
      )
    ).reduce((a, b) => a + b, 0);

    return {
      '物料编号': m.id,
      '物料名称': m.name,
      '类别': m.category,
      '批次号': m.batch,
      '进场日期': m.arrivalDate,
      '当前库存': `${m.stock} ${m.unit}`,
      '安全库存': `${m.safetyThreshold} ${m.unit}`,
      '质检状态': getQualityLabel(m.qualityStatus),
      '合格率': passRate,
      '存放区域': getZoneLabel(m.zone),
      '供应商': supplier?.name || '-',
      '今日消耗': `${dailyConsumption} ${m.unit}`,
      '是否锁定': m.isLocked ? '是' : '否',
    };
  });

  const ws1 = XLSX.utils.json_to_sheet(materialData);
  XLSX.utils.book_append_sheet(wb, ws1, '物料收发存');

  const supplierData = suppliers.map(s => ({
    '供应商编号': s.id,
    '供应商名称': s.name,
    '联系人': s.contact,
    '联系电话': s.phone,
    '资质认证': s.qualification.join('、'),
    '信用评级': `${s.rating} / 5.0`,
  }));

  const ws2 = XLSX.utils.json_to_sheet(supplierData);
  XLSX.utils.book_append_sheet(wb, ws2, '供应商档案');

  const inspectionData = inspections.map(i => ({
    '检测编号': i.id,
    '物料编号': i.materialId,
    '质检员ID': i.inspectorId,
    '检测结果': i.result === 'pass' ? '合格' : '不合格',
    '备注': i.remark,
    '检测时间': i.timestamp,
  }));

  const ws3 = XLSX.utils.json_to_sheet(inspectionData);
  XLSX.utils.book_append_sheet(wb, ws3, '质检记录');

  const reportData = dailyReports.flatMap(r =>
    r.zoneConsumptions.flatMap(z =>
      z.materials.map(m => ({
        '日报编号': r.id,
        '统计日期': r.date,
        '区域': z.zone,
        '物料名称': m.materialName,
        '消耗量': m.amount,
        '生成时间': r.generatedAt,
      }))
    )
  );

  const ws4 = XLSX.utils.json_to_sheet(reportData);
  XLSX.utils.book_append_sheet(wb, ws4, '消耗统计');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
}

export function downloadExcel(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
