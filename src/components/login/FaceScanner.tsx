import React, { useState, useEffect } from 'react';
import { Scan, CheckCircle, XCircle } from 'lucide-react';
import type { UserRole } from '../../types';
import { getRoleLabel } from '../../utils/helpers';

interface FaceScannerProps {
  role: UserRole;
  onScanComplete: () => void;
  onError: () => void;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({ role, onScanComplete, onError }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [status, setStatus] = useState<'scanning' | 'success' | 'error'>('scanning');

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStatus('success');
        setTimeout(onScanComplete, 800);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [onScanComplete, onError]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-48">
        <div className={`absolute inset-0 rounded-full border-4 ${
          status === 'success' ? 'border-neon-green' : status === 'error' ? 'border-neon-red' : 'border-neon-blue'
        }`} style={{ boxShadow: status === 'success' ? '0 0 30px rgba(0, 196, 140, 0.6)' : status === 'error' ? '0 0 30px rgba(255, 71, 87, 0.6)' : '0 0 30px rgba(0, 179, 255, 0.6)' }}></div>
        
        <div className="absolute inset-2 rounded-full overflow-hidden bg-industrial-900">
          {status === 'scanning' && (
            <div className="absolute inset-0 scan-line" style={{ height: '50%' }}></div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            {status === 'scanning' && (
              <div className="text-center">
                <Scan className="w-16 h-16 text-neon-blue mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 179, 255, 0.8))' }} />
                <div className="text-xs text-neon-blue font-mono">正在识别...</div>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-neon-green mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 196, 140, 0.8))' }} />
                <div className="text-xs text-neon-green font-mono">识别成功</div>
              </div>
            )}
            {status === 'error' && (
              <div className="text-center">
                <XCircle className="w-16 h-16 text-neon-red mx-auto mb-2" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 71, 87, 0.8))' }} />
                <div className="text-xs text-neon-red font-mono">识别失败</div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-1/4 left-0 w-4 h-0.5 bg-neon-green"></div>
        <div className="absolute top-1/4 right-0 w-4 h-0.5 bg-neon-green"></div>
        <div className="absolute bottom-1/4 left-0 w-4 h-0.5 bg-neon-green"></div>
        <div className="absolute bottom-1/4 right-0 w-4 h-0.5 bg-neon-green"></div>
        <div className="absolute left-1/4 top-0 w-0.5 h-4 bg-neon-green"></div>
        <div className="absolute left-1/4 bottom-0 w-0.5 h-4 bg-neon-green"></div>
        <div className="absolute right-1/4 top-0 w-0.5 h-4 bg-neon-green"></div>
        <div className="absolute right-1/4 bottom-0 w-0.5 h-4 bg-neon-green"></div>
      </div>

      <div className="w-full">
        <div className="flex justify-between text-xs font-mono mb-1">
          <span className="text-white/60">身份: {getRoleLabel(role)}</span>
          <span className={status === 'success' ? 'text-neon-green' : 'text-neon-blue'}>{scanProgress}%</span>
        </div>
        <div className="w-full h-1.5 bg-industrial-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${status === 'success' ? 'bg-neon-green' : 'bg-neon-blue'}`}
            style={{ width: `${scanProgress}%`, boxShadow: status === 'success' ? '0 0 10px rgba(0, 196, 140, 0.8)' : '0 0 10px rgba(0, 179, 255, 0.8)' }}
          ></div>
        </div>
      </div>
    </div>
  );
};
