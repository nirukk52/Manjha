<script lang="ts">
  import { Pin, TrendingUp, AlertCircle, Globe, Zap } from 'lucide-svelte';

  const headlines = [
    {
      id: 1,
      text: 'Fed signals rate cuts may come sooner than expected',
      icon: TrendingUp,
      iconColor: '#5fb369',
      tag: 'Breaking',
      color: '#c4e1d4'
    },
    {
      id: 2,
      text: 'Tech earnings beat expectations, NASDAQ rallies',
      icon: Zap,
      iconColor: '#d9b89c',
      tag: 'Markets',
      color: '#f5e6d3'
    },
    {
      id: 3,
      text: 'Global oil prices drop 3% on supply concerns',
      icon: Globe,
      iconColor: '#6b9ac4',
      tag: 'Commodities',
      color: '#d9e8f5'
    },
    {
      id: 4,
      text: 'Crypto regulation talks intensify in Congress',
      icon: AlertCircle,
      iconColor: '#e36969',
      tag: 'Crypto',
      color: '#fce8e6'
    }
  ];
</script>

<div class="relative group bg-[#e8f4f8] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
  <button
    class="absolute top-3 right-3 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shadow-[2px_2px_0px_0px_#000000] z-10"
    title="Pin to chat dashboard"
  >
    <Pin class="h-4 w-4 text-[#2d2d2d]" />
  </button>

  <div class="absolute inset-5 opacity-5 pointer-events-none">
    <div class="grid grid-cols-8 grid-rows-12 h-full gap-1.5">
      {#each Array(96) as _}
        <div class="border border-[#2d2d2d]/30"></div>
      {/each}
    </div>
  </div>

  <div class="relative flex items-center justify-between mb-4">
    <h3 class="uppercase tracking-wide font-black text-[#2d2d2d]">Global News</h3>
    <div class="flex items-center gap-1.5">
      <div class="w-1.5 h-1.5 rounded-full bg-[#e36969] border border-black animate-pulse"></div>
      <span class="text-[10px] uppercase tracking-wider font-black text-[#2d2d2d]/60">Live</span>
    </div>
  </div>

  <div class="relative space-y-2.5">
    {#each headlines as headline}
      <div
        class="bg-white/80 border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
      >
        <div class="flex items-start gap-2.5">
          <div 
            class="flex-shrink-0 w-7 h-7 rounded-full border-2 border-black flex items-center justify-center mt-0.5"
            style="background-color: {headline.color}"
          >
            <svelte:component this={headline.icon} class="h-3.5 w-3.5" style="color: {headline.iconColor}" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm text-[#2d2d2d] leading-snug font-medium mb-1.5">
              {headline.text}
            </p>
            <span 
              class="inline-block text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border border-black/30"
              style="background-color: {headline.color}"
            >
              {headline.tag}
            </span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="relative mt-4 pt-3 border-t-2 border-black/20">
    <p class="text-[10px] text-[#2d2d2d]/50 text-center font-bold">
      Updated 2 minutes ago
    </p>
  </div>
</div>

