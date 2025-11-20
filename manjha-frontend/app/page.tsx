'use client';

import { useState } from 'react';
import { Landing } from '@/components/landing';
import { PinnedWidgets } from '@/components/pinned-widgets';
import { PinnedItem } from '@/types';

/**
 * Manjha Trading Journal - Main Application Page
 * Chat-driven trading journal with mental models and portfolio analytics
 */

export default function Page() {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);

  const handlePinItem = (item: PinnedItem) => {
    setPinnedItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const handleRemovePin = (id: string) => {
    setPinnedItems(prev => prev.filter(item => item.id !== id));
  };

  if (!showDashboard) {
    return <Landing onEnter={() => setShowDashboard(true)} />;
  }

  return (
    <div className="relative h-screen w-full bg-[#d4d4d8] overflow-hidden">
      {/* Background Graph Grid */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Dashboard Content */}
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-screen p-8 pb-[280px]">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tight text-[#2d2d2d] mb-2">Manjha</h1>
              <p className="text-[#5a5a5a] leading-relaxed max-w-md">
                Chat with your portfolio manager and create{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#2d2d2d]/80 font-bold">mental models</span>
                  <span className="absolute inset-x-0 bottom-0 h-2 bg-[#d4c4e1]/50 -rotate-1"></span>
                </span>
                ,{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#2d2d2d]/80 font-bold">discipline engine</span>
                  <span className="absolute inset-x-0 bottom-0 h-2 bg-[#e5c9c9]/50 rotate-1"></span>
                </span>
                {' '}and{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#2d2d2d]/80 font-bold">knowledge graphs</span>
                  <span className="absolute inset-x-0 bottom-0 h-2 bg-[#d9b89c]/50 -rotate-1"></span>
                </span>
                {' '}for your trading strategies.
              </p>
            </div>
            <button className="relative px-5 py-2.5 text-sm rounded-xl bg-gradient-to-br from-[#387ED1]/20 to-[#2563eb]/20 hover:from-[#387ED1]/30 hover:to-[#2563eb]/30 backdrop-blur-sm border-2 border-[#387ED1]/40 hover:border-[#387ED1]/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <span className="relative text-[#2d2d2d] font-black uppercase tracking-tight">
                Connect Your Zerodha
              </span>
            </button>
          </div>

          {/* Dashboard Grid - Simplified */}
          <div className="grid grid-cols-12 gap-6">
            {/* Portfolio Summary */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="relative bg-[#c4e1d4] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
                <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Portfolio Value</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 block mb-1">Total Value</span>
                    <span className="text-3xl font-black text-[#2d2d2d]">$127,450</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 block mb-1">Today</span>
                      <span className="text-xl font-black text-[#16a34a]">+$2,340</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 block mb-1">MTD</span>
                      <span className="text-xl font-black text-[#16a34a]">+$8,920</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9">
              <div className="relative bg-[#d4c4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
                <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Trade Journal</h3>
                <p className="text-[#5a5a5a]">
                  Ask questions about your trades in the chat below to get insights and analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input - Floating at Bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-6">
        <div className="border-2 border-[#a1a1aa] rounded-[32px] bg-[#fafafa] p-4">
          <div className="relative bg-[#18181b] rounded-2xl p-3 flex items-center gap-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex-1 flex items-center gap-2 bg-[#e5e5e5] rounded-lg px-4 py-3 border-2 border-black">
              <input
                placeholder="Why is my P&L negative this month, and what should I fix?"
                className="flex-1 bg-transparent border-none outline-none text-[#2d2d2d] placeholder:text-[#5a5a5a] font-mono"
              />
            </div>
            <button 
              className="rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-[#e5e5e5] h-12 px-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Widgets Panel */}
      <PinnedWidgets 
        items={pinnedItems}
        onRemoveItem={handleRemovePin}
      />
    </div>
  );
}
