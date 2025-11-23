'use client';

import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Pin, ChevronLeft, ChevronRight, Activity, Wallet, BookOpen, BarChart3, ChevronDown, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MarketSentimentWidget } from './market-sentiment-widget';
import { NewsFeedWidget } from './news-feed-widget';
import { TwitterRecommendations } from './twitter-recommendations';
import { WatchingSection } from './watching-section';
import { ZerodhaConnectionWidget } from './zerodha-connection-widget';
import { ZerodhaBalanceWidget } from './zerodha-balance-widget';

/**
 * Gets or creates a persistent device ID for tracking user sessions
 */
function getDeviceId(): string {
  const STORAGE_KEY = 'manjha_device_id';
  
  if (typeof window === 'undefined') return 'server';
  
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate unique ID: timestamp + random + browser fingerprint
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const browserFingerprint = navigator.userAgent.length.toString(36);
    deviceId = `device_${timestamp}${random}${browserFingerprint}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Widget Dashboard Component
 * Main dashboard with portfolio, journal, insights, and watching sections
 */

interface WidgetDashboardProps {
  onDateClick: (date: Date) => void;
}

export function WidgetDashboard({ onDateClick }: WidgetDashboardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mobileActiveSection, setMobileActiveSection] = useState<'portfolio' | 'journal' | 'insights' | 'watching'>('portfolio');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    setUserId(getDeviceId());
  }, []);

  // Pie chart data - Portfolio allocation
  const portfolioData = [
    { name: 'Tech', value: 35, color: '#47632d' },
    { name: 'Finance', value: 25, color: '#895727' },
    { name: 'Healthcare', value: 20, color: '#a12d1a' },
    { name: 'Energy', value: 12, color: '#492f13' },
    { name: 'Other', value: 8, color: '#30341d' }
  ];

  // Mock trade data for the selected date
  const tradesForDate = [
    {
      id: '1',
      symbol: 'AAPL',
      type: 'long',
      pnl: 450,
      entry: 185.20,
      exit: 187.50,
      notes: 'Clean breakout above resistance, followed plan'
    },
    {
      id: '2',
      symbol: 'TSLA',
      type: 'short',
      pnl: -280,
      entry: 242.50,
      exit: 245.30,
      notes: 'Stopped out, market momentum too strong'
    },
    {
      id: '3',
      symbol: 'NVDA',
      type: 'long',
      pnl: 920,
      entry: 495.00,
      exit: 501.20,
      notes: 'Perfect entry on pullback, scaled out at target'
    }
  ];

  // Mock calendar data for February 2025
  const calendarData: { [key: number]: { pnl: number; trades: number } } = {
    1: { pnl: 71.32, trades: 1 },
    2: { pnl: 0, trades: 0 },
    3: { pnl: 19.22, trades: 2 },
    4: { pnl: 89.35, trades: 1 },
    5: { pnl: 0, trades: 0 },
    6: { pnl: -932.10, trades: 1 },
    7: { pnl: 0, trades: 0 },
    8: { pnl: 0, trades: 0 },
    9: { pnl: 298.32, trades: 1 },
    10: { pnl: -193.12, trades: 1 },
    11: { pnl: 0, trades: 0 },
    12: { pnl: 0, trades: 0 },
    13: { pnl: 50.00, trades: 1 },
    14: { pnl: 250.58, trades: 1 },
    15: { pnl: -112.74, trades: 1 },
    16: { pnl: 0, trades: 0 },
    17: { pnl: 23.91, trades: 2 },
    18: { pnl: 0, trades: 0 },
    19: { pnl: 0, trades: 0 },
    20: { pnl: 0, trades: 1 },
    21: { pnl: 238.81, trades: 2 },
    22: { pnl: -190.23, trades: 1 },
    23: { pnl: 289.00, trades: 1 },
    24: { pnl: 0, trades: 0 },
    25: { pnl: 0, trades: 0 },
    26: { pnl: 0, trades: 0 },
    27: { pnl: 0, trades: 0 },
    28: { pnl: 0, trades: 0 },
  };

  // Generate calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen p-8 pb-[280px]">
      {/* Header Text */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tight text-[#2d2d2d] mb-2">Manjha</h1>
          <p className="text-[#5a5a5a] leading-relaxed max-w-md">
            Chat with your portfolio manager and create{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#2d2d2d]/80 font-black">mental models</span>
              <span className="absolute inset-x-0 bottom-0 h-2 bg-[#d4c4e1]/50 -rotate-1"></span>
            </span>
            ,{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#2d2d2d]/80 font-black">discipline engine</span>
              <span className="absolute inset-x-0 bottom-0 h-2 bg-[#e5c9c9]/50 rotate-1"></span>
            </span>
            {' '}and{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#2d2d2d]/80 font-black">knowledge graphs</span>
              <span className="absolute inset-x-0 bottom-0 h-2 bg-[#d9b89c]/50 -rotate-1"></span>
            </span>
            {' '}for your trading strategies.
          </p>
        </div>
        <button className="relative px-5 py-2.5 text-sm rounded-xl bg-gradient-to-br from-[#387ED1]/20 to-[#2563eb]/20 hover:from-[#387ED1]/30 hover:to-[#2563eb]/30 backdrop-blur-sm border-2 border-[#387ED1]/40 hover:border-[#387ED1]/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <span className="relative text-[#2d2d2d] font-black uppercase tracking-tight">
            Connect Your Account
          </span>
        </button>
      </div>

      {/* Mobile Section Selector */}
      <div className="lg:hidden mb-6">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMobileActiveSection('portfolio')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all ${
              mobileActiveSection === 'portfolio'
                ? 'bg-[#c4e1d4] shadow-[4px_4px_0px_0px_#000000]'
                : 'bg-white shadow-[2px_2px_0px_0px_#000000]'
            }`}
          >
            <Wallet className={`h-6 w-6 ${mobileActiveSection === 'portfolio' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
            <span className={`text-xs uppercase tracking-wider font-black ${mobileActiveSection === 'portfolio' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
              Portfolio
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileActiveSection === 'portfolio' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
          </button>

          <button
            onClick={() => setMobileActiveSection('journal')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all ${
              mobileActiveSection === 'journal'
                ? 'bg-[#d4c4e1] shadow-[4px_4px_0px_0px_#000000]'
                : 'bg-white shadow-[2px_2px_0px_0px_#000000]'
            }`}
          >
            <BookOpen className={`h-6 w-6 ${mobileActiveSection === 'journal' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
            <span className={`text-xs uppercase tracking-wider font-black ${mobileActiveSection === 'journal' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
              Journal
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileActiveSection === 'journal' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
          </button>

          <button
            onClick={() => setMobileActiveSection('insights')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all ${
              mobileActiveSection === 'insights'
                ? 'bg-[#e5c9c9] shadow-[4px_4px_0px_0px_#000000]'
                : 'bg-white shadow-[2px_2px_0px_0px_#000000]'
            }`}
          >
            <BarChart3 className={`h-6 w-6 ${mobileActiveSection === 'insights' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
            <span className={`text-xs uppercase tracking-wider font-black ${mobileActiveSection === 'insights' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
              Insights
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileActiveSection === 'insights' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
          </button>

          <button
            onClick={() => setMobileActiveSection('watching')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all ${
              mobileActiveSection === 'watching'
                ? 'bg-[#c4e1d4] shadow-[4px_4px_0px_0px_#000000]'
                : 'bg-white shadow-[2px_2px_0px_0px_#000000]'
            }`}
          >
            <Eye className={`h-6 w-6 ${mobileActiveSection === 'watching' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
            <span className={`text-xs uppercase tracking-wider font-black ${mobileActiveSection === 'watching' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`}>
              Watching
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileActiveSection === 'watching' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN - Portfolio State */}
        <div className={`col-span-12 lg:col-span-3 space-y-6 ${mobileActiveSection !== 'portfolio' ? 'hidden lg:block' : ''}`}>
          {/* Zerodha Connection Widget */}
          {userId && <ZerodhaConnectionWidget userId={userId} />}

          {/* Portfolio Summary Stats - Now with Zerodha Balance */}
          <ZerodhaBalanceWidget userId={userId} />

          {/* Portfolio Allocation Pie Chart Widget */}
          <div className="relative group bg-[#b4d4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <button
              className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
              title="Pin to chat dashboard"
            >
              <Pin className="h-4 w-4 text-[#2d2d2d]" />
            </button>
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Portfolio Allocation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#000000"
                  strokeWidth={2}
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #000000', 
                    borderRadius: '8px',
                    fontFamily: 'Inter',
                    fontWeight: 700
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {portfolioData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded border-2 border-black" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#5a5a5a] font-medium">{item.name}</span>
                  </div>
                  <span className="text-[#2d2d2d] font-black">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Position Summary */}
          <div className="relative bg-[#f5e6d3] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Open Positions</h3>
            <div className="space-y-3">
              <div className="bg-white/60 border-2 border-black rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-[#2d2d2d]">AAPL</span>
                  <span className="text-sm font-black text-[#16a34a]">+$420</span>
                </div>
                <div className="text-xs text-[#5a5a5a]">50 shares @ $185.20</div>
              </div>
              <div className="bg-white/60 border-2 border-black rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-[#2d2d2d]">NVDA</span>
                  <span className="text-sm font-black text-[#16a34a]">+$890</span>
                </div>
                <div className="text-xs text-[#5a5a5a]">20 shares @ $495.00</div>
              </div>
              <div className="bg-white/60 border-2 border-black rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-[#2d2d2d]">MSFT</span>
                  <span className="text-sm font-black text-[#dc2626]">-$180</span>
                </div>
                <div className="text-xs text-[#5a5a5a]">30 shares @ $380.50</div>
              </div>
            </div>
          </div>

          {/* Today's Risk Widget */}
          <div className="relative group bg-[#fce8e6] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <button
              className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
              title="Pin to chat dashboard"
            >
              <Pin className="h-4 w-4 text-[#2d2d2d]" />
            </button>
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Today's Risk</h3>
            
            <div className="absolute inset-4 opacity-10 pointer-events-none">
              <div className="grid grid-cols-8 grid-rows-6 h-full gap-2">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-[#2d2d2d]/20"></div>
                ))}
              </div>
            </div>

            <div className="relative space-y-4">
              <div className="bg-white/80 border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-1">Trades Taken</p>
                    <p className="text-3xl font-black text-[#2d2d2d]">3</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#c4e1d4] border-2 border-black flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-1">Total Risk</p>
                    <p className="text-3xl font-black text-[#dc2626]">$1,250</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#fce8e6] border-2 border-black flex items-center justify-center">
                    <span className="text-xl">⚠️</span>
                  </div>
                </div>
                <div className="bg-[#fef3f2] border border-[#dc2626]/30 rounded-lg px-3 py-2">
                  <p className="text-xs text-[#2d2d2d]/70">
                    <span className="font-black text-[#dc2626]">0.98%</span> of portfolio value
                  </p>
                </div>
              </div>

              <div className="bg-[#d9b89c]/30 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000]">
                <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Risk Summary</p>
                <p className="text-sm text-[#2d2d2d]/80 leading-relaxed">
                  Your risk is <span className="font-black text-[#16a34a]">well-managed</span>. All positions follow the 1% rule.
                </p>
              </div>

              <div className="bg-[#47632d] border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000]">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-black text-white/90 mb-1">Quick Tip</p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Never risk more than 2% of your total portfolio on a single trade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - Journal + Calendar */}
        <div className={`col-span-12 lg:col-span-5 space-y-6 ${mobileActiveSection !== 'journal' ? 'hidden lg:block' : ''}`}>
          {/* Trade Journal Widget */}
          <div className="relative bg-[#d4c4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
              <div>
                <h3 className="uppercase tracking-wide font-black text-[#2d2d2d]">Trade Journal</h3>
                <p className="text-sm text-[#5a5a5a]">
                  {date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {tradesForDate.map((trade) => (
                <div key={trade.id} className="bg-white/60 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[#2d2d2d] font-black">{trade.symbol}</h4>
                      <Badge variant={trade.type === 'long' ? 'default' : 'secondary'} className="text-xs">
                        {trade.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {trade.pnl >= 0 ? (
                        <TrendingUp className="size-5 text-[#16a34a]" />
                      ) : (
                        <TrendingDown className="size-5 text-[#dc2626]" />
                      )}
                      <span className={`text-xl font-black ${trade.pnl >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                        ${trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
                    <div>
                      <span className="text-[#5a5a5a]">Entry: </span>
                      <span className="text-[#2d2d2d] font-black">${trade.entry}</span>
                    </div>
                    <div>
                      <span className="text-[#5a5a5a]">Exit: </span>
                      <span className="text-[#2d2d2d] font-black">${trade.exit}</span>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-2 border border-black/10">
                    <p className="text-xs text-[#2d2d2d]/70">{trade.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Twitter Recommendations Widget */}
          <TwitterRecommendations />
        </div>

        {/* RIGHT COLUMN - Behavior + Metrics */}
        <div className={`col-span-12 lg:col-span-4 space-y-6 ${mobileActiveSection !== 'insights' ? 'hidden lg:block' : ''}`}>
          {/* Behavioral Insights Widget */}
          <div className="relative group bg-[#e5c9c9] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <button
              className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
              title="Pin to chat dashboard"
            >
              <Pin className="h-4 w-4 text-[#2d2d2d]" />
            </button>
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Behavioral Insights</h3>
            
            <div className="space-y-3">
              <div className="bg-[#47632d] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
                <p className="text-sm text-white font-black mb-1">Strength</p>
                <p className="text-xs text-white/80">Following your trading plan with discipline</p>
              </div>

              <div className="bg-[#a12d1a] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
                <p className="text-sm text-white font-black mb-1">Watch Out</p>
                <p className="text-xs text-white/80">Holding losers too long - consider tighter stops</p>
              </div>

              <div className="bg-[#895727] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
                <p className="text-sm text-white font-black mb-1">Pattern</p>
                <p className="text-xs text-white/80">Best performance in morning sessions (9:30-11:00)</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-black">
              <h4 className="text-[#2d2d2d] text-sm font-black mb-3">This Week</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Win Rate</span>
                  <span className="text-xl font-black text-[#2d2d2d]">64%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Avg Win</span>
                  <span className="text-xl font-black text-[#16a34a]">$685</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Avg Loss</span>
                  <span className="text-xl font-black text-[#dc2626]">$320</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Profit Factor</span>
                  <span className="text-xl font-black text-[#2d2d2d]">2.14</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Flow Analysis Widget */}
          <div className="relative group bg-[#d9b89c] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <button
              className="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
              title="Pin to chat dashboard"
            >
              <Pin className="h-4 w-4 text-[#2d2d2d]" />
            </button>
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Trade Flow Analysis</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="bg-white border-2 border-black rounded-lg px-6 py-3 shadow-[3px_3px_0px_0px_#000000]">
                  <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">All Trades</p>
                  <p className="text-2xl text-[#2d2d2d] font-black">100</p>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-black"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#c4e1d4] border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
                  <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Planned</p>
                  <p className="text-2xl text-[#2d2d2d] font-black mb-3">65</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                      <span className="text-[#2d2d2d]/70 font-black">Win</span>
                      <span className="text-[#16a34a] font-black">45</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                      <span className="text-[#2d2d2d]/70 font-black">Loss</span>
                      <span className="text-[#dc2626] font-black">15</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                      <span className="text-[#2d2d2d]/70 font-black">B/E</span>
                      <span className="text-[#2d2d2d] font-black">5</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f5c9c9] border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
                  <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Impulsive</p>
                  <p className="text-2xl text-[#2d2d2d] font-black mb-3">35</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                      <span className="text-[#2d2d2d]/70 font-black">Win</span>
                      <span className="text-[#16a34a] font-black">10</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                      <span className="text-[#2d2d2d]/70 font-black">Loss</span>
                      <span className="text-[#dc2626] font-black">20</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                      <span className="text-[#2d2d2d]/70 font-black">B/E</span>
                      <span className="text-[#2d2d2d] font-black">5</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
                <p className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Win Rate Comparison</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#2d2d2d]">Planned</span>
                    <span className="text-xl font-black text-[#16a34a]">69%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#2d2d2d]">Impulsive</span>
                    <span className="text-xl font-black text-[#dc2626]">29%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* News Feed Widget */}
          <NewsFeedWidget />
        </div>

        {/* WATCHING SECTION */}
        <div className={`col-span-12 lg:col-span-4 space-y-6 ${mobileActiveSection !== 'watching' ? 'hidden lg:block' : ''}`}>
          <WatchingSection />
        </div>
      </div>

      {/* FULL WIDTH CALENDAR - At the bottom */}
      <div className="mt-6 max-w-4xl mx-auto">
        <div className="relative bg-[#1a1a1d] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
          <h3 className="uppercase tracking-wide font-black text-[#e5e5e5] mb-3">Trading Calendar</h3>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg border-2 border-[#4d4d50] bg-[#2d2d30] hover:bg-[#3d3d40] transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-[#e5e5e5]" />
            </button>
            <h4 className="font-black text-[#e5e5e5]">
              {monthNames[month]} {year}
            </h4>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg border-2 border-[#4d4d50] bg-[#2d2d30] hover:bg-[#3d3d40] transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-[#e5e5e5]" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#252528] border-2 border-[#4d4d50] rounded-lg p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-black text-[#a5a5a8] py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayData = calendarData[day] || { pnl: 0, trades: 0 };
                const hasTrades = dayData.trades > 0;
                const isProfit = dayData.pnl > 0;
                const isLoss = dayData.pnl < 0;

                return (
                  <div
                    key={day}
                    className={`aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-105 hover:shadow-[3px_3px_0px_0px_#4d4d50] flex flex-col items-center justify-center ${
                      isProfit
                        ? 'bg-[#5fb369] hover:bg-[#6fc379] border-[#5fb369]'
                        : isLoss
                        ? 'bg-[#e36969] hover:bg-[#f37979] border-[#e36969]'
                        : hasTrades
                        ? 'bg-[#4d4d50] hover:bg-[#5d5d60] border-[#4d4d50]'
                        : 'bg-[#2d2d30] hover:bg-[#3d3d40] border-[#3d3d40]'
                    }`}
                    onClick={() => {
                      setDate(new Date(year, month, day));
                      onDateClick(new Date(year, month, day));
                    }}
                  >
                    <div className={`font-black mb-1 ${
                      isProfit || isLoss ? 'text-white/70' : 'text-[#a5a5a8]'
                    }`}>{day}</div>
                    {hasTrades ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className={`font-black ${isProfit ? 'text-white' : isLoss ? 'text-white' : 'text-[#e5e5e5]'}`}>
                          ${isProfit ? '+' : ''}{Math.abs(dayData.pnl).toFixed(0)}
                        </div>
                        <div className={`text-[10px] ${isProfit ? 'text-white/90' : isLoss ? 'text-white/90' : 'text-[#a5a5a8]'}`}>
                          {dayData.trades} {dayData.trades === 1 ? 'trade' : 'trades'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#5a5a5d]">—</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

