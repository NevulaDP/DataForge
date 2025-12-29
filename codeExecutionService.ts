
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

  // Initial Python Configuration
  await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import io
import base64
import sys
import json
import traceback

# Prevent plt.show() from clearing the figure
plt.show = lambda *args, **kwargs: plt.draw()
  `);

  // Load all tables into Python as DataFrames
  for (const table of scenario.tables) {
    pyodide.globals.set(`js_data_${table.name}`, table.data);
    await pyodide.runPythonAsync(`
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

export const executeCode = async (language: 'python' | 'sql', code: string, theme: 'light' | 'dark' = 'dark'): Promise<{ type: 'table' | 'text' | 'error' | 'chart', data: any, logs?: string, sync?: Record<string, any[]> }> => {
  if (language === 'sql') {
    try {
      const res = sqlDb.exec(code);
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
import traceback

# Setup capture
out_capture = io.StringIO()
old_stdout = sys.stdout
sys.stdout = out_capture

# Apply Styling
if __theme__ == "dark":
    plt.rcParams.update({
        "text.color": "#f1f5f9", 
        "axes.labelcolor": "#cbd5e1", 
        "axes.edgecolor": "#334155", 
        "xtick.color": "#94a3b8", 
        "ytick.color": "#94a3b8", 
        "grid.color": "#1e293b", 
        "axes.titlecolor": "#f1f5f9", 
        "figure.facecolor": "#0c1222", 
        "axes.facecolor": "#0f172a"
    })
else:
    plt.rcParams.update({
        "text.color": "#0f172a", 
        "axes.labelcolor": "#475569", 
        "axes.edgecolor": "#cbd5e1", 
        "xtick.color": "#64748b", 
        "ytick.color": "#64748b", 
        "grid.color": "#f1f5f9", 
        "axes.titlecolor": "#0f172a", 
        "figure.facecolor": "#ffffff",
        "axes.facecolor": "#ffffff"
    })

plt.close('all')

# Run Code
code_to_run = __user_code__.strip()
lines = [l for l in code_to_run.split('\\n') if l.strip()]
res = None

response_type = "text"
response_data = ""
captured_logs = ""

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
        sys.stdout = old_stdout
        # CLEAN ERROR HANDLING
        exc_type, exc_value, exc_traceback = sys.exc_info()
        # format_exception_only returns the final NameError/TypeError part
        clean_error = "".join(traceback.format_exception_only(exc_type, exc_value)).strip()
        
        # Extract the line number from the traceback, filtering for user script frames
        # Usually <exec> or <string>
        tblist = traceback.extract_tb(exc_traceback)
        user_frames = [f for f in tblist if f.filename in ["<exec>", "<string>"]]
        
        error_prefix = ""
        if user_frames:
            # We take the last frame which should be the user's specific line
            line_no = user_frames[-1].lineno
            error_prefix = f"Error on line {line_no}: "
        
        response_type = "error"
        response_data = f"{error_prefix}{clean_error}"
        captured_logs = out_capture.getvalue()
        res = None

sys.stdout = old_stdout
if response_type != "error":
    captured_logs = out_capture.getvalue()
    if isinstance(res, (pd.DataFrame, pd.Series)):
        response_type = "table"
        df = res.to_frame() if isinstance(res, pd.Series) else res
        response_data = df.head(50).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')
    else:
        response_type = "text"
        response_data = str(res) if res is not None else ""

# Capture Chart if successful
if response_type != "error" and plt.get_fignums():
    fig = plt.gcf()
    if len(fig.axes) > 0:
        buf = io.BytesIO()
        fig.set_size_inches(10, 6)
        fig.tight_layout()
        fig.canvas.draw()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=140)
        img_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        response_type = "chart"
        response_data = f"data:image/png;base64,{img_str}"
        plt.close('all')

# Sync Tables
sync_payload = {}
for name, obj in list(globals().items()):
    if isinstance(obj, pd.DataFrame) and not name.startswith('_'):
        sync_payload[name] = obj.head(1000).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')

json.dumps({
    "type": response_type,
    "data": response_data,
    "logs": captured_logs,
    "sync": sync_payload
})
`;
      const resultJson = await pyodide.runPythonAsync(runnerScript);
      const result = JSON.parse(resultJson);
      
      if (result.sync) {
        Object.entries(result.sync).forEach(([tbl, data]: any) => syncToSql(tbl, data));
      }
      
      return result;
    } catch (e: any) { 
      // This catch is a fallback if the runnerScript itself fails to produce JSON
      return { type: 'error', data: e.message }; 
    }
  }
};
