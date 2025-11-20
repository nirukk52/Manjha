/**
 * Type definitions for Manjha Trading Journal application
 * These types provide structure for the chat-driven trading journal features
 */

/** Represents a message in the chat conversation */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/** Represents an item pinned to the dashboard */
export interface PinnedItem {
  id: string;
  type: 'chart' | 'mental-model';
  title: string;
  chartType?: string;
  data?: any;
  timestamp: Date;
}

/** Represents a single trade entry */
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

/** Represents overall portfolio data and metrics */
export interface PortfolioData {
  totalPnL: number;
  winRate: number;
  trades: Trade[];
  sectors: { name: string; exposure: number; pnl: number }[];
}

