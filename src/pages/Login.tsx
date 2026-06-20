import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, AlertTriangle } from 'lucide-react';
import { RoleSelector } from '../components/login/RoleSelector';
import { FaceScanner } from '../components/login/FaceScanner';
import { useAppStore } from '../store/useAppStore';
import type { UserRole } from '../types';

const Login: React.FC = () => {
  const [step, setStep] = useState<'select' | 'scanning'>('select');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const login = useAppStore(s => s.login);
  const error = useAppStore(s => s.error);
  const setError = useAppStore(s => s.setError);
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setStep('scanning');
    setError(null);
  };

  const handleScanComplete = () => {
    if (selectedRole) {
      login(selectedRole);
      setTimeout(() => navigate('/dashboard'), 600);
    }
  };

  const handleScanError = () => {
    setError('人脸识别失败，请重试');
    setTimeout(() => setStep('select'), 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center grid-bg relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-neon-blue/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-neon-blue/5 rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Construction className="w-12 h-12 text-neon-orange" style={{ filter: 'drop-shadow(0 0 15px rgba(255, 107, 53, 0.6))' }} />
            <h1 className="text-3xl font-bold font-orbitron tracking-wider text-white" style={{ textShadow: '0 0 20px rgba(0, 179, 255, 0.5)' }}>
              智慧工地
            </h1>
          </div>
          <h2 className="text-lg text-neon-blue font-mono tracking-wide mb-1">
            3D物料调度与质量追溯可视化平台
          </h2>
          <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent mb-2"></div>
          <p className="text-xs text-white/40 font-mono">
            SMART CONSTRUCTION MATERIAL MANAGEMENT SYSTEM
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-red/10 border border-neon-red/30 glow-border-red">
            <AlertTriangle className="w-4 h-4 text-neon-red" />
            <span className="text-sm text-neon-red">{error}</span>
          </div>
        )}

        <div className="glass-panel rounded-2xl p-8 glow-border-blue">
          {step === 'select' && (
            <>
              <div className="text-center mb-6">
                <div className="text-white text-lg font-semibold mb-1">请选择登录身份</div>
                <div className="text-white/40 text-xs font-mono">SELECT ROLE TO CONTINUE</div>
              </div>
              <RoleSelector onSelect={handleSelectRole} />
            </>
          )}
          {step === 'scanning' && selectedRole && (
            <>
              <div className="text-center mb-6">
                <div className="text-white text-lg font-semibold mb-1">正在进行人脸识别</div>
                <div className="text-white/40 text-xs font-mono">FACE RECOGNITION IN PROGRESS</div>
              </div>
              <FaceScanner
                role={selectedRole}
                onScanComplete={handleScanComplete}
                onError={handleScanError}
              />
              <button
                onClick={() => setStep('select')}
                className="mt-6 w-full py-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                ← 返回重新选择身份
              </button>
            </>
          )}
        </div>

        <div className="text-center text-white/20 text-xs font-mono">
          <div>© 2026 智慧建造科技有限公司</div>
          <div className="mt-1">SYSTEM VERSION 2.6.0 | SECURE CONNECTION</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
