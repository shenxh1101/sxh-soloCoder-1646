import { create } from 'zustand';
import type {
  User, UserRole, Material, Supplier, ConsumptionHourly, Inspection,
  Rectification, PurchaseRequest, CraneTask, DailyReport, OperationLog, ActivePanelType, InventoryTransaction
} from '../types';
import {
  mockUsers, mockMaterials, mockSuppliers, generateConsumptionData,
  mockInspections, mockRectifications, mockPurchaseRequests, mockCraneTasks,
  mockDailyReports, mockOperationLogs, mockInventoryTransactions
} from '../data/mockData';
import { generateId, formatDateTime, getSuggestedPurchaseQty, recommendSupplier } from '../utils/helpers';
import { exportMaterialReport, downloadExcel } from '../utils/excelExport';

const STORAGE_KEY = 'construction_material_platform_v2';

interface PersistData {
  materials: Material[];
  inspections: Inspection[];
  rectifications: Rectification[];
  purchaseRequests: PurchaseRequest[];
  dailyReports: DailyReport[];
  operationLogs: OperationLog[];
  inventoryTransactions: InventoryTransaction[];
}

function loadFromStorage(): Partial<PersistData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistData;
  } catch (e) {
    console.warn('Failed to load persisted data:', e);
    return {};
  }
}

function saveToStorage(data: PersistData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to persist data:', e);
  }
}

const persisted = loadFromStorage();

interface AppState {
  currentUser: User | null;
  isLoggedIn: boolean;
  error: string | null;

  materials: Material[];
  suppliers: Supplier[];
  consumptionData: ConsumptionHourly[];

  inspections: Inspection[];
  rectifications: Rectification[];
  purchaseRequests: PurchaseRequest[];
  inventoryTransactions: InventoryTransaction[];

  craneTasks: CraneTask[];

  dailyReports: DailyReport[];
  operationLogs: OperationLog[];

  selectedMaterialId: string | null;
  activePanel: ActivePanelType;
  showNotification: boolean;
  notificationMessage: string;

  login: (role: UserRole) => void;
  logout: () => void;
  setError: (err: string | null) => void;

  selectMaterial: (id: string | null) => void;
  setActivePanel: (panel: ActivePanelType) => void;
  setNotification: (show: boolean, msg?: string) => void;

  inspectMaterial: (materialId: string, result: 'pass' | 'fail', remark: string) => void;
  approveRectification: (id: string, role: UserRole, comment: string) => void;
  rejectRectification: (id: string, role: UserRole, comment: string) => void;

  createPurchaseRequest: (materialId: string, quantity: number, reason: string, auto?: boolean) => void;
  approvePurchase: (id: string) => void;

  assignCraneTask: (task: Omit<CraneTask, 'id' | 'createdAt'>) => void;
  completeCraneTask: (taskId: string) => void;

  generateDailyReport: () => void;
  exportExcelReport: (startDate: string, endDate: string) => boolean;

  addOperationLog: (action: string, details: string) => void;
  addInventoryTransaction: (tx: Omit<InventoryTransaction, 'id'>) => void;

  _persist: () => void;
  checkAndGenerateAutoPurchase: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  error: null,

  materials: persisted.materials || mockMaterials,
  suppliers: mockSuppliers,
  consumptionData: generateConsumptionData(),

  inspections: persisted.inspections || mockInspections,
  rectifications: persisted.rectifications || mockRectifications,
  purchaseRequests: persisted.purchaseRequests || mockPurchaseRequests,
  inventoryTransactions: persisted.inventoryTransactions || mockInventoryTransactions,

  craneTasks: mockCraneTasks,

  dailyReports: persisted.dailyReports || mockDailyReports,
  operationLogs: persisted.operationLogs || mockOperationLogs,

  selectedMaterialId: null,
  activePanel: null,
  showNotification: false,
  notificationMessage: '',

  _persist: () => {
    const s = get();
    saveToStorage({
      materials: s.materials,
      inspections: s.inspections,
      rectifications: s.rectifications,
      purchaseRequests: s.purchaseRequests,
      dailyReports: s.dailyReports,
      operationLogs: s.operationLogs,
      inventoryTransactions: s.inventoryTransactions,
    });
  },

