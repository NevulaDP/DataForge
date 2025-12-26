
import React, { useState, useRef } from 'react';
import { Scenario, SessionState } from '../types';
import Logo from './Logo';
import { Target, Download, CheckCircle2, Circle, ChevronLeft, ChevronRight, Info, LogOut, Upload } from 'lucide-react';

interface Props {
  scenario: Scenario;
  onReset: () => void;
  onImport: (state: SessionState) => void;
  getCurrentState: () => SessionState;
}

const Sidebar: React.FC<Props> = ({ scenario, onReset, onImport, getCurrentState }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const state = getCurrentState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scenario.companyName.replace(/\s+/g, '_')}_analysis.flight`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
    e.target.value = ''; // Reset input
  };

  return (
    <aside 
      className={`relative h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? 'w-24' : 'w-[440px]'
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".flight,.json"
      />

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-12 z-50 flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white shadow-xl hover:bg-blue-500 transition-all hover:scale-110"
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className={`p-10 border-b border-slate-100 dark:border-slate-800/50 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-5'}`}>
        <Logo size="md" />
        {!isCollapsed && (
          <h2 className="font-bold tracking-[0.3em] uppercase text-sm text-slate-500 dark:text-slate-400">Mission Hub</h2>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-10 space-y-12">
        <div className={`bg-slate-50 dark:bg-slate-950/40 rounded-[48px] border-2 border-slate-200 dark:border-slate-800/50 transition-all ${isCollapsed ? 'p-3 flex flex-col items-center' : 'p-10 space-y-6'}`}>
          {isCollapsed ? (
             <div className="group relative">
               <Info className="w-7 h-7 text-slate-400 dark:text-slate-600" />
               <div className="absolute left-16 top-0 w-96 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100]">
                  <p className="text-base font-bold text-slate-900 dark:text-white mb-3">{scenario.companyName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{scenario.problemStatement}</p>
               </div>
             </div>
          ) : (
            <>
              <div className="text-[11px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.35em]">Organization</div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{scenario.companyName}</h3>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                {scenario.problemStatement}
              </p>
            </>
          )}
        </div>

        <div className="space-y-8">
          <div className={`flex items-center text-slate-400 dark:text-slate-600 ${isCollapsed ? 'justify-center' : 'space-x-5'}`}>
            <Target className="w-7 h-7" />
            {!isCollapsed && <h3 className="font-black text-xs uppercase tracking-[0.35em]">Objectives</h3>}
          </div>
          <div className="space-y-7 px-2">
            {scenario.objectives.map((obj) => (
              <div key={obj.id} className={`flex items-start group relative ${isCollapsed ? 'justify-center' : 'space-x-5'}`}>
                {obj.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 dark:text-slate-800 shrink-0 mt-0.5 group-hover:text-slate-400 dark:group-hover:text-slate-600 transition-colors" />
                )}
                {!isCollapsed && (
                  <span className={`text-[15px] font-bold leading-relaxed transition-colors ${obj.completed ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                    {obj.task}
                  </span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap text-base font-bold text-slate-700 dark:text-slate-300">
                    {obj.task}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-10 space-y-4 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className={`flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] transition-all border border-transparent shadow-2xl active:scale-95 ${
              isCollapsed ? 'h-14 w-14 p-0 mx-auto' : 'py-5 px-6 space-x-3'
            }`}
            title="Save Mission File"
          >
            <Download className="w-5 h-5" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">Save File</span>}
          </button>

          <button 
            onClick={handleImportClick}
            className={`flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-[24px] transition-all border border-transparent active:scale-95 ${
              isCollapsed ? 'h-14 w-14 p-0 mx-auto' : 'py-5 px-6 space-x-3'
            }`}
            title="Load Mission File"
          >
            <Upload className="w-5 h-5" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">Load File</span>}
          </button>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className={`w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-[24px] transition-all border border-transparent active:scale-95 cursor-pointer ${
            isCollapsed ? 'h-14 w-14 p-0 mx-auto' : 'py-4 px-10 space-x-4'
          }`}
          title="End Mission"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">End Mission</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
