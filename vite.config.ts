import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel", // ✨ Forces Nitro to build for Vercel even outside Lovable!
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});