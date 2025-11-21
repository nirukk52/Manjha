'use client';

import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

/**
 * JournalLayer Component
 * Displays trading journal with calendar, trade entries, and behavioral insights
 * From Figma Chat-Driven Trading Journal design
 */

export function JournalLayer() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock trade data for the selected date
  const tradesForDate = [
    {
      id: '1',
      symbol: 'AAPL',
      type: 'long' as const,
      pnl: 450,
      entry: 185.20,
      exit: 187.50,
      notes: 'Clean breakout above resistance, followed plan'
    },
    {
      id: '2',
      symbol: 'TSLA',
      type: 'short' as const,
      pnl: -280,
      entry: 242.50,
      exit: 245.30,
      notes: 'Stopped out, market momentum too strong'
    },
    {
      id: '3',
      symbol: 'NVDA',
      type: 'long' as const,
      pnl: 920,
      entry: 495.00,
      exit: 501.20,
      notes: 'Perfect entry on pullback, scaled out at target'
    }
  ];

  const dailyPnL = tradesForDate.reduce((sum, trade) => sum + trade.pnl, 0);

  return (
    <div className="h-full p-8 flex gap-8">
      {/* Calendar Section */}
      <div className="bg-card/90 border border-border rounded-lg p-6 backdrop-blur-sm shadow-lg">
        <h3 className="text-foreground mb-4">Trading Calendar</h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-0"
        />

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Daily P&L</span>
            <span className={`${dailyPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trades</span>
            <span className="text-foreground">{tradesForDate.length}</span>
          </div>
        </div>
      </div>

      {/* Trade Journal */}
      <div className="flex-1 bg-card/90 border border-border rounded-lg p-6 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-foreground">Trade Journal</h3>
            <p className="text-sm text-muted-foreground">
              {date?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${dailyPnL >= 0 ? 'bg-primary/20 border border-primary/50' : 'bg-destructive/20 border border-destructive/50'}`}>
            <p className="text-sm text-muted-foreground">Daily P&L</p>
            <p className={`${dailyPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(2)}
            </p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          <div className="space-y-4">
            {tradesForDate.map((trade) => (
              <div key={trade.id} className="bg-muted border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-foreground">{trade.symbol}</h4>
                    <Badge variant={trade.type === 'long' ? 'default' : 'secondary'} className="text-xs bg-primary/20 text-primary border-primary/30">
                      {trade.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {trade.pnl >= 0 ? (
                      <TrendingUp className="size-4 text-primary" />
                    ) : (
                      <TrendingDown className="size-4 text-destructive" />
                    )}
                    <span className={`${trade.pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      ${trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entry: </span>
                    <span className="text-foreground">${trade.entry}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Exit: </span>
                    <span className="text-foreground">${trade.exit}</span>
                  </div>
                </div>

                <div className="bg-card rounded p-3 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground/80">{trade.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Behavioral Insights */}
      <div className="w-80 bg-card/90 border border-border rounded-lg p-6 backdrop-blur-sm shadow-lg">
        <h3 className="text-foreground mb-4">Behavioral Insights</h3>
        
        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-sm text-primary mb-2">Strength</p>
            <p className="text-sm text-foreground/80">Following your trading plan with discipline</p>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            <p className="text-sm text-accent-foreground mb-2">Watch Out</p>
            <p className="text-sm text-foreground/80">Holding losers too long - consider tighter stops</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary mb-2">Pattern</p>
            <p className="text-sm text-foreground/80">Best performance in morning sessions (9:30-11:00)</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-foreground text-sm mb-3">This Week</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Win Rate</span>
              <span className="text-foreground">64%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Win</span>
              <span className="text-primary">$685</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Loss</span>
              <span className="text-destructive">$320</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit Factor</span>
              <span className="text-foreground">2.14</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

