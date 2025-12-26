
export type Industry = string;

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface Scenario {
  id: string;
  companyName: string;
  industry: Industry;
  problemStatement: string;
  objectives: Objective[];
  schema: DataColumn[];
  sampleData: Record<string, any>[];
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
    summary?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionState {
  industry: Industry | null;
  scenario: Scenario | null;
  blocks: NotebookBlock[];
  mentorMessages: ChatMessage[];
  theme: 'light' | 'dark';
}