  login: (role: UserRole) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      set({ currentUser: user, isLoggedIn: true, error: null });
      get().addOperationLog('系统登录', `${user.name}以${role === 'worker' ? '施工员' : role === 'inspector' ? '质检员' : role === 'manager' ? '项目经理' : '公司领导'}身份登录系统`);
    } else {
      set({ error: '无效的用户角色，请重新选择' });
    }
  },

  logout: () => {
    const user = get().currentUser;
    if (user) {
      get().addOperationLog('系统登出', `${user.name}退出系统`);
    }
    set({ currentUser: null, isLoggedIn: false, selectedMaterialId: null, activePanel: null });
  },

  setError: (err) => set({ error: err }),

  selectMaterial: (id) => set({ selectedMaterialId: id }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setNotification: (show, msg) => set({ showNotification: show, notificationMessage: msg || '' }),

  addInventoryTransaction: (tx) => {
    const newTx: InventoryTransaction = { ...tx, id: generateId('it') };
    set(state => ({ inventoryTransactions: [...state.inventoryTransactions, newTx] }));
  },

  inspectMaterial: (materialId, result, remark) => {
    const user = get().currentUser;
    if (!user || (user.role !== 'inspector' && user.role !== 'manager' && user.role !== 'director')) {
      set({ error: '无权限进行质检操作，仅质检员或管理员可执行' });
      return;
    }

    const material = get().materials.find(m => m.id === materialId);
    const inspection: Inspection = {
      id: generateId('i'),
      materialId,
      inspectorId: user.id,
      result,
      remark,
      timestamp: formatDateTime(),
    };

    const qualityStatus = result === 'pass' ? 'green' : 'red';
    const isLocked = result === 'fail';

    set(state => ({
      inspections: [...state.inspections, inspection],
      materials: state.materials.map(m =>
        m.id === materialId ? { ...m, qualityStatus, isLocked } : m
      ),
    }));

    get().addOperationLog('质检操作', `对物料${materialId}进行质检，结果：${result === 'pass' ? '合格' : '不合格'}`);

    if (result === 'fail' && material) {
      const deductQty = Math.min(material.stock, Math.ceil(material.stock * 0.5));
      get().addInventoryTransaction({
        materialId,
        materialName: material.name,
        type: 'stock_out',
        quantity: deductQty,
        unit: material.unit,
        reason: `质检不合格扣减（${remark}）`,
        relatedId: inspection.id,
        operatorId: user.id,
        operatorName: user.name,
        timestamp: formatDateTime(),
      });
      set(state => ({
        materials: state.materials.map(m =>
          m.id === materialId ? { ...m, stock: Math.max(0, m.stock - deductQty) } : m
        ),
      }));

      const rectification: Rectification = {
        id: generateId('r'),
        materialId,
        description: `物料批次${material.batch}检测不合格：${remark}。需立即整改并完成三级审批。`,
        status: 'pending_worker',
        approvals: [{ role: 'inspector', userId: user.id, time: formatDateTime(), comment: remark }],
        createdAt: formatDateTime(),
      };
      set(state => ({ rectifications: [...state.rectifications, rectification] }));
      get().setNotification(true, '检测不合格，已自动生成整改通知单并扣减库存');
    } else {
      get().setNotification(true, '质检通过，物料状态已更新为合格');
    }
    get()._persist();
  },

  approveRectification: (id, role, comment) => {
    const user = get().currentUser;
    if (!user) return;

    const roleOrder: UserRole[] = ['inspector', 'worker', 'manager'];
    const rect = get().rectifications.find(r => r.id === id);
    if (!rect) return;

    const currentStep = roleOrder.indexOf(role);
    const newStatus = currentStep >= roleOrder.length - 1 ? 'completed' :
      `pending_${roleOrder[currentStep + 1]}` as Rectification['status'];

    set(state => ({
      rectifications: state.rectifications.map(r =>
        r.id === id ? {
          ...r,
          status: newStatus,
          approvals: [...r.approvals, { role, userId: user.id, time: formatDateTime(), comment }],
        } : r
      ),
    }));

    get().addOperationLog('整改审批', `审批整改单${id}，角色：${role}，结果：通过`);
    get().setNotification(true, newStatus === 'completed' ? '整改审批已完成' : '审批已提交至下一级');
    get()._persist();
  },

  rejectRectification: (id, role, comment) => {
    const user = get().currentUser;
    if (!user) return;
    set(state => ({
      rectifications: state.rectifications.map(r =>
        r.id === id ? {
          ...r,
          status: 'rejected',
          approvals: [...r.approvals, { role, userId: user.id, time: formatDateTime(), comment }],
        } : r
      ),
    }));
    get().addOperationLog('整改审批', `驳回整改单${id}，原因：${comment}`);
    get().setNotification(true, '整改单已被驳回');
    get()._persist();
  },

  createPurchaseRequest: (materialId, quantity, reason, auto = false) => {
    const user = get().currentUser;
    if (!user) return;

    const existingAuto = get().purchaseRequests.find(
      p => p.materialId === materialId && p.status === 'pending' && p.isAutoGenerated
    );
    if (auto && existingAuto) return;

    const material = get().materials.find(m => m.id === materialId);
    const rec = recommendSupplier(material?.supplierId || '', get().suppliers);

    const pr: PurchaseRequest = {
      id: generateId('p'),
      materialId,
      quantity,
      reason,
      status: 'pending',
      requesterId: user.id,
      approvals: user.role === 'inspector' ? [{ role: 'inspector', userId: user.id, time: formatDateTime() }] : [],
      createdAt: formatDateTime(),
      recommendedSupplierId: rec?.supplierId,
      recommendedSupplierReason: rec?.reason,
      estimatedArrival: rec?.estimatedArrival,
      isAutoGenerated: auto,
    };

    set(state => ({ purchaseRequests: [...state.purchaseRequests, pr] }));
    get().addOperationLog(auto ? '自动采购申请' : '采购申请', `${auto ? '系统自动创建' : '创建'}采购申请${pr.id}：物料${materialId}，数量${quantity}${rec ? `，推荐${get().suppliers.find(s=>s.id===rec.supplierId)?.name||''}` : ''}`);
    get().setNotification(true, auto ? '库存预警，已自动生成采购申请' : '采购申请已创建并提交审批');
    get()._persist();
  },

  approvePurchase: (id) => {
    const user = get().currentUser;
    if (!user) return;

    const pr = get().purchaseRequests.find(p => p.id === id);
    if (!pr) return;

    const material = get().materials.find(m => m.id === pr.materialId);

    set(state => ({
      purchaseRequests: state.purchaseRequests.map(p =>
        p.id === id ? {
          ...p,
          status: 'approved',
          approvals: [...p.approvals, { role: user.role, userId: user.id, time: formatDateTime() }],
        } : p
      ),
      materials: state.materials.map(m =>
        m.id === pr.materialId ? { ...m, stock: m.stock + pr.quantity } : m
      ),
    }));

    if (material) {
      get().addInventoryTransaction({
        materialId: pr.materialId,
        materialName: material.name,
        type: 'stock_in',
        quantity: pr.quantity,
        unit: material.unit,
        reason: `采购批准入库（申请${pr.id}）`,
        relatedId: pr.id,
        operatorId: user.id,
        operatorName: user.name,
        timestamp: formatDateTime(),
      });
    }

    get().addOperationLog('采购审批', `审批采购申请${id}通过，入库${pr.quantity}${material?.unit || ''}`);
    get().setNotification(true, '采购申请已批准，物料已入库');
    get()._persist();
  },

  assignCraneTask: (task) => {
    const newTask: CraneTask = {
      ...task,
      id: generateId('t'),
      createdAt: formatDateTime(),
    };
    set(state => ({ craneTasks: [...state.craneTasks, newTask] }));
    get().addOperationLog('塔吊调度', `分配塔吊任务${newTask.id}：${newTask.materialName}从${newTask.fromZone}到${newTask.toZone}`);
  },

  completeCraneTask: (taskId) => {
    const user = get().currentUser;
    const task = get().craneTasks.find(t => t.id === taskId);
    const material = task ? get().materials.find(m => m.id === task.materialId) : null;
    const consumeQty = material ? Math.min(material.stock, Math.ceil(Math.random() * 5) + 1) : 0;

    set(state => ({
      craneTasks: state.craneTasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      ),
      materials: consumeQty > 0 ? state.materials.map(m =>
        m.id === task?.materialId ? { ...m, stock: Math.max(0, m.stock - consumeQty) } : m
      ) : state.materials,
    }));

    if (task && material && consumeQty > 0 && user) {
      get().addInventoryTransaction({
        materialId: task.materialId,
        materialName: task.materialName,
        type: 'stock_out',
        quantity: consumeQty,
        unit: material.unit,
        reason: `吊运消耗至${task.toZone}`,
        relatedId: taskId,
        operatorId: user.id,
        operatorName: user.name,
        timestamp: formatDateTime(),
      });
    }

    get().addOperationLog('塔吊任务', `完成塔吊任务${taskId}${consumeQty > 0 ? `，消耗${consumeQty}${material?.unit || ''}` : ''}`);
    get()._persist();
  },

  generateDailyReport: () => {
    const zones = ['材料堆放区', '加工棚', '楼层作业面'];
    const zoneConsumptions = zones.map(zone => ({
      zone,
      materials: get().materials.slice(0, 3).map(m => ({
        materialId: m.id,
        materialName: m.name,
        amount: Math.floor(Math.random() * 100) + 10,
      })),
    }));

    const report: DailyReport = {
      id: generateId('d'),
      date: new Date().toISOString().split('T')[0],
      zoneConsumptions,
      generatedAt: formatDateTime(),
    };

    set(state => ({ dailyReports: [...state.dailyReports, report] }));
    get().addOperationLog('日报生成', `生成日报${report.id}`);
    get().setNotification(true, '物料日报已生成并推送至项目部');
    get()._persist();
  },

  exportExcelReport: (startDate, endDate) => {
    if (!startDate || !endDate) {
      get().setError('请选择完整的开始日期和结束日期');
      return false;
    }
    if (startDate > endDate) {
      get().setError('开始日期不能晚于结束日期，请重新选择日期范围');
      return false;
    }
    const state = get();
    const blob = exportMaterialReport({
      startDate,
      endDate,
      materials: state.materials,
      suppliers: state.suppliers,
      inspections: state.inspections,
      dailyReports: state.dailyReports,
      purchaseRequests: state.purchaseRequests,
      inventoryTransactions: state.inventoryTransactions,
      rectifications: state.rectifications,
    });
    const filename = startDate === endDate
      ? `物料收发存报表_${startDate}.xlsx`
      : `物料收发存报表_${startDate}_至_${endDate}.xlsx`;
    downloadExcel(blob, filename);
    get().addOperationLog('报表导出', `导出${startDate}至${endDate}物料收发存报表`);
    return true;
  },

  addOperationLog: (action, details) => {
    const user = get().currentUser;
    if (!user) return;
    const log: OperationLog = {
      id: generateId('l'),
      userId: user.id,
      userName: user.name,
      action,
      timestamp: formatDateTime(),
      details,
    };
    set(state => ({ operationLogs: [log, ...state.operationLogs].slice(0, 100) }));
    get()._persist();
  },

  checkAndGenerateAutoPurchase: () => {
    const state = get();
    if (!state.currentUser) return;
    state.materials.forEach(m => {
      if (m.stock < m.safetyThreshold) {
        const existingPending = state.purchaseRequests.find(
          p => p.materialId === m.id && p.status === 'pending' && p.isAutoGenerated
        );
        if (existingPending) return;
        const suggested = getSuggestedPurchaseQty(m.stock, m.safetyThreshold, m.unit);
        get().createPurchaseRequest(
          m.id,
          suggested.qty,
          suggested.reason,
          true
        );
      }
    });
  },
}));
