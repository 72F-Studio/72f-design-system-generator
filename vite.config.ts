import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const PROD_UI_URL = "https://72f-studio.github.io/72f-design-system-generator/";
const DEV_UI_URL  = "http://localhost:5173/";

export default defineConfig(({ mode, command }) => {
  const isProd = command === "build";

  const commonServer = {
    host: "0.0.0.0",
    port: 5173,
    cors: true,
  };

  if (mode === "plugin") {
    return {
      server: commonServer,
      define: {
        __UI_URL__: JSON.stringify(isProd ? PROD_UI_URL : DEV_UI_URL),
      },
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
    base: isProd ? "./" : "/",
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
