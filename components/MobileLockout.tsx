
import React from 'react';
import { Monitor, Cpu, Terminal, Laptop } from 'lucide-react';
import Logo from './Logo';

const MobileLockout: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 lg:hidden font-['Plus_Jakarta_Sans'] transition-colors duration-500 ${
      isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Grid Pattern */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-5' : 'opacity-10'}`} 
           style={{ backgroundImage: `radial-gradient(${isDark ? '#334155' : '#94a3b8'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      
      <div className="relative z-10 max-w-[280px] w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Branding - Unified Header */}
        <div className="flex flex-col items-center space-y-3">
          <Logo size="sm" theme={theme} />
          <h1 className="text-sm font-black uppercase tracking-[0.4em] opacity-80">DataForge</h1>
        </div>

        {/* The Information Card - More Compact */}
        <div className={`border rounded-[32px] p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden transition-all duration-500 ${
          isDark 
            ? 'bg-slate-900/40 border-slate-800' 
            : 'bg-white/80 border-slate-200'
        }`}>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40" />
          
          <div className="relative mb-4 flex items-center justify-center">
             <div className="relative flex items-center scale-75">
                <Monitor className={`w-14 h-14 ${isDark ? 'text-blue-500' : 'text-blue-600'} drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]`} />
                <div className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 ${
                  isDark ? 'bg-blue-600 border-slate-900' : 'bg-blue-600 border-white'
                }`}>
                  <Terminal className="w-3 h-3 text-white" />
                </div>
             </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black tracking-tight leading-tight uppercase">
              Desktop <span className="text-blue-500">Only</span>
            </h2>
            <div className={`h-px w-8 mx-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <p className={`text-[12px] font-semibold leading-relaxed px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              DataForge requires a desktop display to render complex analytical environments.
            </p>
          </div>

          {/* Clean Status Indicator */}
          <div className={`mt-6 pt-5 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-100'}`}>
            <div className={`flex items-center justify-center space-x-2 text-[9px] font-black uppercase tracking-widest ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Laptop className="w-3 h-3 text-blue-500" />
              <span>Desktop View Required</span>
            </div>
          </div>
        </div>

        {/* Footer info - Minimalist */}
        <div className={`flex items-center justify-center space-x-2 text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${
          isDark ? 'text-slate-700' : 'text-slate-400'
        }`}>
          <Cpu className="w-2.5 h-2.5" />
          <span>WASM Engine Active</span>
        </div>
      </div>
    </div>
  );
};

export default MobileLockout;
