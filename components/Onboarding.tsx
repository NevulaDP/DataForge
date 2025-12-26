
import React, { useState, useRef, useEffect } from 'react';
import { Industry, SessionState } from '../types';
import Logo from './Logo';
import { 
  ShoppingCart, 
  Cpu, 
  HeartPulse, 
  Wallet, 
  Truck, 
  Cloud, 
  Search, 
  ArrowRight, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Upload, 
  BarChart3,
  Activity,
  Sparkles,
  Layers
} from 'lucide-react';

interface Props {
  onSelect: (industry: Industry) => void;
  onImport: (state: SessionState) => void;
  loading: boolean;
  loadingMessage: string;
  error?: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const industryPresets: { name: Industry; icon: any }[] = [
  { name: 'Retail', icon: ShoppingCart },
  { name: 'Tech', icon: Cpu },
  { name: 'Healthcare', icon: HeartPulse },
  { name: 'Fintech', icon: Wallet },
  { name: 'Logistics', icon: Truck },
  { name: 'SaaS', icon: Cloud },
];

const ANALYST_WISDOM = [
  "Look for the signal within the noise.",
  "Data integrity is the foundation of discovery.",
  "Every distribution hides a business narrative.",
  "Clarity begins with clean, structured raw data.",
  "Transform raw rows into strategic foresight."
];

const FullscreenLoading: React.FC<{ theme: 'light' | 'dark'; message: string }> = ({ theme, message }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [phase, setPhase] = useState("Initializing");
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ANALYST_WISDOM.length);
    }, 4500);

    const phases = ["Calibrating", "Validating", "Optimizing", "Mapping", "Ready"];
    const phaseInterval = setInterval(() => {
      setPhase(p => {
        const idx = phases.indexOf(p);
        return phases[(idx + 1) % phases.length];
      });
      setPercent(prev => Math.min(100, prev + Math.floor(Math.random() * 15)));
    }, 1200);

    return () => {
      clearInterval(tipInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-['Plus_Jakarta_Sans'] transition-all duration-1000 ${
      theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[160px] transition-colors duration-1000 ${
          theme === 'dark' ? 'bg-blue-600/10 animate-[pulse_12s_infinite]' : 'bg-blue-400/20 animate-[pulse_10s_infinite]'
        }`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[160px] transition-colors duration-1000 ${
          theme === 'dark' ? 'bg-indigo-600/10 animate-[pulse_15s_infinite_reverse]' : 'bg-indigo-300/30 animate-[pulse_12s_infinite_reverse]'
        }`} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6 text-center">
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 md:mb-12 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-20 ${theme === 'dark' ? 'border-blue-500' : 'border-blue-400'}`} />
          <div className={`absolute inset-4 rounded-full border-2 border-dashed animate-[spin_20s_linear_infinite] opacity-10 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`} />
          
          <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[32px] flex items-center justify-center shadow-2xl transition-all duration-700 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 text-blue-400 border border-white/5' 
              : 'bg-white text-blue-600 border border-blue-100 shadow-blue-500/5'
          }`}>
            <Layers className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 w-full">
          <div className="space-y-1">
            <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.6em] transition-colors ${
              theme === 'dark' ? 'text-blue-500/40' : 'text-blue-600/40'
            }`}>
              {phase}_Protocol
            </div>
            <h2 className={`text-3xl md:text-5xl font-black tracking-tighter uppercase transition-colors duration-700 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {message}
            </h2>
          </div>

          <div className="max-w-xs mx-auto pt-2 md:pt-4">
            <div className={`w-full h-1 rounded-full overflow-hidden relative ${
              theme === 'dark' ? 'bg-slate-900' : 'bg-slate-200'
            }`}>
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 transition-all duration-700 ease-out" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className={`mt-3 flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${
              theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span>Active Processing</span>
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{percent}%</span>
            </div>
          </div>

          <div className={`pt-8 md:pt-12 flex items-center justify-center space-x-3 text-xs md:text-sm font-semibold transition-opacity duration-700 ${
            theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
          }`}>
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-sky-500/40" />
            <span key={tipIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-1000 px-4">
              {ANALYST_WISDOM[tipIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Onboarding: React.FC<Props> = ({ onSelect, onImport, loading, loadingMessage, error, theme, toggleTheme }) => {
  const [customIndustry, setCustomIndustry] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customIndustry.trim()) {
      onSelect(customIndustry.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target?.result as string);
        if (state.scenario && state.blocks) {
          onImport(state);
        } else {
          alert("Invalid mission file format.");
        }
      } catch (err) {
        alert("Failed to read mission file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 md:p-8 transition-colors duration-700 overflow-x-hidden relative font-['Plus_Jakarta_Sans'] ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'
    }`}>
      {loading && <FullscreenLoading theme={theme} message={loadingMessage} />}

      <div className="w-full max-w-6xl flex flex-row justify-between items-center z-50 mb-8 md:mb-0">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Logo size="md" />
          <span className="font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-80 hidden sm:inline">DataForge</span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center space-x-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full border-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-sm ${
              theme === 'dark' ? 'border-slate-800 hover:bg-slate-900 bg-slate-900/50 text-slate-400' : 'border-slate-100 hover:bg-slate-50 bg-white text-slate-600'
            }`}
          >
            <Upload className="w-3 md:w-3.5 h-3 md:h-3.5" />
            <span className="whitespace-nowrap">Resume Progress</span>
          </button>
          
          <button 
            onClick={toggleTheme}
            className={`p-2 md:p-2.5 rounded-full border-2 transition-all hover:scale-110 active:scale-90 shadow-sm ${
              theme === 'dark' ? 'border-slate-800 hover:bg-slate-900 bg-slate-900/50 text-slate-400' : 'border-slate-100 hover:bg-slate-50 bg-white text-slate-600'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 md:w-4 h-3.5 md:h-4" /> : <Moon className="w-3.5 md:w-4 h-3.5 md:h-4" />}
          </button>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".flight,.json"
      />

      <div className="flex-1 flex flex-col justify-center w-full max-w-4xl py-12 md:py-20 z-10">
        <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4 duration-700">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <span className={`text-lg md:text-2xl font-semibold tracking-tight ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Hi Analyst!</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] select-none">
              Find your <span className="bg-gradient-to-r from-blue-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent">data edge.</span>
            </h1>
            
            <p className={`text-base md:text-xl font-medium max-w-xl leading-relaxed mt-4 opacity-60 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              High-stakes training simulation. Choose a sector to begin analysis.
            </p>
          </div>

          {error && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <div className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-2 flex items-center space-x-4 md:space-x-6 px-6 md:px-10 ${
                theme === 'dark' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-600'
              }`}>
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                <p className="font-bold text-xs md:text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-8 md:space-y-12">
            <form onSubmit={handleSubmitCustom} className="group relative w-full">
              <div className={`relative flex items-center p-1.5 md:p-2 rounded-full border-2 transition-all shadow-2xl ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 focus-within:border-blue-600' : 'bg-slate-50 border-slate-200 focus-within:border-blue-600 shadow-blue-500/5'
              }`}>
                <div className="ml-4 md:ml-8 text-slate-400">
                  <Search className="w-4 md:w-5 h-4 md:h-5" />
                </div>
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="What mission are we starting?"
                  className="flex-1 bg-transparent border-none focus:ring-0 px-3 md:px-6 py-4 md:py-5 text-sm md:text-xl font-bold placeholder:text-slate-500/20"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white p-4 md:p-5 rounded-full transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  <ArrowRight className="w-5 md:w-6 h-5 md:w-6" />
                </button>
              </div>
            </form>

            <div className="space-y-6 md:space-y-8 flex flex-col items-center">
              <div className="flex items-center w-full space-x-4 md:space-x-6">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 opacity-30" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] opacity-30 whitespace-nowrap">Analytical Sectors</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 opacity-30" />
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                {industryPresets.map((ind) => (
                  <button
                    key={ind.name}
                    onClick={() => onSelect(ind.name)}
                    className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-8 py-2 md:py-3.5 rounded-full border-2 transition-all hover:scale-105 active:scale-95 group/pill ${
                      theme === 'dark' 
                        ? 'bg-slate-900/40 border-slate-800 hover:border-blue-600 hover:bg-slate-900 text-slate-400 hover:text-white' 
                        : 'bg-white border-slate-100 hover:border-blue-600 shadow-sm text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ind.icon className="w-3.5 md:w-4 h-3.5 md:h-4 opacity-50 group-hover/pill:opacity-100" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.1em] md:tracking-[0.15em]">{ind.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mt-auto py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Simulator_Active</span>
        </div>
        <div className="text-[8px] md:text-[10px] font-black tracking-widest uppercase">System_Protocol // L_NODE_STABLE</div>
      </div>
    </div>
  );
};

export default Onboarding;
