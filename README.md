
# DataForge: The Data Analyst Flight Simulator

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/Powered%20by-Gemini%20API-orange.svg)](https://ai.google.dev/)
[![Data](https://img.shields.io/badge/Engine-Pyodide%20%2B%20SQL.js-green.svg)](https://pyodide.org/)

DataForge is a high-fidelity "flight simulator" designed for junior data analysts. It bridges the gap between theoretical courses and real-world business problems by forging endless, context-rich analytical missions on demand.

![DataForge Hero](https://images.unsplash.com/photo-1551288049-bbda38a5f85d?auto=format&fit=crop&q=80&w=1200)

---

## The Concept

Standard data science projects often rely on static, over-cleaned datasets. DataForge shifts the paradigm:
1.  **On-Demand Forging**: Select an industry (Fintech, SaaS, Logistics, etc.) and difficulty to generate a unique business case.
2.  **Synthetic Relational Data**: Generates 10k+ rows of realistic, messy data with maintained relational integrity.
3.  **In-Browser Execution**: A full Python (Pandas/Matplotlib) and SQL environment running entirely via WebAssembly.
4.  **AI Mentorship**: A Socratic mentor powered by Gemini 3 Flash that guides strategy without providing direct answers.

## The Data Generation Pipeline

DataForge utilizes a sophisticated two-phase "Architect & Fabricator" pipeline to ensure data is both strategically interesting and statistically significant.

### Phase 1: AI Blueprinting (The Architect)
The mission starts with a high-reasoning request to **Gemini 3 Flash**. The AI acts as a Senior Data Architect to:
- **Design the Schema**: Creates table structures appropriate for the sector (e.g., Star Schemas for Retail).
- **Define Semantic Logic**: Establishes how columns relate (FK/PK) and their business meaning.
- **Generate the Seed**: Produces a "Seed" dataset of 20-30 rows containing the core "story" or business insight.

### Phase 2: Deterministic Augmentation (The Fabricator)
To achieve realistic volume (10k - 15k rows) without sacrificing performance or relational integrity, a custom **TypeScript Augmentation Engine** scales the seed data:
- **Weighted Cloner**: Uses the AI seed to replicate patterns while maintaining primary/foreign key constraints.
- **Controlled Entropy**: Algorithmic injection of `NULL` values (3% probability) and numerical outliers (+/- 50% spikes).
- **Statistical Variance**: Applies a Gaussian-like variance (+/- 8%) to all metrics to ensure realistic distributions in histograms.
- **Temporal Shifting**: Dynamically recalculates dates across a wide range to allow for Time-Series analysis.

![Data Analysis Visualization](https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=1200)

## Key Features

### Mission-Driven Onboarding
- **Dynamic Scenario Generation**: Every mission is unique, built from scratch based on user input.
- **Complexity Scaling**: Select from **Beginner** (Flat Files), **Intermediate** (Relational JOINs), or **Advanced** (Star Schema Logic).

### The Analysis Notebook
- **Hybrid Logic Cells**: Write and execute Python or SQL in a unified, state-persistent interface.
- **Intelligent Autocomplete**: Custom CodeMirror 6 extensions providing context-aware suggestions for dataframes and tables.
- **Visual Analytics**: Direct Matplotlib support—charts are rendered as high-resolution PNGs within the cell output.

### Socratic Mentor
- **Context-Aware Guidance**: The AI mentor understands your objectives, current schemas, and the specific code you have executed.
- **No-Spoiler Policy**: Designed to ask the right business questions that nudge intuition rather than providing copy-paste snippets.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **AI Core**: Google Gemini API (`@google/genai`).
- **Data Engines**: 
  - **Pyodide**: Python 3.x runtime in WebAssembly (Pandas, Numpy, Matplotlib).
  - **SQL.js**: SQLite engine for relational query practice.
- **Editor**: CodeMirror 6 (customized for data science).

## Architecture

![Tech Architecture](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200)

DataForge operates on a strictly client-side heavy architecture:
- **State Management**: Persists analytical sessions (code, data, and chat) to `localStorage`.
- **WASM Bridge**: Synchronizes data between the SQL engine and Python environment, allowing cross-language data cleaning and visualization.

## Getting Started

### Prerequisites
- A modern browser with WebAssembly support.
- A Google Gemini API Key (set as `process.env.API_KEY`).

### Development
1. Clone the repository.
2. Open `index.html` via a local development server.
3. The application will automatically load Pyodide and SQL.js from global CDNs.

## License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the next generation of data-driven strategists. Forge your edge.*
