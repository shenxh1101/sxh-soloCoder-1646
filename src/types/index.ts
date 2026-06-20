export type UserRole = 'worker' | 'inspector' | 'manager' | 'director';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type QualityStatus = 'green' | 'yellow' | 'red';

export interface Material {
  id: string;
  name: string;
  category: string;
  batch: string;
  arrivalDate: string;
  stock: number;
  safetyThreshold: number;
  qualityStatus: QualityStatus;
  supplierId: string;
  position: { x: number; y: number; z: number };
  zone: string;
  isLocked: boolean;
  unit: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  qualification: string[];
  rating: number;
}

export interface ConsumptionHourly {
  materialId: string;
  hour: number;
  amount: number;
}

export interface Inspection {
  id: string;
  materialId: string;
  inspectorId: string;
  result: 'pass' | 'fail';
  remark: string;
  timestamp: string;
}

export interface Rectification {
  id: string;
  materialId: string;
  description: string;
  status: 'pending_inspector' | 'pending_worker' | 'pending_manager' | 'completed' | 'rejected';
  approvals: { role: UserRole; userId: string; time: string; comment: string }[];
  createdAt: string;
}

export interface PurchaseRequest {
  id: string;
  materialId: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requesterId: string;
  approvals: { role: UserRole; userId: string; time: string }[];
  createdAt: string;
}

export interface CraneTask {
  id: string;
  craneId: string;
  materialId: string;
  materialName: string;
  fromZone: string;
  toZone: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'queued' | 'executing' | 'completed';
  path: { x: number; y: number; z: number }[];
  estimatedTime: number;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  date: string;
  zoneConsumptions: { zone: string; materials: { materialId: string; materialName: string; amount: number }[] }[];
  generatedAt: string;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

export type ActivePanelType = 'materials' | 'inspection' | 'crane' | 'reports' | 'purchase' | 'rectification' | null;
