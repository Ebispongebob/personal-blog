import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { contentPlugin } from "./scripts/vite-content-plugin"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [contentPlugin(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
