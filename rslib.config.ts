import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { defineConfig } from "@rslib/core";
import { pluginIconify } from "rsbuild-plugin-iconify";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**/*.{ts,tsx}"],
    },
  },
  lib: [
    {
      bundle: false,
      dts: {
        bundle: false,
      },
      format: "esm",
      outBase: "./src",
      autoExternal: {
        dependencies: true,
        peerDependencies: true,
      },
    },
  ],
  output: {
    target: "web",
    copy: [
      {
        from: "**/*.css",
        to: "styles",
        context: "./src/styles",
      },
      {
        from: "**/*.css",
        to: "components",
        context: "./src/components",
      },
      {
        from: "index.css",
        to: ".",
        context: "./src",
      },
    ],
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
