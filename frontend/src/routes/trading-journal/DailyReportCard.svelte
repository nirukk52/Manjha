<script lang="ts">
  import { Pin, TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertCircle, ThumbsUp, Target, Shield } from 'lucide-svelte';

  interface Props {
    date: Date;
  }

  let { date }: Props = $props();

  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
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

  function getQualityColor(quality: string) {
    if (quality === 'Excellent' || quality === 'Good') return 'bg-[#c4e1d4]';
    if (quality === 'Fair') return 'bg-[#f5e6d3]';
    return 'bg-[#fce8e6]';
  }

  function getQualityIcon(quality: string) {
    if (quality === 'Excellent' || quality === 'Good') return CheckCircle2;
    if (quality === 'Fair') return AlertCircle;
    return XCircle;
  }

  // Pre-compute icons for equity data
  const equityEntryIcon = getQualityIcon(equityData.entryQuality);
  const equityExitIcon = getQualityIcon(equityData.exitQuality);
  
  // Pre-compute icons for options data
  const optionsEntryIcon = getQualityIcon(optionsData.entryQuality);
  const optionsExitIcon = getQualityIcon(optionsData.exitQuality);
</script>

<div class="mt-6 max-w-7xl mx-auto">
  <h2 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-6 text-2xl">Daily Report Cards</h2>
  <div class="grid grid-cols-2 gap-6">
    <!-- Equity Report Card -->
    <div class="relative group bg-[#f5f0e8] rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
      <button
        class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
        title="Pin to chat dashboard"
      >
        <Pin class="h-4 w-4 text-[#2d2d2d]" />
      </button>

      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">Equity Report</h3>
          <p class="text-xs text-[#2d2d2d]/60">{equityData.date}</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-1">Total P&L</p>
          <p class="text-3xl font-black {equityData.totalPnl >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}">
            ${equityData.totalPnl >= 0 ? '+' : ''}{equityData.totalPnl}
          </p>
        </div>
      </div>

      <div class="absolute inset-6 opacity-5 pointer-events-none">
        <div class="grid grid-cols-16 grid-rows-10 h-full gap-2">
          {#each Array(160) as _}
            <div class="border border-[#2d2d2d]/30"></div>
          {/each}
        </div>
      </div>

      <div class="relative space-y-4">
        <!-- Trades Section -->
        <div class="bg-[#e8e4f3] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
          <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Trades ({equityData.trades.length})</p>
          <div class="space-y-2">
            {#each equityData.trades as trade}
              <div class="bg-white/80 border border-black/30 rounded-lg px-3 py-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-black text-[#2d2d2d]">{trade.symbol}</span>
                  <span class="text-[10px] uppercase tracking-wider font-bold text-[#2d2d2d]/60 bg-[#f5f5f5] border border-black/20 rounded px-2 py-0.5">
                    {trade.type}
                  </span>
                  <span class="text-xs text-[#2d2d2d]/60">
                    {trade.size} @ ${trade.entry} → ${trade.exit}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  {#if trade.pnl >= 0}
                    <TrendingUp class="h-3 w-3 text-[#5fb369]" />
                  {:else}
                    <TrendingDown class="h-3 w-3 text-[#e36969]" />
                  {/if}
                  <span class="font-black {trade.pnl >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}">
                    ${trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Risk & Position Info -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#fce8e6] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center gap-2 mb-2">
              <Shield class="h-4 w-4 text-[#2d2d2d]/60" />
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Total Risk</p>
            </div>
            <p class="text-2xl font-black text-[#e36969]">${equityData.totalRisk}</p>
            <p class="text-xs text-[#2d2d2d]/60 mt-1">{equityData.riskPercent}% of portfolio</p>
          </div>

          <div class="bg-[#d9e8f5] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center gap-2 mb-2">
              <Target class="h-4 w-4 text-[#2d2d2d]/60" />
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Avg Position</p>
            </div>
            <p class="text-2xl font-black text-[#2d2d2d]">
              {Math.round(equityData.trades.reduce((sum, t) => sum + t.size, 0) / equityData.trades.length)} shares
            </p>
            <p class="text-xs text-[#2d2d2d]/60 mt-1">Per trade</p>
          </div>
        </div>

        <!-- Quality Metrics -->
        <div class="grid grid-cols-2 gap-4">
          <div class="{getQualityColor(equityData.entryQuality)} border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Entry Quality</p>
              <svelte:component this={equityEntryIcon} class="h-4 w-4 {equityData.entryQuality === 'Excellent' || equityData.entryQuality === 'Good' ? 'text-[#5fb369]' : equityData.entryQuality === 'Fair' ? 'text-[#d9b89c]' : 'text-[#e36969]'}" />
            </div>
            <p class="text-xl font-black text-[#2d2d2d]">{equityData.entryQuality}</p>
          </div>

          <div class="{getQualityColor(equityData.exitQuality)} border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Exit Quality</p>
              <svelte:component this={equityExitIcon} class="h-4 w-4 {equityData.exitQuality === 'Excellent' || equityData.exitQuality === 'Good' ? 'text-[#5fb369]' : equityData.exitQuality === 'Fair' ? 'text-[#d9b89c]' : 'text-[#e36969]'}" />
            </div>
            <p class="text-xl font-black text-[#2d2d2d]">{equityData.exitQuality}</p>
          </div>
        </div>

        <!-- Emotions & Rules -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#f5e6d3] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Emotions</p>
            <div class="flex flex-wrap gap-2">
              {#each equityData.emotions as emotion}
                <span class="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-black text-[#2d2d2d]">
                  {emotion}
                </span>
              {/each}
            </div>
          </div>

          <div class="bg-[#c4e1d4] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Rules Followed</p>
            <div class="flex items-end gap-2">
              <p class="text-3xl font-black text-[#2d2d2d]">{equityData.rulesFollowed}</p>
              <p class="text-xl font-black text-[#2d2d2d]/60 mb-0.5">/ {equityData.rulesTotal}</p>
            </div>
            <div class="mt-2 bg-white/60 rounded-full h-2 border border-black/30">
              <div 
                class="h-full bg-[#5fb369] rounded-full border-r border-black/30"
                style="width: {(equityData.rulesFollowed / equityData.rulesTotal) * 100}%;"
              />
            </div>
          </div>
        </div>

        <!-- Market Condition & Outcomes -->
        <div class="space-y-3">
          <div class="bg-[#e5d4f5] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Market Condition</p>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-[#5fb369] border border-black animate-pulse"></div>
              <span class="font-black text-[#2d2d2d]">{equityData.marketCondition}</span>
            </div>
          </div>

          <div class="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Final Outcomes</p>
            <div class="flex flex-wrap gap-2">
              {#each equityData.outcomes as outcome}
                <span class="bg-[#5fb369]/20 border border-[#5fb369] rounded-lg px-3 py-1.5 text-xs font-black text-[#2d2d2d] flex items-center gap-1.5">
                  <CheckCircle2 class="h-3 w-3 text-[#5fb369]" />
                  {outcome}
                </span>
              {/each}
            </div>
          </div>
        </div>

        <!-- Bottom Summary -->
        <div class="bg-[#47632d] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
          <div class="flex items-start gap-2">
            <ThumbsUp class="h-5 w-5 text-white/90 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-xs uppercase tracking-wider font-black text-white/90 mb-1">Daily Grade</p>
              <p class="text-sm text-white/80 leading-relaxed">
                Strong equity performance. Entry execution was precise, risk management within limits, emotions well-controlled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Options Report Card -->
    <div class="relative group bg-[#e8f4f8] rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
      <button
        class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
        title="Pin to chat dashboard"
      >
        <Pin class="h-4 w-4 text-[#2d2d2d]" />
      </button>

      <div class="flex items-start justify-between mb-6">
        <div>
          <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">Options Report</h3>
          <p class="text-xs text-[#2d2d2d]/60">{optionsData.date}</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-1">Total P&L</p>
          <p class="text-3xl font-black {optionsData.totalPnl >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}">
            ${optionsData.totalPnl >= 0 ? '+' : ''}{optionsData.totalPnl}
          </p>
        </div>
      </div>

      <div class="absolute inset-6 opacity-5 pointer-events-none">
        <div class="grid grid-cols-16 grid-rows-10 h-full gap-2">
          {#each Array(160) as _}
            <div class="border border-[#2d2d2d]/30"></div>
          {/each}
        </div>
      </div>

      <div class="relative space-y-4">
        <!-- Trades Section -->
        <div class="bg-[#e8e4f3] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
          <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Trades ({optionsData.trades.length})</p>
          <div class="space-y-2">
            {#each optionsData.trades as trade}
              <div class="bg-white/80 border border-black/30 rounded-lg px-3 py-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-black text-[#2d2d2d]">{trade.symbol}</span>
                  <span class="text-[10px] uppercase tracking-wider font-bold text-[#2d2d2d]/60 bg-[#f5f5f5] border border-black/20 rounded px-2 py-0.5">
                    {trade.type}
                  </span>
                  <span class="text-xs text-[#2d2d2d]/60">
                    {trade.size} @ ${trade.entry} → ${trade.exit}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  {#if trade.pnl >= 0}
                    <TrendingUp class="h-3 w-3 text-[#5fb369]" />
                  {:else}
                    <TrendingDown class="h-3 w-3 text-[#e36969]" />
                  {/if}
                  <span class="font-black {trade.pnl >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}">
                    ${trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Risk & Position Info -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#fce8e6] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center gap-2 mb-2">
              <Shield class="h-4 w-4 text-[#2d2d2d]/60" />
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Total Risk</p>
            </div>
            <p class="text-2xl font-black text-[#e36969]">${optionsData.totalRisk}</p>
            <p class="text-xs text-[#2d2d2d]/60 mt-1">{optionsData.riskPercent}% of portfolio</p>
          </div>

          <div class="bg-[#d9e8f5] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center gap-2 mb-2">
              <Target class="h-4 w-4 text-[#2d2d2d]/60" />
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Avg Position</p>
            </div>
            <p class="text-2xl font-black text-[#2d2d2d]">
              {Math.round(optionsData.trades.reduce((sum, t) => sum + t.size, 0) / optionsData.trades.length)} contracts
            </p>
            <p class="text-xs text-[#2d2d2d]/60 mt-1">Per trade</p>
          </div>
        </div>

        <!-- Quality Metrics -->
        <div class="grid grid-cols-2 gap-4">
          <div class="{getQualityColor(optionsData.entryQuality)} border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Entry Quality</p>
              <svelte:component this={optionsEntryIcon} class="h-4 w-4 {optionsData.entryQuality === 'Excellent' || optionsData.entryQuality === 'Good' ? 'text-[#5fb369]' : optionsData.entryQuality === 'Fair' ? 'text-[#d9b89c]' : 'text-[#e36969]'}" />
            </div>
            <p class="text-xl font-black text-[#2d2d2d]">{optionsData.entryQuality}</p>
          </div>

          <div class="{getQualityColor(optionsData.exitQuality)} border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">Exit Quality</p>
              <svelte:component this={optionsExitIcon} class="h-4 w-4 {optionsData.exitQuality === 'Excellent' || optionsData.exitQuality === 'Good' ? 'text-[#5fb369]' : optionsData.exitQuality === 'Fair' ? 'text-[#d9b89c]' : 'text-[#e36969]'}" />
            </div>
            <p class="text-xl font-black text-[#2d2d2d]">{optionsData.exitQuality}</p>
          </div>
        </div>

        <!-- Emotions & Rules -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#f5e6d3] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Emotions</p>
            <div class="flex flex-wrap gap-2">
              {#each optionsData.emotions as emotion}
                <span class="bg-white border-2 border-black rounded-full px-3 py-1 text-xs font-black text-[#2d2d2d]">
                  {emotion}
                </span>
              {/each}
            </div>
          </div>

          <div class="bg-[#c4e1d4] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Rules Followed</p>
            <div class="flex items-end gap-2">
              <p class="text-3xl font-black text-[#2d2d2d]">{optionsData.rulesFollowed}</p>
              <p class="text-xl font-black text-[#2d2d2d]/60 mb-0.5">/ {optionsData.rulesTotal}</p>
            </div>
            <div class="mt-2 bg-white/60 rounded-full h-2 border border-black/30">
              <div 
                class="h-full bg-[#5fb369] rounded-full border-r border-black/30"
                style="width: {(optionsData.rulesFollowed / optionsData.rulesTotal) * 100}%;"
              />
            </div>
          </div>
        </div>

        <!-- Market Condition & Outcomes -->
        <div class="space-y-3">
          <div class="bg-[#e5d4f5] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">Market Condition</p>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-[#5fb369] border border-black animate-pulse"></div>
              <span class="font-black text-[#2d2d2d]">{optionsData.marketCondition}</span>
            </div>
          </div>

          <div class="bg-white border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <p class="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-3">Final Outcomes</p>
            <div class="flex flex-wrap gap-2">
              {#each optionsData.outcomes as outcome}
                <span class="bg-[#5fb369]/20 border border-[#5fb369] rounded-lg px-3 py-1.5 text-xs font-black text-[#2d2d2d] flex items-center gap-1.5">
                  <CheckCircle2 class="h-3 w-3 text-[#5fb369]" />
                  {outcome}
                </span>
              {/each}
            </div>
          </div>
        </div>

        <!-- Bottom Summary -->
        <div class="bg-[#47632d] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
          <div class="flex items-start gap-2">
            <ThumbsUp class="h-5 w-5 text-white/90 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-xs uppercase tracking-wider font-black text-white/90 mb-1">Daily Grade</p>
              <p class="text-sm text-white/80 leading-relaxed">
                Excellent options trading today. Good premium capture, volatility well-managed, disciplined position sizing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

