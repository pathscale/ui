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
    // `@rsbuild/plugin-solid` depends on `babel-preset-solid: ^1.9.12`, a range
    // semver cannot cross to `2.0.0-rc.0`. So bun installs a *nested* Solid 1
    // preset under the plugin, and the plugin's own `require.resolve` loads
    // that one no matter what this package hoists. The Solid 1 transform emits
    // `solid-js/web`, a subpath Solid 2 dropped, so every generated file was
    // unresolvable in a real consumer while building fine in this repo.
    //
    // Naming the preset by absolute path is what pins the transform to the
    // Solid 2 one. Verify with a built file rather than a passing build:
    //   grep -o 'from "[^"]*web"' dist/components/icon/Icon.generated.js
    // must say `@solidjs/web`.
    pluginSolid({
      solidPresetOptions: {
        moduleName: "@solidjs/web",
        generate: "dom",
      },
    }),
  ],
});
