<script lang="ts">
  import { onMount } from 'svelte';
  
  let { children } = $props();

  onMount(() => {
    // Hide parent layout elements
    const app = document.querySelector('.app');
    if (app) {
      const header = app.querySelector('header');
      const footer = app.querySelector('footer');
      const main = app.querySelector('main');
      
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (main) {
        main.style.padding = '0';
        main.style.margin = '0';
        main.style.maxWidth = 'none';
        main.style.width = '100%';
      }
      
      if (app instanceof HTMLElement) {
        app.style.padding = '0';
        app.style.margin = '0';
        app.style.maxWidth = 'none';
      }
    }
  });
</script>

<div class="trading-journal-wrapper">
  {@render children()}
</div>

<style>
  :global(html, body) {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow-x: hidden;
  }

  :global(.app) {
    display: block !important;
    min-height: 100vh !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    width: 100vw !important;
  }

  :global(.app > header),
  :global(.app > footer) {
    display: none !important;
  }

  :global(.app > main) {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    width: 100% !important;
    flex: none !important;
    display: block !important;
    overflow: visible !important;
  }

  .trading-journal-wrapper {
    width: 100vw;
    min-height: 100vh;
    position: relative;
    overflow: visible;
  }
</style>
