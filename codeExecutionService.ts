
import { Scenario } from './types';

let pyodide: any = null;
let sqlDb: any = null;
let SQL: any = null;

/**
 * Synchronizes a JavaScript array of objects (DataFrame records) to the SQL.js database.
 */
const syncToSql = (tableName: string, records: any[]) => {
  if (!sqlDb || records.length === 0) return;

  try {
    // Drop existing table to ensure fresh schema/data
    sqlDb.run(`DROP TABLE IF EXISTS "${tableName}"`);

    // Infer schema from first record
    const first = records[0];
    const columns = Object.keys(first).map(key => {
      const val = first[key];
      const type = typeof val === 'number' ? 'REAL' : 'TEXT';
      return `"${key}" ${type}`;
    }).join(', ');

    sqlDb.run(`CREATE TABLE "${tableName}" (${columns})`);

    // Prepare insert
    const keys = Object.keys(first);
    const placeholders = keys.map(() => '?').join(',');
    const stmt = sqlDb.prepare(`INSERT INTO "${tableName}" VALUES (${placeholders})`);

    records.forEach(row => {
      const values = keys.map(k => row[k]);
      stmt.run(values);
    });
    stmt.free();
  } catch (e) {
    console.error(`Failed to sync table ${tableName} to SQL:`, e);
  }
};

/**
 * Reads a table from SQL.js and returns it as an array of objects.
 */
const readFromSql = (tableName: string): any[] | null => {
  if (!sqlDb) return null;
  try {
    const res = sqlDb.exec(`SELECT * FROM "${tableName}"`);
    if (res.length === 0) return [];
    const columns = res[0].columns;
    return res[0].values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, i: number) => {
        obj[col] = row[i];
      });
      return obj;
    });
  } catch (e) {
    return null;
  }
};

export const initEngines = async (scenario: Scenario) => {
  // Initialize SQL.js
  if (!SQL) {
    const config = {
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    };
    // @ts-ignore
    SQL = await window.initSqlJs(config);
  }
  
  // Create SQL Database and initial table
  sqlDb = new SQL.Database();
  syncToSql('df', scenario.sampleData);

  // Initialize Pyodide
  if (!pyodide) {
    // @ts-ignore
    pyodide = await window.loadPyodide();
    // Load matplotlib for plotting support
    await pyodide.loadPackage(["pandas", "numpy", "matplotlib"]);
  }
  
  // Inject data and libraries into Python
  pyodide.globals.set("js_raw_data", scenario.sampleData);
  await pyodide.runPythonAsync(`
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import json
import io
import base64
from pyodide.ffi import JsProxy

# Use a non-interactive backend for plotting in Pyodide
matplotlib.use('Agg')

# Convert JS Proxy to native Python list of dicts
raw_data = js_raw_data.to_py()
df = pd.DataFrame(raw_data)
`);
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
    } catch (e) {
      return { dataframes: {} };
    }
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
    } catch (e) {
      return { tables: {} };
    }
  }
};

export const executeCode = async (language: 'python' | 'sql', code: string, theme: 'light' | 'dark' = 'dark'): Promise<{ type: 'table' | 'text' | 'error' | 'chart', data: any, updatedDf?: any[] }> => {
  if (language === 'sql') {
    try {
      const res = sqlDb.exec(code);
      
      // After any SQL execution, we MUST check if the 'df' table was modified
      // and pull it back to ensure synchronization with the application state.
      const updatedDf = readFromSql('df');

      if (res.length === 0) {
        return { 
          type: 'text', 
          data: 'Query executed successfully. No rows returned.',
          updatedDf: updatedDf || undefined
        };
      }
      
      const columns = res[0].columns;
      const values = res[0].values;
      const data = values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => {
          obj[col] = row[i];
        });
        return obj;
      });

      return { 
        type: 'table', 
        data: data.slice(0, 50), // Visual preview only
        updatedDf: updatedDf || undefined 
      };
    } catch (e: any) {
      return { type: 'error', data: e.message };
    }
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

def clean_for_json(obj):
    if isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj): return None
    elif isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(v) for v in obj]
    return obj

def run_user_logic():
    code = globals().get("__user_code__", "").strip()
    theme = globals().get("__theme__", "dark")
    if not code:
        return {"type": "text", "data": ""}
    
    locs = globals()
    lines = code.split('\\n')
    
    # Configure Matplotlib Theme
    if theme == "dark":
        plt.rcParams.update({
            "text.color": "#f1f5f9",
            "axes.labelcolor": "#cbd5e1",
            "axes.edgecolor": "#334155",
            "xtick.color": "#94a3b8",
            "ytick.color": "#94a3b8",
            "grid.color": "#1e293b",
            "axes.titlecolor": "#f1f5f9",
            "figure.facecolor": "none",
            "axes.facecolor": "none",
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
            "figure.facecolor": "none",
            "axes.facecolor": "none",
        })

    # Ensure any previous plot is closed before starting new execution
    plt.close('all')
    
    try:
        if len(lines) == 1:
            res = eval(lines[0], globals(), locs)
        else:
            exec("\\n".join(lines[:-1]), globals(), locs)
            res = eval(lines[-1], globals(), locs)
    except Exception:
        exec(code, globals(), locs)
        res = "Code executed successfully."

    # Identify all DataFrames to sync back to SQL
    sync_payload = {}
    main_df_records = None
    for name, obj in globals().items():
        if isinstance(obj, pd.DataFrame) and not name.startswith('_'):
            # Fetch ENTIRE dataframe for syncing
            records = obj.replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')
            sync_payload[name] = records
            if name == 'df':
                main_df_records = records

    # Default response structure
    response = {"type": "text", "data": str(res), "sync": sync_payload, "updatedDf": main_df_records}

    # Handle DataFrame result specifically for PREVIEW
    if isinstance(res, pd.DataFrame):
        preview_data = res.head(50).replace({np.nan: None, np.inf: None, -np.inf: None}).to_dict(orient='records')
        response.update({"type": "table", "data": preview_data})
    elif isinstance(res, pd.Series):
        preview_data = res.head(50).replace({np.nan: None, np.inf: None, -np.inf: None}).reset_index().to_dict(orient='records')
        response.update({"type": "table", "data": preview_data})
    elif isinstance(res, (list, dict)):
        response.update({"type": "text", "data": json.dumps(clean_for_json(res), indent=2)})

    # Check for visual plots (Matplotlib)
    fig = plt.gcf()
    if fig.get_axes():
        for ax in fig.get_axes():
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.tick_params(labelsize=10)
            for artist in ax.get_children():
                if isinstance(artist, matplotlib.container.BarContainer):
                    for patch in artist.patches:
                        if patch.get_facecolor() == (0.12156862745098039, 0.4666666666666667, 0.7058823529411765, 1.0):
                            patch.set_facecolor('#60a5fa' if theme == 'dark' else '#2563eb')
            
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=150, transparent=True)
        buf.seek(0)
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        plt.close('all')
        response.update({"type": "chart", "data": f"data:image/png;base64,{img_str}"})
    
    return response

json.dumps(run_user_logic())
`;
      const resultJson = await pyodide.runPythonAsync(runnerScript);
      const result = JSON.parse(resultJson);

      // Perform the actual synchronization to SQL database
      if (result.sync) {
        Object.entries(result.sync).forEach(([tableName, records]: [string, any]) => {
          syncToSql(tableName, records);
        });
      }

      const finalResult = { ...result };
      delete finalResult.sync;
      return finalResult;
      
    } catch (e: any) {
      return { type: 'error', data: e.message };
    }
  }
};
