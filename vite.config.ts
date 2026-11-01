import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = import.meta.dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        popup: resolve(projectRoot, "index.html"),
        workspace: resolve(projectRoot, "workspace.html"),
        options: resolve(projectRoot, "options.html"),
        serviceWorker: resolve(projectRoot, "src/background/serviceWorker.ts"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "serviceWorker" ? "service-worker.js" : "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
  },
});
