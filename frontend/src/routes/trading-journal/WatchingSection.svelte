<script lang="ts">
  import { Plus, ExternalLink, X, Twitter, Youtube, Rss, Link as LinkIcon, TrendingUp, Clock } from 'lucide-svelte';

  interface WatchedSource {
    id: string;
    type: 'twitter' | 'youtube' | 'rss' | 'url';
    name: string;
    handle?: string;
    url: string;
    addedDate: string;
    lastSync: string;
    updates: number;
  }

  let showAddModal = $state(false);
  let urlInput = $state('');
  let sources = $state<WatchedSource[]>([
    {
      id: '1',
      type: 'twitter',
      name: 'WallStreetJesus',
      handle: '@wallstjesus',
      url: 'https://twitter.com/wallstjesus',
      addedDate: '2025-02-10',
      lastSync: '2 mins ago',
      updates: 14
    },
    {
      id: '2',
      type: 'youtube',
      name: 'The Chart Guys',
      handle: '@TheChartGuys',
      url: 'https://youtube.com/@thechartguys',
      addedDate: '2025-02-08',
      lastSync: '1 hour ago',
      updates: 3
    },
    {
      id: '3',
      type: 'rss',
      name: 'TradingView Blog',
      url: 'https://www.tradingview.com/blog/en/',
      addedDate: '2025-02-05',
      lastSync: '5 mins ago',
      updates: 8
    }
  ]);

  function getIconForType(type: string) {
    switch (type) {
      case 'twitter':
        return Twitter;
      case 'youtube':
        return Youtube;
      case 'rss':
        return Rss;
      default:
        return LinkIcon;
    }
  }

  function getColorForType(type: string) {
    switch (type) {
      case 'twitter':
        return { bg: '#e8f5ff', border: '#1DA1F2', icon: '#1DA1F2' };
      case 'youtube':
        return { bg: '#ffebe8', border: '#FF0000', icon: '#FF0000' };
      case 'rss':
        return { bg: '#fff3e8', border: '#FFA500', icon: '#FFA500' };
      default:
        return { bg: '#f0f0f0', border: '#666666', icon: '#666666' };
    }
  }

  function removeSource(id: string) {
    sources = sources.filter(source => source.id !== id);
  }
</script>

