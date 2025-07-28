export interface Turn {
  speaker: 'user' | 'assistant';
  text: string;
  voice: string;
  avatar: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  turns: Turn[];
} 