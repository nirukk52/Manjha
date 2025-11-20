<script lang="ts">
  import { PinOff, BarChart2, GitBranch } from 'lucide-svelte';
  import { fly, scale } from 'svelte/transition';
  import type { PinnedItem } from '$lib/types';

  interface Props {
    items: PinnedItem[];
    onRemoveItem: (id: string) => void;
  }

  let { items, onRemoveItem }: Props = $props();
</script>

{#if items.length > 0}
  <div class="fixed top-6 right-6 z-30 w-80 max-h-[calc(100vh-120px)] pointer-events-auto">
    <div class="relative bg-white rounded-2xl p-4 space-y-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
      <div class="flex items-center justify-between mb-2 pb-3 border-b-2 border-black">
        <div>
          <h3 class="text-[#2d2d2d] font-medium">Chat Pinned Items</h3>
          <p class="text-xs text-[#5a5a5a]">from chat responses</p>
        </div>
      </div>

      <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
        {#each items as item (item.id)}
          <div
            class="relative bg-[#c4e1d4] rounded-xl p-3 group border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
            transition:scale={{ duration: 200 }}
          >
            <!-- Unpin button at top right -->
            <button
              onclick={() => onRemoveItem(item.id)}
              class="absolute -top-2 -right-2 p-2 rounded-lg bg-[#e5c9c9] border-2 border-black hover:bg-[#dc2626] hover:text-white transition-all shadow-[2px_2px_0px_0px_#000000] z-10"
              title="Unpin widget"
            >
              <PinOff class="h-3 w-3 text-[#2d2d2d]" />
            </button>

            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                {#if item.type === 'chart'}
                  <BarChart2 class="size-4 text-[#3f3f46]" />
                {:else}
                  <GitBranch class="size-4 text-[#3f3f46]" />
                {/if}
                <h4 class="text-sm text-[#2d2d2d] font-medium">{item.title}</h4>
              </div>
            </div>
            
            <p class="text-xs text-[#5a5a5a] mb-2">
              {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>

            <!-- Mini Preview -->
            <div class="bg-white rounded-lg p-3 h-32 flex items-center justify-center border-2 border-black">
              {#if item.type === 'chart'}
                <BarChart2 class="size-10 text-[#2d2d2d]/40" />
              {:else}
                <GitBranch class="size-10 text-[#2d2d2d]/40" />
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Next Button Area -->
      <div class="pt-3 border-t-2 border-black">
        <button class="w-full bg-[#e5c9c9] hover:bg-[#e5c9c9]/90 text-[#2d2d2d] border-2 border-black rounded-lg py-3 shadow-[4px_4px_0px_0px_#000000] transition-transform hover:translate-y-[-2px]">
          <span class="text-sm font-medium">Next button</span>
          <br />
          <span class="text-xs opacity-70">chat window stay as it is</span>
          <br />
          <span class="text-xs opacity-70">background moves to next page</span>
        </button>
      </div>
    </div>
  </div>
{/if}

