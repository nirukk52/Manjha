<script lang="ts">
  import { Calendar, TrendingUp, TrendingDown, Pin, ChevronLeft, ChevronRight, Activity, Wallet, BookOpen, BarChart3, ChevronDown, Eye } from 'lucide-svelte';
  import MarketSentimentWidget from './MarketSentimentWidget.svelte';
  import NewsFeedWidget from './NewsFeedWidget.svelte';
  import TwitterRecommendations from './TwitterRecommendations.svelte';
  import WatchingSection from './WatchingSection.svelte';
  import DailyReportCard from './DailyReportCard.svelte';

  interface Props {
    onDateClick: (date: Date) => void;
  }

  let { onDateClick }: Props = $props();

  let date = $state<Date | undefined>(new Date());
  let currentMonth = $state(new Date());
  let mobileActiveSection = $state<'portfolio' | 'journal' | 'insights' | 'watching'>('portfolio');

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

  const portfolioData = [
    { name: 'Tech', value: 35, color: '#47632d' },
    { name: 'Finance', value: 25, color: '#895727' },
    { name: 'Healthcare', value: 20, color: '#a12d1a' },
    { name: 'Energy', value: 12, color: '#492f13' },
    { name: 'Other', value: 8, color: '#30341d' }
  ];

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

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  }

  function previousMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  }

  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<div class="min-h-screen p-8 pb-[280px]">
  <!-- Header Text -->
  <div class="mb-8 flex items-start justify-between">
    <div>
      <h1 class="text-5xl font-black uppercase tracking-tight text-[#2d2d2d] mb-2">Manjha</h1>
      <p class="text-[#2d2d2d]/60 leading-relaxed max-w-md">
        Chat with your portfolio manager and create{' '}
        <span class="relative inline-block">
          <span class="relative z-10 text-[#2d2d2d]/80 font-bold">mental models</span>
          <span class="absolute inset-x-0 bottom-0 h-2 bg-[#d4c4e1]/50 -rotate-1"></span>
        </span>
        ,{' '}
        <span class="relative inline-block">
          <span class="relative z-10 text-[#2d2d2d]/80 font-bold">discipline engine</span>
          <span class="absolute inset-x-0 bottom-0 h-2 bg-[#e5c9c9]/50 rotate-1"></span>
        </span>
        {' '}and{' '}
        <span class="relative inline-block">
          <span class="relative z-10 text-[#2d2d2d]/80 font-bold">knowledge graphs</span>
          <span class="absolute inset-x-0 bottom-0 h-2 bg-[#d9b89c]/50 -rotate-1"></span>
        </span>
        {' '}for your trading strategies.
      </p>
    </div>
    <button class="relative px-5 py-2.5 text-sm rounded-xl bg-gradient-to-br from-[#387ED1]/20 to-[#2563eb]/20 hover:from-[#387ED1]/30 hover:to-[#2563eb]/30 backdrop-blur-sm border-2 border-[#387ED1]/40 hover:border-[#387ED1]/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <span class="relative text-[#2d2d2d] font-black uppercase tracking-tight">
        Connect Your Zerodha
      </span>
    </button>
  </div>

  <!-- Mobile Section Selector -->
  <div class="lg:hidden mb-6">
    <div class="grid grid-cols-2 gap-2">
      <button
        onclick={() => mobileActiveSection = 'portfolio'}
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all {mobileActiveSection === 'portfolio'
          ? 'bg-[#c4e1d4] shadow-[4px_4px_0px_0px_#000000]'
          : 'bg-white shadow-[2px_2px_0px_0px_#000000]'}"
      >
        <Wallet class="h-6 w-6 {mobileActiveSection === 'portfolio' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
        <span class="text-xs uppercase tracking-wider font-black {mobileActiveSection === 'portfolio' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}">Portfolio</span>
        <ChevronDown class="h-4 w-4 transition-transform {mobileActiveSection === 'portfolio' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
      </button>

      <button
        onclick={() => mobileActiveSection = 'journal'}
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all {mobileActiveSection === 'journal'
          ? 'bg-[#d4c4e1] shadow-[4px_4px_0px_0px_#000000]'
          : 'bg-white shadow-[2px_2px_0px_0px_#000000]'}"
      >
        <BookOpen class="h-6 w-6 {mobileActiveSection === 'journal' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
        <span class="text-xs uppercase tracking-wider font-black {mobileActiveSection === 'journal' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}">Journal</span>
        <ChevronDown class="h-4 w-4 transition-transform {mobileActiveSection === 'journal' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
      </button>

      <button
        onclick={() => mobileActiveSection = 'insights'}
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all {mobileActiveSection === 'insights'
          ? 'bg-[#e5c9c9] shadow-[4px_4px_0px_0px_#000000]'
          : 'bg-white shadow-[2px_2px_0px_0px_#000000]'}"
      >
        <BarChart3 class="h-6 w-6 {mobileActiveSection === 'insights' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
        <span class="text-xs uppercase tracking-wider font-black {mobileActiveSection === 'insights' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}">Insights</span>
        <ChevronDown class="h-4 w-4 transition-transform {mobileActiveSection === 'insights' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
      </button>

      <button
        onclick={() => mobileActiveSection = 'watching'}
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-black transition-all {mobileActiveSection === 'watching'
          ? 'bg-[#c4e1d4] shadow-[4px_4px_0px_0px_#000000]'
          : 'bg-white shadow-[2px_2px_0px_0px_#000000]'}"
      >
        <Eye class="h-6 w-6 {mobileActiveSection === 'watching' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
        <span class="text-xs uppercase tracking-wider font-black {mobileActiveSection === 'watching' ? 'text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}">Watching</span>
        <ChevronDown class="h-4 w-4 transition-transform {mobileActiveSection === 'watching' ? 'rotate-180 text-[#2d2d2d]' : 'text-[#2d2d2d]/40'}" />
      </button>
    </div>
  </div>

  <div class="grid grid-cols-12 gap-6">
    <!-- LEFT COLUMN - Portfolio State -->
    <div class="col-span-12 lg:col-span-3 space-y-6 {mobileActiveSection !== 'portfolio' ? 'hidden lg:block' : ''}">
      <!-- Portfolio Summary Stats -->
      <div class="relative bg-[#c4e1d4] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Portfolio Value</h3>
        <div class="space-y-4">
          <div>
            <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 block mb-1">Total Value</span>
            <span class="text-3xl font-black text-[#2d2d2d]">$127,450</span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 block mb-1">Today</span>
              <span class="text-xl font-black text-[#16a34a]">+$2,340</span>
            </div>
            <div>
              <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 block mb-1">MTD</span>
              <span class="text-xl font-black text-[#16a34a]">+$8,920</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio Allocation Pie Chart Widget -->
      <div class="relative group bg-[#b4d4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <button
          class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
          title="Pin to chat dashboard"
        >
          <Pin class="h-4 w-4 text-[#2d2d2d]" />
        </button>
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Portfolio Allocation</h3>
        <!-- Simple pie chart visualization -->
        <div class="h-[200px] flex items-center justify-center">
          <div class="relative w-40 h-40">
            <!-- Pie segments using CSS -->
            <div class="absolute inset-0 rounded-full border-2 border-black" style="background: conic-gradient(
              #47632d 0deg 126deg,
              #895727 126deg 216deg,
              #a12d1a 216deg 288deg,
              #492f13 288deg 331deg,
              #30341d 331deg 360deg
            );"></div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          {#each portfolioData as item}
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded border-2 border-black" 
                  style="background-color: {item.color}"
                />
                <span class="text-[#5a5a5a]">{item.name}</span>
              </div>
              <span class="text-[#2d2d2d] font-bold">{item.value}%</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Position Summary -->
      <div class="relative bg-[#f5e6d3] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Open Positions</h3>
        <div class="space-y-3">
          <div class="bg-white/60 border-2 border-black rounded-lg p-3">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-[#2d2d2d]">AAPL</span>
              <span class="text-sm font-black text-[#16a34a]">+$420</span>
            </div>
            <div class="text-xs text-[#5a5a5a]">50 shares @ $185.20</div>
          </div>
          <div class="bg-white/60 border-2 border-black rounded-lg p-3">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-[#2d2d2d]">NVDA</span>
              <span class="text-sm font-black text-[#16a34a]">+$890</span>
            </div>
            <div class="text-xs text-[#5a5a5a]">20 shares @ $495.00</div>
          </div>
          <div class="bg-white/60 border-2 border-black rounded-lg p-3">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-[#2d2d2d]">MSFT</span>
              <span class="text-sm font-black text-[#dc2626]">-$180</span>
            </div>
            <div class="text-xs text-[#5a5a5a]">30 shares @ $380.50</div>
          </div>
        </div>
      </div>

      <!-- Today's Risk Widget -->
      <div class="relative group bg-[#fce8e6] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <button
          class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
          title="Pin to chat dashboard"
        >
          <Pin class="h-4 w-4 text-[#2d2d2d]" />
        </button>
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Today's Risk</h3>
        
        <div class="absolute inset-4 opacity-10 pointer-events-none">
          <div class="grid grid-cols-8 grid-rows-6 h-full gap-2">
            {#each Array(48) as _}
              <div class="border border-[#2d2d2d]/20"></div>
            {/each}
          </div>
        </div>

        <div class="relative space-y-4">
          <div class="bg-white/80 border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-1">Trades Taken</p>
                <p class="text-3xl font-black text-[#2d2d2d]">3</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-[#c4e1d4] border-2 border-black flex items-center justify-center">
                <span class="text-xl">📊</span>
              </div>
            </div>
          </div>

          <div class="bg-white/80 border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-1">Total Risk</p>
                <p class="text-3xl font-black text-[#dc2626]">$1,250</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-[#fce8e6] border-2 border-black flex items-center justify-center">
                <span class="text-xl">⚠️</span>
              </div>
            </div>
            <div class="bg-[#fef3f2] border border-[#dc2626]/30 rounded-lg px-3 py-2">
              <p class="text-xs text-[#2d2d2d]/70">
                <span class="font-black text-[#dc2626]">0.98%</span> of portfolio value
              </p>
            </div>
          </div>

          <div class="bg-[#d9b89c]/30 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-2">Risk Summary</p>
            <p class="text-sm text-[#2d2d2d]/80 leading-relaxed">
              Your risk is <span class="font-black text-[#16a34a]">well-managed</span>. All positions follow the 1% rule.
            </p>
          </div>

          <div class="bg-[#47632d] border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000]">
            <div class="flex items-start gap-2">
              <span class="text-lg">💡</span>
              <div>
                <p class="text-xs uppercase tracking-wider font-bold text-white/90 mb-1">Quick Tip</p>
                <p class="text-xs text-white/80 leading-relaxed">
                  Never risk more than 2% of your total portfolio on a single trade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MIDDLE COLUMN - Journal + Calendar -->
    <div class="col-span-12 lg:col-span-5 space-y-6 {mobileActiveSection !== 'journal' ? 'hidden lg:block' : ''}">
      <!-- Trade Journal Widget -->
      <div class="relative bg-[#d4c4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div class="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
          <div>
            <h3 class="uppercase tracking-wide font-black text-[#2d2d2d]">Trade Journal</h3>
            <p class="text-sm text-[#5a5a5a]">
              {date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          {#each tradesForDate as trade}
            <div class="bg-white/60 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000]">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <h4 class="text-[#2d2d2d] font-bold">{trade.symbol}</h4>
                  <span class="text-xs uppercase tracking-wider font-bold px-2 py-1 rounded border-2 border-black {trade.type === 'long' ? 'bg-[#c4e1d4]' : 'bg-[#f5e6d3]'}">
                    {trade.type.toUpperCase()}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  {#if trade.pnl >= 0}
                    <TrendingUp class="size-5 text-[#16a34a]" />
                  {:else}
                    <TrendingDown class="size-5 text-[#dc2626]" />
                  {/if}
                  <span class="text-xl font-black {trade.pnl >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}">
                    ${trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-2 text-sm">
                <div>
                  <span class="text-[#5a5a5a]">Entry: </span>
                  <span class="text-[#2d2d2d] font-bold">${trade.entry}</span>
                </div>
                <div>
                  <span class="text-[#5a5a5a]">Exit: </span>
                  <span class="text-[#2d2d2d] font-bold">${trade.exit}</span>
                </div>
              </div>

              <div class="bg-white/80 rounded-lg p-2 border border-black/10">
                <p class="text-xs text-[#2d2d2d]/70">{trade.notes}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <TwitterRecommendations />
    </div>

    <!-- RIGHT COLUMN - Behavior + Metrics -->
    <div class="col-span-12 lg:col-span-4 space-y-6 {mobileActiveSection !== 'insights' ? 'hidden lg:block' : ''}">
      <!-- Behavioral Insights Widget -->
      <div class="relative group bg-[#e5c9c9] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <button
          class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
          title="Pin to chat dashboard"
        >
          <Pin class="h-4 w-4 text-[#2d2d2d]" />
        </button>
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Behavioral Insights</h3>
        
        <div class="space-y-3">
          <div class="bg-[#47632d] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
            <p class="text-sm text-white mb-1">Strength</p>
            <p class="text-xs text-white/80">Following your trading plan with discipline</p>
          </div>

          <div class="bg-[#a12d1a] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
            <p class="text-sm text-white mb-1">Watch Out</p>
            <p class="text-xs text-white/80">Holding losers too long - consider tighter stops</p>
          </div>

          <div class="bg-[#895727] border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000]">
            <p class="text-sm text-white mb-1">Pattern</p>
            <p class="text-xs text-white/80">Best performance in morning sessions (9:30-11:00)</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t-2 border-black">
          <h4 class="text-[#2d2d2d] text-sm mb-3 font-bold">This Week</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">Win Rate</span>
              <span class="text-xl font-black text-[#2d2d2d]">64%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">Avg Win</span>
              <span class="text-xl font-black text-[#16a34a]">$685</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">Avg Loss</span>
              <span class="text-xl font-black text-[#dc2626]">$320</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">Profit Factor</span>
              <span class="text-xl font-black text-[#2d2d2d]">2.14</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trade Flow Analysis Widget -->
      <div class="relative group bg-[#d9b89c] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <button
          class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
          title="Pin to chat dashboard"
        >
          <Pin class="h-4 w-4 text-[#2d2d2d]" />
        </button>
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Trade Flow Analysis</h3>
        
        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2">
            <div class="bg-white border-2 border-black rounded-lg px-6 py-3 shadow-[3px_3px_0px_0px_#000000]">
              <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">All Trades</p>
              <p class="text-2xl text-[#2d2d2d] font-black">100</p>
            </div>
          </div>

          <div class="flex justify-center">
            <div class="w-0.5 h-6 bg-black"></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="bg-[#c4e1d4] border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
              <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">Planned</p>
              <p class="text-2xl text-[#2d2d2d] font-black mb-3">65</p>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                  <span class="text-[#2d2d2d]/70 font-bold">Win</span>
                  <span class="text-[#16a34a] font-black">45</span>
                </div>
                <div class="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                  <span class="text-[#2d2d2d]/70 font-bold">Loss</span>
                  <span class="text-[#dc2626] font-black">15</span>
                </div>
                <div class="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                  <span class="text-[#2d2d2d]/70 font-bold">B/E</span>
                  <span class="text-[#2d2d2d] font-black">5</span>
                </div>
              </div>
            </div>

            <div class="bg-[#f5c9c9] border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
              <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60">Impulsive</p>
              <p class="text-2xl text-[#2d2d2d] font-black mb-3">35</p>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                  <span class="text-[#2d2d2d]/70 font-bold">Win</span>
                  <span class="text-[#16a34a] font-black">10</span>
                </div>
                <div class="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                  <span class="text-[#2d2d2d]/70 font-bold">Loss</span>
                  <span class="text-[#dc2626] font-black">20</span>
                </div>
                <div class="flex justify-between items-center bg-white/60 border border-black/20 rounded px-2 py-1">
                  <span class="text-[#2d2d2d]/70 font-bold">B/E</span>
                  <span class="text-[#2d2d2d] font-black">5</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-3">Win Rate Comparison</p>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#2d2d2d]">Planned</span>
                <span class="text-xl font-black text-[#16a34a]">69%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#2d2d2d]">Impulsive</span>
                <span class="text-xl font-black text-[#dc2626]">29%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewsFeedWidget />
    </div>

    <!-- WATCHING SECTION -->
    <div class="col-span-12 lg:col-span-4 space-y-6 {mobileActiveSection !== 'watching' ? 'hidden lg:block' : ''}">
      <WatchingSection />
    </div>
  </div>

  <!-- FULL WIDTH CALENDAR - At the bottom -->
  <div class="mt-6 max-w-4xl mx-auto">
    <div class="relative bg-[#1a1a1d] rounded-2xl p-5 border-[3px] border-black shadow-[6px_6px_0px_0px_#000000]">
      <h3 class="uppercase tracking-wide font-black text-[#e5e5e5] mb-3">Trading Calendar</h3>
      
      <div class="flex items-center justify-center gap-4 mb-3">
        <button
          onclick={previousMonth}
          class="p-2 rounded-lg border-2 border-[#4d4d50] bg-[#2d2d30] hover:bg-[#3d3d40] transition-colors"
        >
          <ChevronLeft class="h-4 w-4 text-[#e5e5e5]" />
        </button>
        <h4 class="font-black text-[#e5e5e5]">
          {monthNames[month]} {year}
        </h4>
        <button
          onclick={nextMonth}
          class="p-2 rounded-lg border-2 border-[#4d4d50] bg-[#2d2d30] hover:bg-[#3d3d40] transition-colors"
        >
          <ChevronRight class="h-4 w-4 text-[#e5e5e5]" />
        </button>
      </div>

      <div class="bg-[#252528] border-2 border-[#4d4d50] rounded-lg p-4">
        <div class="grid grid-cols-7 gap-2 mb-2">
          {#each dayNames as day}
            <div class="text-center font-black text-[#a5a5a8] py-2">
              {day}
            </div>
          {/each}
        </div>

        <div class="grid grid-cols-7 gap-2">
          {#each Array(startingDayOfWeek) as _}
            <div class="aspect-square" />
          {/each}

          {#each Array(daysInMonth) as _, i}
            {@const day = i + 1}
            {@const dayData = calendarData[day] || { pnl: 0, trades: 0 }}
            {@const hasTrades = dayData.trades > 0}
            {@const isProfit = dayData.pnl > 0}
            {@const isLoss = dayData.pnl < 0}
            <div
              class="aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all hover:scale-105 hover:shadow-[3px_3px_0px_0px_#4d4d50] flex flex-col items-center justify-center {isProfit
                ? 'bg-[#5fb369] hover:bg-[#6fc379] border-[#5fb369]'
                : isLoss
                ? 'bg-[#e36969] hover:bg-[#f37979] border-[#e36969]'
                : hasTrades
                ? 'bg-[#4d4d50] hover:bg-[#5d5d60] border-[#4d4d50]'
                : 'bg-[#2d2d30] hover:bg-[#3d3d40] border-[#3d3d40]'}"
              onclick={() => {
                date = new Date(year, month, day);
                onDateClick(new Date(year, month, day));
              }}
            >
              <div class="font-black mb-1 {isProfit || isLoss ? 'text-white/70' : 'text-[#a5a5a8]'}">{day}</div>
              {#if hasTrades}
                <div class="flex flex-col items-center gap-0.5">
                  <div class="font-black {isProfit ? 'text-white' : isLoss ? 'text-white' : 'text-[#e5e5e5]'}">
                    ${isProfit ? '+' : ''}{Math.abs(dayData.pnl).toFixed(0)}
                  </div>
                  <div class="text-[10px] {isProfit ? 'text-white/90' : isLoss ? 'text-white/90' : 'text-[#a5a5a8]'}">
                    {dayData.trades} {dayData.trades === 1 ? 'trade' : 'trades'}
                  </div>
                </div>
              {:else}
                <div class="text-[10px] text-[#5a5a5d]">—</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

