
import { Scenario } from './types';

let pyodide: any = null;
let sqlDb: any = null;
let SQL: any = null;
let initializationPromise: Promise<{ sql: boolean; python: boolean }> | null = null;
let currentLoadedScenarioId: string | null = null;
let isMatplotlibLoaded = false;

export type PythonStatus = 'idle' | 'loading' | 'ready' | 'error';
let currentPythonStatus: PythonStatus = 'idle';
let pythonErrorMessage: string | null = null;

const yieldToBrowser = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

const waitForGlobals = async (keys: string[], timeout = 60000): Promise<void> => {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      // @ts-ignore
      const allFound = keys.every(k => typeof window[k] === 'function' || typeof window[k] === 'object');
      if (allFound) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error(`Timeout: ${keys.join(', ')} failed to load.`));
      } else {
        setTimeout(check, 500); 
      }
    };
    check();
  });
};

const syncToSql = (tableName: string, records: any[]) => {
  if (!sqlDb || !records || records.length === 0) return;
  try {
    sqlDb.run(`DROP TABLE IF EXISTS "${tableName}"`);
    const first = records[0];
    const columns = Object.keys(first).map(key => {
      const val = first[key];
      const type = typeof val === 'number' ? 'REAL' : 'TEXT';
      return `"${key}" ${type}`;
    }).join(', ');
    sqlDb.run(`CREATE TABLE "${tableName}" (${columns})`);
    const keys = Object.keys(first);
    const placeholders = keys.map(() => '?').join(',');
    const stmt = sqlDb.prepare(`INSERT INTO "${tableName}" VALUES (${placeholders})`);
    records.forEach(row => {
      const values = keys.map(k => row[k]);
      stmt.run(values);
    });
    stmt.free();
  } catch (e) { console.error(`[SQL Sync Error]:`, e); }
};

/**
 * Injects data into Python safely.
 */
const injectDataToPython = async (scenario: Scenario) => {
  if (!pyodide) return;
  try {
    for (const table of scenario.tables) {
      const proxy = pyodide.toPy(table.data);
      pyodide.globals.set(`__tmp_proxy__`, proxy);
      await pyodide.runPythonAsync(`
import pandas as pd
import gc
${table.name} = pd.DataFrame(__tmp_proxy__)
del __tmp_proxy__
gc.collect()
      `);
      proxy.destroy();
      await yieldToBrowser(50);
    }
  } catch (e) {
    console.warn("Data injection to Python failed:", e);
  }
};

/**
 * Isolated Python Bootstrapper.
 */
const bootPythonInternal = async (scenario: Scenario) => {
  if (currentPythonStatus === 'ready' || currentPythonStatus === 'loading') return;
  
  currentPythonStatus = 'loading';
  pythonErrorMessage = null;
  
  try {
    // Force clean state
    pyodide = null;
    
    // @ts-ignore
    pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });
    
    await yieldToBrowser(200);
    await pyodide.loadPackage("numpy");
    await yieldToBrowser(200);
    await pyodide.loadPackage("pandas");
    
    await pyodide.runPythonAsync(`
import pandas as pd
import numpy as np
import io, base64, sys, json, traceback, gc
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
    `);

    await injectDataToPython(scenario);
    currentPythonStatus = 'ready';
  } catch (e: any) {
    console.error("Python Boot Failure:", e);
    currentPythonStatus = 'error';
    pythonErrorMessage = e.message || "Unknown WASM error";
    pyodide = null;
  }
};

/**
 * Primary Entry Point.
 * Resolves as soon as SQL/Data is ready. Python is optional.
 */
