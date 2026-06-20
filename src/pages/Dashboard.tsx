import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Scene3d from '../components/scene3d/Scene3d';
import {
  TopBar,
  SideNav,
  StatusBar,
  MaterialDetail,
  InspectionPanel,
  RectificationPanel,
  CranePanel,
  PurchasePanel,
  ReportPanel,
  NotificationPanel,
  ErrorModal,
} from '../components/panels';
import type { ActivePanelType } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAppStore(s => s.isLoggedIn);
  const currentUser = useAppStore(s => s.currentUser);
  const activePanel = useAppStore(s => s.activePanel);
  const setActivePanel = useAppStore(s => s.setActivePanel);
  const selectedMaterialId = useAppStore(s => s.selectedMaterialId);
  const error = useAppStore(s => s.error);
  const setError = useAppStore(s => s.setError);
  const showNotification = useAppStore(s => s.showNotification);
  const setNotification = useAppStore(s => s.setNotification);
  const generateDailyReport = useAppStore(s => s.generateDailyReport);
  const checkAndGenerateAutoPurchase = useAppStore(s => s.checkAndGenerateAutoPurchase);

  const [notifCountdown, setNotifCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const timer = setTimeout(() => checkAndGenerateAutoPurchase(), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, currentUser, checkAndGenerateAutoPurchase]);

  useEffect(() => {
    const reportInterval = setInterval(() => {
      generateDailyReport();
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(reportInterval);
  }, [generateDailyReport]);

  useEffect(() => {
    if (showNotification) {
      setNotifCountdown(4);
      const timer = setInterval(() => {
        setNotifCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setNotification(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showNotification, setNotification]);

  if (!isLoggedIn || !currentUser) return null;

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'materials':
        return <MaterialDetail />;
      case 'inspection':
        return <InspectionPanel />;
      case 'rectification':
        return <RectificationPanel />;
      case 'crane':
        return <CranePanel />;
      case 'purchase':
        return <PurchasePanel />;
      case 'reports':
        return <ReportPanel />;
      default:
        return selectedMaterialId ? <MaterialDetail /> : null;
    }
  };

  const shouldShowRightPanel = activePanel !== null || selectedMaterialId !== null;

  return (
    <div className="w-full h-full flex flex-col bg-industrial-900 overflow-hidden">
      <TopBar />

      <div className="flex-1 flex relative overflow-hidden">
        <SideNav />

        <div className="flex-1 relative">
          <Scene3d />

          {shouldShowRightPanel && (
            <div className="absolute top-4 right-4 bottom-16 w-[380px] z-20">
              <div className="h-full overflow-y-auto pr-1">
                {renderPanelContent()}
              </div>
              <button
                onClick={() => {
                  setActivePanel(null);
                  useAppStore.getState().selectMaterial(null);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded bg-industrial-700/80 hover:bg-neon-red/30 text-white/60 hover:text-white flex items-center justify-center text-xs transition-colors z-30"
              >
                ✕
              </button>
            </div>
          )}

          {showNotification && <NotificationPanel />}
        </div>
      </div>

      <StatusBar />

      {error && <ErrorModal />}
    </div>
  );
};

export default Dashboard;
