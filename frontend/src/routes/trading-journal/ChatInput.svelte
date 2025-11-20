<script lang="ts">
  import { Send, X, ChevronDown, ChevronUp, Pin } from 'lucide-svelte';
  import { fly, slide } from 'svelte/transition';
  import { generateResponse } from '$lib/utils/responseGenerator';
  import type { ConversationItem, PinnedItem } from '$lib/types';
  import DirectAnswer from './DirectAnswer.svelte';
  import ChartWidget from './ChartWidget.svelte';
  import MentalModelFlow from './MentalModelFlow.svelte';

  interface Props {
    onOutputGenerated: (output: any) => void;
    onPinItem: (item: PinnedItem) => void;
  }

  let { onOutputGenerated, onPinItem }: Props = $props();

  let input = $state('');
  let isLoading = $state(false);
  let conversation = $state<ConversationItem[]>([]);
  let activeTab = $state<'answer' | 'chart' | 'mental-model'>('answer');
  let isExpanded = $state(true);

  let hasMessages = $derived(conversation.length > 0);
  let currentOutput = $derived(conversation.length > 0 ? conversation[conversation.length - 1].output : null);
  let lastUserMessage = $derived(conversation.filter(item => item.type === 'user').pop()?.content || '');

  const quickQuestions = [
    "Why is my P&L negative this month?",
    "What's my win rate by sector?",
    "Show my biggest losing streaks",
    "Am I overtrading on impulsive setups?",
    "Which time of day am I most profitable?",
    "How does my planned vs impulsive trade performance compare?",
    "What's my average hold time for winners vs losers?",
    "Show my risk-reward ratio trends"
  ];

  function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationItem = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    conversation = [...conversation, userMessage];
    isLoading = true;

    const currentInput = input;
    input = '';

    // Generate AI response
    setTimeout(() => {
      const response = generateResponse(currentInput);
      
      const assistantMessage: ConversationItem = {
        type: 'assistant',
        content: response.answer || 'Response generated',
        output: response,
        timestamp: new Date()
      };

      conversation = [...conversation, assistantMessage];
      onOutputGenerated(response);
      isLoading = false;
      isExpanded = true;
    }, 500);
  }

  function handlePinChart() {
    if (!currentOutput) return;
    onPinItem({
      id: Date.now().toString(),
      type: 'chart',
      title: currentOutput.chartType || 'Chart',
      chartType: currentOutput.chartType,
      data: currentOutput,
      timestamp: new Date()
    });
  }

  function handlePinModel() {
    if (!currentOutput) return;
    onPinItem({
      id: Date.now().toString(),
      type: 'mental-model',
      title: 'Mental Model',
      data: currentOutput.mentalModel,
      timestamp: new Date()
    });
  }

  function handleClose() {
    conversation = [];
    input = '';
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }
</script>

