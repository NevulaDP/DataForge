
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scenario, NotebookBlock } from '../types';
import { Play, Trash2, Loader2, AlertCircle, Terminal, Database, Edit3, Eye, Code2, FileText, Settings2 } from 'lucide-react';
import { executeCode, initEngines, getDynamicSymbols } from '../codeExecutionService';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { markdown } from "@codemirror/lang-markdown";
import { autocompletion, CompletionContext, CompletionResult, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { indentWithTab, history, historyKeymap, defaultKeymap } from "@codemirror/commands";
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { tags as t } from "@lezer/highlight";
// @ts-ignore
import { marked } from "marked";

interface Props {
  scenario: Scenario;
  blocks: NotebookBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<NotebookBlock[]>>;
  onUpdateScenario: (updatedScenario: Scenario) => void;
  theme: 'light' | 'dark';
}

const PANDAS_METHODS = ['head()', 'tail()', 'describe()', 'info()', 'columns', 'shape', 'value_counts()', 'groupby()', 'mean()', 'sum()', 'sort_values()', 'dropna()', 'fillna()', 'iloc', 'loc'];

const createCustomHighlightStyle = (theme: 'light' | 'dark') => {
  const isDark = theme === 'dark';
  return HighlightStyle.define([
    { tag: t.keyword, color: isDark ? "#60a5fa" : "#2563eb", fontWeight: "bold" },
    { tag: t.operator, color: isDark ? "#94a3b8" : "#475569" },
    { tag: t.string, color: isDark ? "#34d399" : "#059669" },
    { tag: t.number, color: isDark ? "#fbbf24" : "#d97706" },
    { tag: t.variableName, color: isDark ? "#f1f5f9" : "#0f172a" },
    { tag: t.propertyName, color: isDark ? "#c084fc" : "#7c3aed" },
    { tag: t.comment, color: isDark ? "#64748b" : "#94a3b8", fontStyle: "italic" },
    { tag: t.function(t.variableName), color: isDark ? "#38bdf8" : "#0284c7" },
    { tag: t.typeName, color: isDark ? "#818cf8" : "#4f46e5" },
    { tag: t.className, color: isDark ? "#818cf8" : "#4f46e5" },
    { tag: t.heading, color: isDark ? "#60a5fa" : "#2563eb", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.link, color: "#3b82f6", textDecoration: "underline" },
  ]);
};

const baseTheme = (theme: 'light' | 'dark') => {
  const isDark = theme === 'dark';
  return EditorView.theme({
    "&": { color: isDark ? "#f1f5f9" : "#0f172a", backgroundColor: "transparent" },
    ".cm-content": { caretColor: isDark ? "#3b82f6" : "#2563eb", padding: "16px 0" },
    ".cm-gutters": { backgroundColor: "transparent", color: isDark ? "#475569" : "#94a3b8", border: "none", paddingRight: "8px" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: isDark ? "#3b82f6" : "#2563eb" },
    ".cm-activeLine": { backgroundColor: isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(37, 99, 235, 0.03)" },
    ".cm-selectionBackground, ::selection": { backgroundColor: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.2)" }
  }, { dark: isDark });
};

const CodeEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onRun?: () => void;
  language: 'python' | 'sql' | 'markdown';
  theme: 'light' | 'dark';
  autoFocus?: boolean;
}> = ({ value, onChange, onRun, language, theme, autoFocus }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onRunRef.current = onRun; }, [onRun]);
  useEffect(() => {
    if (!editorRef.current) return;
    const myCompletions = async (context: CompletionContext): Promise<CompletionResult | null> => {
      if (language === 'markdown') return null;
      const word = context.matchBefore(/\w*/);
      const isMethod = context.matchBefore(/\.\w*/);
      if (!word && !isMethod && !context.explicit) return null;
      try {
        const symbols = await getDynamicSymbols(language as 'python' | 'sql');
        const options: any[] = [];
        if (language === 'python') {
          const dataframes = symbols?.dataframes || {};
          if (isMethod) {
            const line = context.state.doc.lineAt(context.pos).text;
            const beforeDotMatch = line.slice(0, context.pos).match(/(\w+)\.$/);
            const beforeDot = beforeDotMatch ? beforeDotMatch[1] : null;
            if (beforeDot && dataframes[beforeDot]) {
              dataframes[beforeDot].forEach((col: string) => options.push({ label: col, type: "property", detail: "column" }));
              PANDAS_METHODS.forEach(m => options.push({ label: m, type: "method", detail: "pandas" }));
            }
          } else {
            Object.keys(dataframes).forEach(name => options.push({ label: name, type: "variable", detail: "DataFrame" }));
            options.push({ label: "pd", type: "namespace" }, { label: "plt", type: "namespace" }, { label: "np", type: "namespace" });
          }
        } else {
          const tables = symbols?.tables || {};
          Object.keys(tables).forEach(tbl => {
            options.push({ label: tbl, type: "type", detail: "table" });
            if (tables[tbl]) tables[tbl].forEach((col: string) => options.push({ label: col, type: "property", detail: `col (${tbl})` }));
          });
          ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'ON'].forEach(k => options.push({ label: k, type: "keyword" }));
        }
        if (options.length === 0) return null;
        return { from: isMethod ? isMethod.from + 1 : word!.from, options: options.sort((a, b) => a.label.localeCompare(b.label)) };
      } catch (err) { return null; }
    };
    const extensions: Extension[] = [
      lineNumbers(), highlightActiveLineGutter(), highlightSpecialChars(), history(), drawSelection(), dropCursor(),
      EditorState.allowMultipleSelections.of(true), indentOnInput(), syntaxHighlighting(createCustomHighlightStyle(theme), { fallback: true }),
      bracketMatching(), closeBrackets(), autocompletion({ override: [myCompletions] }), rectangularSelection(), crosshairCursor(),
      highlightActiveLine(), highlightSelectionMatches(), foldGutter(),
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, indentWithTab, { key: "Mod-Enter", run: () => { onRunRef.current?.(); return true; } }]),
      language === 'python' ? python() : language === 'sql' ? sql() : markdown(),
      baseTheme(theme),
      EditorView.updateListener.of((update) => { if (update.docChanged) onChangeRef.current(update.state.doc.toString()); }),
    ];
    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    if (autoFocus) { setTimeout(() => view.focus(), 10); }
    return () => { view.destroy(); viewRef.current = null; };
  }, [language, theme]);
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) { viewRef.current.dispatch({ changes: { from: 0, to: currentDoc.length, insert: value } }); }
    }
  }, [value]);
  return <div ref={editorRef} className={`rounded-2xl overflow-hidden border-2 transition-all ${theme === 'dark' ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200/80 bg-white'}`} />;
};

