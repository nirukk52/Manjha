<script lang="ts">
  import { Pin, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-svelte';

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

  function getSentimentColor(sentiment: 'bullish' | 'bearish' | 'neutral') {
    if (sentiment === 'bullish') return 'bg-[#c4e1d4]';
    if (sentiment === 'bearish') return 'bg-[#fce8e6]';
    return 'bg-[#f5e6d3]';
  }

  function getSentimentIndicatorColor(sentiment: 'bullish' | 'bearish' | 'neutral') {
    if (sentiment === 'bullish') return 'bg-[#5fb369]';
    if (sentiment === 'bearish') return 'bg-[#e36969]';
    return 'bg-[#d9b89c]';
  }
</script>

<div class="mt-6 max-w-5xl mx-auto">
  <div class="relative group bg-[#e8e4f3] rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
    <button
      class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
      title="Pin to chat dashboard"
    >
      <Pin class="h-4 w-4 text-[#2d2d2d]" />
    </button>

    <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-6">Market Sentiment</h3>

    <div class="absolute inset-6 opacity-5 pointer-events-none">
      <div class="grid grid-cols-12 grid-rows-8 h-full gap-3">
        {#each Array(96) as _}
          <div class="border border-[#2d2d2d]/30"></div>
        {/each}
      </div>
    </div>

    <div class="relative grid grid-cols-2 gap-6">
      <!-- NIFTY 50 Card -->
      <div class="{getSentimentColor(nifty50.sentiment)} border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000000]">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">Nifty 50</h4>
            <p class="text-2xl font-black text-[#2d2d2d]">
              {nifty50.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div class="flex items-center gap-1 mt-1 {nifty50.change >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}">
              {#if nifty50.change >= 0}
                <TrendingUp class="h-3 w-3" />
              {:else}
                <TrendingDown class="h-3 w-3" />
              {/if}
              <span class="text-xs font-black">
                {nifty50.change >= 0 ? '+' : ''}{nifty50.change.toFixed(2)} ({nifty50.changePercent >= 0 ? '+' : ''}{nifty50.changePercent}%)
              </span>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div class="{getSentimentIndicatorColor(nifty50.sentiment)} border-2 border-black rounded-full p-3 shadow-[3px_3px_0px_0px_#000000]">
              {#if nifty50.sentiment === 'bullish'}
                <ArrowUp class="h-6 w-6 text-white" stroke-width="3" />
              {:else if nifty50.sentiment === 'bearish'}
                <ArrowDown class="h-6 w-6 text-white" stroke-width="3" />
              {:else}
                <div class="h-6 w-6 flex items-center justify-center text-white font-black">—</div>
              {/if}
            </div>
            <span class="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]">
              {nifty50.sentiment}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="bg-white/80 border-2 border-black rounded-lg p-3">
            <p class="text-[10px] uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-2">Support & Resistance</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <span class="text-[9px] text-[#e36969] block mb-0.5 uppercase font-bold">Resistance</span>
                <span class="text-sm font-black text-[#2d2d2d]">{nifty50.resistance.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span class="text-[9px] text-[#5fb369] block mb-0.5 uppercase font-bold">Support</span>
                <span class="text-sm font-black text-[#2d2d2d]">{nifty50.support.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="bg-white/60 border border-black/40 rounded-lg p-2">
              <span class="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-bold">Pivot</span>
              <span class="text-xs font-black text-[#2d2d2d]">{nifty50.pivot.toLocaleString('en-IN')}</span>
            </div>
            <div class="bg-white/60 border border-black/40 rounded-lg p-2">
              <span class="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-bold">VWAP</span>
              <span class="text-xs font-black text-[#2d2d2d]">{nifty50.vwap.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="mt-3 bg-white border-2 border-black rounded-lg p-3">
          <p class="text-xs text-[#2d2d2d]/80 leading-relaxed">
            <span class="font-black">Market View:</span> Price trading above VWAP with strong momentum. Watch for resistance test at {nifty50.resistance.toLocaleString('en-IN')}.
          </p>
        </div>
      </div>

      <!-- BANK NIFTY Card -->
      <div class="{getSentimentColor(bankNifty.sentiment)} border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000000]">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-1">Bank Nifty</h4>
            <p class="text-2xl font-black text-[#2d2d2d]">
              {bankNifty.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div class="flex items-center gap-1 mt-1 {bankNifty.change >= 0 ? 'text-[#5fb369]' : 'text-[#e36969]'}">
              {#if bankNifty.change >= 0}
                <TrendingUp class="h-3 w-3" />
              {:else}
                <TrendingDown class="h-3 w-3" />
              {/if}
              <span class="text-xs font-black">
                {bankNifty.change >= 0 ? '+' : ''}{bankNifty.change.toFixed(2)} ({bankNifty.changePercent >= 0 ? '+' : ''}{bankNifty.changePercent}%)
              </span>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2">
            <div class="{getSentimentIndicatorColor(bankNifty.sentiment)} border-2 border-black rounded-full p-3 shadow-[3px_3px_0px_0px_#000000]">
              {#if bankNifty.sentiment === 'bullish'}
                <ArrowUp class="h-6 w-6 text-white" stroke-width="3" />
              {:else if bankNifty.sentiment === 'bearish'}
                <ArrowDown class="h-6 w-6 text-white" stroke-width="3" />
              {:else}
                <div class="h-6 w-6 flex items-center justify-center text-white font-black">—</div>
              {/if}
            </div>
            <span class="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]">
              {bankNifty.sentiment}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="bg-white/80 border-2 border-black rounded-lg p-3">
            <p class="text-[10px] uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-2">Support & Resistance</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <span class="text-[9px] text-[#e36969] block mb-0.5 uppercase font-bold">Resistance</span>
                <span class="text-sm font-black text-[#2d2d2d]">{bankNifty.resistance.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span class="text-[9px] text-[#5fb369] block mb-0.5 uppercase font-bold">Support</span>
                <span class="text-sm font-black text-[#2d2d2d]">{bankNifty.support.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="bg-white/60 border border-black/40 rounded-lg p-2">
              <span class="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-bold">Pivot</span>
              <span class="text-xs font-black text-[#2d2d2d]">{bankNifty.pivot.toLocaleString('en-IN')}</span>
            </div>
            <div class="bg-white/60 border border-black/40 rounded-lg p-2">
              <span class="text-[9px] text-[#2d2d2d]/60 block mb-0.5 uppercase font-bold">VWAP</span>
              <span class="text-xs font-black text-[#2d2d2d]">{bankNifty.vwap.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="mt-3 bg-white border-2 border-black rounded-lg p-3">
          <p class="text-xs text-[#2d2d2d]/80 leading-relaxed">
            <span class="font-black">Market View:</span> Facing resistance near current levels. Support zone at {bankNifty.support.toLocaleString('en-IN')} remains critical.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

