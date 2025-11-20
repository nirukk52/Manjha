<script lang="ts">
  import Landing from './Landing.svelte';
  import ChatInput from './ChatInput.svelte';
  import PinnedWidgets from './PinnedWidgets.svelte';
  import WidgetDashboard from './WidgetDashboard.svelte';
  import DailyReportPage from './DailyReportPage.svelte';
  import type { PinnedItem } from '$lib/types';
  import '../trading-journal.css';

  let showDashboard = $state(false);
  let pinnedItems = $state<PinnedItem[]>([]);
  let currentView = $state<'dashboard' | 'dailyReport'>('dashboard');
  let selectedDate = $state<Date | null>(null);

  function handleEnter() {
    showDashboard = true;
  }

  function handlePinItem(item: PinnedItem) {
    pinnedItems = [...pinnedItems, { ...item, id: Date.now().toString() }];
  }

  function handleRemovePin(id: string) {
    pinnedItems = pinnedItems.filter(item => item.id !== id);
  }

  function handleNewOutput(output: any) {
    // This is now handled internally in ChatInput
    console.log('Output generated:', output);
  }

  function handleDateClick(date: Date) {
    selectedDate = date;
    currentView = 'dailyReport';
  }

  function handleBackToDashboard() {
    currentView = 'dashboard';
    selectedDate = null;
  }
</script>

<svelte:head>
  <title>Manjha - Chat-Driven Trading Journal</title>
  <meta name="description" content="Your portfolio gets a brain, a rulebook, and a diary" />
</svelte:head>

{#if !showDashboard}
  <Landing onEnter={handleEnter} />
{:else}
  <div class="relative w-full bg-[#d4d4d8]" style="min-height: 100vh;">
    <!-- Background Graph Grid - Fixed background -->
    <div class="fixed inset-0 opacity-[0.15] pointer-events-none z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    <!-- Dashboard Content (Full screen scrollable) -->
    <div class="relative z-10">
      {#if currentView === 'dailyReport' && selectedDate}
        <DailyReportPage date={selectedDate} onBack={handleBackToDashboard} />
      {:else}
        <WidgetDashboard onDateClick={handleDateClick} />
      {/if}
    </div>

    <!-- Floating Chat Input at Bottom -->
    <ChatInput
      onOutputGenerated={handleNewOutput}
      onPinItem={handlePinItem}
    />

    <!-- Floating Pinned Widgets Panel on Right -->
    <PinnedWidgets 
      items={pinnedItems}
      onRemoveItem={handleRemovePin}
    />
  </div>
{/if}

