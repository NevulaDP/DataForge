
import React, { useState, useRef, useEffect } from 'react';
import { Industry, SessionState, Difficulty } from '../types';
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
  Sun, 
  Moon, 
  Upload, 
  Sparkles,
  ChevronDown,
  Terminal,
  Database
} from 'lucide-react';

interface Props {
  onSelect: (industry: Industry, difficulty: Difficulty) => void;
  onImport: (state: SessionState) => void;
  loading: boolean;
  loadingMessage: string;
  progress?: number;
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

const difficulties: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Flat file exploration' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Relational JOINs' },
  { id: 'advanced', label: 'Advanced', desc: 'Star Schema logic' },
];

const ANALYST_TIPS = [
  "Use SQL for heavy-lifting aggregations before bringing data into Python.",
  "Always check for NULL values in primary keys to ensure join integrity.",
  "Exploratory Data Analysis (EDA) is 80% of the work. Don't rush it.",
  "Visualizations should tell a story, not just show numbers.",
  "Standardize your date formats early to avoid time-series errors later.",
  "Correlation does not imply causation—verify with domain context.",
  "Data cleaning is iterative. Keep a log of every transformation."
];

const NeuralCore: React.FC<{ theme: 'light' | 'dark'; progress: number }> = ({ theme, progress }) => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <div className={`absolute inset-0 rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${
      theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
    }`} style={{ transform: `scale(${0.8 + (progress / 500)})` }} />
    
    <svg className="absolute w-full h-full animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100">
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.25" 
        strokeDasharray="4,8" 
        className={theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} 
      />
    </svg>

    <div className={`relative z-20 w-20 h-20 rounded-[24px] flex items-center justify-center transform transition-transform duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_0_40px_rgba(37,99,235,0.4)]' 
        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl'
    }`} style={{ scale: 0.9 + (Math.sin(Date.now() / 1000) * 0.05) }}>
      <Database className="w-10 h-10 text-white animate-pulse" />
      <div className="absolute inset-0 border-2 border-white/10 rounded-[24px]" />
    </div>
  </div>
);

