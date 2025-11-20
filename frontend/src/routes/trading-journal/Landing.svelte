<script lang="ts">
  import { ArrowRight, BarChart3, Brain, BookOpen } from 'lucide-svelte';

  interface Props {
    onEnter: () => void;
  }

  let { onEnter }: Props = $props();

  // Kite animation state
  let kite1Y = $state(0);
  let kite1X = $state(0);
  let kite1Rotate = $state(0);
  
  let kite2Y = $state(0);
  let kite2X = $state(0);
  let kite2Rotate = $state(0);
  
  let kite3Y = $state(0);
  let kite3X = $state(0);
  let kite3Rotate = $state(0);
  
  $effect(() => {
    // Animate kite 1
    const animateKites = () => {
      const time = Date.now() / 1000;
      
      // Kite 1 - 6 second cycle
      kite1Y = Math.sin(time * (Math.PI / 3)) * 20;
      kite1X = Math.cos(time * (Math.PI / 3)) * 10;
      kite1Rotate = Math.sin(time * (Math.PI / 3)) * 5;
      
      // Kite 2 - 5 second cycle with delay
      kite2Y = Math.sin((time + 1) * (Math.PI / 2.5)) * 15;
      kite2X = Math.cos((time + 1) * (Math.PI / 2.5)) * -8;
      kite2Rotate = Math.sin((time + 1) * (Math.PI / 2.5)) * -4;
      
      // Kite 3 - 7 second cycle with delay
      kite3Y = Math.sin((time + 2) * (Math.PI / 3.5)) * 18;
      kite3X = Math.cos((time + 2) * (Math.PI / 3.5)) * 12;
      kite3Rotate = Math.sin((time + 2) * (Math.PI / 3.5)) * 6;
      
      requestAnimationFrame(animateKites);
    };
    animateKites();
  });
</script>

