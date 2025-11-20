/**
 * Response Generator
 * Simulates AI responses for the trading journal chat interface
 * In production, this would connect to a real AI/LLM backend
 */

/** Generates a simulated response based on the user's question */
export function generateResponse(question: string) {
  // Normalize the question for pattern matching
  const q = question.toLowerCase();

  // Detect question type and generate appropriate response
  if (q.includes('p&l') || q.includes('pnl') || q.includes('profit') || q.includes('loss')) {
    return {
      answer: "Your P&L is negative this month primarily due to impulsive trades. You've taken 35 impulsive trades with only a 29% win rate, compared to 65 planned trades with a 69% win rate. The biggest impact came from holding losing positions too long, especially in the tech sector where you averaged $320 losses per trade.",
      chartType: 'Planned vs Impulsive Win Rate',
      chartData: [
        { name: 'Planned', winRate: 69, lossRate: 23, breakEven: 8 },
        { name: 'Impulsive', winRate: 29, lossRate: 57, breakEven: 14 }
      ],
      mentalModel: {
        nodes: [
          { id: '1', label: 'See Market Movement', type: 'trigger' },
          { id: '2', label: 'Feel FOMO', type: 'emotion' },
          { id: '3', label: 'Skip Plan Check', type: 'behavior' },
          { id: '4', label: 'Enter Trade', type: 'action' },
          { id: '5', label: 'Loss Occurs', type: 'outcome' }
        ],
        edges: [
          { from: '1', to: '2', label: 'triggers' },
          { from: '2', to: '3', label: 'causes' },
          { from: '3', to: '4', label: 'leads to' },
          { from: '4', to: '5', label: 'results in' }
        ]
      }
    };
  }

  if (q.includes('win rate') || q.includes('sector')) {
    return {
      answer: "Your win rate varies significantly by sector. Tech sector shows a 72% win rate with your best performance, Finance at 58%, Healthcare at 45%, and Energy at 38%. Consider focusing more capital on Tech where you have demonstrated edge.",
      chartType: 'Win Rate by Sector',
      chartData: [
        { name: 'Tech', winRate: 72, trades: 45 },
        { name: 'Finance', winRate: 58, trades: 32 },
        { name: 'Healthcare', winRate: 45, trades: 28 },
        { name: 'Energy', winRate: 38, trades: 18 }
      ],
      mentalModel: {
        nodes: [
          { id: '1', label: 'Tech Sector', type: 'focus' },
          { id: '2', label: '72% Win Rate', type: 'metric' },
          { id: '3', label: 'Strong Edge', type: 'insight' },
          { id: '4', label: 'Increase Allocation', type: 'action' }
        ],
        edges: [
          { from: '1', to: '2', label: 'shows' },
          { from: '2', to: '3', label: 'indicates' },
          { from: '3', to: '4', label: 'suggests' }
        ]
      }
    };
  }

  if (q.includes('losing streak') || q.includes('biggest loss')) {
    return {
      answer: "Your biggest losing streak was 5 consecutive trades in early February, totaling -$1,847. This occurred during high volatility periods when you deviated from your stop-loss discipline. Pattern shows you held losers 40% longer than your plan specified.",
      chartType: 'Losing Streak Analysis',
      chartData: [
        { date: 'Feb 4', pnl: -280 },
        { date: 'Feb 5', pnl: -450 },
        { date: 'Feb 6', pnl: -327 },
        { date: 'Feb 7', pnl: -390 },
        { date: 'Feb 8', pnl: -400 }
      ],
      mentalModel: {
        nodes: [
          { id: '1', label: 'Losing Trade', type: 'trigger' },
          { id: '2', label: 'Hope It Recovers', type: 'emotion' },
          { id: '3', label: 'Hold Past Stop', type: 'behavior' },
          { id: '4', label: 'Bigger Loss', type: 'outcome' },
          { id: '5', label: 'Emotional Tilt', type: 'state' }
        ],
        edges: [
          { from: '1', to: '2', label: 'triggers' },
          { from: '2', to: '3', label: 'causes' },
          { from: '3', to: '4', label: 'results in' },
          { from: '4', to: '5', label: 'leads to' }
        ]
      }
    };
  }

  if (q.includes('overtrading') || q.includes('impulsive')) {
    return {
      answer: "Yes, you're overtrading on impulsive setups. 35% of your trades are impulsive with only a 29% win rate. These trades typically happen during market volatility spikes and cost you an average of $420 per trade. Consider implementing a 'trade approval' checklist before entering.",
      chartType: 'Trade Type Distribution',
      chartData: [
        { type: 'Planned', count: 65, avgPnL: 485 },
        { type: 'Impulsive', count: 35, avgPnL: -420 }
      ],
      mentalModel: {
        nodes: [
          { id: '1', label: 'Market Spike', type: 'trigger' },
          { id: '2', label: 'Excitement', type: 'emotion' },
          { id: '3', label: 'No Checklist', type: 'skip' },
          { id: '4', label: 'Impulsive Entry', type: 'action' },
          { id: '5', label: 'Regret & Loss', type: 'outcome' }
        ],
        edges: [
          { from: '1', to: '2', label: 'causes' },
          { from: '2', to: '3', label: 'leads to' },
          { from: '3', to: '4', label: 'results in' },
          { from: '4', to: '5', label: 'ends with' }
        ]
      }
    };
  }

  if (q.includes('time of day') || q.includes('profitable')) {
    return {
      answer: "You're most profitable during morning sessions (9:30-11:00 AM) with a 68% win rate and average profit of $620 per trade. Afternoon sessions (1:00-4:00 PM) show only 42% win rate with average profit of $180. Focus your active trading on morning sessions.",
      chartType: 'Profitability by Time of Day',
      chartData: [
        { time: '9:30-11:00', winRate: 68, avgProfit: 620 },
        { time: '11:00-1:00', winRate: 52, avgProfit: 340 },
        { time: '1:00-4:00', winRate: 42, avgProfit: 180 }
      ],
      mentalModel: {
        nodes: [
          { id: '1', label: 'Morning Session', type: 'timeframe' },
          { id: '2', label: 'High Win Rate', type: 'metric' },
          { id: '3', label: 'Strong Performance', type: 'insight' },
          { id: '4', label: 'Focus Trading Here', type: 'action' }
        ],
        edges: [
          { from: '1', to: '2', label: 'shows' },
          { from: '2', to: '3', label: 'indicates' },
          { from: '3', to: '4', label: 'suggests' }
        ]
      }
    };
  }

  // Default response
  return {
    answer: "I've analyzed your trading data. Based on your question, I can help you understand patterns in your trading behavior, identify areas for improvement, and suggest actionable changes. Try asking about specific metrics like P&L, win rates, or trading patterns.",
    chartType: 'Monthly Performance Overview',
    chartData: [
      { month: 'Jan', pnl: 2450 },
      { month: 'Feb', pnl: -890 },
      { month: 'Mar', pnl: 3200 }
    ],
    mentalModel: {
      nodes: [
        { id: '1', label: 'Question', type: 'input' },
        { id: '2', label: 'Analyze Data', type: 'process' },
        { id: '3', label: 'Insight', type: 'output' },
        { id: '4', label: 'Action', type: 'outcome' }
      ],
      edges: [
        { from: '1', to: '2', label: 'triggers' },
        { from: '2', to: '3', label: 'generates' },
        { from: '3', to: '4', label: 'suggests' }
      ]
    }
  };
}

