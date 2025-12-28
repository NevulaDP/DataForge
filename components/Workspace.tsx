
import React, { useState } from 'react';
import { Scenario, NotebookBlock } from '../types';
import { Table as TableIcon, BookOpen, Sun, Moon, Home } from 'lucide-react';
import DataExplorer from './DataExplorer';
import Notebook from './Notebook';

interface Props {
  scenario: Scenario;
  blocks: NotebookBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<NotebookBlock[]>>;
  onUpdateScenario: (updatedScenario: Scenario) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onReset: () => void;
}

const Workspace: React.FC<Props> = ({ scenario, blocks, setBlocks, onUpdateScenario, theme, toggleTheme, onReset }) => {
  const [activeView, setActiveView] = useState<'explorer' | 'notebook'>('notebook');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#020617] transition-colors">
      <div className="grid grid-cols-3 items-center px-10 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] z-50">
        {/* Left Section */}
        <div className="flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="flex items-center space-x-2 text-slate-400 hover:text-blue-500 transition-colors group"
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Main Page</span>
          </button>
        </div>

        {/* Center Section - Navigation Toggles */}
        <div className="flex justify-center">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setActiveView('notebook')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all text-xs font-bold ${
                activeView === 'notebook' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="uppercase tracking-widest text-[9px]">Analysis Notebook</span>
            </button>
            <button
              onClick={() => setActiveView('explorer')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-full transition-all text-xs font-bold ${
                activeView === 'explorer' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span className="uppercase tracking-widest text-[9px]">Dataset Explorer</span>
            </button>
          </div>
        </div>

        {/* Right Section - Action Controllers */}
        <div className="flex items-center justify-end space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-slate-200 dark:border-slate-800 shadow-sm"
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
      </div>
    </div>
  );
};

export default Workspace;
