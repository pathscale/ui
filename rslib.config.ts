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
      dts: true,
      format: "esm",
      autoExternal: {
        dependencies: true,
        peerDependencies: true,
      },
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
      targetDir: "src/styles/icons",
      includeSets: ["mdi-light", "material-symbols"],
      forceIncludeSets: false,
      maxIconsPerSet: 1000,
    }),
  ],
});
