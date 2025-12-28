
export type Industry = string;
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface DataColumn {
  name: string;
  type: 'string' | 'float' | 'integer' | 'date' | 'boolean';
  description?: string;
  isPk?: boolean;
}

export interface DataTable {
  name: string;
  schema: DataColumn[];
  data: Record<string, any>[];
  isFactTable?: boolean; // Used to identify which table to scale to 10k+ rows
}

export interface Scenario {
  id: string;
  companyName: string;
  industry: Industry;
  difficulty: Difficulty;
  problemStatement: string;
  objectives: Objective[];
  tables: DataTable[];
}

export interface Objective {
  id: string;
  task: string;
  completed: boolean;
}

export type BlockType = 'text' | 'code';

export interface NotebookBlock {
  id: string;
  type: BlockType;
  content: string;
  language?: 'python' | 'sql';
  output?: {
    type: 'table' | 'chart' | 'text' | 'error';
    data: any;
    logs?: string;
    summary?: string;
  };
  includeCodeInReport?: boolean;
  includeOutputInReport?: boolean;
  includeInReport?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionState {
  industry: Industry | null;
  difficulty: Difficulty | null;
  scenario: Scenario | null;
  blocks: NotebookBlock[];
  mentorMessages: ChatMessage[];
  theme: 'light' | 'dark';
}