const Onboarding: React.FC<Props> = ({ 
  onSelect, 
  onImport, 
  loading, 
  loadingMessage, 
  progress = 0, 
  error, 
  theme, 
  toggleTheme 
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');
  const [tipIndex, setTipIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % ANALYST_TIPS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDiffOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStart = (industry: Industry) => {
    if (industry.trim()) {
      onSelect(industry.trim(), selectedDifficulty);
    }
  };

  const currentDiffLabel = difficulties.find(d => d.id === selectedDifficulty);

  return (
    <div className={`min-h-screen flex flex-col items-center p-8 transition-colors duration-500 font-['Plus_Jakarta_Sans'] overflow-hidden ${
      theme === 'dark' ? 'bg-[#020617] text-white' : 'bg-white text-slate-950'
    }`}>
      
      {/* PERSISTENT ACTION BAR */}
      <div className="fixed top-8 right-8 z-[110] flex items-center space-x-4">
        {!loading && (
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className={`flex items-center space-x-3 px-6 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              theme === 'dark' 
                ? 'border-slate-800 text-white hover:bg-slate-900' 
                : 'border-slate-200 text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Resume Project</span>
          </button>
        )}
        <button 
          onClick={toggleTheme} 
          className={`p-3 rounded-full border-2 transition-all shadow-lg active:scale-95 ${
            theme === 'dark' 
              ? 'border-slate-800 bg-slate-900 text-white' 
              : 'border-slate-200 bg-white text-slate-950'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {loading && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${
          theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'
        }`}>
          <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-8 text-center">
            <div className="relative mb-16 flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-blue-500/30 rounded-full animate-[ripple_4s_linear_infinite]" />
              <NeuralCore theme={theme} progress={progress} />
            </div>
            <div className="w-full space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <Terminal className="w-4 h-4 text-blue-500 animate-pulse" />
                  <h2 className={`text-3xl font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {loadingMessage}
                  </h2>
                </div>
                <div className="flex justify-between items-end px-1">
                   <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Simulation Initializing</p>
                   <span className="text-blue-500 font-black text-xs tabular-nums">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className={`relative w-full h-2.5 rounded-full border p-[2px] overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className={`mt-20 pt-10 border-t w-full ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-200'}`}>
              <p className={`text-sm font-medium italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>"{ANALYST_TIPS[tipIndex]}"</p>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div className={`w-full max-w-7xl flex items-center z-50 transition-all duration-300 mb-20 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center space-x-4">
          <Logo size="md" theme={theme} />
          <span className="font-black text-[12px] uppercase tracking-[0.4em] opacity-90">DataForge</span>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const state = JSON.parse(event.target?.result as string);
              if (state.scenario && state.blocks) onImport(state);
            } catch (err) { alert("Invalid mission file."); }
          };
          reader.readAsText(file);
          e.target.value = '';
      }} className="hidden" accept=".flight,.json" />

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col items-center justify-center w-full max-w-6xl transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* GREETING & HEADLINE */}
          <div className="space-y-6 px-2">
            <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-medium tracking-tight">Hi analyst!</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1] md:leading-[1.15]">
                Find your <span className="inline-block bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent pb-6 pt-2 -mb-6 -mt-2">data edge.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-3xl">
                The ultimate flight simulator for junior data analysts. Sharpen your intuition, refine your SQL/Python logic, and master the art of data strategy through high-stakes business simulations.
              </p>
            </div>
          </div>

          {error && <div className="p-6 rounded-[32px] bg-rose-500/10 border-2 border-rose-500/20 text-rose-500 font-bold">{error}</div>}

          {/* UNIFIED COMMAND BAR */}
          <div className="space-y-12">
            <div className="relative group w-full">
              {/* Animated Glow Layer */}
              <div className="absolute -inset-[2px] rounded-full blur-xl opacity-40 group-focus-within:opacity-80 transition-opacity duration-500 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move" />
              
              {/* Animated Border Layer */}
              <div className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)]" />

              <div className={`relative flex items-center w-full rounded-full transition-all duration-500 p-3 pr-4 shadow-2xl ${
                theme === 'dark' 
                  ? 'bg-[#0f172a]' 
                  : 'bg-white'
              }`}>
                
                <div className="pl-6 pr-2">
                  <Search className={`w-6 h-6 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500/40 group-focus-within:text-blue-500/40' : 'text-slate-300'}`} />
                </div>

                {/* Input */}
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart(customIndustry)}
                  placeholder="Ask DataForge for a specific sector..."
                  className="flex-1 bg-transparent border-none focus:ring-0 py-5 px-4 text-xl font-medium placeholder:text-slate-500/40"
                />

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  
                  {/* Difficulty Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDiffOpen(!isDiffOpen)}
                      className={`flex items-center space-x-3 px-6 py-3 rounded-full border transition-all ${
                        theme === 'dark' 
                          ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300' 
                          : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{currentDiffLabel?.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDiffOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDiffOpen && (
                      <div className={`absolute top-full right-0 mt-3 w-56 z-[120] rounded-[32px] border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden p-2 ${
                        theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        {difficulties.map(d => (
                          <button
                            key={d.id}
                            onClick={() => { setSelectedDifficulty(d.id); setIsDiffOpen(false); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all ${
                              selectedDifficulty === d.id 
                                ? 'bg-blue-600 text-white' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                            }`}
                          >
                            <div className="text-xs font-black uppercase tracking-widest">{d.label}</div>
                            <div className="text-[10px] opacity-60 font-medium">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Arrow Button */}
                  <button 
                    onClick={() => handleStart(customIndustry || 'Retail')} 
                    className="bg-blue-600 text-white p-5 rounded-full shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ArrowRight className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>

            {/* SECTOR PILLS CLUSTER */}
            <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
              {industryPresets.map((ind) => (
                <button 
                  key={ind.name} 
                  onClick={() => handleStart(ind.name)} 
                  className={`flex items-center space-x-4 px-10 py-5 rounded-full border-2 transition-all hover:scale-105 active:scale-95 group ${
                    theme === 'dark' 
                      ? 'bg-slate-900/40 border-slate-800 hover:border-blue-600/50 text-slate-400' 
                      : 'bg-white border-slate-100 hover:border-blue-600/50 shadow-sm text-slate-600'
                  }`}
                >
                  <ind.icon className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
                  <span className="text-base font-bold tracking-tight">{ind.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
