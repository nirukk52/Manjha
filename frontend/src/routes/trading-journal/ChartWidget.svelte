<script lang="ts">
  import { BarChart2 } from 'lucide-svelte';

  interface Props {
    output: any;
    onPin: () => void;
  }

  let { output, onPin }: Props = $props();

  let chartType = $derived(output?.chartType || 'bar');
  let chartData = $derived(output?.chartData || { labels: [], values: [] });
</script>

<div class="p-6">
  <div class="max-w-3xl mx-auto">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <BarChart2 class="size-5 text-[#3f3f46]" />
        <h3 class="text-lg font-bold text-[#2d2d2d]">{chartType === 'line' ? 'Performance Trend' : 'Distribution Analysis'}</h3>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="bg-white border-2 border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_#000000]">
      <!-- Simple Bar Chart Visualization -->
      {#if chartType === 'bar' && chartData.labels && chartData.values}
        <div class="space-y-4">
          {#each chartData.labels as label, i}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-[#2d2d2d] font-medium">{label}</span>
                <span class="text-[#3f3f46] font-bold">{chartData.values[i]}%</span>
              </div>
              <div class="h-8 bg-[#e5e5e5] rounded-lg border-2 border-black overflow-hidden">
                <div 
                  class="h-full bg-[#b4d4e1] transition-all duration-500 flex items-center justify-end px-2"
                  style="width: {chartData.values[i]}%;"
                >
                  {#if chartData.values[i] > 15}
                    <span class="text-xs font-bold text-[#2d2d2d]">{chartData.values[i]}%</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else if chartType === 'line' && chartData.labels && chartData.values}
        <!-- Line Chart Visualization -->
        <div class="relative h-64">
          <svg class="w-full h-full" viewBox="0 0 400 200">
            <!-- Grid -->
            <g class="text-[#e5e5e5]">
              {#each [0, 50, 100, 150, 200] as y}
                <line x1="0" y1={y} x2="400" y2={y} stroke="currentColor" stroke-width="1" />
              {/each}
            </g>
            
            <!-- Line -->
            {#if chartData.values.length > 0}
              {@const max = Math.max(...chartData.values.map(Math.abs))}
              {@const min = Math.min(...chartData.values)}
              {@const range = max - min}
              {@const points = chartData.values.map((val, i) => {
                const x = (i / (chartData.values.length - 1)) * 400;
                const y = 200 - ((val - min) / range) * 180 - 10;
                return `${x},${y}`;
              }).join(' ')}
              <polyline
                points={points}
                fill="none"
                stroke="#b4d4e1"
                stroke-width="3"
                class="drop-shadow-lg"
              />
              {#each chartData.values as val, i}
                {@const x = (i / (chartData.values.length - 1)) * 400}
                {@const y = 200 - ((val - min) / range) * 180 - 10}
                <circle cx={x} cy={y} r="5" fill="#3f3f46" stroke="#000" stroke-width="2" />
              {/each}
            {/if}
          </svg>
          
          <!-- Labels -->
          <div class="flex justify-between mt-4 text-xs text-[#5a5a5a]">
            {#each chartData.labels as label}
              <span>{label}</span>
            {/each}
          </div>
        </div>
      {:else}
        <!-- Placeholder -->
        <div class="h-64 flex items-center justify-center text-[#5a5a5a]">
          <div class="text-center">
            <BarChart2 class="size-16 mx-auto mb-4 text-[#e5e5e5]" />
            <p class="text-sm">Chart data will appear here</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Chart Insights -->
    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="bg-[#d9b89c] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
        <p class="text-xs text-[#2d2d2d] mb-1">Average</p>
        <p class="text-2xl font-bold text-[#2d2d2d]">
          {chartData.values ? Math.round(chartData.values.reduce((a, b) => a + b, 0) / chartData.values.length) : 0}%
        </p>
      </div>
      <div class="bg-[#d4c4e1] border-2 border-black rounded-xl p-4 shadow-[3px_3px_0px_0px_#000000]">
        <p class="text-xs text-[#2d2d2d] mb-1">Peak</p>
        <p class="text-2xl font-bold text-[#2d2d2d]">
          {chartData.values ? Math.max(...chartData.values) : 0}%
        </p>
      </div>
    </div>
  </div>
</div>

