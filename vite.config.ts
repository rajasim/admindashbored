import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// We remove the specific server entry "server" which points to a Cloudflare wrapper.
// TanStack Start on Vercel will use its default entry point detection.
export default defineConfig({
  vite: {
    // If you have specific Vercel requirements, they go here.
    // For most TanStack Start projects, the defaults are sufficient.
  }
});