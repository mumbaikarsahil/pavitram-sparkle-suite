import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    build: {
      chunkSizeWarningLimit: 1500,
    }
  },
  nitro: {
    preset: "vercel",
  }
});