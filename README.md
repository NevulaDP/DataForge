
# DataForge: The Data Analyst Flight Simulator

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/Powered%20by-Gemini%20API-orange.svg)](https://ai.google.dev/)
[![Data](https://img.shields.io/badge/Engine-Pyodide%20%2B%20SQL.js-green.svg)](https://pyodide.org/)

DataForge is a high-fidelity "flight simulator" designed for junior data analysts. It bridges the gap between theoretical courses and real-world business problems by forging endless, context-rich analytical missions on demand.

---

## The Concept

Standard data science projects often rely on static, over-cleaned datasets. DataForge shifts the paradigm:
1.  **On-Demand Forging**: Select an industry (Fintech, SaaS, Logistics, etc.) and difficulty to generate a unique business case.
2.  **Synthetic Relational Data**: Generates 10k+ rows of realistic, messy data with maintained relational integrity (Star Schemas, Fact/Dimension tables).
3.  **In-Browser Execution**: A full Python (Pandas/Matplotlib) and SQL environment running entirely via WebAssembly—no backend required.
4.  **AI Mentorship**: A Socratic mentor powered by Gemini 3 Flash that guides strategy without providing direct answers.

## Key Features

### Mission-Driven Onboarding
- **Dynamic Scenario Generation**: Leverages `gemini-3-flash-preview` to build unique business cases, organization names, and strategic objectives.
- **Complexity Scaling**: Select from Beginner (Flat Files), Intermediate (Relational JOINs), or Advanced (Star Schema Logic).

### The Analysis Notebook
- **Hybrid Logic Cells**: Write and execute Python or SQL in a unified, state-persistent interface.
- **Intelligent Autocomplete**: Custom CodeMirror 6 extensions providing context-aware suggestions for dataframes and tables.
- **Visual Analytics**: Direct Matplotlib support—charts are rendered as high-resolution PNGs within the cell output.

### Dataset Explorer
- **Live Schema Registry**: Instant access to data dictionaries and column descriptions.
- **Real-time Previews**: Inspect the first rows of forged tables to understand distributions and types before analysis.

### Socratic Mentor
- **Context-Aware Guidance**: The AI mentor understands your objectives, current schemas, and the specific code you have executed.
- **No-Spoiler Policy**: Designed to ask the right business questions that nudge intuition rather than providing copy-paste snippets.

### Strategic Reporting
- **Markdown Export**: Generate professional analysis reports including narratives, code logic, and visual results in a single click.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **AI Core**: Google Gemini API (`@google/genai`).
- **Data Engines**: 
  - **Pyodide**: Python 3.x runtime in WebAssembly (Pandas, Numpy, Matplotlib).
  - **SQL.js**: SQLite engine for relational query practice.
- **Editor**: CodeMirror 6 (customized for data science).

## Architecture

DataForge operates on a strictly client-side heavy architecture:
- **State Management**: Persists analytical sessions (code, data, and chat) to `localStorage`.
- **WASM Bridge**: Synchronizes data between the SQL engine and Python environment, allowing cross-language data cleaning and visualization.
- **Prompt Engineering**: Uses sophisticated system instructions to ensure Gemini produces valid relational schemas for data augmentation.

## Getting Started

### Prerequisites
- A modern browser with WebAssembly support.
- A Google Gemini API Key (set as `process.env.API_KEY`).

### Development
1. Clone the repository.
2. Open `index.html` via a local development server (e.g., Vite or Live Server).
3. The application will automatically load Pyodide and SQL.js from global CDNs.

## License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the next generation of data-driven strategists. Forge your edge.*
