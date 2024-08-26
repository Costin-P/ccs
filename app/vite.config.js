import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
 resolve: {
  alias: {
   "@": path.resolve(__dirname, "./src"),
  },
 },
 optimizeDeps: {
  esbuildOptions: {
   loader: {
    ".js": "jsx",
   },
  },
 },
 plugins: [react()],
 build: {
  outDir: resolve(__dirname, "../views"), // Set the output directory to `views`
  emptyOutDir: true, // Ensure the directory is emptied before each build
 },
 esbuild: {
  loader: "jsx",
 },
 server: {
  host: true,
 },
 base: "/",
});