<div class="space-y-6">
  <!-- Header Section -->
  <div class="relative bg-gradient-to-br from-[#c4e1d4] to-[#b4d4e1] rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-2">Watching</h3>
        <p class="text-sm text-[#2d2d2d]/70 leading-relaxed max-w-md">
          Track public social accounts and URLs. Content gets synced and fed into Manjha's knowledge graph.
        </p>
      </div>
      <div class="w-12 h-12 rounded-full bg-[#fce8e6] border-2 border-black flex items-center justify-center">
        <span class="text-xl">👀</span>
      </div>
    </div>

    <button
      onclick={() => showAddModal = !showAddModal}
      class="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#f5f5f5] border-2 border-black rounded-xl py-3 px-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
    >
      <Plus class="h-5 w-5 text-[#2d2d2d]" />
      <span class="font-black uppercase tracking-tight text-[#2d2d2d]">Add Source</span>
    </button>
  </div>

  <!-- Add Source Modal/Form -->
  {#if showAddModal}
    <div class="relative bg-white rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-black uppercase tracking-tight text-[#2d2d2d]">Add New Source</h4>
        <button
          onclick={() => showAddModal = false}
          class="p-2 rounded-lg bg-[#fce8e6] border-2 border-black hover:bg-[#fcd8d6] transition-colors"
        >
          <X class="h-4 w-4 text-[#2d2d2d]" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-2">
            Paste URL or Handle
          </label>
          <input
            type="text"
            bind:value={urlInput}
            placeholder="twitter.com/username, youtube.com/@channel, or any URL"
            class="w-full px-4 py-3 border-2 border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#387ED1]/50"
          />
        </div>

        <div>
          <p class="text-xs uppercase tracking-wider font-bold text-[#2d2d2d]/60 mb-2">
            Quick Add
          </p>
          <div class="grid grid-cols-2 gap-2">
            <button class="flex items-center gap-2 p-3 bg-[#e8f5ff] border-2 border-[#1DA1F2] rounded-lg hover:bg-[#d8ebff] transition-colors">
              <Twitter class="h-4 w-4 text-[#1DA1F2]" />
              <span class="text-xs font-black text-[#2d2d2d]">Twitter</span>
            </button>
            <button class="flex items-center gap-2 p-3 bg-[#ffebe8] border-2 border-[#FF0000] rounded-lg hover:bg-[#ffdbd8] transition-colors">
              <Youtube class="h-4 w-4 text-[#FF0000]" />
              <span class="text-xs font-black text-[#2d2d2d]">YouTube</span>
            </button>
            <button class="flex items-center gap-2 p-3 bg-[#fff3e8] border-2 border-[#FFA500] rounded-lg hover:bg-[#ffe3d8] transition-colors">
              <Rss class="h-4 w-4 text-[#FFA500]" />
              <span class="text-xs font-black text-[#2d2d2d]">RSS Feed</span>
            </button>
            <button class="flex items-center gap-2 p-3 bg-[#f0f0f0] border-2 border-[#666666] rounded-lg hover:bg-[#e0e0e0] transition-colors">
              <LinkIcon class="h-4 w-4 text-[#666666]" />
              <span class="text-xs font-black text-[#2d2d2d]">Any URL</span>
            </button>
          </div>
        </div>

        <button class="w-full bg-[#387ED1] hover:bg-[#2563eb] border-2 border-black rounded-lg py-3 px-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <span class="font-black uppercase tracking-tight text-white">Start Watching</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Active Sources List -->
  <div class="relative bg-[#d4c4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
    <h4 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">
      Active Sources ({sources.length})
    </h4>

    <div class="space-y-3">
      {#each sources as source}
        {@const colors = getColorForType(source.type)}
        {@const Icon = getIconForType(source.type)}
        <div
          class="bg-white/80 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center"
              style="background-color: {colors.bg}; color: {colors.icon}"
            >
              <svelte:component this={Icon} class="h-5 w-5" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-black text-[#2d2d2d] leading-none mb-0.5">
                    {source.name}
                  </p>
                  {#if source.handle}
                    <p class="text-xs font-bold" style="color: {colors.icon}">
                      {source.handle}
                    </p>
                  {/if}
                </div>
                <div class="flex items-center gap-1">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-1.5 rounded-md bg-[#f0f0f0] border border-black/20 hover:bg-[#e0e0e0] transition-colors"
                  >
                    <ExternalLink class="h-3 w-3 text-[#2d2d2d]" />
                  </a>
                  <button
                    onclick={() => removeSource(source.id)}
                    class="p-1.5 rounded-md bg-[#fce8e6] border border-[#dc2626]/30 hover:bg-[#fcd8d6] transition-colors"
                  >
                    <X class="h-3 w-3 text-[#dc2626]" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 mb-2">
                <div class="bg-[#c4e1d4]/30 border border-black/10 rounded px-2 py-1">
                  <div class="flex items-center gap-1">
                    <TrendingUp class="h-3 w-3 text-[#16a34a]" />
                    <span class="text-xs font-black text-[#2d2d2d]">
                      {source.updates}
                    </span>
                  </div>
                  <p class="text-[9px] text-[#2d2d2d]/60 font-bold">Updates</p>
                </div>
                <div class="bg-[#d9e8f5]/30 border border-black/10 rounded px-2 py-1">
                  <div class="flex items-center gap-1">
                    <Clock class="h-3 w-3 text-[#387ED1]" />
                    <span class="text-xs font-black text-[#2d2d2d]">
                      {source.lastSync}
                    </span>
                  </div>
                  <p class="text-[9px] text-[#2d2d2d]/60 font-bold">Last sync</p>
                </div>
                <div class="bg-[#f5e6d3]/30 border border-black/10 rounded px-2 py-1">
                  <span class="text-xs font-black text-[#2d2d2d]">
                    {new Date(source.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <p class="text-[9px] text-[#2d2d2d]/60 font-bold">Added</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
                  <span class="text-[10px] uppercase tracking-wider font-black text-[#16a34a]">
                    Syncing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Info Card -->
  <div class="relative bg-[#47632d] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
    <div class="flex items-start gap-3">
      <span class="text-2xl">💡</span>
      <div>
        <h4 class="font-black text-white mb-2">How It Works</h4>
        <ul class="space-y-2 text-sm text-white/90">
          <li class="flex items-start gap-2">
            <span class="text-[#c4e1d4]">•</span>
            <span>Content is synced every 5-15 minutes</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#c4e1d4]">•</span>
            <span>AI analyzes sentiment, trends, and trading signals</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#c4e1d4]">•</span>
            <span>Insights appear in your chat and dashboard</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-[#c4e1d4]">•</span>
            <span>Only public content is tracked - no authentication needed</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Suggested Sources -->
  <div class="relative bg-[#f5e6d3] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
    <h4 class="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">
      Suggested Sources
    </h4>
    <div class="space-y-2">
      <button class="w-full flex items-center justify-between p-3 bg-white/60 border-2 border-black rounded-lg hover:bg-white hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#e8f5ff] border-2 border-[#1DA1F2] flex items-center justify-center">
            <Twitter class="h-4 w-4 text-[#1DA1F2]" />
          </div>
          <div class="text-left">
            <p class="font-black text-[#2d2d2d] leading-none">@traderstewie</p>
            <p class="text-xs text-[#2d2d2d]/60">Options flow expert</p>
          </div>
        </div>
        <Plus class="h-5 w-5 text-[#2d2d2d]" />
      </button>

      <button class="w-full flex items-center justify-between p-3 bg-white/60 border-2 border-black rounded-lg hover:bg-white hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#fff3e8] border-2 border-[#FFA500] flex items-center justify-center">
            <Rss class="h-4 w-4 text-[#FFA500]" />
          </div>
          <div class="text-left">
            <p class="font-black text-[#2d2d2d] leading-none">Bloomberg Markets</p>
            <p class="text-xs text-[#2d2d2d]/60">Market news feed</p>
          </div>
        </div>
        <Plus class="h-5 w-5 text-[#2d2d2d]" />
      </button>

      <button class="w-full flex items-center justify-between p-3 bg-white/60 border-2 border-black rounded-lg hover:bg-white hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#ffebe8] border-2 border-[#FF0000] flex items-center justify-center">
            <Youtube class="h-4 w-4 text-[#FF0000]" />
          </div>
          <div class="text-left">
            <p class="font-black text-[#2d2d2d] leading-none">Warrior Trading</p>
            <p class="text-xs text-[#2d2d2d]/60">Day trading videos</p>
          </div>
        </div>
        <Plus class="h-5 w-5 text-[#2d2d2d]" />
      </button>
    </div>
  </div>
</div>

