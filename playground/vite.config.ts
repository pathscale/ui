import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import paths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [solid(), paths(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@src",
        replacement: resolve(__dirname, "../src"),
      },
      {
        find: /^@pathscale\/ui$/,
        replacement: resolve(__dirname, "../src/index.ts"),
      },
      {
        find: /^@pathscale\/ui\/(.*)$/,
        replacement: resolve(__dirname, "../src/$1"),
      },
    ],
  },
  server: {
    fs: {
      allow: [resolve(__dirname, "..")],
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  base: "/",
});
