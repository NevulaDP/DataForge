
import { GoogleGenAI, Type } from "@google/genai";
import { Industry, Scenario, NotebookBlock, ChatMessage, Difficulty, DataTable } from "./types";

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || '';
      const isRetriable = error?.status >= 500 || !error?.status || errorMsg.includes('fetch') || errorMsg.includes('429');
      if (attempt < maxRetries && isRetriable) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  throw lastError;
}

const augmentSingleTable = (seed: any[], targetRows: number): any[] => {
  if (seed.length === 0) return [];
  const augmented = [...seed];
  const seedLength = seed.length;
  const keys = Object.keys(seed[0]);

  const remaining = targetRows - augmented.length;
  for (let i = 0; i < remaining; i++) {
    const sourceRow = seed[Math.floor(Math.random() * seedLength)];
    const newRow = { ...sourceRow };

    for (const key of keys) {
      const val = newRow[key];
      
      // Avoid modifying IDs to maintain FK relations to Dim tables
      if (key.toLowerCase().includes('group') || key.toLowerCase().includes('variant') || key.toLowerCase().includes('id')) {
        continue;
      }

      // Add noise and nulls
      if (Math.random() < 0.03) {
        if (Math.random() < 0.5) {
          newRow[key] = null;
        } else if (typeof val === 'number') {
          newRow[key] = val * (Math.random() > 0.5 ? 1.5 : 0.7);
        }
        continue;
      }

      // Gaussian-ish variance
      if (typeof val === 'number') {
        const variance = 0.92 + Math.random() * 0.16;
        newRow[key] = Number((val * variance).toFixed(2));
      } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const d = new Date(val);
        d.setDate(d.getDate() - Math.floor(Math.random() * 120));
        newRow[key] = d.toISOString().split('T')[0];
      }
    }
    augmented.push(newRow);
  }
  return augmented;
};

