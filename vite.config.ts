import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  if (mode === "plugin") {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, "src/plugin.ts"),
          name: "plugin",
          formats: ["iife"],
          fileName: () => "plugin-v1.js",
        },
        outDir: "dist",
        emptyOutDir: false,
      },
    };
  }

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          ui: resolve(__dirname, "index.html"),
        },
        output: {
          entryFileNames: "ui-v1.js",
          assetFileNames: "style-v1.[ext]",
        },
      },
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
