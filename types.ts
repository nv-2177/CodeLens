
export enum GeminiModel {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  CHATGPT = 'chatgpt-alias',
  PERPLEXITY = 'perplexity-alias',
  LMARENA = 'lmarena-alias'
}

export type AppMode = 'explain' | 'generate';

export interface DiagramNode {
  id: string;
  label: string;
}

export interface DiagramLink {
  source: string;
  target: string;
  label?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ExplanationResponse {
  code?: string;
  explanation: string;
  analogies: string[];
  workflow: string[];
  diagram: {
    nodes: DiagramNode[];
    links: DiagramLink[];
  };
  followUp: string;
  sources?: GroundingSource[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
