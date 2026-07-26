import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Tauri expects a fixed port and relative asset paths.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    rollupOptions: {
      // Vite only builds index.html by default. The notification window
      // loads notification.html directly (see tauri.conf.json), so it
      // must be registered as its own entry or it's silently absent
      // from dist/ in production builds — `tauri dev` masks this since
      // Vite's dev server serves any file, entry or not.
      input: {
        main: path.resolve(__dirname, "index.html"),
        notification: path.resolve(__dirname, "notification.html"),
      },
    },
  },
});
