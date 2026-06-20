import { create } from 'zustand';
import type {
  User, UserRole, Material, Supplier, ConsumptionHourly, Inspection,
  Rectification, PurchaseRequest, CraneTask, DailyReport, OperationLog, ActivePanelType
} from '../types';
import {
  mockUsers, mockMaterials, mockSuppliers, generateConsumptionData,
  mockInspections, mockRectifications, mockPurchaseRequests, mockCraneTasks,
  mockDailyReports, mockOperationLogs
} from '../data/mockData';
import { generateId, formatDateTime } from '../utils/helpers';
import { exportMaterialReport, downloadExcel } from '../utils/excelExport';

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

  createPurchaseRequest: (materialId: string, quantity: number, reason: string) => void;
  approvePurchase: (id: string) => void;

  assignCraneTask: (task: Omit<CraneTask, 'id' | 'createdAt'>) => void;
  completeCraneTask: (taskId: string) => void;

  generateDailyReport: () => void;
  exportExcelReport: (date: string) => void;

  addOperationLog: (action: string, details: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  error: null,

  materials: mockMaterials,
  suppliers: mockSuppliers,
  consumptionData: generateConsumptionData(),

  inspections: mockInspections,
  rectifications: mockRectifications,
  purchaseRequests: mockPurchaseRequests,

  craneTasks: mockCraneTasks,

  dailyReports: mockDailyReports,
  operationLogs: mockOperationLogs,

  selectedMaterialId: null,
  activePanel: null,
  showNotification: false,
  notificationMessage: '',

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

  inspectMaterial: (materialId, result, remark) => {
    const user = get().currentUser;
    if (!user || (user.role !== 'inspector' && user.role !== 'manager' && user.role !== 'director')) {
      set({ error: '无权限进行质检操作，仅质检员或管理员可执行' });
      return;
    }

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

    if (result === 'fail') {
      const material = get().materials.find(m => m.id === materialId);
      const rectification: Rectification = {
        id: generateId('r'),
        materialId,
        description: `物料批次${material?.batch || ''}检测不合格：${remark}。需立即整改并完成三级审批。`,
        status: 'pending_worker',
        approvals: [{ role: 'inspector', userId: user.id, time: formatDateTime(), comment: remark }],
        createdAt: formatDateTime(),
      };
      set(state => ({ rectifications: [...state.rectifications, rectification] }));
      get().setNotification(true, '检测不合格，已自动生成整改通知单');
    } else {
      get().setNotification(true, '质检通过，物料状态已更新为合格');
    }
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
  },

  createPurchaseRequest: (materialId, quantity, reason) => {
    const user = get().currentUser;
    if (!user) return;

    const pr: PurchaseRequest = {
      id: generateId('p'),
      materialId,
      quantity,
      reason,
      status: 'pending',
      requesterId: user.id,
      approvals: user.role === 'inspector' ? [{ role: 'inspector', userId: user.id, time: formatDateTime() }] : [],
      createdAt: formatDateTime(),
    };

    set(state => ({ purchaseRequests: [...state.purchaseRequests, pr] }));
    get().addOperationLog('采购申请', `创建采购申请${pr.id}：物料${materialId}，数量${quantity}`);
    get().setNotification(true, '采购申请已创建并提交审批');
  },

  approvePurchase: (id) => {
    const user = get().currentUser;
    if (!user) return;
    set(state => ({
      purchaseRequests: state.purchaseRequests.map(p =>
        p.id === id ? {
          ...p,
          status: 'approved',
          approvals: [...p.approvals, { role: user.role, userId: user.id, time: formatDateTime() }],
        } : p
      ),
    }));
    get().addOperationLog('采购审批', `审批采购申请${id}通过`);
    get().setNotification(true, '采购申请已批准');
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
    set(state => ({
      craneTasks: state.craneTasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      ),
    }));
    get().addOperationLog('塔吊任务', `完成塔吊任务${taskId}`);
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
  },

  exportExcelReport: (date) => {
    const state = get();
    const blob = exportMaterialReport({
      date,
      materials: state.materials,
      suppliers: state.suppliers,
      inspections: state.inspections,
      dailyReports: state.dailyReports,
    });
    downloadExcel(blob, `物料收发存报表_${date}.xlsx`);
    get().addOperationLog('报表导出', `导出${date}物料收发存报表`);
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
  },
}));
