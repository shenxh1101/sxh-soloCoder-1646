import React from 'react';
import { AlertOctagon, X, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlowCard } from '@/components/common/GlowCard';

export const ErrorModal: React.FC = () => {
  const error = useAppStore(s => s.error);
  const setError = useAppStore(s => s.setError);

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GlowCard
        color="red"
        className="w-[380px] p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-5 py-4 border-b border-neon-red/20 bg-neon-red/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-neon-red/20 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-neon-red" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neon-red">操作错误</h3>
              <p className="text-[10px] text-neon-red/60">SYSTEM ERROR</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="min-h-[60px] flex items-center">
            <p className="text-sm text-white leading-relaxed">{error}</p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/5 bg-white/5 flex justify-end gap-2">
          <button
            onClick={() => setError(null)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-neon-red/20 border border-neon-red/50 text-neon-red text-xs font-medium hover:bg-neon-red/30 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            确认
          </button>
        </div>
      </GlowCard>
    </div>
  );
};