<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-6">
  <div 
    class="border border-[#a1a1aa] rounded-[32px] bg-[#fafafa] mt-4 flex flex-col overflow-hidden transition-all duration-300"
    style="height: {hasMessages ? 'calc(100vh - 3rem)' : 'auto'};"
  >
    <!-- Conversation Area - Only show when there are messages -->
    {#if hasMessages}
      <div class="flex-1 flex flex-col overflow-hidden" transition:slide={{ duration: 300 }}>
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#b4d4e1]">
          <button
            onclick={() => isExpanded = !isExpanded}
            class="flex items-center gap-2 text-[#2d2d2d] hover:text-[#18181b] transition-colors"
          >
            {#if isExpanded}
              <ChevronDown class="size-5" />
            {:else}
              <ChevronUp class="size-5" />
            {/if}
            <span class="text-sm font-bold">
              {isExpanded ? 'Collapse' : 'Expand'} response
            </span>
          </button>
          
          <div class="flex items-center gap-2">
            {#if activeTab === 'chart'}
              <button
                onclick={handlePinChart}
                class="text-xs px-3 py-2 rounded hover:bg-white/50 transition-colors flex items-center gap-1"
              >
                <Pin class="size-4" />
                Pin Chart
              </button>
            {/if}
            {#if activeTab === 'mental-model'}
              <button
                onclick={handlePinModel}
                class="text-xs px-3 py-2 rounded hover:bg-white/50 transition-colors flex items-center gap-1"
              >
                <Pin class="size-4" />
                Pin Model
              </button>
            {/if}
            <button
              onclick={handleClose}
              class="text-[#2d2d2d] hover:text-[#18181b] p-2"
            >
              <X class="size-4" />
            </button>
          </div>
        </div>

        <!-- Content Area -->
        {#if isExpanded}
          <div class="flex-1 flex flex-col overflow-hidden bg-white">
            <!-- User Message -->
            <div class="p-6 bg-[#fafafa]">
              <div class="flex justify-end">
                <div class="max-w-[80%] px-4 py-3 rounded-2xl border-2 border-black bg-[#3f3f46] text-white shadow-[3px_3px_0px_0px_#000000]">
                  <p class="text-sm">{lastUserMessage}</p>
                </div>
              </div>
            </div>

            <!-- Response Content Box -->
            <div class="flex-1 overflow-y-auto bg-white">
              {#if activeTab === 'answer'}
                <DirectAnswer output={currentOutput} />
              {:else if activeTab === 'chart'}
                <ChartWidget output={currentOutput} onPin={handlePinChart} />
              {:else if activeTab === 'mental-model'}
                <MentalModelFlow output={currentOutput} onPin={handlePinModel} />
              {/if}
            </div>

            <!-- Tab Pills at Bottom -->
            <div class="flex items-center justify-center gap-3 bg-[#fafafa] py-3">
              <button
                onclick={() => activeTab = 'answer'}
                class="relative px-8 py-3 rounded-full transition-all text-sm font-medium border-2 border-black {activeTab === 'answer'
                  ? 'bg-[#d9b89c] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                  : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'}"
              >
                Answer
              </button>
              <button
                onclick={() => activeTab = 'chart'}
                class="relative px-8 py-3 rounded-full transition-all text-sm font-medium border-2 border-black {activeTab === 'chart'
                  ? 'bg-[#e5c9c9] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                  : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'}"
              >
                Chart
              </button>
              <button
                onclick={() => activeTab = 'mental-model'}
                class="relative px-8 py-3 rounded-full transition-all text-sm font-medium border-2 border-black {activeTab === 'mental-model'
                  ? 'bg-[#d4c4e1] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                  : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'}"
              >
                Model
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Input Section - Always visible at bottom -->
    <div class="p-4">
      <!-- Quick Questions -->
      {#if !input && !hasMessages}
        <div class="mb-2 overflow-x-auto scrollbar-hide">
          <div class="flex gap-2 pb-2 min-w-max px-1">
            {#each quickQuestions as q, i}
              {@const colors = [
                'bg-[#3f3f46]',
                'bg-[#52525b]',
                'bg-[#27272a]',
                'bg-[#71717a]',
                'bg-[#3f3f46]',
                'bg-[#52525b]',
                'bg-[#44403c]',
                'bg-[#27272a]',
              ]}
              {@const colorClass = colors[i % colors.length]}
              <button
                onclick={() => input = q}
                class="relative text-xs px-4 py-2 rounded-lg {colorClass} text-[#e5e5e5] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] border-2 border-black shadow-[3px_3px_0px_0px_#000000] whitespace-nowrap flex-shrink-0 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                {q}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Chat Input Bar -->
      <div class="relative bg-[#18181b] rounded-2xl p-3 flex items-center gap-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div class="flex-1 flex items-center gap-2 bg-[#e5e5e5] rounded-lg px-4 py-3 border-2 border-black">
          <input
            bind:value={input}
            onkeydown={handleKeyDown}
            placeholder="Why is my P&L negative this month, and what should I fix?"
            class="flex-1 bg-transparent border-none outline-none text-[#2d2d2d] placeholder:text-[#5a5a5a] font-mono"
            disabled={isLoading}
          />
        </div>
        <button 
          onclick={handleSend}
          disabled={!input.trim() || isLoading}
          class="rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-[#e5e5e5] h-12 px-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send class="size-5" />
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>

