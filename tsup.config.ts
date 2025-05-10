import { defineConfig } from "tsup";
import type { Options } from "tsup";
import { solidPlugin } from "esbuild-plugin-solid";

function generateConfig(format: "esm" | "cjs", jsx: boolean): Options {
  return {
    target: "esnext",
    platform: "browser",
    format,
    clean: true,
    minify: false,
    sourcemap: false,
    dts: format === "esm" && !jsx,
    entry: [
      "src/index.ts",
      "src/index.css",
      "src/*/index.tsx",
      "src/components/*/index.ts",
    ],
    outDir: "dist/",
    treeshake: { preset: "smallest" },
    replaceNodeEnv: true,
    esbuildOptions(options) {
      if (jsx) {
        options.jsx = "preserve";
      }
      options.chunkNames = "[name]/[hash]";
      options.drop = ["console", "debugger"];
    },
    outExtension() {
      return jsx ? { js: ".jsx" } : {};
    },
    esbuildPlugins: !jsx ? [solidPlugin({ solid: { generate: "dom" } })] : [],
  };
}

export default defineConfig([
  generateConfig("esm", false),
  generateConfig("esm", true),
]);
