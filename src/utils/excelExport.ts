import * as XLSX from 'xlsx';
import type { Material, Supplier, Inspection, DailyReport, PurchaseRequest, InventoryTransaction, Rectification } from '../types';
import { getQualityLabel, getZoneLabel } from './helpers';

export interface ExportParams {
  startDate: string;
  endDate: string;
  materials: Material[];
  suppliers: Supplier[];
  inspections: Inspection[];
  dailyReports: DailyReport[];
  purchaseRequests: PurchaseRequest[];
  inventoryTransactions: InventoryTransaction[];
  rectifications: Rectification[];
}

function isDateInRange(dateStr: string, start: string, end: string): boolean {
  const d = dateStr.substring(0, 10);
  return d >= start && d <= end;
}

export function exportMaterialReport(params: ExportParams): Blob {
  const { startDate, endDate, materials, suppliers, inspections, dailyReports, purchaseRequests, inventoryTransactions, rectifications } = params;

  const filteredInspections = inspections.filter(i => isDateInRange(i.timestamp, startDate, endDate));
  const filteredReports = dailyReports.filter(r => isDateInRange(r.date, startDate, endDate));

  const wb = XLSX.utils.book_new();

  const materialData = materials.map(m => {
    const supplier = suppliers.find(s => s.id === m.supplierId);
    const passCount = filteredInspections.filter(i => i.materialId === m.id && i.result === 'pass').length;
    const totalCount = filteredInspections.filter(i => i.materialId === m.id).length;
    const passRate = totalCount > 0 ? `${((passCount / totalCount) * 100).toFixed(1)}%` : '-';
    const dailyConsumption = filteredReports.flatMap(r =>
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

  const inspectionData = filteredInspections.map(i => ({
    '检测编号': i.id,
    '物料编号': i.materialId,
    '质检员ID': i.inspectorId,
    '检测结果': i.result === 'pass' ? '合格' : '不合格',
    '备注': i.remark,
    '检测时间': i.timestamp,
  }));

  const ws3 = XLSX.utils.json_to_sheet(inspectionData);
  XLSX.utils.book_append_sheet(wb, ws3, '质检记录');

  const reportData = filteredReports.flatMap(r =>
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

  const purchaseStatusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已驳回',
  };

  const filteredPurchaseRequests = purchaseRequests.filter(pr => isDateInRange(pr.createdAt, startDate, endDate));
  const purchaseRequestData = filteredPurchaseRequests.map(pr => ({
    '申请编号': pr.id,
    '物料编号': pr.materialId,
    '申请数量': pr.quantity,
    '申请原因': pr.reason,
    '状态': purchaseStatusMap[pr.status] || pr.status,
    '申请人ID': pr.requesterId,
    '推荐供应商ID': pr.recommendedSupplierId || '-',
    '推荐理由': pr.recommendedSupplierReason || '-',
    '预计到货': pr.estimatedArrival || '-',
    '创建时间': pr.createdAt,
  }));

  const ws5 = XLSX.utils.json_to_sheet(purchaseRequestData);
  XLSX.utils.book_append_sheet(wb, ws5, '采购申请');

  const transactionTypeMap: Record<string, string> = {
    stock_in: '入库',
    stock_out: '出库',
  };

  const filteredInventoryTransactions = inventoryTransactions.filter(t => isDateInRange(t.timestamp, startDate, endDate));
  const inventoryTransactionData = filteredInventoryTransactions.map(t => ({
    '流水编号': t.id,
    '物料编号': t.materialId,
    '物料名称': t.materialName,
    '类型': transactionTypeMap[t.type] || t.type,
    '数量': `${t.quantity} ${t.unit}`,
    '原因': t.reason,
    '关联单号': t.relatedId,
    '操作人': t.operatorName,
    '时间': t.timestamp,
  }));

  const ws6 = XLSX.utils.json_to_sheet(inventoryTransactionData);
  XLSX.utils.book_append_sheet(wb, ws6, '出入库流水');

  const rectificationStatusMap: Record<string, string> = {
    pending_inspector: '待质检员审批',
    pending_worker: '待施工员审批',
    pending_manager: '待项目经理审批',
    completed: '已完成',
    rejected: '已驳回',
  };

  const filteredRectifications = rectifications.filter(r => isDateInRange(r.createdAt, startDate, endDate));
  const rectificationData = filteredRectifications.map(r => ({
    '整改编号': r.id,
    '物料编号': r.materialId,
    '描述': r.description,
    '状态': rectificationStatusMap[r.status] || r.status,
    '审批记录': r.approvals.map(a => `${a.role}:${a.userId} ${a.time} ${a.comment}`).join('; '),
    '创建时间': r.createdAt,
  }));

  const ws7 = XLSX.utils.json_to_sheet(rectificationData);
  XLSX.utils.book_append_sheet(wb, ws7, '整改审批');

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
