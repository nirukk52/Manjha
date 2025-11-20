'use client';

import { Pin, TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertCircle, ThumbsUp, Target, Shield } from 'lucide-react';

/**
 * Daily Report Card Component
 * Displays detailed daily trading report with equity and options data
 */

interface DailyReportCardProps {
  date: Date;
}

export function DailyReportCard({ date }: DailyReportCardProps) {
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Mock data for EQUITY trading
  const equityData = {
    date: formattedDate,
    trades: [
      { symbol: 'AAPL', type: 'LONG', pnl: +450, size: 50, entry: 185.20, exit: 187.50 },
      { symbol: 'TSLA', type: 'SHORT', pnl: -280, size: 30, entry: 242.50, exit: 245.30 },
      { symbol: 'NVDA', type: 'LONG', pnl: +920, size: 20, entry: 495.00, exit: 501.20 }
    ],
    totalPnl: 1090,
    totalRisk: 1250,
    riskPercent: 0.98,
    entryQuality: 'Good',
    exitQuality: 'Excellent',
    emotions: ['Disciplined', 'Patient'],
    rulesFollowed: 7,
    rulesTotal: 8,
    marketCondition: 'Trending',
    outcomes: ['Win Rate: 67%', 'Followed Plan', 'Good Risk Management']
  };

  // Mock data for OPTIONS trading
  const optionsData = {
    date: formattedDate,
    trades: [
      { symbol: 'SPY 500C', type: 'CALL', pnl: +680, size: 5, entry: 3.20, exit: 4.45 },
      { symbol: 'QQQ 395P', type: 'PUT', pnl: +320, size: 3, entry: 2.10, exit: 3.15 },
      { symbol: 'AAPL 190C', type: 'CALL', pnl: -150, size: 2, entry: 1.80, exit: 1.05 }
    ],
    totalPnl: 850,
    totalRisk: 890,
    riskPercent: 0.70,
    entryQuality: 'Excellent',
    exitQuality: 'Good',
    emotions: ['Focused', 'Calculated'],
    rulesFollowed: 6,
    rulesTotal: 8,
    marketCondition: 'Volatile',
    outcomes: ['Win Rate: 67%', 'Risk Managed', 'Took Profits Early']
  };

  const getQualityColor = (quality: string) => {
    if (quality === 'Excellent' || quality === 'Good') return 'bg-[#c4e1d4]';
    if (quality === 'Fair') return 'bg-[#f5e6d3]';
    return 'bg-[#fce8e6]';
  };

  const getQualityIcon = (quality: string) => {
    if (quality === 'Excellent' || quality === 'Good') return <CheckCircle2 className="h-4 w-4 text-[#5fb369]" />;
    if (quality === 'Fair') return <AlertCircle className="h-4 w-4 text-[#d9b89c]" />;
    return <XCircle className="h-4 w-4 text-[#e36969]" />;
  };

  const ReportCard = ({ data, title, bgColor }: { data: typeof equityData; title: string; bgColor: string }) => (
    <div className={`relative group ${bgColor} rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]`}>
      <button
        className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
        title="Pin to chat dashboard"
      >
        <Pin className="h-4 w-4 text-[#2d2d2d]" />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">{title}</h3>
          <p className="text-xs text-[#2d2d2d]/60">{data.date}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-1">Total P&L</p>
          <p className={`text-3xl font-black ${data.totalPnl >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}`}>
            ${data.totalPnl >= 0 ? '+' : ''}{data.totalPnl}
          </p>
        </div>
      </div>

      {/* Grid background effect */}
      <div className="absolute inset-6 opacity-5 pointer-events-none">
        <div className="grid grid-cols-16 grid-rows-10 h-full gap-2">
          {Array.from({ length: 160 }).map((_, i) => (
            <div key={i} className="border border-[#2d2d2d]/30"></div>
          ))}
        </div>
      </div>

      <div className="relative space-y-4">
        {/* Trades Section */}
        <div className="bg-[#e8e4f3] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
          <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Trades ({data.trades.length})</p>
          <div className="space-y-2">
            {data.trades.map((trade, i) => (
              <div key={i} className="bg-white/80 border border-black/30 rounded-lg px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#2d2d2d]">{trade.symbol}</span>
                  <span className="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]/60 bg-[#f5f5f5] border border-black/20 rounded px-2 py-0.5">
                    {trade.type}
                  </span>
                  <span className="text-xs text-[#2d2d2d]/60">
                    {trade.size} @ ${trade.entry} → ${trade.exit}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {trade.pnl >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-[#5fb369]" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-[#e36969]" />
                  )}
                  <span className={`font-black ${trade.pnl >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}`}>
                    ${trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Position Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#fce8e6] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-[#2d2d2d]/60" />
              <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Total Risk</p>
            </div>
            <p className="text-2xl font-black text-[#e36969]">${data.totalRisk}</p>
            <p className="text-xs text-[#2d2d2d]/60 mt-1">{data.riskPercent}% of portfolio</p>
          </div>

          <div className="bg-[#d9e8f5] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-[#2d2d2d]/60" />
              <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Avg Position</p>
            </div>
            <p className="text-2xl font-black text-[#2d2d2d]">
              {Math.round(data.trades.reduce((sum, t) => sum + t.size, 0) / data.trades.length)} {title === 'Equity Report' ? 'shares' : 'contracts'}
            </p>
            <p className="text-xs text-[#2d2d2d]/60 mt-1">Per trade</p>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`${getQualityColor(data.entryQuality)} border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Entry Quality</p>
              {getQualityIcon(data.entryQuality)}
            </div>
            <p className="text-xl font-black text-[#2d2d2d]">{data.entryQuality}</p>
          </div>

          <div className={`${getQualityColor(data.exitQuality)} border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Exit Quality</p>
              {getQualityIcon(data.exitQuality)}
            </div>
            <p className="text-xl font-black text-[#2d2d2d]">{data.exitQuality}</p>
          </div>
        </div>

        {/* Emotions & Rules */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#f5e6d3] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Emotions</p>
            <div className="flex flex-wrap gap-2">
              {data.emotions.map((emotion, i) => (
                <span key={i} className="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-black text-[#2d2d2d]">
                  {emotion}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#c4e1d4] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Rules Followed</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-[#2d2d2d]">{data.rulesFollowed}</p>
              <p className="text-xl font-black text-[#2d2d2d]/60 mb-0.5">/ {data.rulesTotal}</p>
            </div>
            <div className="mt-2 bg-white/60 rounded-full h-2 border border-black/30">
              <div 
                className="h-full bg-[#5fb369] rounded-full border-r border-black/30"
                style={{ width: `${(data.rulesFollowed / data.rulesTotal) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Market Condition & Outcomes */}
        <div className="space-y-3">
          <div className="bg-[#e5d4f5] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Market Condition</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5fb369] border border-black animate-pulse"></div>
              <span className="font-black text-[#2d2d2d]">{data.marketCondition}</span>
            </div>
          </div>

          <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Final Outcomes</p>
            <div className="flex flex-wrap gap-2">
              {data.outcomes.map((outcome, i) => (
                <span key={i} className="bg-[#5fb369]/20 border border-[#5fb369] rounded-lg px-3 py-1.5 text-xs font-black text-[#2d2d2d] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-[#5fb369]" />
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="bg-[#47632d] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
          <div className="flex items-start gap-2">
            <ThumbsUp className="h-5 w-5 text-white/90 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider font-black text-white/90 mb-1">Daily Grade</p>
              <p className="text-sm text-white/80 leading-relaxed">
                {title === 'Equity Report' 
                  ? 'Strong equity performance. Entry execution was precise, risk management within limits, emotions well-controlled.'
                  : 'Excellent options trading today. Good premium capture, volatility well-managed, disciplined position sizing.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-6 max-w-7xl mx-auto">
      <h2 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-6 text-2xl">Daily Report Cards</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity Report Card */}
        <ReportCard data={equityData} title="Equity Report" bgColor="bg-[#f5f0e8]" />
        
        {/* Options Report Card */}
        <ReportCard data={optionsData} title="Options Report" bgColor="bg-[#e8f4f8]" />
      </div>
    </div>
  );
}

