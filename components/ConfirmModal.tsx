
import React from 'react';
import { X, FileJson, Check, AlertCircle } from 'lucide-react';
import { SessionState } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingState: SessionState | null;
  theme: 'light' | 'dark';
  isExistingSession: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  pendingState, 
  theme,
  isExistingSession
}) => {
  if (!isOpen || !pendingState) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-md border-2 rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${
        isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl">
                <FileJson className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Project Recovery</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5 opacity-40" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-black leading-tight tracking-tight">
                Resume {pendingState.scenario?.companyName}?
              </h2>
            </div>
            
            <div className={`p-5 rounded-[24px] border transition-colors ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Subject Domain</div>
                <div className="text-blue-500 font-bold text-sm tracking-tight">{pendingState.scenario?.industry} Analysis</div>
              </div>
            </div>
            
            {isExistingSession && (
              <div className={`flex items-start space-x-3 p-4 rounded-2xl ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 leading-relaxed uppercase tracking-wider">
                  Caution: This will overwrite your active workspace.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-2">
            <button 
              onClick={onConfirm}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center space-x-3"
            >
              <Check className="w-4 h-4" />
              <span>Load Mission</span>
            </button>
            <button 
              onClick={onClose}
              className={`w-full h-14 rounded-full font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 border-2 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
