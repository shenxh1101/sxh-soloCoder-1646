import type { User, Material, Supplier, ConsumptionHourly, Inspection, Rectification, PurchaseRequest, CraneTask, DailyReport, OperationLog, InventoryTransaction } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: '张伟', role: 'worker', avatar: '' },
  { id: 'u2', name: '李明', role: 'inspector', avatar: '' },
  { id: 'u3', name: '王强', role: 'manager', avatar: '' },
  { id: 'u4', name: '赵总', role: 'director', avatar: '' },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: '华东建材集团', contact: '陈经理', phone: '13800138001', qualification: ['ISO9001认证', '建筑用钢资质'], rating: 4.8, leadTime: 3, unitPrice: 4200, priceUnit: '元/吨' },
  { id: 's2', name: '中建水泥有限公司', contact: '刘总', phone: '13800138002', qualification: ['生产许可证', '环保认证'], rating: 4.6, leadTime: 2, unitPrice: 28, priceUnit: '元/袋' },
  { id: 's3', name: '绿源砂石料场', contact: '周老板', phone: '13800138003', qualification: ['采矿许可证', '质量检测报告'], rating: 4.5, leadTime: 1, unitPrice: 85, priceUnit: '元/立方米' },
  { id: 's4', name: '恒泰木业', contact: '吴经理', phone: '13800138004', qualification: ['木材经营许可证', 'FSC认证'], rating: 4.3, leadTime: 5, unitPrice: 55, priceUnit: '元/张' },
];

export const mockMaterials: Material[] = [
  {
    id: 'm1', name: 'HRB400E螺纹钢', category: '钢材', batch: 'G20260615001',
    arrivalDate: '2026-06-15', stock: 285, safetyThreshold: 100,
    qualityStatus: 'green', supplierId: 's1',
    position: { x: -12, y: 0, z: -8 }, zone: 'material_yard',
    isLocked: false, unit: '吨', lockedStock: 0
  },
  {
    id: 'm2', name: 'P.O42.5水泥', category: '水泥', batch: 'C20260618002',
    arrivalDate: '2026-06-18', stock: 520, safetyThreshold: 200,
    qualityStatus: 'green', supplierId: 's2',
    position: { x: -6, y: 0, z: -8 }, zone: 'material_yard',
    isLocked: false, unit: '袋', lockedStock: 0
  },
  {
    id: 'm3', name: '河沙(中粗)', category: '砂石', batch: 'S20260619003',
    arrivalDate: '2026-06-19', stock: 85, safetyThreshold: 150,
    qualityStatus: 'yellow', supplierId: 's3',
    position: { x: 0, y: 0, z: -8 }, zone: 'material_yard',
    isLocked: false, unit: '立方米', lockedStock: 0
  },
  {
    id: 'm4', name: '5-25mm碎石', category: '砂石', batch: 'A20260617004',
    arrivalDate: '2026-06-17', stock: 180, safetyThreshold: 100,
    qualityStatus: 'green', supplierId: 's3',
    position: { x: 6, y: 0, z: -8 }, zone: 'material_yard',
    isLocked: false, unit: '立方米', lockedStock: 0
  },
  {
    id: 'm5', name: '松木模板', category: '木材', batch: 'W20260610005',
    arrivalDate: '2026-06-10', stock: 42, safetyThreshold: 80,
    qualityStatus: 'red', supplierId: 's4',
    position: { x: -9, y: 0, z: -2 }, zone: 'processing_shed',
    isLocked: true, unit: '张', lockedStock: 42
  },
  {
    id: 'm6', name: '100x100方木', category: '木材', batch: 'W20260612006',
    arrivalDate: '2026-06-12', stock: 320, safetyThreshold: 150,
    qualityStatus: 'green', supplierId: 's4',
    position: { x: 9, y: 0, z: -2 }, zone: 'processing_shed',
    isLocked: false, unit: '根', lockedStock: 0
  },
  {
    id: 'm7', name: 'HPB300圆钢', category: '钢材', batch: 'G20260616007',
    arrivalDate: '2026-06-16', stock: 156, safetyThreshold: 80,
    qualityStatus: 'green', supplierId: 's1',
    position: { x: 12, y: 0, z: -8 }, zone: 'material_yard',
    isLocked: false, unit: '吨', lockedStock: 0
  },
  {
    id: 'm8', name: '粉煤灰砖', category: '砌体', batch: 'B20260620008',
    arrivalDate: '2026-06-20', stock: 12000, safetyThreshold: 5000,
    qualityStatus: 'yellow', supplierId: 's2',
    position: { x: -3, y: 0, z: -2 }, zone: 'processing_shed',
    isLocked: false, unit: '块', lockedStock: 0
  },
];

