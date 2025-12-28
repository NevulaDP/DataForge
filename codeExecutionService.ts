
import { Scenario } from './types';

let pyodide: any = null;
let sqlDb: any = null;
let SQL: any = null;

const syncToSql = (tableName: string, records: any[]) => {
  if (!sqlDb || records.length === 0) return;
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
  } catch (e) { console.error(`SQL Sync Error (${tableName}):`, e); }
};

export const initEngines = async (scenario: Scenario) => {
  if (!SQL) {
    const config = { locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}` };
    // @ts-ignore
    SQL = await window.initSqlJs(config);
  }
  sqlDb = new SQL.Database();
  
  // Sync all tables to SQL
  scenario.tables.forEach(table => syncToSql(table.name, table.data));

  if (!pyodide) {
    // @ts-ignore
    pyodide = await window.loadPyodide();
    await pyodide.loadPackage(["pandas", "numpy", "matplotlib"]);
  }

  // Load all tables into Python as DataFrames
  for (const table of scenario.tables) {
    pyodide.globals.set(`js_data_${table.name}`, table.data);
    await pyodide.runPythonAsync(`
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import json
import io
import base64
import sys
matplotlib.use('Agg')
${table.name} = pd.DataFrame(js_data_${table.name}.to_py())
    `);
  }
};

export const getDynamicSymbols = async (language: 'python' | 'sql') => {
  if (language === 'python') {
    if (!pyodide) return { dataframes: {} };
    try {
      const jsonStr = await pyodide.runPythonAsync(`
import json
import pandas as pd
symbols = {}
for name, obj in globals().items():
    if isinstance(obj, pd.DataFrame) and not name.startswith('_'):
        symbols[name] = obj.columns.tolist()
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

export const executeCode = async (language: 'python' | 'sql', code: string, theme: 'light' | 'dark' = 'dark'): Promise<{ type: 'table' | 'text' | 'error' | 'chart', data: any, logs?: string, updatedDf?: any[] }> => {
  if (language === 'sql') {
    try {
      const res = sqlDb.exec(code);
      // We don't automatically update scenario data from SQL yet, just return result
      if (res.length === 0) return { type: 'text', data: 'Execution successful.' };
      const columns = res[0].columns;
      const data = res[0].values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
        return obj;
      });
      return { type: 'table', data: data.slice(0, 50) };
    } catch (e: any) { return { type: 'error', data: e.message }; }
  } else {
    try {
      pyodide.globals.set("__user_code__", code);
      pyodide.globals.set("__theme__", theme);
      const runnerScript = `
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
import sys

def run_user_logic():
    code = globals().get("__user_code__", "").strip()
    theme = globals().get("__theme__", "dark")
    if not code: return {"type": "text", "data": ""}
    
    out_capture = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = out_capture
    
    if theme == "dark":
        plt.rcParams.update({"text.color": "#f1f5f9", "axes.labelcolor": "#cbd5e1", "axes.edgecolor": "#334155", "xtick.color": "#94a3b8", "ytick.color": "#94a3b8", "grid.color": "#1e293b", "axes.titlecolor": "#f1f5f9", "figure.facecolor": "none", "axes.facecolor": "none"})
    else:
        plt.rcParams.update({"text.color": "#0f172a", "axes.labelcolor": "#475569", "axes.edgecolor": "#cbd5e1", "xtick.color": "#64748b", "ytick.color": "#64748b", "grid.color": "#f1f5f9", "axes.titlecolor": "#0f172a", "figure.facecolor": "none", "axes.facecolor": "none"})

    plt.close('all')
    locs = globals()
    lines = code.split('\\n')
    res = None
    try:
        if len(lines) == 1:
            res = eval(lines[0], globals(), locs)
        else:
            exec("\\n".join(lines[:-1]), globals(), locs)
            res = eval(lines[-1], globals(), locs)
    except Exception:
        try:
            exec(code, globals(), locs)
            res = ""
        except Exception as e:
            sys.stdout = old_stdout
            raise e

    sys.stdout = old_stdout
    captured_logs = out_capture.getvalue()

    # Track all updated DataFrames to sync back to SQL
    sync_payload = {}
    for name, obj in globals().items():
        if isinstance(obj, pd.DataFrame) and not name.startswith('_'):
            sync_payload[name] = obj.head(1000).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')

    response = {"type": "text", "data": str(res), "logs": captured_logs, "sync": sync_payload}

    if isinstance(res, pd.DataFrame):
        preview = res.head(50).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')
        response.update({"type": "table", "data": preview})
    elif isinstance(res, pd.Series):
        preview = res.head(50).replace({np.nan: None, np.inf: None, -np.inf: None}).reset_index().to_dict(orient='records')
        response.update({"type": "table", "data": preview})

    fig = plt.gcf()
    if fig.get_axes():
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=150, transparent=True)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close('all')
        response.update({"type": "chart", "data": f"data:image/png;base64,{img_str}"})
    
    return response

json.dumps(run_user_logic())
`;
      const resultJson = await pyodide.runPythonAsync(runnerScript);
      const result = JSON.parse(resultJson);
      if (result.sync) {
        Object.entries(result.sync).forEach(([tbl, data]: any) => syncToSql(tbl, data));
      }
      return result;
    } catch (e: any) { return { type: 'error', data: e.message }; }
  }
};