export const generateScenario = async (industry: Industry, difficulty: Difficulty): Promise<Scenario> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const difficultyPrompt = {
    beginner: "Generate EXACTLY 1 table. Focus on flat-file exploratory analysis and simple aggregations.",
    intermediate: "Generate EXACTLY 3 related tables. This should involve a primary transaction/event table and 2 dimension/metadata tables (e.g. Orders, Customers, and Products).",
    advanced: "Generate EXACTLY 4 or 5 tables. This must be a full Star Schema: 1 large Fact table and 3-4 distinct Dimension tables. The scenario must require multi-way joins and complex relational logic."
  }[difficulty];

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-stakes data analysis mission for an analyst in the ${industry} sector.
      
      Difficulty Level: ${difficulty}
      Table Count Requirement: ${difficultyPrompt}
      
      SCHEMA DATA TYPE RULES:
      You MUST ONLY use the following types for columns:
      - 'string' (for text, IDs, or categories)
      - 'float' (for decimals, currency, rates, metrics) - NEVER use 'decimal' or 'number'
      - 'integer' (for counts, whole numbers)
      - 'date' (for YYYY-MM-DD formatted strings)
      - 'boolean' (for true/false)
      
      Schema Instructions:
      - For each table, provide a name, schema (name, type, description, isPk), and sample data (20-30 rows).
      - Relational integrity (FKs) is CRITICAL. IDs in the Fact table must correspond to IDs in the Dimension tables.
      - Ensure column names are descriptive and professional.
      
      Mission Requirements:
      1. Organization name (invent a professional-sounding name).
      2. Problem statement involving a realistic business hurdle.
      3. Define 4 Strategic objectives phrased as analytical goals.
      
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            objectives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  task: { type: Type.STRING }
                },
                required: ["id", "task"]
              }
            },
            tables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  isFactTable: { 
                    type: Type.BOOLEAN, 
                    description: "True if this is the primary transactional/event table to be scaled." 
                  },
                  schema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { 
                          type: Type.STRING, 
                          description: "Allowed values: 'string', 'float', 'integer', 'date', 'boolean'" 
                        },
                        description: { type: Type.STRING },
                        isPk: { type: Type.BOOLEAN }
                      },
                      required: ["name", "type", "description", "isPk"]
                    }
                  },
                  sampleData: { type: Type.STRING, description: "JSON stringified array of data rows (min 25 rows)" }
                },
                required: ["name", "schema", "sampleData"]
              }
            }
          },
          required: ["companyName", "problemStatement", "objectives", "tables"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Improved logic to distinguish Fact vs Dim tables
    const hasExplicitFact = result.tables.some((t: any) => t.isFactTable === true);
    
    // If no explicit fact is marked, find the best candidate via keyword matching
    const factKeywords = ['transaction', 'sale', 'event', 'order', 'click', 'log', 'fact', 'revenue', 'metric'];
    let fallbackFactIndex = -1;
    if (!hasExplicitFact) {
      fallbackFactIndex = result.tables.findIndex((t: any) => 
        factKeywords.some(k => t.name.toLowerCase().includes(k))
      );
      // Final fallback if keywords fail but we have tables
      if (fallbackFactIndex === -1 && result.tables.length > 0) fallbackFactIndex = 0;
    }

    const finalTables: DataTable[] = result.tables.map((t: any, idx: number) => {
      let parsedData = [];
      try {
        parsedData = typeof t.sampleData === 'string' ? JSON.parse(t.sampleData) : t.sampleData;
      } catch (e) { parsedData = []; }

      // A table is scaled to 15k rows only if it is the primary Fact table.
      // Dimension tables (Customers, Products, etc.) should maintain their original cardinality.
      const shouldScale = hasExplicitFact ? !!t.isFactTable : (idx === fallbackFactIndex);
      
      const targetRows = shouldScale 
        ? (12000 + Math.floor(Math.random() * 4500)) 
        : parsedData.length;
      
      return {
        name: t.name,
        schema: t.schema,
        data: shouldScale ? augmentSingleTable(parsedData, targetRows) : parsedData,
        isFactTable: shouldScale
      };
    });

    return {
      id: Math.random().toString(36).substring(2, 11),
      companyName: result.companyName,
      industry,
      difficulty,
      problemStatement: result.problemStatement,
      objectives: result.objectives.map((obj: any) => ({ ...obj, completed: false })),
      tables: finalTables
    };
  });
};

export const getMentorAdvice = async (scenario: Scenario, currentHistory: ChatMessage[], currentWork: NotebookBlock[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const historyParts = currentHistory.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const systemInstruction = `You are a world-class Socratic Tutor and Data Strategy Mentor.

  YOUR MISSION:
  Empower the analyst to solve the business problem using their own critical thinking. 
  Respond to their questions and analysis by nudging them toward deep insight.

  MISSION CONTEXT:
  - Organization: ${scenario.companyName} (${scenario.industry})
  - Case: ${scenario.problemStatement}
  - Objectives: ${scenario.objectives.map(o => `[${o.completed ? 'COMPLETED' : 'OPEN'}] ${o.task}`).join(', ')}
  - Tables Available: ${scenario.tables.map(t => `${t.name} (${t.data.length} rows): [${t.schema.map(s => s.name).join(', ')}]`).join(' | ')}
  
  ANALYST ACTIVITY (Last Notebook Blocks):
  ${currentWork.map(b => `- [${b.type.toUpperCase()}${b.language ? ':' + b.language : ''}] ${b.content.substring(0, 150)}... ${b.output ? '(Has Results)' : '(No results)'}`).join('\n')}

  TUTORING PROTOCOLS:
  1. KPI FOCUS: If they are calculating metrics, ask how that metric translates to business health.
  2. CAUSALITY VS CORRELATION: If they identify a trend, nudge them to look for confounding variables.
  3. NO SPOILERS: Never provide direct SQL queries or Python snippets.
  4. STRATEGIC ROI: Help them quantify the "so what" of their findings.
  5. BE CONCISE: Analysts are busy. Keep your nudges punchy and impactful.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: historyParts,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    
    return response.text || "I'm reviewing your analysis. What primary driver do you suspect is influencing these results?";
  });
};
