export type MessageRole = 'user' | 'assistant';

export interface HistoryMessage {
  role: MessageRole;
  content: string;
}

export interface Reference {
  type: 'project' | 'experience' | 'contact';
  id: string;
  label: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  error?: boolean;
  references?: Reference[];
}