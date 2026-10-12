import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  // Production builds ship with no console output; `npm run dev` keeps the logs.
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
