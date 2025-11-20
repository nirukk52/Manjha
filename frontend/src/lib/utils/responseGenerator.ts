// Utility to generate AI-like responses for the chat interface

export function generateResponse(userInput: string) {
  const lowerInput = userInput.toLowerCase();
  
  // Generate contextual responses based on user input
  let answer = "Based on your portfolio analysis, ";
  let chartType = "bar";
  let chartData = {};
  let mentalModel = {};
  
  if (lowerInput.includes('pnl') || lowerInput.includes('negative')) {
    answer = "Your P&L is negative this month primarily due to three factors: overtrading in the tech sector (-$2,340), poor timing on energy plays (-$1,890), and breaking your stop-loss discipline on AAPL (-$1,200). Your win rate dropped to 42% from your usual 58%.";
    chartType = "line";
    chartData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      values: [1200, -800, -1500, -2100]
    };
  } else if (lowerInput.includes('win rate') || lowerInput.includes('sector')) {
    answer = "Your win rate varies significantly by sector: Tech (65%), Healthcare (58%), Energy (32%), Finance (71%). You're most profitable in Finance, but Energy is dragging down your overall performance.";
    chartType = "bar";
    chartData = {
      labels: ['Tech', 'Healthcare', 'Energy', 'Finance'],
      values: [65, 58, 32, 71]
    };
  } else if (lowerInput.includes('losing') || lowerInput.includes('streak')) {
    answer = "Your biggest losing streak was 7 consecutive trades in October, totaling -$4,500. Pattern: all were revenge trades after initial losses, entered outside your setup criteria, and held too long hoping for reversals.";
    chartType = "line";
  } else if (lowerInput.includes('overtrading') || lowerInput.includes('impulsive')) {
    answer = "You're averaging 23 trades/week vs your planned 12. Impulsive trades (68% of total) have a 38% win rate and -$340 avg P&L. Planned trades have 72% win rate and +$580 avg P&L. Clear pattern: discipline = profits.";
    chartType = "bar";
  } else if (lowerInput.includes('time') || lowerInput.includes('profitable')) {
    answer = "Your most profitable trading window is 10am-11am EST (67% win rate, +$890 avg). Worst is 2pm-3pm (41% win rate, -$230 avg). You're most disciplined in mornings when fresh.";
    chartType = "line";
  } else {
    answer = "I've analyzed your recent trading patterns. Your performance shows room for improvement in risk management and trade selection. Consider focusing on your highest win-rate setups and reducing position sizes during losing streaks.";
  }
  
  // Generate mental model insights
  mentalModel = {
    patterns: [
      "Tends to overtrade after losses",
      "Best performance with 2-3 hour hold times",
      "Breaks discipline in afternoon sessions"
    ],
    strengths: [
      "Strong sector analysis",
      "Excellent at identifying entry points",
      "Disciplined position sizing (when followed)"
    ],
    improvements: [
      "Set hard stop after 2 consecutive losses",
      "No trading after 2pm",
      "Reduce position size by 50% after losing day"
    ]
  };
  
  return {
    answer,
    chartType,
    chartData,
    mentalModel
  };
}

