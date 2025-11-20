<script lang="ts">
  interface Props {
    output: any;
  }

  let { output }: Props = $props();
</script>

<div class="p-6">
  <div class="max-w-2xl mx-auto">
    <!-- AI Response -->
    <div class="bg-[#fafafa] border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000000]">
      <div class="flex items-start gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-[#b4d4e1] border-2 border-black flex items-center justify-center flex-shrink-0">
          <span class="text-sm font-bold">AI</span>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-bold text-[#2d2d2d] mb-1">Manjha Analysis</h3>
          <p class="text-xs text-[#5a5a5a]">Based on your portfolio data</p>
        </div>
      </div>
      
      <div class="prose prose-sm max-w-none">
        <p class="text-[#2d2d2d] leading-relaxed">
          {output?.answer || 'Analyzing your portfolio...'}
        </p>
      </div>

      {#if output?.chartData}
        <div class="mt-4 p-4 bg-white border-2 border-black rounded-lg">
          <p class="text-xs text-[#5a5a5a] mb-2">Quick Insight</p>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-[#e5e5e5] rounded-full border border-black overflow-hidden">
              <div class="h-full bg-[#b4d4e1] rounded-full" style="width: 65%;"></div>
            </div>
            <span class="text-sm font-bold">65%</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Key Insights -->
    {#if output?.mentalModel}
      <div class="mt-6 space-y-3">
        <h4 class="text-sm font-bold text-[#2d2d2d]">Key Takeaways</h4>
        
        {#if output.mentalModel.patterns}
          <div class="bg-[#e5c9c9] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <h5 class="text-xs font-bold text-[#2d2d2d] mb-2">Patterns Detected</h5>
            <ul class="space-y-1">
              {#each output.mentalModel.patterns as pattern}
                <li class="text-sm text-[#2d2d2d] flex items-start gap-2">
                  <span class="text-xs">•</span>
                  <span>{pattern}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if output.mentalModel.improvements}
          <div class="bg-[#d4c4e1] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
            <h5 class="text-xs font-bold text-[#2d2d2d] mb-2">Recommended Actions</h5>
            <ul class="space-y-1">
              {#each output.mentalModel.improvements as improvement}
                <li class="text-sm text-[#2d2d2d] flex items-start gap-2">
                  <span class="text-xs">→</span>
                  <span>{improvement}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

