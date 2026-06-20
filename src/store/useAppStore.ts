import { create } from 'zustand';
import type {
  User, UserRole, Material, MaterialBatch, Supplier, ConsumptionHourly, Inspection,
  Rectification, PurchaseRequest, CraneTask, DailyReport, OperationLog, ActivePanelType, InventoryTransaction
} from '../types';
import {
  mockUsers, mockMaterials, mockSuppliers, generateConsumptionData,
  mockInspections, mockRectifications, mockPurchaseRequests, mockCraneTasks,
  mockDailyReports, mockOperationLogs, mockInventoryTransactions
} from '../data/mockData';
import { generateId, formatDateTime, getSuggestedPurchaseQty, recommendSuppliers, generateBatchNo } from '../utils/helpers';
import { exportMaterialReport, downloadExcel } from '../utils/excelExport';

const STORAGE_KEY_V4 = 'construction_material_platform_v4';
const STORAGE_KEY_V3 = 'construction_material_platform_v3';
const STORAGE_KEY_V2 = 'construction_material_platform_v2';
const STORAGE_KEY_V1 = 'construction_material_platform_v1';

interface PersistData {
  materials: Material[];
  inspections: Inspection[];
  rectifications: Rectification[];
  purchaseRequests: PurchaseRequest[];
  dailyReports: DailyReport[];
  operationLogs: OperationLog[];
  inventoryTransactions: InventoryTransaction[];
}

function migratePurchaseStatus(status: string): PurchaseRequest['status'] {
  if (status === 'approved') return 'delivered';
  if (status === 'pending' || status === 'delivering' || status === 'delivered' || status === 'rejected') return status;
  return 'pending';
}

function ensureMaterialDefaults(m: any): Material {
  const lockedStock = m.lockedStock ?? 0;
  if (m.batches && m.batches.length > 0) {
    return { ...m, lockedStock, batches: m.batches.map((b: any) => ({ ...b, lockedQuantity: b.lockedQuantity ?? 0 })) };
  }
  const batch: MaterialBatch = {
    id: generateId('b'),
    batchNo: m.batch || '',
    arrivalDate: m.arrivalDate || '',
    quantity: m.stock || 0,
    lockedQuantity: lockedStock,
    qualityStatus: m.qualityStatus || 'green',
    supplierId: m.supplierId || '',
    inspectionStatus: 'inspected',
  };
  return { ...m, lockedStock, batches: [batch] };
}

function ensureTransactionDefaults(tx: any): InventoryTransaction {
  return { ...tx, batchId: tx.batchId || '' };
}

function ensurePurchaseDefaults(pr: any): PurchaseRequest {
  return {
    ...pr,
    status: migratePurchaseStatus(pr.status),
    supplierAlternatives: pr.supplierAlternatives || [],
    actualQuantity: pr.actualQuantity,
    deliveryDate: pr.deliveryDate,
    deliveryInspectionResult: pr.deliveryInspectionResult,
    confirmedSupplierId: pr.confirmedSupplierId,
  };
}

function ensureInspectionDefaults(i: any): Inspection {
  return { ...i, batchId: i.batchId || '' };
}

function ensureRectificationDefaults(r: any): Rectification {
  return { ...r, batchId: r.batchId || '' };
}

function loadFromStorage(): Partial<PersistData> {
  try {
    let raw = localStorage.getItem(STORAGE_KEY_V4);
    if (!raw) raw = localStorage.getItem(STORAGE_KEY_V3);
    if (!raw) raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (parsed.materials) parsed.materials = parsed.materials.map(ensureMaterialDefaults);
    if (parsed.inventoryTransactions) parsed.inventoryTransactions = parsed.inventoryTransactions.map(ensureTransactionDefaults);
    if (parsed.purchaseRequests) parsed.purchaseRequests = parsed.purchaseRequests.map(ensurePurchaseDefaults);
    if (parsed.inspections) parsed.inspections = parsed.inspections.map(ensureInspectionDefaults);
    if (parsed.rectifications) parsed.rectifications = parsed.rectifications.map(ensureRectificationDefaults);
    return parsed as PersistData;
  } catch (e) {
    console.warn('Failed to load persisted data:', e);
    return {};
  }
}

