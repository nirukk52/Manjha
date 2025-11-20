'use client';

import { Pin, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Market Sentiment Widget
 * Displays Nifty 50 and Bank Nifty sentiment with key levels
 */

export function MarketSentimentWidget() {
  // Mock data for Nifty 50
  const nifty50 = {
    price: 23847.50,
    change: +142.30,
    changePercent: +0.60,
    sentiment: 'bullish' as 'bullish' | 'bearish' | 'neutral',
    resistance: 24180.50,
    support: 23450.00,
    pivot: 23815.00,
    vwap: 23792.30
  };

  // Mock data for Bank Nifty
  const bankNifty = {
    price: 51234.75,
    change: -186.45,
    changePercent: -0.36,
    sentiment: 'bearish' as 'bullish' | 'bearish' | 'neutral',
    resistance: 52400.00,
    support: 50200.00,
    pivot: 51315.00,
    vwap: 51178.45
  };

  const getSentimentColor = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    if (sentiment === 'bullish') return 'bg-[#c4e1d4]';
    if (sentiment === 'bearish') return 'bg-[#fce8e6]';
    return 'bg-[#f5e6d3]';
  };

  const getSentimentIndicatorColor = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    if (sentiment === 'bullish') return 'bg-[#5fb369]';
    if (sentiment === 'bearish') return 'bg-[#e36969]';
    return 'bg-[#d9b89c]';
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="relative group bg-[#e8e4f3] rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <button
          className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
          title="Pin to chat dashboard"
        >
          <Pin className="h-4 w-4 text-[#2d2d2d]" />
        </button>

        <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-6">Market Sentiment</h3>

        {/* Grid background effect */}
        <div className="absolute inset-6 opacity-5 pointer-events-none">
          <div className="grid grid-cols-12 grid-rows-8 h-full gap-3">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="border border-[#2d2d2d]/30"></div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-6">
          {/* NIFTY 50 Card */}
          <div className={`${getSentimentColor(nifty50.sentiment)} border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000000]`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">Nifty 50</h4>
                <p className="text-2xl font-black text-[#2d2d2d]">
                  {nifty50.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 mt-1 ${nifty50.change >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}`}>
                  {nifty50.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-xs font-black">
                    {nifty50.change >= 0 ? '+' : ''}{nifty50.change.toFixed(2)} ({nifty50.changePercent >= 0 ? '+' : ''}{nifty50.changePercent}%)
                  </span>
                </div>
              </div>

              {/* Sentiment Indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className={`${getSentimentIndicatorColor(nifty50.sentiment)} border-2 border-black rounded-full p-3 shadow-[3px_3px_0px_0px_#000000]`}>
                  {nifty50.sentiment === 'bullish' ? (
                    <ArrowUp className="h-6 w-6 text-white" strokeWidth={3} />
                  ) : nifty50.sentiment === 'bearish' ? (
                    <ArrowDown className="h-6 w-6 text-white" strokeWidth={3} />
                  ) : (
                    <div className="h-6 w-6 flex items-center justify-center text-white font-black">—</div>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]">
                  {nifty50.sentiment}
                </span>
              </div>
            </div>

            {/* Key Levels */}
            <div className="space-y-2">
              <div className="bg-white/80 border-2 border-black rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Support & Resistance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] text-[#e36969] block mb-0.5 uppercase font-black">Resistance</span>
                    <span className="text-sm font-black text-[#2d2d2d]">{nifty50.resistance.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#5fb369] block mb-0.5 uppercase font-black">Support</span>
                    <span className="text-sm font-black text-[#2d2d2d]">{nifty50.support.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/60 border border-black/40 rounded-lg p-2">
                  <span className="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-black">Pivot</span>
                  <span className="text-xs font-black text-[#2d2d2d]">{nifty50.pivot.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white/60 border border-black/40 rounded-lg p-2">
                  <span className="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-black">VWAP</span>
                  <span className="text-xs font-black text-[#2d2d2d]">{nifty50.vwap.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Current Sentiment Status */}
            <div className="mt-3 bg-white border-2 border-black rounded-lg p-3">
              <p className="text-xs text-[#2d2d2d]/80 leading-relaxed">
                <span className="font-black">Market View:</span> Price trading above VWAP with strong momentum. Watch for resistance test at {nifty50.resistance.toLocaleString('en-IN')}.
              </p>
            </div>
          </div>

          {/* BANK NIFTY Card */}
          <div className={`${getSentimentColor(bankNifty.sentiment)} border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000000]`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">Bank Nifty</h4>
                <p className="text-2xl font-black text-[#2d2d2d]">
                  {bankNifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 mt-1 ${bankNifty.change >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}`}>
                  {bankNifty.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-xs font-black">
                    {bankNifty.change >= 0 ? '+' : ''}{bankNifty.change.toFixed(2)} ({bankNifty.changePercent >= 0 ? '+' : ''}{bankNifty.changePercent}%)
                  </span>
                </div>
              </div>

              {/* Sentiment Indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className={`${getSentimentIndicatorColor(bankNifty.sentiment)} border-2 border-black rounded-full p-3 shadow-[3px_3px_0px_0px_#000000]`}>
                  {bankNifty.sentiment === 'bullish' ? (
                    <ArrowUp className="h-6 w-6 text-white" strokeWidth={3} />
                  ) : bankNifty.sentiment === 'bearish' ? (
                    <ArrowDown className="h-6 w-6 text-white" strokeWidth={3} />
                  ) : (
                    <div className="h-6 w-6 flex items-center justify-center text-white font-black">—</div>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]">
                  {bankNifty.sentiment}
                </span>
              </div>
            </div>

            {/* Key Levels */}
            <div className="space-y-2">
              <div className="bg-white/80 border-2 border-black rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Support & Resistance</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] text-[#e36969] block mb-0.5 uppercase font-black">Resistance</span>
                    <span className="text-sm font-black text-[#2d2d2d]">{bankNifty.resistance.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#5fb369] block mb-0.5 uppercase font-black">Support</span>
                    <span className="text-sm font-black text-[#2d2d2d]">{bankNifty.support.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/60 border border-black/40 rounded-lg p-2">
                  <span className="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-black">Pivot</span>
                  <span className="text-xs font-black text-[#2d2d2d]">{bankNifty.pivot.toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-white/60 border border-black/40 rounded-lg p-2">
                  <span className="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-black">VWAP</span>
                  <span className="text-xs font-black text-[#2d2d2d]">{bankNifty.vwap.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Current Sentiment Status */}
            <div className="mt-3 bg-white border-2 border-black rounded-lg p-3">
              <p className="text-xs text-[#2d2d2d]/80 leading-relaxed">
                <span className="font-black">Market View:</span> Facing resistance near current levels. Support zone at {bankNifty.support.toLocaleString('en-IN')} remains critical.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

