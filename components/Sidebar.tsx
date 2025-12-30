
import React, { useState, useRef } from 'react';
import { Scenario, SessionState, NotebookBlock } from '../types';
import Logo from './Logo';
import { Target, CheckCircle2, Circle, ChevronLeft, ChevronRight, Save, FolderOpen, Power, Printer, Loader2, Info } from 'lucide-react';
// @ts-ignore
import { marked } from "marked";
// @ts-ignore
import DOMPurify from "dompurify";
import { trackEvent, Analytics } from '../analytics';

interface Props {
  scenario: Scenario;
  onReset: () => void;
  onImport: (state: SessionState) => void;
  onUpdateScenario: (updatedScenario: Scenario) => void;
  getCurrentState: () => SessionState;
  theme: 'light' | 'dark';
}

const Sidebar: React.FC<Props> = ({ scenario, onReset, onImport, onUpdateScenario, getCurrentState, theme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMd = (content: string) => {
    try {
      // @ts-ignore
      const rawHtml = marked.parse(content || "");
      // @ts-ignore
      return DOMPurify.sanitize(rawHtml);
    } catch (e) {
      return content || "";
    }
  };

  const toggleObjective = (id: string) => {
    const updatedObjectives = scenario.objectives.map(obj => 
      obj.id === id ? { ...obj, completed: !obj.completed } : obj
    );
    onUpdateScenario({ ...scenario, objectives: updatedObjectives });
  };

  const getReportHtml = (state: SessionState) => {
    let blocksHtml = '';
    state.blocks.forEach((block: NotebookBlock) => {
      if (block.type === 'text' && block.includeInReport !== false) {
        blocksHtml += `<div class="section-content">${parseMd(block.content)}</div>`;
      } else if (block.type === 'code') {
        if (block.includeCodeInReport) {
          const langLabel = block.language === 'python' ? 'Python Script' : 'SQL Query';
          blocksHtml += `
            <div class="code-container">
              <div class="label">${langLabel}</div>
              <pre class="code-block">${block.content}</pre>
            </div>
          `;
        }

        if (block.output && block.includeOutputInReport !== false) {
          const out = block.output;
          if (out.type === 'table' && Array.isArray(out.data) && out.data.length > 0) {
            const headers = Object.keys(out.data[0]);
            blocksHtml += `
              <div class="table-container">
                <div class="label">Analysis Results</div>
                <table>
                  <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                  </thead>
                  <tbody>
                    ${out.data.slice(0, 30).map(row => `
                      <tr>${headers.map(h => `<td>${row[h] === null ? 'null' : row[h]}</td>`).join('')}</tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          } else if (out.type === 'chart') {
            blocksHtml += `
              <div class="chart-container">
                <div class="label">Visualization</div>
                <div style="text-align: center; margin: 20px 0;">
                  <img src="${out.data}" style="max-width: 90%; border-radius: 8px; border: 1px solid #e2e8f0;" />
                </div>
              </div>
            `;
          } else if (out.type === 'text') {
            blocksHtml += `<div class="section-content">${parseMd(String(out.data))}</div>`;
          }
        }
      }
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${scenario.companyName} - Strategic Briefing</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
          
          @page {
            margin: 1in;
          }

          body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background: #ffffff; 
            color: #1a202c; 
            line-height: 1.5; 
            font-size: 10pt; 
            max-width: 8.5in;
            margin: 0 auto;
            -webkit-print-color-adjust: exact;
          }

          .header-meta { 
            display: flex; 
            justify-content: space-between; 
            font-size: 8pt; 
            color: #94a3b8; 
            text-transform: uppercase; 
            font-weight: 800;
            letter-spacing: 0.25em;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 12px;
            margin-bottom: 50px;
          }

          h1 { 
            font-size: 30pt; 
            font-weight: 800; 
            color: #0f172a; 
            margin-bottom: 10px; 
            letter-spacing: -0.04em;
            line-height: 1.1;
          }

          .subtitle {
            font-size: 11pt;
            font-weight: 700;
            color: #64748b;
            margin-bottom: 60px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
          }

          h2 { 
            font-size: 13pt; 
            font-weight: 800; 
            color: #0f172a; 
            margin: 40px 0 20px; 
            text-transform: uppercase; 
            letter-spacing: 0.2em;
            display: flex;
            align-items: center;
          }
          
          h2::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #e2e8f0;
            margin-left: 15px;
          }

          .section-content { 
            margin-bottom: 25px; 
            color: #334155; 
          }

          .section-content p { 
            margin-bottom: 15px; 
            text-align: justify;
            hyphens: auto;
          }

          .objective { 
            display: flex; 
            align-items: center; 
            margin-bottom: 8px; 
            font-size: 9pt;
            font-weight: 600;
            color: #475569;
          }
          
          .check { 
            width: 12px; 
            height: 12px; 
            border: 2px solid #e2e8f0; 
            border-radius: 3px;
            margin-right: 12px; 
            display: inline-block;
            flex-shrink: 0;
          }
          .check.done { 
            background: #3b82f6; 
            border-color: #3b82f6;
          }

          .label { 
            font-size: 7pt; 
            font-weight: 800; 
            color: #94a3b8; 
            margin-bottom: 8px; 
            text-transform: uppercase;
            letter-spacing: 0.2em;
          }

          .code-block { 
            background: #f8fafc; 
            color: #1e293b; 
            padding: 20px; 
            border-radius: 8px; 
            font-family: 'JetBrains Mono', monospace; 
            font-size: 8.5pt; 
            margin-bottom: 30px; 
            white-space: pre-wrap;
            border: 1px solid #e2e8f0;
            line-height: 1.4;
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            font-size: 8.5pt; 
          }
          
          th { 
            border-bottom: 2px solid #f1f5f9; 
            padding: 10px 8px; 
            text-align: left; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
            color: #64748b;
          }
          td { 
            padding: 8px; 
            border-bottom: 1px solid #f8fafc; 
            word-break: break-all; 
            color: #334155;
            font-family: 'JetBrains Mono', monospace;
          }

          @media print {
            body { 
              padding: 0; 
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header-meta">
          <span>Strategic Briefing</span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>

        <h1>${scenario.companyName}</h1>
        <div class="subtitle">${scenario.industry} Sector : Intel Report</div>

        <h2>I. Problem Definition</h2>
        <div class="section-content">${parseMd(scenario.problemStatement)}</div>

        <h2>II. Operational Milestones</h2>
        <div class="section-content">
          ${scenario.objectives.map(obj => `
            <div class="objective">
              <div class="check ${obj.completed ? 'done' : ''}"></div>
              <span>${obj.task}</span>
            </div>
          `).join('')}
        </div>

        <h2>III. Quantitative Evidence</h2>
        ${blocksHtml}

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const state = getCurrentState();
      
      // Track Export in GA4
      trackEvent(Analytics.REPORT_EXPORTED, {
        company: scenario.companyName,
        objectives_completed: scenario.objectives.filter(o => o.completed).length
      });

      const reportHtml = getReportHtml(state);
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups to export your report.");
      }

      printWindow.document.open();
      printWindow.document.write(reportHtml);
      printWindow.document.close();

      setIsExporting(false);
    } catch (err: any) {
      console.error("PDF Export failed:", err);
      alert(err.message || "Failed to generate project report.");
      setIsExporting(false);
    }
  };

  const handleExportFile = () => {
    const state = getCurrentState();
    
    // Track Save in GA4
    trackEvent(Analytics.PROJECT_SAVED, {
      industry: scenario.industry,
      block_count: state.blocks.length
    });

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
          alert("Invalid project file format.");
        }
      } catch (err) { alert("Failed to read project file."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const commonButtonClasses = "flex items-center justify-center rounded-full transition-all border shadow-xl active:scale-95 group relative hover:shadow-2xl hover:brightness-105";

  return (
    <aside className={`relative h-full bg-white dark:bg-[#0c1222] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-500 ease-in-out z-[60] ${isCollapsed ? 'w-24' : 'w-[440px]'}`}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".flight,.json" />
      
      <div className={`absolute inset-y-0 left-0 w-full flex items-start justify-center pt-36 pointer-events-none select-none transition-all duration-500 ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="flex flex-col items-center"
          style={{ 
            writingMode: 'vertical-rl', 
            transform: 'rotate(180deg)',
          }}
        >
          <span className="text-[14px] font-black uppercase tracking-[1em] text-slate-200 dark:text-slate-800/60 whitespace-nowrap">
            DATAFORGE
          </span>
        </div>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-4 top-12 z-[70] flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white shadow-2xl hover:bg-blue-400 transition-all hover:scale-110 active:scale-95 border-2 border-white dark:border-[#0c1222]"
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className={`flex items-center transition-all ${isCollapsed ? 'p-6 justify-center' : 'p-10 pl-16 space-x-6'}`}>
        <Logo size={isCollapsed ? "sm" : "md"} theme={theme} />
        {!isCollapsed && (
          <div className="flex flex-col">
            <h2 className="font-black tracking-[0.3em] uppercase text-[10px] text-blue-500 opacity-80">Project Hub</h2>
            <h1 className="font-black text-xl tracking-widest uppercase text-slate-900 dark:text-white leading-none mt-1">DATAFORGE</h1>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto scrollbar-hide transition-all ${isCollapsed ? 'p-0' : 'p-8 pt-0 pl-16'} space-y-8`}>
        {!isCollapsed && (
          <>
            <div className={`bg-slate-50 dark:bg-[#0f172a] rounded-[32px] border-2 border-slate-200 dark:border-slate-800 transition-all p-8 space-y-4 shadow-sm`}>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em]">Organization</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{scenario.companyName}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{scenario.problemStatement}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center text-slate-400 dark:text-slate-600 space-x-4">
                <Target className="w-5 h-5" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em]">Objectives</h3>
              </div>
              <div className="space-y-5 px-1">
                {scenario.objectives.map((obj) => (
                  <button 
                    key={obj.id} 
                    onClick={() => toggleObjective(obj.id)}
                    className="flex items-start group relative space-x-4 w-full text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50 p-2 -m-2 rounded-2xl"
                  >
                    {obj.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700 shrink-0 mt-0.5 group-hover:text-blue-500 transition-colors" />
                    )}
                    <span className={`text-sm font-bold leading-relaxed transition-colors ${obj.completed ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      {obj.task}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className={`transition-all ${isCollapsed ? 'p-4 pb-10' : 'p-8 pt-0 pl-16'} space-y-4`}>
        <div className={`flex transition-all ${isCollapsed ? 'flex-col space-y-4 items-center' : 'flex-col space-y-3'}`}>
          {!isCollapsed && <div className="h-px w-full bg-slate-100 dark:bg-slate-800/50 mb-4" />}
          
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className={`${commonButtonClasses} bg-[#059669] hover:bg-[#10b981] text-white border-transparent ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-8 space-x-4'}`} 
            title="Export Strategic Report (PDF)"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5 shrink-0" />}
            {!isCollapsed && <span className="font-black text-[12px] uppercase tracking-[0.25em]">{isExporting ? 'Synthesizing...' : 'Export PDF Report'}</span>}
          </button>
          
          <button 
            onClick={handleExportFile} 
            className={`${commonButtonClasses} bg-[#2563eb] hover:bg-[#3b82f6] text-white border-transparent ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-8 space-x-4'}`} 
            title="Save Project File"
          >
            <Save className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="font-black text-[12px] uppercase tracking-[0.25em]">Save Progress</span>}
          </button>

          <button 
            onClick={handleImportClick} 
            className={`${commonButtonClasses} ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-8 space-x-4'} ${
              theme === 'dark' 
                ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`} 
            title="Load Project File"
          >
            <FolderOpen className={`w-5 h-5 shrink-0 ${theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`} />
            {!isCollapsed && <span className="font-black text-[12px] uppercase tracking-[0.25em]">Load Project</span>}
          </button>

          <div className={`${isCollapsed ? 'pt-4' : 'pt-8'}`}>
            {!isCollapsed && <div className="h-px w-full bg-slate-100 dark:bg-slate-800/50 mb-6" />}
            
            <button 
              onClick={(e) => { e.stopPropagation(); onReset(); }} 
              className={`${commonButtonClasses} cursor-pointer ${isCollapsed ? 'h-14 w-14' : 'w-full h-16 px-8 space-x-4'} ${
                theme === 'dark'
                  ? 'bg-transparent border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-500/20'
              }`}
              title="Terminate Project"
            >
              <Power className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="font-black text-[12px] uppercase tracking-[0.25em]">Terminate Project</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
