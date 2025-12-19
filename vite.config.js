import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
   optimizeDeps: {
    include: ["recharts"]
  },
   server: {
    port: 3000,
    open: true,
    host: true,
    allowedHosts: [
      "3e3bba935ee1.ngrok-free.app", // ✅ must be array item
      "soundbet.com"
    ],
  },
});
