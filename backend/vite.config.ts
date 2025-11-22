/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Disable file-level parallelism for VSCode compatibility
    fileParallelism: false,
    // Enable TypeScript resolution
    globals: true,
    environment: 'node',
  },
});