export function generateConsumptionData(): ConsumptionHourly[] {
  const data: ConsumptionHourly[] = [];
  mockMaterials.forEach(m => {
    for (let h = 0; h < 24; h++) {
      data.push({
        materialId: m.id,
        hour: h,
        amount: Math.floor(Math.random() * 15) + 2
      });
    }
  });
  return data;
}

export const mockInspections: Inspection[] = [
  { id: 'i1', materialId: 'm5', inspectorId: 'u2', result: 'fail', remark: '含水率超标，存在腐烂现象', timestamp: '2026-06-19 14:30:00' },
  { id: 'i2', materialId: 'm1', inspectorId: 'u2', result: 'pass', remark: '检测合格', timestamp: '2026-06-18 09:15:00' },
  { id: 'i3', materialId: 'm3', inspectorId: 'u2', result: 'pass', remark: '含泥量略高，可使用', timestamp: '2026-06-19 10:20:00' },
];

export const mockRectifications: Rectification[] = [
  {
    id: 'r1', materialId: 'm5', description: '松木模板批次W20260610005检测不合格，含水率超标15%，部分存在腐烂。需退回供应商并更换合格批次。',
    status: 'pending_worker',
    approvals: [
      { role: 'inspector', userId: 'u2', time: '2026-06-19 14:35:00', comment: '检测确认不合格，需立即处理' }
    ],
    createdAt: '2026-06-19 14:32:00'
  },
  {
    id: 'r2', materialId: 'm3', description: '河沙批次S20260619003库存量已低于安全阈值，需尽快组织采购。',
    status: 'pending_inspector',
    approvals: [],
    createdAt: '2026-06-20 08:00:00'
  },
];

export const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: 'p1', materialId: 'm3', quantity: 200, reason: '库存低于安全阈值（当前85立方米，阈值150立方米），7日预测需求420立方米',
    status: 'pending', requesterId: 'u1',
    approvals: [], createdAt: '2026-06-20 08:15:00',
    recommendedSupplierId: 's3', recommendedSupplierReason: '绿源砂石料场交期1天、评分4.5、单价85元/立方米、综合评分110',
    estimatedArrival: '2026-06-21', isAutoGenerated: true,
    supplierAlternatives: [
      { supplierId: 's3', supplierName: '绿源砂石料场', score: 110, rating: 4.5, leadTime: 1, unitPrice: 85, priceUnit: '元/立方米', failCount: 0, estimatedArrival: '2026-06-21', isOriginal: true },
      { supplierId: 's2', supplierName: '中建水泥有限公司', score: 92, rating: 4.6, leadTime: 2, unitPrice: 28, priceUnit: '元/袋', failCount: 0, estimatedArrival: '2026-06-22', isOriginal: false },
      { supplierId: 's1', supplierName: '华东建材集团', score: 86, rating: 4.8, leadTime: 3, unitPrice: 4200, priceUnit: '元/吨', failCount: 0, estimatedArrival: '2026-06-23', isOriginal: false },
    ],
  },
  {
    id: 'p2', materialId: 'm5', quantity: 200, reason: '现有批次检测不合格，需紧急采购替换',
    status: 'delivering', requesterId: 'u2',
    approvals: [{ role: 'inspector', userId: 'u2', time: '2026-06-19 15:00:00' }, { role: 'manager', userId: 'u3', time: '2026-06-19 16:00:00' }],
    createdAt: '2026-06-19 15:00:00',
    recommendedSupplierId: 's4', recommendedSupplierReason: '恒泰木业为该物料原供应商，交期5天、评分4.3、历史不合格1次',
    estimatedArrival: '2026-06-25',
    supplierAlternatives: [
      { supplierId: 's4', supplierName: '恒泰木业', score: 96, rating: 4.3, leadTime: 5, unitPrice: 55, priceUnit: '元/张', failCount: 1, estimatedArrival: '2026-06-25', isOriginal: true },
      { supplierId: 's1', supplierName: '华东建材集团', score: 86, rating: 4.8, leadTime: 3, unitPrice: 4200, priceUnit: '元/吨', failCount: 0, estimatedArrival: '2026-06-23', isOriginal: false },
      { supplierId: 's2', supplierName: '中建水泥有限公司', score: 72, rating: 4.6, leadTime: 2, unitPrice: 28, priceUnit: '元/袋', failCount: 0, estimatedArrival: '2026-06-22', isOriginal: false },
    ],
  },
];

