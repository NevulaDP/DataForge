
import React, { useState, useRef } from 'react';
import { Scenario, SessionState, NotebookBlock } from '../types';
import Logo from './Logo';
import { Target, CheckCircle2, Circle, ChevronLeft, ChevronRight, FileText, Save, FolderOpen, Power } from 'lucide-react';

interface Props {
  scenario: Scenario;
  onReset: () => void;
  onImport: (state: SessionState) => void;
  getCurrentState: () => SessionState;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<Props> = ({ scenario, onReset, onImport, getCurrentState, theme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateMarkdownReport = (state: SessionState) => {
    let md = `# Strategic Analysis: ${scenario.companyName}\n\n`;
    md += `**Sector:** ${scenario.industry}  \n`;
    md += `**Report Date:** ${new Date().toLocaleDateString()}\n\n`;
    
    md += `## 1. Executive Briefing\n`;
    md += `${scenario.problemStatement}\n\n`;
    
    md += `## 2. Mission Objectives\n`;
    scenario.objectives.forEach(obj => {
      md += `- [${obj.completed ? 'x' : ' '}] ${obj.task}\n`;
    });
    md += `\n---\n\n`;

    state.blocks.forEach((block: NotebookBlock) => {
      if (block.type === 'text') {
        if (block.includeInReport !== false) {
          md += `${block.content}\n\n`;
        }
      } else if (block.type === 'code') {
        if (block.includeCodeInReport) {
          md += `### Analytical Logic (${block.language?.toUpperCase()})\n`;
          md += `\`\`\`${block.language}\n${block.content}\n\`\`\`\n\n`;
        }

        if (block.output && block.includeOutputInReport !== false) {
          const out = block.output;
          
          if (out.logs && out.logs.trim()) {
            md += `\n\`\`\`\n${out.logs.trim()}\n\`\`\`\n\n`;
          }

          if (out.type === 'table' && Array.isArray(out.data) && out.data.length > 0) {
            const data = out.data;
            const headers = Object.keys(data[0]);
            md += `| ${headers.join(' | ')} |\n`;
            md += `| ${headers.map(() => '---').join(' | ')} |\n`;
            data.slice(0, 15).forEach(row => {
              md += `| ${headers.map(h => {
                const val = row[h];
                return val === null || val === undefined ? '*null*' : String(val).replace(/\|/g, '\\|');
              }).join(' | ')} |\n`;
            });
            if (data.length > 15) {
              md += `\n*Showing top 15 of ${data.length} total records.*\n\n`;
            } else {
              md += `\n`;
            }
          } else if (out.type === 'chart') {
            md += `![Data Visualization](${out.data})\n\n`;
          } else if (out.type === 'text' && out.data && !out.logs) {
            md += `${out.data}\n\n`;
          }
        }
      }
    });

    md += `\n---\n*Report generated via DataForge Strategy Protocol*`;
    return md;
  };

  const handleExportReport = () => {
    const state = getCurrentState();
    const md = generateMarkdownReport(state);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scenario.companyName.replace(/\s+/g, '_')}_Strategic_Report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFile = () => {
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
      } catch (err) { alert("Failed to read mission file."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className={`relative h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-500 ease-in-out z-[60] ${isCollapsed ? 'w-24' : 'w-[440px]'}`}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".flight,.json" />
      
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-4 top-12 z-[70] flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white shadow-2xl hover:bg-blue-500 transition-all hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900"
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className={`border-b border-slate-100 dark:border-slate-800/50 flex items-center transition-all ${isCollapsed ? 'p-6 justify-center' : 'p-10 space-x-5'}`}>
        <Logo size={isCollapsed ? "sm" : "md"} theme={theme} />
        {!isCollapsed && <h2 className="font-bold tracking-[0.3em] uppercase text-sm text-slate-500 dark:text-slate-400">Mission Hub</h2>}
      </div>

      <div className={`flex-1 overflow-y-auto scrollbar-hide transition-all ${isCollapsed ? 'p-0' : 'p-10'} space-y-12`}>
        {!isCollapsed && (
          <>
            <div className={`bg-slate-50 dark:bg-slate-950/40 rounded-[48px] border-2 border-slate-200 dark:border-slate-800/50 transition-all p-10 space-y-6`}>
              <div className="text-[11px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.35em]">Organization</div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">{scenario.companyName}</h3>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{scenario.problemStatement}</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center text-slate-400 dark:text-slate-600 space-x-5">
                <Target className="w-6 h-6" />
                <h3 className="font-black text-xs uppercase tracking-[0.35em]">Objectives</h3>
              </div>
              <div className="space-y-7 px-2">
                {scenario.objectives.map((obj) => (
                  <div key={obj.id} className="flex items-start group relative space-x-5">
                    {obj.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300 dark:text-slate-800 shrink-0 mt-0.5 group-hover:text-slate-400 dark:group-hover:text-slate-600 transition-colors" />
                    )}
                    <span className={`text-[15px] font-bold leading-relaxed transition-colors ${obj.completed ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                      {obj.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`transition-all ${isCollapsed ? 'p-5 pb-10' : 'p-10 pt-0'} space-y-4`}>
        <div className={`flex transition-all ${isCollapsed ? 'flex-col space-y-4 items-center' : 'flex-col space-y-3'}`}>
          {!isCollapsed && <div className="h-px w-full bg-slate-100 dark:bg-slate-800/50 mb-4" />}
          
          <button 
            onClick={handleExportReport} 
            className={`flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all border border-transparent shadow-lg shadow-emerald-600/10 active:scale-95 group relative ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-6 space-x-3'}`} 
            title="Export Strategic Markdown Report"
          >
            <FileText className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">Export Report</span>}
          </button>
          
          <button 
            onClick={handleExportFile} 
            className={`flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all border border-transparent shadow-lg shadow-blue-600/10 active:scale-95 group relative ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-6 space-x-3'}`} 
            title="Save Mission File"
          >
            <Save className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">Save Progress</span>}
          </button>

          <button 
            onClick={handleImportClick} 
            className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full transition-all border border-transparent active:scale-95 group relative ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-6 space-x-3'}`} 
            title="Load Mission File"
          >
            <FolderOpen className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">Load Mission</span>}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onReset(); }} 
            className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-full transition-all border border-transparent active:scale-95 cursor-pointer group relative ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-6 space-x-3'}`} 
            title="End Mission"
          >
            <Power className="w-6 h-6 shrink-0" />
            {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.35em]">Terminate Mission</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
