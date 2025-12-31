
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
      
      // Preserving A/B test groups and IDs to maintain relational integrity
      if (key.toLowerCase().includes('group') || key.toLowerCase().includes('variant') || key.toLowerCase().includes('id')) {
        continue;
      }

      if (Math.random() < 0.03) {
        if (Math.random() < 0.5) {
          newRow[key] = null;
        } else if (typeof val === 'number') {
          newRow[key] = val * (Math.random() > 0.5 ? 1.5 : 0.7);
        }
        continue;
      }

      if (typeof val === 'number') {
        const variance = 0.92 + Math.random() * 0.16; // Slight variance +/- 8%
        newRow[key] = Number((val * variance).toFixed(2));
      } else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const d = new Date(val);
        // Ensure dates drift backwards more naturally for time-series
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
    beginner: "A single dataset with ~15 columns. Focus on basic exploratory analysis and simple aggregations.",
    intermediate: "2-3 related tables. Scenario could involve either deep exploratory analysis (e.g. identifying churn factors) OR an experimental validation (e.g. an A/B test with a 'test_group' column). Choose the most natural business narrative.",
    advanced: "A Star Schema with complex relational logic. Challenge should involve either advanced time-series decay analysis (e.g. cohort retention) OR a multi-variant experiment requiring statistical rigor."
  }[difficulty];

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-stakes data analysis mission for an analyst in the ${industry} sector.
      
      Difficulty Level: ${difficulty}
      Data Structure Requirements: ${difficultyPrompt}
      
      Schema Instructions:
      - For each table, provide a name, schema (name, type, description, isPk), and sample data (20-30 rows).
      - Relational integrity (FKs) must be maintained for intermediate/advanced missions.
      - ONLY include a 'test_group' or 'variant' column if the business case you choose actually requires an experiment or A/B test.
      
      Mission Requirements:
      1. Organization name.
      2. Problem statement involving a realistic business hurdle (e.g., 'Optimize inventory turnover' or 'Analyze why a specific user segment is churning').
      3. Define 4 Strategic objectives. Phrase them as analytical goals. If you chose an experimental scenario, include objectives for 'lift' or significance. If you chose an exploratory scenario, focus on finding drivers, trends, or outliers.
      
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
                  isFactTable: { type: Type.BOOLEAN },
                  schema: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING },
                        description: { type: Type.STRING },
                        isPk: { type: Type.BOOLEAN }
                      },
                      required: ["name", "type", "description", "isPk"]
                    }
                  },
                  sampleData: { type: Type.STRING, description: "JSON stringified array of data rows" }
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
    const finalTables: DataTable[] = result.tables.map((t: any) => {
      let parsedData = [];
      try {
        parsedData = typeof t.sampleData === 'string' ? JSON.parse(t.sampleData) : t.sampleData;
      } catch (e) { parsedData = []; }

      const shouldScale = t.isFactTable || result.tables.length === 1 || t.name.toLowerCase().includes('transaction') || t.name.toLowerCase().includes('sale') || t.name.toLowerCase().includes('event');
      const targetRows = shouldScale ? (10000 + Math.floor(Math.random() * 5500)) : parsedData.length;
      
      return {
        name: t.name,
        schema: t.schema,
        data: shouldScale ? augmentSingleTable(parsedData, targetRows) : parsedData,
        isFactTable: !!t.isFactTable
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
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class Socratic Tutor and Data Strategy Mentor.

      YOUR MISSION:
      Empower the analyst to solve the business problem using their own critical thinking.

      MISSION CONTEXT:
      - Organization: ${scenario.companyName} (${scenario.industry})
      - Case: ${scenario.problemStatement}
      - Objectives: ${JSON.stringify(scenario.objectives)}
      - Tables: ${scenario.tables.map(t => `${t.name}: [${t.schema.map(s => s.name).join(', ')}]`).join(' | ')}
      
      ANALYST ACTIVITY:
      - Last Notebook States: ${JSON.stringify(currentWork.map(b => ({ type: b.type, content: b.content.substring(0, 100), hasOutput: !!b.output })))}

      TUTORING PROTOCOLS:
      1. KPI FOCUS: If they are calculating metrics, ask how that metric translates to business health.
      2. CAUSALITY VS CORRELATION: If they identify a trend, nudge them to look for confounding variables.
      3. EXPERIMENTAL RIGOR (If applicable): If an A/B test is present, guide them toward statistical significance without giving them the code.
      4. NO SPOILERS: Never provide direct SQL queries or Python snippets.
      5. STRATEGIC ROI: Help them quantify the "so what" of their findings.`,
      config: {
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text || "I'm reviewing your analysis. What primary driver do you suspect is influencing these results?";
  });
};
