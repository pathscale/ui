import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { defineConfig } from "@rslib/core";
import { pluginIconify } from "rsbuild-plugin-iconify";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/index.ts"],
    },
  },
  tools: {
    rspack: {
      plugins: [],
    },
  },
  lib: [
    {
      bundle: true,
      dts: false,
      format: "esm",
    },
  ],
  output: {
    target: "web",
  },
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
    pluginIconify({
      targetDir: 'src/styles/icons',
      includeSets: ['mdi-light', 'material-symbols'],
      maxIconsPerSet: 1000,
    }),
  ],
});
