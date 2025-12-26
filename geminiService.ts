
import { GoogleGenAI, Type } from "@google/genai";
import { Industry, Scenario, NotebookBlock, ChatMessage } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRetriable = error?.status >= 500 || !error?.status || error.message?.toLowerCase().includes('fetch') || error.message?.includes('429');
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

/**
 * Procedurally augments the seed data to reach 10,000 rows.
 * Introduces realistic "messiness" like occasional nulls, outliers, and duplicates.
 */
const augmentData = (seed: any[], targetRows: number = 10000): any[] => {
  if (seed.length === 0) return [];
  const augmented = [...seed];
  const seedLength = seed.length;
  const keys = Object.keys(seed[0]);

  const remaining = targetRows - augmented.length;
  for (let i = 0; i < remaining; i++) {
    const sourceRow = seed[i % seedLength];
    const newRow = { ...sourceRow };
    const messinessRoll = Math.random();

    for (const key of keys) {
      const val = newRow[key];
      
      // Inject messiness into ~3% of values
      if (Math.random() < 0.03) {
        if (Math.random() < 0.5) {
          newRow[key] = null; // Missing values
        } else if (typeof val === 'number') {
          newRow[key] = val * (Math.random() > 0.5 ? 10 : 0.01); // Outliers
        }
        continue;
      }

      // Standard variance for numeric values
      if (typeof val === 'number') {
        const variance = 0.98 + Math.random() * 0.04; // 2% variance
        newRow[key] = Number((val * variance).toFixed(2));
      } 
      // Date shifting
      else if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const d = new Date(val);
        d.setDate(d.getDate() + (Math.floor(Math.random() * 14) - 7));
        newRow[key] = d.toISOString().split('T')[0];
      }
    }

    // Occasional duplicated rows (1% chance)
    if (messinessRoll < 0.01) {
      augmented.push({ ...newRow });
      i++; 
    }
    
    if (augmented.length < targetRows) {
      augmented.push(newRow);
    }
  }
  return augmented.slice(0, targetRows);
};

export const generateScenario = async (industry: Industry): Promise<Scenario> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-stakes, immersive data analysis scenario for an analyst in the ${industry} sector. 
      
      Narrative Diversity:
      - Beyond standard BI: explore public health, environmental conservation, high-tech manufacturing, aerospace, or humanitarian aid.
      - Create a specific, high-pressure strategic mission.
      
      Data Quality & Challenge:
      - The dataset should be "real-world messy." This means a realistic distribution of issues: some missing values (NaN), occasional extreme outliers, inconsistent casing in strings, or slightly malformed dates. 
      - The goal is not a "cleaning project," but to force the analyst to apply basic data validation before deriving their BI/Strategic insights.
      
      Requirements:
      1. Organization name: Realistic and immersive.
      2. Problem statement: A complex challenge (e.g., "Predicting hospital bed shortages during a viral outbreak" or "Optimizing satellite power cycles based on historical telemetry").
      3. 4 Objectives: Focus on synthesis, forecasting, risk assessment, and strategic recommendations.
      4. Data: 100 rows of realistic sector-specific data including some "messy" records.
      
      Return as JSON with the following structure:
      {
        "companyName": "string",
        "problemStatement": "string",
        "objectives": [{"id": "string", "task": "string"}],
        "schema": [{"name": "string", "type": "string"}],
        "sampleData": "A JSON STRINGIFIED ARRAY of 100 objects representing the data rows."
      }`,
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
            schema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["name", "type"]
              }
            },
            sampleData: { 
              type: Type.STRING,
              description: "JSON stringified array of data rows."
            }
          },
          required: ["companyName", "problemStatement", "objectives", "schema", "sampleData"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    let parsedData = [];
    try {
      parsedData = JSON.parse(result.sampleData);
    } catch (e) {
      if (typeof result.sampleData === 'object') parsedData = result.sampleData;
    }

    const scaledData = augmentData(parsedData, 10000);

    return {
      id: Math.random().toString(36).substring(2, 11),
      companyName: result.companyName,
      industry,
      problemStatement: result.problemStatement,
      objectives: result.objectives.map((obj: any) => ({ ...obj, completed: false })),
      schema: result.schema,
      sampleData: scaledData
    };
  });
};

export const getMentorAdvice = async (scenario: Scenario, currentHistory: ChatMessage[], currentWork: NotebookBlock[]): Promise<string> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      You are a World-Class Data Strategist and Mentor.
      Mission: ${scenario.companyName} (${scenario.industry})
      Strategic Brief: ${scenario.problemStatement}
      Recent Dialogue: ${JSON.stringify(currentHistory.slice(-5))}
      Notebook Snapshot: ${JSON.stringify(currentWork.map(b => ({ type: b.type, content: b.content.substring(0, 100) })))}
      
      Advice Protocol:
      1. Acknowledge the messy nature of real-world data but focus on how that noise impacts the strategic conclusion.
      2. Suggest diverse analytical frameworks (e.g., Sensitivity analysis, Cluster analysis, Moving averages).
      3. Push the analyst toward identifying the "Signal" while accounting for the "Noise."
      4. Use a tone appropriate for the mission.
      5. Keep advice concise and insightful.`
    });
    return response.text || "Insightful progress, Analyst. Remember that anomalies often hide the most interesting system behaviors. Keep investigating the outliers.";
  });
};
