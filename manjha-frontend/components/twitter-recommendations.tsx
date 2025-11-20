'use client';

import { Pin, ExternalLink, Users } from 'lucide-react';

/**
 * Twitter Recommendations Widget
 * Displays recommended trading Twitter accounts to follow
 */

export function TwitterRecommendations() {
  const accounts = [
    {
      id: 1,
      handle: '@wallstjesus',
      name: 'WallStJesus',
      description: 'Day trading education, chart setups, and market psychology',
      followers: '156K',
      category: 'Day Trading',
      categoryColor: '#c4e1d4',
      avatar: '📈'
    },
    {
      id: 2,
      handle: '@alphatrends',
      name: 'Brian Shannon',
      description: 'Technical analysis, risk management, and trading strategies',
      followers: '89K',
      category: 'Technical',
      categoryColor: '#f5e6d3',
      avatar: '📊'
    },
    {
      id: 3,
      handle: '@markminervini',
      name: 'Mark Minervini',
      description: 'SEPA methodology, breakout strategies, champion trader',
      followers: '127K',
      category: 'Swing Trading',
      categoryColor: '#e8e4f3',
      avatar: '🎯'
    },
    {
      id: 4,
      handle: '@traderstewie',
      name: 'Stewie',
      description: 'Options flow, unusual activity, and market sentiment',
      followers: '203K',
      category: 'Options',
      categoryColor: '#fce8e6',
      avatar: '🔥'
    }
  ];

  return (
    <div className="relative group bg-[#d9e8f5] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
      <button
        className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
        title="Pin to chat dashboard"
      >
        <Pin className="h-4 w-4 text-[#2d2d2d]" />
      </button>

      {/* Grid background effect */}
      <div className="absolute inset-5 opacity-5 pointer-events-none">
        <div className="grid grid-cols-10 grid-rows-8 h-full gap-1.5">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="border border-[#2d2d2d]/30"></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1DA1F2] border-2 border-black flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <h3 className="uppercase tracking-wide font-black text-[#2d2d2d]">Trading Twitter</h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]/60">
          Recommended
        </span>
      </div>

      {/* Account Cards */}
      <div className="relative space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white/80 border-2 border-black rounded-lg p-3.5 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-xl"
                style={{ backgroundColor: account.categoryColor }}
              >
                {account.avatar}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Name and Handle */}
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="font-black text-[#2d2d2d] leading-none mb-0.5">
                      {account.name}
                    </p>
                    <p className="text-xs text-[#1DA1F2] font-black">
                      {account.handle}
                    </p>
                  </div>
                  <button
                    className="ml-2 p-1.5 rounded-md bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/20 transition-colors"
                    title="Open in Twitter"
                  >
                    <ExternalLink className="h-3 w-3 text-[#1DA1F2]" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-[#2d2d2d]/70 leading-relaxed mb-2">
                  {account.description}
                </p>

                {/* Footer - Category and Followers */}
                <div className="flex items-center justify-between">
                  <span 
                    className="inline-block text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-full border border-black/30"
                    style={{ backgroundColor: account.categoryColor }}
                  >
                    {account.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#2d2d2d]">
                      {account.followers}
                    </span>
                    <span className="text-[10px] text-[#2d2d2d]/50 font-black">
                      followers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="relative mt-4 pt-4 border-t-2 border-black/20">
        <button className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] border-2 border-black rounded-lg py-2.5 px-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <span className="text-sm font-black uppercase tracking-tight text-white">
            Discover More Traders
          </span>
        </button>
      </div>
    </div>
  );
}

