
# DataForge: The Data Analyst Flight Simulator

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/Powered%20by-Gemini%20API-orange.svg)](https://ai.google.dev/)
[![Data](https://img.shields.io/badge/Engine-Pyodide%20%2B%20SQL.js-green.svg)](https://pyodide.org/)

DataForge is a high-fidelity "flight simulator" designed for junior data analysts. It bridges the gap between theoretical courses and real-world business problems by forging endless, context-rich analytical missions on demand.

<div align="center">
  <svg width="800" height="200" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="200" rx="20" fill="#0f172a"/>
    <path d="M50 100H150M250 100H350M450 100H550M650 100H750" stroke="#1e293b" stroke-width="2" stroke-dasharray="8 8"/>
    <circle cx="200" cy="100" r="40" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="2"/>
    <text x="200" y="105" text-anchor="middle" fill="#3b82f6" font-family="sans-serif" font-weight="bold" font-size="12">AI ARCHITECT</text>
    <rect x="360" y="60" width="80" height="80" rx="10" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
    <text x="400" y="105" text-anchor="middle" fill="#10b981" font-family="sans-serif" font-weight="bold" font-size="12">SCALER</text>
    <circle cx="600" cy="100" r="40" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-width="2"/>
    <text x="600" y="105" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-weight="bold" font-size="12">INSIGHTS</text>
    <path d="M240 100L340 100" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow)"/>
    <path d="M440 100L540 100" stroke="#10b981" stroke-width="2" marker-end="url(#arrow)"/>
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
      </marker>
    </defs>
  </svg>
</div>

---

## The Concept

Standard data science projects often rely on static, over-cleaned datasets. DataForge shifts the paradigm:
1.  **On-Demand Forging**: Select an industry (Fintech, SaaS, Logistics, etc.) and difficulty to generate a unique business case.
2.  **Synthetic Relational Data**: Generates 10k+ rows of realistic, messy data with maintained relational integrity.
3.  **In-Browser Execution**: A full Python (Pandas/Matplotlib) and SQL environment running entirely via WebAssembly.

## The Forge: How Data is Born

DataForge uses a **Hybrid Generation Pipeline** that combines the creative reasoning of Large Language Models with the precision of deterministic algorithms.

### Phase 1: AI Blueprinting (The Architect)
When a mission is triggered, **Gemini 3 Flash** acts as a Senior Data Architect. It doesn't just "write data"; it designs a business ecosystem:
- **Relational Blueprint**: It creates a schema (e.g., Snowflake or Star) specific to the industry.
- **Semantic Mapping**: It assigns business logic to columns (e.g., `churn_rate` must be a float between 0 and 1).
- **The Seed**: It generates 20-30 "perfect" rows. These rows contain the core insights (the "Answer") hidden within the patterns.

### Phase 2: Deterministic Scaling (The Fabricator)
To turn a 30-row blueprint into a 15,000-row dataset, a custom **TypeScript Augmentation Engine** takes over. This ensures the data is "large" enough for real analysis without losing the AI's intended story.

<div align="center">
  <svg width="600" height="250" viewBox="0 0 600 250" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="250" rx="20" fill="#0f172a"/>
    <text x="30" y="40" fill="#94a3b8" font-family="sans-serif" font-weight="bold" font-size="14">FABRICATION LOGIC</text>
    
    <!-- Scaling Illustration -->
    <rect x="50" y="80" width="100" height="20" rx="4" fill="#334155"/>
    <rect x="50" y="110" width="100" height="20" rx="4" fill="#334155"/>
    <rect x="50" y="140" width="100" height="20" rx="4" fill="#3b82f6" fill-opacity="0.5"/>
    <text x="160" y="125" fill="#3b82f6" font-family="sans-serif" font-size="12">x500 Cloning</text>

    <!-- Noise Illustration -->
    <circle cx="350" cy="115" r="30" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="350" y="120" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="10">ENTROPY</text>
    <path d="M380 115H450" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 4"/>
    <text x="460" y="120" fill="#f43f5e" font-family="sans-serif" font-size="12">3% Null Injection</text>
    
    <!-- Variance Illustration -->
    <path d="M50 200C100 200 150 160 200 160C250 160 300 220 350 220" stroke="#10b981" stroke-width="2"/>
    <text x="370" y="200" fill="#10b981" font-family="sans-serif" font-size="12">+/- 8% Variance</text>
  </svg>
</div>

**The scaling process includes:**
- **Weighted Re-sampling**: Clones rows while preserving the statistical distributions of the AI seed.
- **Controlled Entropy**: Randomly injects `null` values and extreme outliers (spikes) to force users to practice data cleaning.
- **Temporal Shifting**: Dynamically recalculates dates so the data feels "fresh" relative to the current simulation time.

## Key Features

### The Analysis Notebook
- **Hybrid Logic Cells**: Write and execute Python or SQL in a unified interface.
- **State Synchronization**: Changes in Python (e.g., creating a new table in Pandas) can be synced back to the SQL engine via a custom WASM bridge.
- **Visual Analytics**: Direct Matplotlib support—charts are rendered as high-resolution PNGs within the cell output.

### Socratic Mentor
- **Context-Aware Guidance**: The AI mentor understands your objectives, current schemas, and the specific code you have executed.
- **No-Spoiler Policy**: It asks questions that nudge your intuition rather than providing direct solutions.

<div align="center">
  <svg width="600" height="150" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="150" rx="20" fill="#1e293b"/>
    <circle cx="60" cy="75" r="30" fill="#3b82f6"/>
    <path d="M50 75H70M60 65V85" stroke="white" stroke-width="3"/>
    <rect x="110" y="50" width="450" height="15" rx="7.5" fill="#334155"/>
    <rect x="110" y="75" width="300" height="15" rx="7.5" fill="#334155"/>
    <text x="115" y="110" fill="#94a3b8" font-family="sans-serif" font-style="italic" font-size="12">"Have you checked for correlation between plan_type and churn_event?"</text>
  </svg>
</div>

## Tech Stack

- **AI Core**: Google Gemini API (`@google/genai`).
- **Data Engines**: 
  - **Pyodide**: Python 3.x runtime in WebAssembly (Pandas, Numpy, Matplotlib).
  - **SQL.js**: SQLite engine for relational query practice.
- **Editor**: CodeMirror 6 with custom autocompletion for dynamic dataframes.

## License
Distributed under the MIT License.

---

*Built for the next generation of data-driven strategists. Forge your edge.*
