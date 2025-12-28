
# ⚒️ DataForge: The Data Analyst Flight Simulator

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/Powered%20by-Gemini%20API-orange.svg)](https://ai.google.dev/)
[![Data](https://img.shields.io/badge/Engine-Pyodide%20%2B%20SQL.js-green.svg)](https://pyodide.org/)

**DataForge** is a high-fidelity "flight simulator" designed for junior data analysts. It bridges the gap between theoretical courses and real-world messy business problems by forging endless, context-rich analytical missions on demand.

---

## 🚀 The Concept

Most data science projects use static datasets (Titanic, Iris, etc.). **DataForge** changes the game:
1.  **On-Demand Forging**: Choose an industry (Fintech, SaaS, Logistics, etc.) and difficulty.
2.  **Synthetic Relational Data**: Generates 10k+ rows of realistic, messy data with relational integrity (Star Schemas, Fact/Dimension tables).
3.  **In-Browser Execution**: A full Python (Pandas/Matplotlib) and SQL environment running entirely in your browser—no backend required.
4.  **AI Mentorship**: A Socratic mentor powered by Gemini 3 Pro that guides your strategy without giving you the answers.

## ✨ Key Features

### 🏛️ Mission-Driven Onboarding
- **Dynamic Scenario Generation**: Leverages `gemini-3-flash-preview` to build unique business cases, organization names, and strategic objectives.
- **Complexity Scaling**: Select from Beginner (Flat Files), Intermediate (Relational JOINs), or Advanced (Star Schema Logic).

### 📓 The Analysis Notebook
- **Hybrid Logic Cells**: Write and execute Python or SQL in a unified interface.
- **Intelligent Autocomplete**: Custom CodeMirror 6 extensions providing context-aware suggestions for your dataframes and tables.
- **Visual Analytics**: Direct Matplotlib support—charts are rendered as high-resolution PNGs right in the cell output.

### 🔍 Dataset Explorer
- **Live Schema Registry**: Instant access to data dictionaries and column descriptions.
- **Real-time Previews**: Inspect the first rows of your forged tables to understand data types and distributions before writing a single line of code.

### 🧠 Socratic Mentor
- **Context-Aware Guidance**: The AI "Senior Mentor" knows your objectives, your table schemas, and the code you've already written.
- **No-Spoiler Policy**: It won't give you code snippets. Instead, it asks the right business questions to nudge your intuition forward.

### 📊 Strategic Reporting
- **Markdown Export**: One-click generation of a professional analysis report, including your narrative, selected code blocks, and visual results.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **AI Core**: Google Gemini API (`@google/genai`).
- **Data Engines**: 
  - **Pyodide**: Python 3.x runtime in WebAssembly (Pandas, Numpy, Matplotlib).
  - **SQL.js**: SQLite engine for relational query practice.
- **Editor**: CodeMirror 6 (highly customized for data science).

## 🏗️ Architecture

DataForge operates on a strictly **Client-Side Heavy** architecture:
- **State Management**: Persists entire analytical sessions (code, data, and chat) to `localStorage`.
- **WASM Bridge**: Synchronizes data between the SQL engine and the Python environment, allowing you to clean data in SQL and visualize it in Python seamlessly.
- **Prompt Engineering**: Uses sophisticated system instructions to ensure Gemini produces valid JSON schemas for data augmentation.

## 🚦 Getting Started

### Prerequisites
- A modern browser with WebAssembly support.
- A Google Gemini API Key (set as `process.env.API_KEY`).

### Development
1. Clone the repository.
2. Open `index.html` via a local development server (like Vite or Live Server).
3. The app will automatically load Pyodide and SQL.js from global CDNs.

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the next generation of data-driven strategists. Forge your edge.*
