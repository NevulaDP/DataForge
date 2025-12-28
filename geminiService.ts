
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
        d.setDate(d.getDate() + (Math.floor(Math.random() * 90) - 45)); // Shifting dates across a wider range
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
    beginner: "A single comprehensive dataset (flat file) with ~15 columns.",
    intermediate: "2-3 related tables (e.g. transactions and users) allowing for JOIN operations.",
    advanced: "A Star Schema with 1 central fact table and 2-3 dimension tables (e.g. sales, products, stores, calendar)."
  }[difficulty];

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a high-stakes data analysis mission for an analyst in the ${industry} sector.
      
      Difficulty Level: ${difficulty}
      Data Structure Requirements: ${difficultyPrompt}
      
      Schema Instructions:
      - For each table, provide a name, schema (name, type, description, isPk), and sample data (20-30 rows).
      - Ensure relational integrity (FKs) for intermediate/advanced missions.
      - Descriptions should be neutral and factual.
      
      Mission Requirements:
      1. Organization name.
      2. Complex problem statement.
      3. 4 Strategic objectives.
      
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

      const shouldScale = t.isFactTable || result.tables.length === 1 || t.name.toLowerCase().includes('transaction') || t.name.toLowerCase().includes('sale');
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
      Empower the analyst to solve the business problem using their own critical thinking. You are like a private tutor who helps a student derive a formula rather than giving it to them.

      MISSION CONTEXT:
      - Organization: ${scenario.companyName} (${scenario.industry})
      - Business Case: ${scenario.problemStatement}
      - Current Objectives: ${JSON.stringify(scenario.objectives)}
      - Schema Knowledge: ${scenario.tables.map(t => `${t.name}: [${t.schema.map(s => s.name).join(', ')}]`).join(' | ')}
      
      ANALYST ACTIVITY TRACKER:
      - Last Notebook States: ${JSON.stringify(currentWork.map(b => ({ type: b.type, content: b.content.substring(0, 100), hasOutput: !!b.output })))}
      - Recent Discussion: ${JSON.stringify(currentHistory.slice(-5))}

      TUTORING PROTOCOLS:
      1. SOCRATIC GUIDANCE: If asked "How do I calculate X?" or "What's the formula for Y?", respond by asking about the business logic. Example: "To find the churn rate, what two metrics would we need to compare to see who stayed versus who left?"
      2. CONCEPT CLARIFICATION: If they don't understand a term (e.g., 'Star Schema' or 'Relational JOIN'), explain the *concept* clearly with an analogy, then ask how it applies to the current datasets.
      3. NO SPOILERS: Never provide direct SQL queries, Python snippets, or final mathematical formulas.
      4. MISSION ALIGNMENT: Always pivot the conversation back to the specific Objectives if the analyst gets distracted.
      5. NO HONORIFICS: Do NOT use "Senior Analyst", "Analyst", or "Sir/Madam". Speak as a peer-mentor.
      6. INCREMENTAL PUSH: Acknowledge small wins ("Excellent first look at the distribution...") and then nudge toward the next deeper question ("...now, what might explain that outlier in the Q3 data?").

      FORMATTING:
      - Use **Markdown** for emphasis.
      - Use bullet points for multiple thoughts.
      - Keep responses focused and punchy.`,
      config: {
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text || "I'm looking at your current data frame. What stands out to you in the relationship between those two key variables?";
  });
};
