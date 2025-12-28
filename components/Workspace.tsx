
import React, { useState } from 'react';
import { Scenario, NotebookBlock } from '../types';
import { Table as TableIcon, BookOpen, Type as TypeIcon, Code2, Database, Terminal, X, Sun, Moon, Home } from 'lucide-react';
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
  const [isCodePickerOpen, setIsCodePickerOpen] = useState(false);

  const addBlock = (type: 'text' | 'code', language?: 'python' | 'sql') => {
    const newBlock: NotebookBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      language: type === 'code' ? (language || 'python') : undefined,
      // Default report visibility settings
      includeInReport: true, 
      includeCodeInReport: false,
      includeOutputInReport: true
    };
    setBlocks([...blocks, newBlock]);
    setIsCodePickerOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="flex items-center justify-between px-10 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-50">
        <div className="flex items-center space-x-6">
          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="flex items-center space-x-3 px-6 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group active:scale-95 cursor-pointer shadow-sm hover:shadow-md"
            title="Back to Main Page"
          >
            <Home className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em]">Back to Main Page</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveView('notebook')}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full transition-all ${
                activeView === 'notebook' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-base font-bold">Analysis Notebook</span>
            </button>
            <button
              onClick={() => setActiveView('explorer')}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full transition-all ${
                activeView === 'explorer' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-5 h-5" />
              <span className="text-base font-bold">Dataset Explorer</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-3.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {activeView === 'notebook' && (
            <>
              <button
                onClick={() => addBlock('text')}
                className="flex items-center space-x-3 px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-xs font-black uppercase tracking-widest shadow-sm"
              >
                <TypeIcon className="w-4 h-4" />
                <span>+ Narrative</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsCodePickerOpen(!isCodePickerOpen)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-full border-2 transition-all text-xs font-black uppercase tracking-widest shadow-sm ${
                    isCodePickerOpen ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>+ Logic Cell</span>
                </button>

                {isCodePickerOpen && (
                  <div className="absolute top-full mt-4 right-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] p-3 flex space-x-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => addBlock('code', 'python')}
                      className="flex items-center space-x-3 px-6 py-3.5 rounded-[20px] hover:bg-blue-600 text-slate-700 dark:text-slate-200 hover:text-white transition-all text-sm font-bold"
                    >
                      <Terminal className="w-5 h-5" />
                      <span>Python</span>
                    </button>
                    <button
                      onClick={() => addBlock('code', 'sql')}
                      className="flex items-center space-x-3 px-6 py-3.5 rounded-[20px] hover:bg-blue-600 text-slate-700 dark:text-slate-200 hover:text-white transition-all text-sm font-bold"
                    >
                      <Database className="w-5 h-5" />
                      <span>SQL</span>
                    </button>
                    <button
                      onClick={() => setIsCodePickerOpen(false)}
                      className="p-3.5 rounded-full text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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
