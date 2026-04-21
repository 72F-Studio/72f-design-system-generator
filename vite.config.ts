import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode, command }) => {
  const commonServer = {
    host: "0.0.0.0",
    port: 5173,
    cors: true,
  };

  if (mode === "plugin") {
    return {
      server: commonServer,
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
    base: command === "build" ? "/72f-design-system-generator/" : "/",
    server: commonServer,
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
