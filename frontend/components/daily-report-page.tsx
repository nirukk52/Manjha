'use client';

import { ArrowLeft } from 'lucide-react';
import { DailyReportCard } from './daily-report-card';

/**
 * Daily Report Page Component
 * Full page view for a specific day's trading report
 */

interface DailyReportPageProps {
  date: Date;
  onBack: () => void;
}

export function DailyReportPage({ date, onBack }: DailyReportPageProps) {
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#d4d4d8] p-8 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 mb-4 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <ArrowLeft className="h-4 w-4 text-[#2d2d2d]" />
              <span className="font-black uppercase tracking-tight text-sm text-[#2d2d2d]">Back to Calendar</span>
            </button>
            <h1 className="text-4xl font-black uppercase tracking-tight text-[#2d2d2d] mb-2">
              Daily Trading Report
            </h1>
            <p className="text-lg text-[#2d2d2d]/60 font-black">{formattedDate}</p>
          </div>

          {/* Date Badge */}
          <div className="bg-[#47632d] border-2 border-black rounded-xl px-6 py-4 shadow-[4px_4px_0px_0px_#000000]">
            <p className="text-xs uppercase tracking-wider font-black text-white/60 mb-1">Trading Day</p>
            <p className="text-3xl font-black text-white">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Daily Report Cards */}
        <DailyReportCard date={date} />

        {/* Additional Context Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Market Context */}
          <div className="bg-[#e8e4f3] border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000000]">
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Market Context</h3>
            <div className="space-y-3">
              <div className="bg-white/60 border border-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-1">Nifty 50</p>
                <p className="font-black text-[#2d2d2d]">22,150 <span className="text-[#5fb369]">+0.8%</span></p>
              </div>
              <div className="bg-white/60 border border-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-1">Bank Nifty</p>
                <p className="font-black text-[#2d2d2d]">47,850 <span className="text-[#e36969]">-0.3%</span></p>
              </div>
              <div className="bg-white/60 border border-black/20 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-1">VIX</p>
                <p className="font-black text-[#2d2d2d]">14.5 <span className="text-[#2d2d2d]/60">~</span></p>
              </div>
            </div>
          </div>

          {/* Journal Notes */}
          <div className="bg-[#f5e6d3] border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000000]">
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Journal Notes</h3>
            <div className="bg-white/60 border border-black/20 rounded-lg p-4">
              <p className="text-sm text-[#2d2d2d]/80 leading-relaxed">
                Market showed strong momentum in tech sector. Waited patiently for pullback entries. 
                Managed risk well on the TSLA short when momentum didn't break. 
                Overall disciplined day with solid execution.
              </p>
            </div>
          </div>

          {/* Key Learnings */}
          <div className="bg-[#fce8e6] border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_#000000]">
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Key Learnings</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 bg-white/60 border border-black/20 rounded-lg p-3">
                <span className="text-lg">✓</span>
                <span className="text-sm text-[#2d2d2d]/80">Patience on entries paid off</span>
              </li>
              <li className="flex items-start gap-2 bg-white/60 border border-black/20 rounded-lg p-3">
                <span className="text-lg">✓</span>
                <span className="text-sm text-[#2d2d2d]/80">Stop loss discipline saved capital</span>
              </li>
              <li className="flex items-start gap-2 bg-white/60 border border-black/20 rounded-lg p-3">
                <span className="text-lg">✓</span>
                <span className="text-sm text-[#2d2d2d]/80">Scaled out properly on winners</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

