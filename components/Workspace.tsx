
import React, { useState } from 'react';
import { Scenario, NotebookBlock } from '../types';
import { Table as TableIcon, BookOpen, Sun, Moon, Info } from 'lucide-react';
import DataExplorer from './DataExplorer';
import Notebook from './Notebook';

interface Props {
  scenario: Scenario;
  blocks: NotebookBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<NotebookBlock[]>>;
  onUpdateScenario: (updatedScenario: Scenario) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onAbout: () => void;
  onReset: () => void;
}

const Workspace: React.FC<Props> = ({ scenario, blocks, setBlocks, onUpdateScenario, theme, toggleTheme, onAbout, onReset }) => {
  const [activeView, setActiveView] = useState<'explorer' | 'notebook'>('notebook');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#020617] transition-colors">
      <div className="grid grid-cols-3 items-center px-10 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] z-50">
        <div className="flex items-center">
        </div>

        <div className="flex justify-center">
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-900/40 p-1.5 rounded-full border border-slate-200 dark:border-slate-800/60 shadow-inner min-w-[360px]">
            <div 
              className="absolute transition-all duration-300 ease-out bg-[#3b82f6] rounded-full shadow-lg h-[calc(100%-12px)] top-[6px] left-[6px]"
              style={{
                width: 'calc(50% - 6px)',
                transform: `translateX(${activeView === 'notebook' ? '0%' : '100%'})`,
              }}
            />
            
            <button
              onClick={() => setActiveView('notebook')}
              className={`relative z-10 flex items-center justify-center space-x-3 flex-1 py-2.5 rounded-full transition-colors duration-200 ${
                activeView === 'notebook' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="uppercase tracking-[0.15em] text-[10px] font-black">Analysis Notebook</span>
            </button>
            
            <button
              onClick={() => setActiveView('explorer')}
              className={`relative z-10 flex items-center justify-center space-x-3 flex-1 py-2.5 rounded-full transition-colors duration-200 ${
                activeView === 'explorer' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <TableIcon className="w-5 h-5" />
              <span className="uppercase tracking-[0.15em] text-[10px] font-black">Dataset Explorer</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <div className="relative group">
            <div className="absolute -inset-[1.5px] rounded-full blur-md opacity-30 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move" />
            <div className="absolute -inset-[1.2px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_200%] animate-gradient-move" />
            
            <button 
              onClick={onAbout}
              className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all text-[9px] font-black uppercase tracking-widest shadow-sm ${
                theme === 'dark' 
                  ? 'bg-[#0f172a] text-slate-200' 
                  : 'bg-white text-slate-600'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About Me</span>
            </button>
          </div>
          
          <button 
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all border shadow-sm ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeView === 'explorer' ? (
          <DataExplorer scenario={scenario} />
        ) : (
          <Notebook scenario={scenario} blocks={blocks} setBlocks={setBlocks} onUpdateScenario={onUpdateScenario} theme={theme} />
        )}
        
        {/* REFINED FOOTER CREDITS */}
        <footer className="w-full py-16 flex flex-col items-center justify-center space-y-4 transition-all duration-700 opacity-20 hover:opacity-100 group/footer">
          <div className={`h-px w-24 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-800 to-transparent transition-all group-hover/footer:w-48`} />
          <div className="flex flex-col items-center space-y-1.5">
            <p className={`text-[8px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
              DataForge <span className="opacity-40 font-bold ml-1">2025</span>
            </p>
            <a 
              href="https://www.linkedin.com/in/nevobetesh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-[8px] font-bold uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'text-slate-700 hover:text-blue-500' : 'text-slate-400 hover:text-blue-600'}`}
            >
              Nevo Betesh
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Workspace;