export const mockCraneTasks: CraneTask[] = [
  {
    id: 't1', craneId: 'crane1', materialId: 'm1', materialName: 'HRB400E螺纹钢',
    fromZone: 'material_yard', toZone: 'building_f3', priority: 'high',
    status: 'executing',
    path: [
      { x: -12, y: 5, z: -8 },
      { x: -12, y: 25, z: -8 },
      { x: 18, y: 25, z: 6 },
      { x: 18, y: 15, z: 6 }
    ],
    estimatedTime: 180, createdAt: '2026-06-20 10:30:00'
  },
  {
    id: 't2', craneId: 'crane1', materialId: 'm2', materialName: 'P.O42.5水泥',
    fromZone: 'material_yard', toZone: 'building_f2', priority: 'normal',
    status: 'queued',
    path: [
      { x: -6, y: 5, z: -8 },
      { x: -6, y: 25, z: -8 },
      { x: 18, y: 25, z: 6 },
      { x: 18, y: 10, z: 6 }
    ],
    estimatedTime: 150, createdAt: '2026-06-20 10:32:00'
  },
  {
    id: 't3', craneId: 'crane2', materialId: 'm6', materialName: '100x100方木',
    fromZone: 'processing_shed', toZone: 'building_f4', priority: 'urgent',
    status: 'queued',
    path: [
      { x: 9, y: 4, z: -2 },
      { x: 9, y: 28, z: -2 },
      { x: 18, y: 28, z: 6 },
      { x: 18, y: 20, z: 6 }
    ],
    estimatedTime: 200, createdAt: '2026-06-20 10:35:00'
  },
];

export const mockDailyReports: DailyReport[] = [
  {
    id: 'd1', date: '2026-06-20',
    zoneConsumptions: [
      { zone: '材料堆放区', materials: [{ materialId: 'm1', materialName: 'HRB400E螺纹钢', amount: 45 }, { materialId: 'm2', materialName: 'P.O42.5水泥', amount: 80 }] },
      { zone: '加工棚', materials: [{ materialId: 'm6', materialName: '100x100方木', amount: 28 }, { materialId: 'm8', materialName: '粉煤灰砖', amount: 1200 }] },
      { zone: '楼层作业面', materials: [{ materialId: 'm4', materialName: '5-25mm碎石', amount: 35 }] },
    ],
    generatedAt: '2026-06-20 10:00:00'
  },
];

export const mockOperationLogs: OperationLog[] = [
  { id: 'l1', userId: 'u2', userName: '李明', action: '质检操作', timestamp: '2026-06-20 10:25:00', details: '对河沙(中粗)进行质检，结果：通过' },
  { id: 'l2', userId: 'u1', userName: '张伟', action: '吊运任务', timestamp: '2026-06-20 10:30:00', details: '执行任务T1：螺纹钢吊运至3F' },
  { id: 'l3', userId: 'u3', userName: '王强', action: '查看日报', timestamp: '2026-06-20 10:05:00', details: '查看6月20日物料日报' },
];

export const mockInventoryTransactions: InventoryTransaction[] = [
  { id: 'it1', materialId: 'm1', materialName: 'HRB400E螺纹钢', batchId: 'G20260615001', type: 'stock_in', quantity: 300, unit: '吨', reason: '采购到货入库', relatedId: 'p0', operatorId: 'u3', operatorName: '王强', timestamp: '2026-06-15 08:30:00' },
  { id: 'it2', materialId: 'm5', materialName: '松木模板', batchId: 'W20260610005', type: 'stock_in', quantity: 100, unit: '张', reason: '采购到货入库', relatedId: 'p0b', operatorId: 'u3', operatorName: '王强', timestamp: '2026-06-10 09:00:00' },
  { id: 'it3', materialId: 'm5', materialName: '松木模板', batchId: 'W20260610005', type: 'stock_out', quantity: 58, unit: '张', reason: '质检不合格扣减', relatedId: 'i1', operatorId: 'u2', operatorName: '李明', timestamp: '2026-06-19 14:30:00' },
  { id: 'it4', materialId: 'm1', materialName: 'HRB400E螺纹钢', batchId: 'G20260615001', type: 'stock_out', quantity: 15, unit: '吨', reason: '吊运消耗至3F作业面', relatedId: 't1', operatorId: 'u1', operatorName: '张伟', timestamp: '2026-06-20 10:30:00' },
  { id: 'it5', materialId: 'm3', materialName: '河沙(中粗)', batchId: 'S20260619003', type: 'stock_in', quantity: 200, unit: '立方米', reason: '采购到货入库', relatedId: 'p0c', operatorId: 'u3', operatorName: '王强', timestamp: '2026-06-19 07:00:00' },
  { id: 'it6', materialId: 'm3', materialName: '河沙(中粗)', batchId: 'S20260619003', type: 'stock_out', quantity: 115, unit: '立方米', reason: '日常施工消耗', relatedId: 'd1', operatorId: 'u1', operatorName: '张伟', timestamp: '2026-06-20 10:00:00' },
];
