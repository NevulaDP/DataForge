
import React, { useState } from 'react';
import { Scenario, DataTable } from '../types';
import { Database, Info, Layers, ShieldCheck, ChevronRight } from 'lucide-react';

interface Props {
  scenario: Scenario;
}

const getTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('string')) return 'text-emerald-500';
  if (t.includes('float')) return 'text-amber-500';
  if (t.includes('integer') || t.includes('int')) return 'text-orange-500';
  if (t.includes('date')) return 'text-indigo-500';
  return 'text-blue-500';
};

const DataExplorer: React.FC<Props> = ({ scenario }) => {
  const [activeTableIdx, setActiveTableIdx] = useState(0);
  const activeTable = scenario.tables[activeTableIdx];
  const previewData = activeTable.data.slice(0, 20);

  return (
    <div className="p-12 pb-32 space-y-12">
      <div className="flex items-center space-x-4 mb-8">
        <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Source Registry</div>
        <div className="flex flex-wrap gap-3">
          {scenario.tables.map((table, idx) => (
            <button
              key={table.name}
              onClick={() => setActiveTableIdx(idx)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border-2 ${
                activeTableIdx === idx 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-blue-600'
              }`}
            >
              {table.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[48px] border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-10 py-6 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{activeTable.name} Preview</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">Rows 1-20 displayed</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cardinality: {activeTable.data.length.toLocaleString()}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50">
                  {activeTable.schema.map((col) => (
                    <th key={col.name} className="px-8 py-6 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] border-b-2 border-slate-200 dark:border-slate-800">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-900 dark:text-white">{col.name}</span>
                          {col.isPk && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                        <span className={`text-[9px] font-black uppercase ${getTypeColor(col.type)} opacity-80`}>{col.type.toUpperCase()}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    {activeTable.schema.map((col) => (
                      <td key={col.name} className="px-8 py-5 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap font-semibold font-mono">
                        {row[col.name]?.toString() ?? <span className="text-slate-300 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/30 rounded-[48px] border-2 border-slate-200 dark:border-slate-800 p-10 flex flex-col">
          <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.3em]">Dictionary</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">{activeTable.name} Schema</p>
            </div>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide">
            {activeTable.schema.map((col) => (
              <div key={col.name} className="space-y-2 border-b border-slate-200 dark:border-slate-800/50 pb-4 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 dark:text-white">{col.name}</span>
                  <span className={`text-[9px] font-black uppercase ${getTypeColor(col.type)}`}>{col.type}</span>
                </div>
                <p className="text-xs text-slate-500 italic font-semibold">{col.description || "Reference field."}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
