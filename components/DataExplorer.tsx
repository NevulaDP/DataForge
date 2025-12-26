
import React from 'react';
import { Scenario } from '../types';

interface Props {
  scenario: Scenario;
}

const DataExplorer: React.FC<Props> = ({ scenario }) => {
  const previewData = scenario.sampleData.slice(0, 50);

  return (
    <div className="p-12 pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-[48px] border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-black/[0.02] dark:shadow-none">
        <div className="px-10 py-6 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Operational Dataset Preview</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Showing first {previewData.length} of {scenario.sampleData.length.toLocaleString()} total records</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-blue-600 font-black uppercase tracking-widest block">{scenario.sampleData.length.toLocaleString()} RECORDS IN MEMORY</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Use Python/SQL to analyze full depth</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50">
                {scenario.schema.map((col) => (
                  <th key={col.name} className="px-8 py-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] border-b-2 border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col space-y-1">
                      <span className="text-slate-900 dark:text-white">{col.name}</span>
                      <span className="text-[10px] opacity-60 font-black text-blue-600 dark:text-blue-500">{col.type}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {previewData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  {scenario.schema.map((col) => (
                    <td key={col.name} className="px-8 py-5 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap font-semibold font-mono">
                      {row[col.name]?.toString() ?? <span className="text-slate-300 dark:text-slate-700 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-10 flex flex-col items-center space-y-4 bg-slate-50/50 dark:bg-slate-950/50 border-t-2 border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">
            Explorer limited to first 50 rows for performance.
          </p>
          <div className="flex items-center space-x-2 text-[10px] font-black text-blue-500/60 dark:text-blue-400/40 uppercase tracking-[0.2em]">
            <span>Full {scenario.sampleData.length.toLocaleString()} row dataset active in Logic Cells</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