export const initEngines = async (scenario: Scenario): Promise<{ sql: boolean; python: boolean }> => {
  if (initializationPromise) {
    await initializationPromise;
    if (currentLoadedScenarioId !== scenario.id) {
      for (const table of scenario.tables) syncToSql(table.name, table.data);
      if (currentPythonStatus === 'ready') await injectDataToPython(scenario);
      currentLoadedScenarioId = scenario.id;
    }
    return { sql: !!sqlDb, python: currentPythonStatus === 'ready' };
  }

  initializationPromise = (async () => {
    try {
      await waitForGlobals(['initSqlJs', 'loadPyodide']);

      // 1. BOOT SQL (Fast)
      if (!SQL) {
        // @ts-ignore
        SQL = await window.initSqlJs({ 
          locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` 
        });
      }
      if (!sqlDb) sqlDb = new SQL.Database();
      for (const table of scenario.tables) syncToSql(table.name, table.data);

      // 2. TRIGGER PYTHON (Async, No Await)
      bootPythonInternal(scenario).catch(() => {});

      currentLoadedScenarioId = scenario.id;
      return { sql: true, python: false }; // Python is false because it's still loading
    } catch (err: any) {
      initializationPromise = null;
      throw err;
    }
  })();

  return initializationPromise;
};

export const getPythonStatus = () => ({
  status: currentPythonStatus,
  error: pythonErrorMessage
});

export const retryPython = async (scenario: Scenario) => {
  currentPythonStatus = 'idle';
  return bootPythonInternal(scenario);
};

const ensureMatplotlib = async () => {
  if (!pyodide || currentPythonStatus !== 'ready') return;
  if (isMatplotlibLoaded) return;
  try {
    await pyodide.loadPackage("matplotlib");
    await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.show = lambda *args, **kwargs: plt.draw()
    `);
    isMatplotlibLoaded = true;
  } catch (e) {
    console.error("Matplotlib load error:", e);
  }
};

export const getDynamicSymbols = async (language: 'python' | 'sql') => {
  if (language === 'python') {
    if (!pyodide || currentPythonStatus !== 'ready') return { dataframes: {} };
    try {
      const jsonStr = await pyodide.runPythonAsync(`
import json, pandas as pd
symbols = {name: obj.columns.tolist() for name, obj in globals().items() if isinstance(obj, pd.DataFrame) and not name.startswith('_')}
json.dumps({"dataframes": symbols})
      `);
      return JSON.parse(jsonStr);
    } catch (e) { return { dataframes: {} }; }
  } else {
    if (!sqlDb) return { tables: {} };
    try {
      const tables = sqlDb.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const result: Record<string, string[]> = {};
      if (tables.length > 0) {
        for (const row of tables[0].values) {
          const tableName = row[0];
          const info = sqlDb.exec(`PRAGMA table_info("${tableName}")`);
          result[tableName] = info[0].values.map((c: any) => c[1]);
        }
      }
      return { tables: result };
    } catch (e) { return { tables: {} }; }
  }
};

export const executeCode = async (language: 'python' | 'sql', code: string, theme: 'light' | 'dark' = 'dark'): Promise<{ type: 'table' | 'text' | 'error' | 'chart', data: any, logs?: string, sync?: Record<string, any[]> }> => {
  if (language === 'sql') {
    if (!sqlDb) return { type: 'error', data: 'SQL engine not ready.' };
    try {
      const res = sqlDb.exec(code);
      if (res.length === 0) return { type: 'text', data: 'Query executed successfully. 0 rows returned.' };
      const columns = res[0].columns;
      const data = res[0].values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
        return obj;
      });
      return { type: 'table', data: data.slice(0, 100) };
    } catch (e: any) { return { type: 'error', data: e.message }; }
  } else {
    if (!pyodide || currentPythonStatus !== 'ready') {
      return { type: 'error', data: 'Python engine is unavailable. Please use SQL blocks for this session.' };
    }
    
    if (code.includes('plt.') || code.includes('matplotlib')) {
      await ensureMatplotlib();
    }

    try {
      pyodide.globals.set("__user_code__", code);
      pyodide.globals.set("__theme__", theme);
      const runner = `
import json, pandas as pd, numpy as np, io, base64, sys, traceback, gc
out_capture = io.StringIO()
old_stdout = sys.stdout
sys.stdout = out_capture

try:
    import matplotlib.pyplot as plt
    if __theme__ == "dark":
        plt.style.use('dark_background')
        plt.rcParams.update({"figure.facecolor": "#0c1222", "axes.facecolor": "#0f172a"})
    else:
        plt.style.use('default')
    plt.close('all')
except:
    pass

code_to_run = __user_code__.strip()
lines = [l for l in code_to_run.split('\\n') if l.strip()]
res = None
response_type = "text"
response_data = ""

try:
    if len(lines) == 1: 
        res = eval(lines[0], globals())
    else:
        exec("\\n".join(lines[:-1]), globals())
        res = eval(lines[-1], globals())
except Exception:
    try: 
        exec(code_to_run, globals())
        res = ""
    except Exception as e:
        response_type = "error"
        response_data = str(e)

sys.stdout = old_stdout
logs = out_capture.getvalue()

if response_type != "error":
    if isinstance(res, (pd.DataFrame, pd.Series)):
        response_type = "table"
        df = res.to_frame() if isinstance(res, pd.Series) else res
        response_data = df.head(100).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')
    else:
        response_type = "text"
        response_data = str(res) if res is not None else ""

if response_type != "error":
    try:
        import matplotlib.pyplot as plt
        if plt.get_fignums():
            buf = io.BytesIO()
            plt.gcf().savefig(buf, format='png', bbox_inches='tight', dpi=80) 
            response_type = "chart"
            response_data = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode()}"
            plt.close('all')
    except:
        pass

sync_payload = {}
for name, obj in list(globals().items()):
    if isinstance(obj, pd.DataFrame) and not name.startswith('_'):
        sync_payload[name] = obj.head(500).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')

gc.collect()
json.dumps({"type": response_type, "data": response_data, "logs": logs, "sync": sync_payload})
`;
      const resultJson = await pyodide.runPythonAsync(runner);
      const result = JSON.parse(resultJson);
      if (result.sync) {
        Object.entries(result.sync).forEach(([tbl, data]: any) => syncToSql(tbl, data));
      }
      return result;
    } catch (e: any) { 
      return { type: 'error', data: e.message }; 
    }
  }
};