function saveToStorage(data: PersistData) {
  try {
    localStorage.setItem(STORAGE_KEY_V4, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to persist data:', e);
  }
}

const persisted = loadFromStorage();

function recalcMaterialStock(m: Material): Material {
  const totalQty = m.batches.reduce((s, b) => s + b.quantity, 0);
  const totalLocked = m.batches.reduce((s, b) => s + b.lockedQuantity, 0);
  const hasRed = m.batches.some(b => b.qualityStatus === 'red');
  const hasYellow = m.batches.some(b => b.qualityStatus === 'yellow');
  const qualityStatus: Material['qualityStatus'] = hasRed ? 'red' : hasYellow ? 'yellow' : 'green';
  const isLocked = totalLocked > 0 || hasRed;
  return { ...m, stock: totalQty, lockedStock: totalLocked, qualityStatus, isLocked };
}

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

  inspectBatch: (materialId: string, batchId: string, result: 'pass' | 'fail', remark: string) => void;
  approveRectification: (id: string, role: UserRole, comment: string) => void;
  rejectRectification: (id: string, role: UserRole, comment: string) => void;

  createPurchaseRequest: (materialId: string, quantity: number, reason: string, auto?: boolean) => void;
  approvePurchase: (id: string, selectedSupplierId?: string) => void;
  confirmDelivery: (id: string, actualQuantity: number, deliveryDate: string, inspectionResult: 'pass' | 'fail' | 'pending', batchNo?: string) => void;

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

  inspectBatch: (materialId, batchId, result, remark) => {
    const user = get().currentUser;
    if (!user || (user.role !== 'inspector' && user.role !== 'manager' && user.role !== 'director')) {
      set({ error: '无权限进行质检操作，仅质检员或管理员可执行' });
      return;
    }

    const material = get().materials.find(m => m.id === materialId);
    const batch = material?.batches.find(b => b.id === batchId);
    if (!material || !batch) return;

    const inspection: Inspection = {
      id: generateId('i'),
      materialId,
      batchId,
      inspectorId: user.id,
      result,
      remark,
      timestamp: formatDateTime(),
    };

    const qualityStatus: Material['qualityStatus'] = result === 'pass' ? 'green' : 'red';
    const lockQty = result === 'fail' ? Math.ceil(batch.quantity * 0.5) : 0;

    set(state => ({
      inspections: [...state.inspections, inspection],
      materials: state.materials.map(m => {
        if (m.id !== materialId) return m;
        const updatedBatches = m.batches.map(b =>
          b.id === batchId
            ? { ...b, qualityStatus, lockedQuantity: result === 'fail' ? b.lockedQuantity + lockQty : Math.max(0, b.lockedQuantity - lockQty), inspectionStatus: 'inspected' as const }
            : b
        );
        return recalcMaterialStock({ ...m, batches: updatedBatches });
      }),
    }));

    get().addOperationLog('质检操作', `对物料${materialId}批次${batch.batchNo}进行质检，结果：${result === 'pass' ? '合格' : '不合格'}`);

    if (result === 'fail') {
      get().addInventoryTransaction({
        materialId,
        materialName: material.name,
        batchId: batch.batchNo,
        type: 'stock_out',
        quantity: lockQty,
        unit: material.unit,
        reason: `质检不合格扣减（${remark}）`,
        relatedId: inspection.id,
        operatorId: user.id,
        operatorName: user.name,
        timestamp: formatDateTime(),
      });

      const rectification: Rectification = {
        id: generateId('r'),
        materialId,
        batchId,
        description: `物料批次${batch.batchNo}检测不合格：${remark}。需立即整改并完成三级审批。`,
        status: 'pending_worker',
        approvals: [{ role: 'inspector', userId: user.id, time: formatDateTime(), comment: remark }],
        createdAt: formatDateTime(),
      };
      set(state => ({ rectifications: [...state.rectifications, rectification] }));
      get().setNotification(true, '检测不合格，已自动生成整改通知单并锁定批次库存');
    } else {
      get().setNotification(true, '质检通过，批次状态已更新为合格');
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
      p => p.materialId === materialId && (p.status === 'pending' || p.status === 'delivering') && p.isAutoGenerated
    );
    if (auto && existingAuto) return;

    const material = get().materials.find(m => m.id === materialId);
    const suppliers = get().suppliers;
    const inspections = get().inspections;
    const materials = get().materials;

    const inspectionFails = inspections.map(i => {
      const mat = materials.find(m => m.id === i.materialId);
      return { materialId: i.materialId, supplierId: mat?.supplierId || '', result: i.result };
    });

    const alternatives = recommendSuppliers(material?.supplierId || '', suppliers, inspectionFails);
    const best = alternatives[0];

    const recReason = best
      ? [`${best.supplierName}交期${best.leadTime}天`, `评分${best.rating}`, `单价${best.unitPrice}${best.priceUnit}`, best.failCount > 0 ? `历史不合格${best.failCount}次` : null, `综合评分${best.score}`].filter(Boolean).join('、')
      : undefined;

    const pr: PurchaseRequest = {
      id: generateId('p'),
      materialId,
      quantity,
      reason,
      status: 'pending',
      requesterId: user.id,
      approvals: user.role === 'inspector' ? [{ role: 'inspector', userId: user.id, time: formatDateTime() }] : [],
      createdAt: formatDateTime(),
      recommendedSupplierId: best?.supplierId,
      recommendedSupplierReason: recReason,
      estimatedArrival: best?.estimatedArrival,
      isAutoGenerated: auto,
      supplierAlternatives: alternatives,
    };

    set(state => ({ purchaseRequests: [...state.purchaseRequests, pr] }));
    get().addOperationLog(auto ? '自动采购申请' : '采购申请', `${auto ? '系统自动创建' : '创建'}采购申请${pr.id}：物料${materialId}，数量${quantity}${best ? `，推荐${best.supplierName}` : ''}`);
    get().setNotification(true, auto ? '库存预警，已自动生成采购申请' : '采购申请已创建并提交审批');
    get()._persist();
  },

  approvePurchase: (id, selectedSupplierId) => {
    const user = get().currentUser;
    if (!user) return;

    const pr = get().purchaseRequests.find(p => p.id === id);
    if (!pr) return;

    const confirmedSupplierId = selectedSupplierId || pr.recommendedSupplierId;
    let estimatedArrival = pr.estimatedArrival;
    if (selectedSupplierId && selectedSupplierId !== pr.recommendedSupplierId) {
      const supplier = get().suppliers.find(s => s.id === selectedSupplierId);
      if (supplier) {
        const today = new Date();
        const arrival = new Date(today);
        arrival.setDate(today.getDate() + supplier.leadTime);
        const pad = (n: number) => n.toString().padStart(2, '0');
        estimatedArrival = `${arrival.getFullYear()}-${pad(arrival.getMonth() + 1)}-${pad(arrival.getDate())}`;
      }
    }

    set(state => ({
      purchaseRequests: state.purchaseRequests.map(p =>
        p.id === id ? {
          ...p,
          status: 'delivering' as const,
          approvals: [...p.approvals, { role: user.role, userId: user.id, time: formatDateTime() }],
          confirmedSupplierId,
          estimatedArrival,
        } : p
      ),
    }));

    get().addOperationLog('采购审批', `审批采购申请${id}通过，进入待到货状态${confirmedSupplierId && confirmedSupplierId !== pr.recommendedSupplierId ? `，改选供应商${confirmedSupplierId}` : ''}`);
    get().setNotification(true, '采购申请已批准，等待到货确认');
    get()._persist();
  },

  confirmDelivery: (id, actualQuantity, deliveryDate, inspectionResult, batchNo) => {
    const user = get().currentUser;
    if (!user) return;

    const pr = get().purchaseRequests.find(p => p.id === id);
    if (!pr || pr.status !== 'delivering') return;

    const material = get().materials.find(m => m.id === pr.materialId);
    if (!material) return;

    const supplierId = pr.confirmedSupplierId || pr.recommendedSupplierId || material.supplierId;
    const finalBatchNo = batchNo || generateBatchNo(material.category);
    const qualityStatus: Material['qualityStatus'] = inspectionResult === 'pass' ? 'green' : inspectionResult === 'fail' ? 'red' : 'yellow';
    const lockQty = inspectionResult === 'fail' ? Math.ceil(actualQuantity * 0.5) : 0;

    const newBatch: MaterialBatch = {
      id: generateId('b'),
      batchNo: finalBatchNo,
      arrivalDate: deliveryDate,
      quantity: actualQuantity,
      lockedQuantity: lockQty,
      qualityStatus,
      supplierId,
      inspectionStatus: inspectionResult === 'pending' ? 'pending' : 'inspected',
      purchaseRequestId: pr.id,
    };

    set(state => ({
      purchaseRequests: state.purchaseRequests.map(p =>
        p.id === id ? {
          ...p,
          status: 'delivered' as const,
          actualQuantity,
          deliveryDate,
          deliveryInspectionResult: inspectionResult,
        } : p
      ),
      materials: state.materials.map(m => {
        if (m.id !== pr.materialId) return m;
        const updatedBatches = [...m.batches, newBatch];
        return recalcMaterialStock({ ...m, batches: updatedBatches });
      }),
    }));

    get().addInventoryTransaction({
      materialId: pr.materialId,
      materialName: material.name,
      batchId: finalBatchNo,
      type: 'stock_in',
      quantity: actualQuantity,
      unit: material.unit,
      reason: `到货入库（申请${pr.id}，实收${actualQuantity}${material.unit}，验收${inspectionResult === 'pass' ? '合格' : inspectionResult === 'fail' ? '不合格' : '待检'}）`,
      relatedId: pr.id,
      operatorId: user.id,
      operatorName: user.name,
      timestamp: formatDateTime(),
    });

    get().addOperationLog('到货确认', `确认采购申请${id}到货，批次${finalBatchNo}，实收${actualQuantity}${material.unit}，验收${inspectionResult === 'pass' ? '合格' : inspectionResult === 'fail' ? '不合格' : '待检'}`);
    get().setNotification(true, `到货确认完成，批次${finalBatchNo}共${actualQuantity}${material.unit}已入库`);
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
    if (!task || !material) return;

    const availableBatches = material.batches
      .filter(b => b.quantity - b.lockedQuantity > 0)
      .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime());

    let remainingConsume = Math.min(
      availableBatches.reduce((s, b) => s + (b.quantity - b.lockedQuantity), 0),
      Math.ceil(Math.random() * 5) + 1
    );

    if (remainingConsume <= 0) {
      set(state => ({
        craneTasks: state.craneTasks.map(t =>
          t.id === taskId ? { ...t, status: 'completed' } : t
        ),
      }));
      get().addOperationLog('塔吊任务', `完成塔吊任务${taskId}，无可用库存`);
      get()._persist();
      return;
    }

    let consumed = 0;
    const updatedBatches = [...material.batches];

    for (const batch of availableBatches) {
      if (remainingConsume <= 0) break;
      const batchAvailable = batch.quantity - batch.lockedQuantity;
      const take = Math.min(remainingConsume, batchAvailable);
      const idx = updatedBatches.findIndex(b => b.id === batch.id);
      if (idx >= 0) {
        updatedBatches[idx] = { ...updatedBatches[idx], quantity: updatedBatches[idx].quantity - take };
      }
      remainingConsume -= take;
      consumed += take;
    }

    set(state => ({
      craneTasks: state.craneTasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      ),
      materials: state.materials.map(m =>
        m.id === task.materialId ? recalcMaterialStock({ ...m, batches: updatedBatches }) : m
      ),
    }));

    if (consumed > 0 && user) {
      const consumeBatch = availableBatches[0];
      get().addInventoryTransaction({
        materialId: task.materialId,
        materialName: task.materialName,
        batchId: consumeBatch?.batchNo || material.batch,
        type: 'stock_out',
        quantity: consumed,
        unit: material.unit,
        reason: `吊运消耗至${task.toZone}`,
        relatedId: taskId,
        operatorId: user.id,
        operatorName: user.name,
        timestamp: formatDateTime(),
      });
    }

    get().addOperationLog('塔吊任务', `完成塔吊任务${taskId}${consumed > 0 ? `，消耗${consumed}${material.unit}` : ''}`);
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
      const availableStock = m.stock - m.lockedStock;
      if (availableStock < m.safetyThreshold) {
        const existingPending = state.purchaseRequests.find(
          p => p.materialId === m.id && (p.status === 'pending' || p.status === 'delivering') && p.isAutoGenerated
        );
        if (existingPending) return;
        const suggested = getSuggestedPurchaseQty(availableStock, m.safetyThreshold, m.unit);
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
