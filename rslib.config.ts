import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { pluginSolidLayoutsLibrary } from "rsbuild-plugin-solid-layouts";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  source: {
    entry: {
      index: ["./src/**/*.{ts,tsx}", "!./src/**/*.layout.tsx"],
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
    pluginSolidLayoutsLibrary(),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
  ],
});