<div class="min-h-screen bg-[#d4d4d8] relative overflow-hidden">
  <!-- Background Grid -->
  <div class="absolute inset-0 opacity-[0.15]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#landing-grid)" />
    </svg>
  </div>

  <div class="relative z-10">
    <!-- Floating Kites - Right Side -->
    <div class="absolute right-0 top-0 w-1/3 h-screen pointer-events-none opacity-30 hidden lg:block">
      <!-- Kite 1 -->
      <div 
        class="absolute right-32 top-40"
        style="transform: translate({kite1X}px, {kite1Y}px) rotate({kite1Rotate}deg);"
      >
        <svg width="60" height="400" viewBox="0 0 60 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 5L50 30L30 55L10 30L30 5Z" fill="#e5c9c9" stroke="#18181b" stroke-width="2"/>
          <path d="M30 55 Q35 120, 30 180 T30 300 Q28 350, 30 400" stroke="#18181b" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
        </svg>
      </div>
      
      <!-- Kite 2 -->
      <div 
        class="absolute right-20 top-64"
        style="transform: translate({kite2X}px, {kite2Y}px) rotate({kite2Rotate}deg);"
      >
        <svg width="50" height="350" viewBox="0 0 50 350" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 5L40 25L25 45L10 25L25 5Z" fill="#d9b89c" stroke="#18181b" stroke-width="2"/>
          <path d="M25 45 Q20 100, 25 150 T25 250 Q27 300, 25 350" stroke="#18181b" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
        </svg>
      </div>
      
      <!-- Kite 3 -->
      <div 
        class="absolute right-48 top-96"
        style="transform: translate({kite3X}px, {kite3Y}px) rotate({kite3Rotate}deg);"
      >
        <svg width="45" height="300" viewBox="0 0 45 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.5 5L37.5 23L22.5 41L7.5 23L22.5 5Z" fill="#d4c4e1" stroke="#18181b" stroke-width="2"/>
          <path d="M22.5 41 Q18 90, 22.5 140 T22.5 240 Q24 270, 22.5 300" stroke="#18181b" stroke-width="2" stroke-dasharray="4 3" fill="none"/>
        </svg>
      </div>
    </div>

    <!-- Top Navigation Bar -->
    <nav class="max-w-5xl mx-auto px-6 py-6">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="w-10 h-10 bg-[#18181b] border-[3px] border-black rounded-lg flex items-center justify-center relative overflow-hidden">
          <div class="w-full h-full bg-gradient-to-br from-[#b4d4e1] to-[#d4c4e1]"></div>
        </div>
        
        <!-- About Link -->
        <a 
          href="#about" 
          class="text-lg text-[#18181b] hover:text-[#52525b] transition-colors px-4 py-2 rounded-lg bg-white hover:bg-white/50 border-[3px] border-black"
        >
          About
        </a>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-5xl mx-auto px-6 pt-16 pb-16">
      <div class="space-y-8">
        <!-- Logo/Name -->
        <div class="space-y-2">
          <h1 class="text-7xl tracking-tight">Manjha</h1>
          <p class="text-xl text-[#52525b]">Personal financial assistant and portfolio manager.</p>
        </div>

        <!-- Main Headline -->
        <div class="space-y-4">
          <h2 class="text-6xl max-w-3xl leading-tight">
            Your portfolio gets a 
            <span class="relative inline-block">
              <span class="relative z-10 px-2">brain</span>
              <span class="absolute inset-0 bg-[#d9b89c] -rotate-1 border-4 border-black"></span>
            </span>, a 
            <span class="relative inline-block">
              <span class="relative z-10 px-2">rulebook</span>
              <span class="absolute inset-0 bg-[#e5c9c9] rotate-1 border-4 border-black"></span>
            </span>, and a 
            <span class="relative inline-block">
              <span class="relative z-10 px-2">diary</span>
              <span class="absolute inset-0 bg-[#d4c4e1] -rotate-1 border-4 border-black"></span>
            </span>
          </h2>
          <p class="text-xl text-[#52525b] max-w-2xl leading-relaxed font-medium">
            Manjha creates a 
            <span class="relative inline-block">
              <span class="relative z-10 text-[#3f3f46] font-bold">mental model</span>
              <span class="absolute inset-x-0 bottom-0 h-2 bg-[#d4c4e1]/50 -rotate-1"></span>
            </span>
            for himself, a 
            <span class="relative inline-block">
              <span class="relative z-10 text-[#3f3f46] font-bold">discipline engine</span>
              <span class="absolute inset-x-0 bottom-0 h-2 bg-[#e5c9c9]/50 rotate-1"></span>
            </span>
            for you, and a 
            <span class="relative inline-block">
              <span class="relative z-10 text-[#3f3f46] font-bold">journal</span>
              <span class="absolute inset-x-0 bottom-0 h-2 bg-[#d9b89c]/50 -rotate-1"></span>
            </span>
            for your portfolio. From scattered trades to disciplined, documented strategy.
          </p>
          <p class="text-xl text-[#52525b] italic">A rope for your Kite account</p>
        </div>

        <!-- CTA -->
        <div class="pt-4">
          <button
            onclick={onEnter}
            class="group px-10 py-8 text-xl bg-[#18181b] hover:bg-[#27272a] text-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[4px] hover:translate-y-[4px] rounded-2xl flex items-center gap-2"
          >
            Open Dashboard
            <ArrowRight class="size-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>

    <!-- Three Pillars -->
    <div class="max-w-5xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Mental Model -->
        <div class="bg-[#d9b89c] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-2xl p-8 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border-4 border-black rounded-xl mb-4">
            <Brain class="size-8 text-white" />
          </div>
          <h3 class="text-2xl mb-3">Mental Model</h3>
          <p class="text-[#2d2d2d]">
            Manjha analyzes patterns, learns your style, and builds a living mental model of your trading behavior.
          </p>
        </div>

        <!-- Discipline Engine -->
        <div class="bg-[#e5c9c9] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-2xl p-8 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border-4 border-black rounded-xl mb-4">
            <BarChart3 class="size-8 text-white" />
          </div>
          <h3 class="text-2xl mb-3">Discipline Engine</h3>
          <p class="text-[#2d2d2d]">
            Get personalized rules, decision flows, and risk guardrails that adapt to your portfolio's reality.
          </p>
        </div>

        <!-- Portfolio Journal -->
        <div class="bg-[#d4c4e1] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-2xl p-8 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border-4 border-black rounded-xl mb-4">
            <BookOpen class="size-8 text-white" />
          </div>
          <h3 class="text-2xl mb-3">Portfolio Journal</h3>
          <p class="text-[#2d2d2d]">
            Every trade, every decision, every lesson—logged, searchable, and ready to surface insights when you need them.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="max-w-5xl mx-auto px-6 py-16 text-center">
      <div class="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] rounded-2xl p-12">
        <h3 class="text-4xl mb-4">
          Not just P&L, a memory for your money.
        </h3>
        <p class="text-xl text-[#5a5a5a] mb-8 max-w-2xl mx-auto">
          Stop trading blind. Start building discipline, clarity, and a portfolio that learns with you.
        </p>
        <button
          onclick={onEnter}
          class="group px-10 py-8 text-xl bg-[#18181b] hover:bg-[#27272a] text-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[4px] hover:translate-y-[4px] rounded-2xl inline-flex items-center gap-2"
        >
          Get Started
          <ArrowRight class="size-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>
</div>
