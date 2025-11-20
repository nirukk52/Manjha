<script lang="ts">
  import { GitBranch, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-svelte';

  interface Props {
    output: any;
    onPin: () => void;
  }

  let { output, onPin }: Props = $props();

  let mentalModel = $derived(output?.mentalModel || {});
</script>

<div class="p-6">
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-6">
      <GitBranch class="size-5 text-[#3f3f46]" />
      <h3 class="text-lg font-bold text-[#2d2d2d]">Your Mental Model</h3>
    </div>

    <!-- Flow Diagram -->
    <div class="space-y-6">
      <!-- Patterns Section -->
      {#if mentalModel.patterns && mentalModel.patterns.length > 0}
        <div class="relative">
          <div class="absolute left-8 top-12 bottom-0 w-0.5 bg-[#2d2d2d]"></div>
          
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-xl bg-[#e5c9c9] border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center flex-shrink-0">
              <AlertTriangle class="size-8 text-[#2d2d2d]" />
            </div>
            <div class="flex-1 pt-2">
              <h4 class="text-sm font-bold text-[#2d2d2d] mb-3">Behavioral Patterns</h4>
              <div class="space-y-3">
                {#each mentalModel.patterns as pattern}
                  <div class="bg-white border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <p class="text-sm text-[#2d2d2d]">{pattern}</p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Strengths Section -->
      {#if mentalModel.strengths && mentalModel.strengths.length > 0}
        <div class="relative">
          <div class="absolute left-8 top-12 bottom-0 w-0.5 bg-[#2d2d2d]"></div>
          
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-xl bg-[#c4e1d4] border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center flex-shrink-0">
              <CheckCircle class="size-8 text-[#2d2d2d]" />
            </div>
            <div class="flex-1 pt-2">
              <h4 class="text-sm font-bold text-[#2d2d2d] mb-3">Core Strengths</h4>
              <div class="space-y-3">
                {#each mentalModel.strengths as strength}
                  <div class="bg-white border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <p class="text-sm text-[#2d2d2d]">{strength}</p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Improvements Section -->
      {#if mentalModel.improvements && mentalModel.improvements.length > 0}
        <div class="relative">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-xl bg-[#d4c4e1] border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center flex-shrink-0">
              <TrendingUp class="size-8 text-[#2d2d2d]" />
            </div>
            <div class="flex-1 pt-2">
              <h4 class="text-sm font-bold text-[#2d2d2d] mb-3">Action Items</h4>
              <div class="space-y-3">
                {#each mentalModel.improvements as improvement, i}
                  <div class="bg-[#d4c4e1] border-2 border-black rounded-lg p-4 shadow-[3px_3px_0px_0px_#000000]">
                    <div class="flex items-start gap-3">
                      <span class="text-xs font-bold text-[#2d2d2d] bg-[#2d2d2d] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black">
                        {i + 1}
                      </span>
                      <p class="text-sm text-[#2d2d2d] flex-1">{improvement}</p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Summary Card -->
    <div class="mt-8 bg-[#d9b89c] border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000000]">
      <h4 class="text-sm font-bold text-[#2d2d2d] mb-2">Mental Model Summary</h4>
      <p class="text-sm text-[#2d2d2d]">
        Your trading behavior shows clear patterns. Focus on leveraging your strengths while implementing
        the action items to improve your overall performance and discipline.
      </p>
    </div>
  </div>
</div>