const Toggle = ({ label, active, onChange }: { label: string, active: boolean, onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!active)}
    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
      active 
        ? 'bg-blue-600/10 border-blue-500/30 text-blue-500' 
        : 'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-600 hover:text-slate-500'
    }`}
  >
    <span>{label}</span>
    <div className={`w-5 h-2.5 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <div className={`absolute top-0.5 w-1.5 h-1.5 bg-white rounded-full transition-transform ${active ? 'left-3' : 'left-0.5'}`} />
    </div>
  </button>
);

const Notebook: React.FC<Props> = ({ scenario, blocks, setBlocks, onUpdateScenario, theme }) => {
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    if (!hasInitialized.current || hasInitialized.current !== (scenario.id as any)) {
      initEngines(scenario);
      hasInitialized.current = scenario.id as any;
    }
  }, [scenario.id]);
  
  const updateBlock = useCallback((id: string, updates: Partial<NotebookBlock>) => { 
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)); 
  }, [setBlocks]);
  
  const removeBlock = useCallback((id: string) => { setBlocks(prev => prev.filter(b => b.id !== id)); }, [setBlocks]);
  
  const runBlock = useCallback(async (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block || block.type !== 'code') return;
    setExecutingId(id);
    try {
      const result = await executeCode(block.language!, block.content, theme);
      if (result.updatedDf) {
        onUpdateScenario({ ...scenario, sampleData: result.updatedDf });
      }
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, output: { type: result.type, data: result.data, logs: result.logs } } : b));
    } catch (e: any) {
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, output: { type: 'error', data: e.message } } : b));
    } finally { setExecutingId(null); }
  }, [blocks, setBlocks, theme, scenario, onUpdateScenario]);
  
  const renderMarkdown = (content: string) => {
    try { return marked.parse(content || "_Add your narrative here..._"); } catch (e) { return content; }
  };

  return (
    <div className="max-w-5xl mx-auto p-12 space-y-16 pb-64 transition-all">
      {blocks.map((block) => (
        <div key={block.id} className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="absolute -left-16 top-4 opacity-0 group-hover:opacity-100 transition-all z-10">
             <button onMouseDown={() => removeBlock(block.id)} className="p-3 text-slate-400 hover:text-rose-500 transition-colors bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl" title="Remove block"><Trash2 className="w-5 h-5" /></button>
          </div>
          {block.type === 'text' ? (
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
                    <Edit3 className="w-4 h-4" />
                    <span>Narrative Context</span>
                  </div>
                  <Toggle 
                    label="Show in Report" 
                    active={block.includeInReport !== false} 
                    onChange={(v) => updateBlock(block.id, { includeInReport: v })} 
                  />
                </div>
                {editingTextId === block.id ? (
                  <button onMouseDown={(e) => { e.preventDefault(); setEditingTextId(null); }} className="flex items-center space-x-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-6 py-2 rounded-xl text-xs font-black tracking-[0.2em] transition-all border border-blue-500/20"><Eye className="w-4 h-4" /><span>PREVIEW</span></button>
                ) : (
                  <button onMouseDown={(e) => { e.preventDefault(); setEditingTextId(block.id); }} className="flex items-center space-x-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 px-6 py-2 rounded-xl text-xs font-black tracking-[0.2em] transition-all"><Edit3 className="w-4 h-4" /><span>EDIT</span></button>
                )}
              </div>
              {editingTextId === block.id ? (
                <div onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setEditingTextId(null); } }}>
                  <CodeEditor value={block.content} onChange={(val) => updateBlock(block.id, { content: val })} language="markdown" theme={theme} autoFocus onRun={() => setEditingTextId(null)} />
                </div>
              ) : (
                <div onMouseDown={() => setEditingTextId(block.id)} className={`markdown-preview min-h-[4rem] px-8 py-6 rounded-[32px] cursor-text transition-all border-2 border-transparent ${theme === 'dark' ? 'text-slate-200 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-800/50 shadow-inner' : 'text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-200/50'}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content) }} />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">
                    {block.language === 'python' ? <Terminal className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                    <span>{block.language} environment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Toggle 
                      label="Report Code" 
                      active={block.includeCodeInReport || false} 
                      onChange={(v) => updateBlock(block.id, { includeCodeInReport: v })} 
                    />
                    <Toggle 
                      label="Report Result" 
                      active={block.includeOutputInReport !== false} 
                      onChange={(v) => updateBlock(block.id, { includeOutputInReport: v })} 
                    />
                  </div>
                </div>
                <button onClick={() => runBlock(block.id)} disabled={executingId === block.id} className="flex items-center space-x-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-6 py-2.5 rounded-xl text-xs font-black tracking-[0.2em] transition-all disabled:opacity-50 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 active:scale-95">
                  {executingId === block.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>EXECUTE</span>
                </button>
              </div>
              <CodeEditor value={block.content} onChange={(val) => updateBlock(block.id, { content: val })} onRun={() => runBlock(block.id)} language={block.language!} theme={theme} />
              {block.output && (
                <div className="bg-white dark:bg-[#0f172a]/40 border-2 border-slate-100 dark:border-slate-800/80 rounded-[32px] overflow-hidden mt-8 shadow-2xl shadow-black/[0.03] dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="px-8 py-3.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Console Output</div>
                  </div>
                  <div className="p-8 overflow-x-auto max-h-[600px] scrollbar-hide space-y-6">
                    {block.output.logs && block.output.logs.trim().length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400/50 dark:text-slate-600 uppercase tracking-[0.2em]"><Code2 className="w-3 h-3"/><span>Standard Output</span></div>
                        <pre className="text-slate-500 dark:text-slate-400 text-sm font-mono whitespace-pre-wrap leading-relaxed border-l-2 border-slate-200 dark:border-slate-800 pl-4">{block.output.logs}</pre>
                      </div>
                    )}
                    <div className="space-y-3">
                      {block.output.logs && block.output.logs.trim().length > 0 && (
                        <div className="flex items-center space-x-2 text-[10px] font-black text-blue-500/50 dark:text-blue-600 uppercase tracking-[0.2em]"><Terminal className="w-3 h-3"/><span>Final Expression Result</span></div>
                      )}
                      {block.output.type === 'error' ? (
                        <div className="flex items-start space-x-4 text-rose-500 text-sm font-bold"><AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><pre className="font-mono whitespace-pre-wrap leading-relaxed">{block.output.data}</pre></div>
                      ) : block.output.type === 'table' ? (
                        <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                              {block.output.data.length > 0 && Object.keys(block.output.data[0]).map(k => (<th key={k} className="px-4 py-3 text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">{k}</th>))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {block.output.data.slice(0, 15).map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">{Object.values(row).map((v: any, j) => (<td key={j} className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">{v?.toString() ?? 'null'}</td>))}</tr>
                            ))}
                            {block.output.data.length > 15 && (<tr><td colSpan={Object.keys(block.output.data[0]).length} className="px-4 py-4 text-slate-400 italic text-sm font-medium bg-slate-50/30 dark:bg-transparent">... results truncated. showing 15 of {block.output.data.length} records.</td></tr>)}
                          </tbody>
                        </table>
                      ) : block.output.type === 'chart' ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="bg-white/90 dark:bg-slate-800/20 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-inner"><img src={block.output.data} alt="Data Visualization" className="max-w-full h-auto rounded-xl" /></div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Matplotlib Generated Visual</p>
                        </div>
                      ) : (
                        <pre className="text-slate-700 dark:text-slate-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">{block.output.data}</pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default Notebook;
