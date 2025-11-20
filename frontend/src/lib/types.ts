// Type definitions for the Chat-Driven Trading Journal application

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PinnedItem {
  id: string;
  type: 'chart' | 'mental-model';
  title: string;
  chartType?: string;
  data?: any;
  timestamp: Date;
}

export interface Trade {
  id: string;
  date: Date;
  symbol: string;
  type: 'long' | 'short';
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  tags: string[];
  notes?: string;
}

export interface PortfolioData {
  totalPnL: number;
  winRate: number;
  trades: Trade[];
  sectors: { name: string; exposure: number; pnl: number }[];
}

export interface ConversationItem {
  type: 'user' | 'assistant';
  content: string;
  output?: any;
  timestamp: Date;
}

