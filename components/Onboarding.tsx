
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
  Info
} from 'lucide-react';

interface Props {
  onSelect: (industry: Industry, difficulty: Difficulty) => void;
  onImport: (state: SessionState) => void;
  onAbout: () => void;
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
    <svg className="absolute w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        strokeDasharray="4,16" 
        className={theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} 
      />
    </svg>

    <div className="relative z-20 transform transition-transform duration-500" style={{ scale: 1.1 + (Math.sin(Date.now() / 1000) * 0.05) }}>
      <Logo size="lg" theme={theme} />
    </div>
  </div>
);

const Onboarding: React.FC<Props> = ({ 
  onSelect, 
  onImport, 
  onAbout,
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
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className={`h-screen flex flex-col items-center p-6 md:p-8 transition-colors duration-500 font-['Plus_Jakarta_Sans'] overflow-hidden ${
      theme === 'dark' ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-950'
    }`}>
      
      {/* PERSISTENT ACTION BAR */}
      <div className="fixed top-6 right-6 md:top-8 md:right-8 z-[110] flex items-center space-x-4">
        {!loading && (
          <>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={`flex items-center space-x-3 px-6 py-3 rounded-full border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                theme === 'dark' 
                  ? 'border-slate-800 text-white hover:bg-slate-900 bg-slate-900/50' 
                  : 'border-slate-300 text-slate-700 hover:bg-white bg-white/50 shadow-sm'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Resume Project</span>
            </button>
            
            <div className="relative group">
              <div className="absolute -inset-[2px] rounded-full blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move" />
              <div className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]" />
              
              <button 
                onClick={onAbout}
                className={`relative flex items-center space-x-3 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                  theme === 'dark' 
                    ? 'bg-[#0f172a] text-white' 
                    : 'bg-white text-slate-700'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>About Me</span>
              </button>
            </div>
          </>
        )}
        <button 
          onClick={toggleTheme} 
          className={`p-3 rounded-full border-2 transition-all shadow-lg active:scale-95 ${
            theme === 'dark' 
              ? 'border-slate-800 bg-slate-900 text-white' 
              : 'border-slate-300 bg-white text-slate-700'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {loading && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-700 ${
          theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'
        }`}>
          <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-8 text-center">
            <div className="relative mb-12 flex items-center justify-center">
              <NeuralCore theme={theme} progress={progress} />
            </div>
            
            <div className="w-full space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center h-32">
                  <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-[0.3em] leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {loadingMessage}
                  </h2>
                </div>
                
                <div className="flex justify-center items-center h-6">
                   <span className="text-blue-500 font-black text-sm tabular-nums tracking-widest">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className={`relative w-full h-10 rounded-full border p-[4px] overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200 shadow-inner'}`}>
                <div className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)] relative" style={{ width: `${progress}%` }}>
                </div>
              </div>
            </div>

            <div className={`mt-16 pt-8 border-t w-full ${theme === 'dark' ? 'border-slate-800/50' : 'border-slate-200'}`}>
              <p className={`text-sm font-semibold italic tracking-tight ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>"{ANALYST_TIPS[tipIndex]}"</p>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <div className={`w-full max-w-7xl flex items-center z-50 transition-all duration-300 mb-6 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center space-x-4">
          <Logo size="md" theme={theme} />
          <span className={`font-black text-[12px] uppercase tracking-[0.4em] opacity-80 ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`}>DataForge</span>
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
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="space-y-4 px-2">
            <div className={`flex items-center space-x-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-xl font-medium tracking-tight">Hi analyst!</span>
            </div>
            <div className="space-y-3">
              <h1 className={`text-5xl md:text-7xl font-black tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                Find your <span className={`inline-block bg-gradient-to-r ${theme === 'dark' ? 'from-blue-400' : 'from-blue-700'} via-indigo-600 to-purple-700 bg-clip-text text-transparent pb-3 pt-1 -mb-3 -mt-1`}>data edge.</span>
              </h1>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} text-base md:text-lg font-medium leading-relaxed max-w-4xl`}>
                Master the end-to-end analytical workflow. Solve complex enterprise business cases using SQL and Python with targeted strategic mentorship.
              </p>
            </div>
          </div>

          {error && <div className="p-3 rounded-[20px] bg-rose-500/10 border-2 border-rose-500/20 text-rose-500 font-bold text-xs">{error}</div>}

          <div className="space-y-8">
            <div className="relative group w-full">
              <div className="absolute -inset-[2px] rounded-full blur-xl opacity-30 group-focus-within:opacity-70 transition-opacity duration-500 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move" />
              <div className="absolute -inset-[1.5px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)]" />

              <div className={`relative flex items-center w-full rounded-full transition-all duration-500 p-3 pr-3.5 shadow-2xl ${
                theme === 'dark' 
                  ? 'bg-[#0f172a]' 
                  : 'bg-white'
              }`}>
                
                <div className="pl-5 pr-2">
                  <Search className={`w-5 h-5 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-500/40 group-focus-within:text-blue-500/40' : 'text-slate-500 group-focus-within:text-blue-600'}`} />
                </div>

                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart(customIndustry)}
                  placeholder="Ask DataForge for a specific sector.."
                  className={`flex-1 bg-transparent border-none focus:ring-0 py-4 px-3 text-lg font-medium ${theme === 'dark' ? 'placeholder:text-slate-500/40 text-white' : 'placeholder:text-slate-500 text-slate-900'}`}
                />

                <div className="flex items-center space-x-3">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDiffOpen(!isDiffOpen)}
                      className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-full border transition-all ${
                        theme === 'dark' 
                          ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300' 
                          : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{currentDiffLabel?.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isDiffOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDiffOpen && (
                      <div className={`absolute top-full right-0 mt-2 w-52 z-[120] rounded-[24px] border shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden p-1.5 ${
                        theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        {difficulties.map(d => (
                          <button
                            key={d.id}
                            onClick={() => { setSelectedDifficulty(d.id); setIsDiffOpen(false); }}
                            className={`w-full text-left p-3 rounded-[18px] transition-all ${
                              selectedDifficulty === d.id 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                            }`}
                          >
                            <div className="text-[10px] font-black uppercase tracking-widest">{d.label}</div>
                            <div className="text-[9px] opacity-60 font-medium">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleStart(customIndustry || 'Retail')} 
                    className="bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              {industryPresets.map((ind) => (
                <button 
                  key={ind.name} 
                  onClick={() => setCustomIndustry(ind.name)} 
                  className={`flex items-center space-x-3 px-8 py-4 rounded-full border-2 transition-all hover:scale-105 active:scale-95 group ${
                    theme === 'dark' 
                      ? 'bg-slate-900/40 border-slate-800 hover:border-blue-600/50 text-slate-400' 
                      : 'bg-white border-slate-300 hover:border-blue-600/50 shadow-md text-slate-700 font-semibold'
                  }`}
                >
                  <ind.icon className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-slate-500 group-hover:text-blue-500' : 'text-slate-500 group-hover:text-blue-600'}`} />
                  <span className="text-sm font-bold tracking-tight">{ind.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* REFINED FOOTER CREDITS */}
      <footer className={`w-full py-4 mt-auto flex flex-col items-center justify-center space-y-3 transition-all duration-700 ${loading ? 'opacity-0' : 'opacity-30 hover:opacity-100'}`}>
        <div className={`h-px w-16 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-800 to-transparent`} />
        <div className="flex flex-col items-center space-y-1 text-center">
          <p className={`text-[8px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            DataForge <span className="opacity-40 font-bold ml-1">2025</span>
          </p>
          <a 
            href="https://www.linkedin.com/in/nevobetesh/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-[8px] font-bold uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'text-slate-600 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}
          >
            Nevo Betesh
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
