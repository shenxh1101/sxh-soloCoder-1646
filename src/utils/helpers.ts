import type { QualityStatus, UserRole, SupplierAlternative } from '../types';

export function getRoleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    worker: '施工员',
    inspector: '质检员',
    manager: '项目经理',
    director: '公司领导',
  };
  return map[role];
}

export function getQualityLabel(status: QualityStatus): string {
  const map: Record<QualityStatus, string> = {
    green: '合格',
    yellow: '预警',
    red: '不合格',
  };
  return map[status];
}

export function getQualityColor(status: QualityStatus): string {
  const map: Record<QualityStatus, string> = {
    green: '#00C48C',
    yellow: '#FFB020',
    red: '#FF4757',
  };
  return map[status];
}

export function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急',
  };
  return map[priority] || priority;
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: '#00B3FF',
    normal: '#00C48C',
    high: '#FFB020',
    urgent: '#FF4757',
  };
  return map[priority] || '#ffffff';
}

export function getZoneLabel(zone: string): string {
  const map: Record<string, string> = {
    material_yard: '材料堆放区',
    processing_shed: '加工棚',
    building_f1: '1F作业面',
    building_f2: '2F作业面',
    building_f3: '3F作业面',
    building_f4: '4F作业面',
    project_office: '项目部',
  };
  return map[zone] || zone;
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateBatchNo(category: string): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const seq = Math.floor(Math.random() * 900) + 100;
  const prefixMap: Record<string, string> = {
    '钢材': 'G',
    '水泥': 'C',
    '砂石': 'S',
    '木材': 'W',
    '砌体': 'B',
  };
  const prefix = prefixMap[category] || 'M';
  return `${prefix}${datePart}${seq}`;
}

export function formatDateTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getFutureDemand(): { day: string; date: string; demand: number }[] {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const today = new Date();
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const demand = 40 + (seed % 80);
    result.push({
      day: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
      date: dateStr,
      demand,
    });
  }
  return result;
}

export function getFutureDemandTotal(): number {
  return getFutureDemand().reduce((sum, d) => sum + d.demand, 0);
}

export function getSuggestedPurchaseQty(currentStock: number, safetyThreshold: number, unit = ''): { qty: number; reason: string; demandTotal: number } {
  const futureDemand = getFutureDemandTotal();
  const shortage = Math.max(0, safetyThreshold - currentStock);
  const buffer = Math.ceil(futureDemand * 0.3);
  const qty = Math.ceil((shortage + buffer) * 1.2);
  const reason = shortage > 0
    ? `库存缺口${shortage}${unit} + 7日需求缓冲${buffer}${unit}（7日总预测${futureDemand}${unit}×30%）`
    : `7日需求缓冲${buffer}${unit}（7日总预测${futureDemand}${unit}×30%）`;
  return { qty: Math.max(qty, 10), reason, demandTotal: futureDemand };
}

export function recommendSuppliers(
  materialSupplierId: string,
  suppliers: { id: string; name: string; rating: number; leadTime: number; unitPrice: number; priceUnit: string }[],
  inspectionFails: { materialId: string; supplierId: string; result: string }[]
): SupplierAlternative[] {
  if (suppliers.length === 0) return [];
  const today = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const scored = suppliers.map(s => {
    let score = s.rating * 20;
    score += Math.max(0, 30 - s.leadTime * 5);
    const failCount = inspectionFails.filter(f => f.supplierId === s.id && f.result === 'fail').length;
    score -= failCount * 5;
    if (s.id === materialSupplierId) score += 15;

    const arrival = new Date(today);
    arrival.setDate(today.getDate() + s.leadTime);
    const arrivalStr = `${arrival.getFullYear()}-${pad(arrival.getMonth() + 1)}-${pad(arrival.getDate())}`;

    return {
      supplierId: s.id,
      supplierName: s.name,
      score,
      rating: s.rating,
      leadTime: s.leadTime,
      unitPrice: s.unitPrice,
      priceUnit: s.priceUnit,
      failCount,
      estimatedArrival: arrivalStr,
      isOriginal: s.id === materialSupplierId,
    } as SupplierAlternative;
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}
