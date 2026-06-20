import type { QualityStatus, UserRole } from '../types';

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

export function formatDateTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getFutureDemand(): { day: string; demand: number }[] {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const today = new Date();
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      day: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
      demand: Math.floor(Math.random() * 80) + 40,
    });
  }
  return result;
}
