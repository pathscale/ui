/*
 * Build config for the QA harness.
 *
 * Separate from `rslib.config.ts`, which builds the library: this is an
 * application, and it consumes the library from source so a check runs against
 * the working tree rather than the last publish.
 */
import { defineConfig } from "@rsbuild/core";
import { pluginSolid } from "@rsbuild/plugin-solid";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSolidLayoutsApplication } from "rsbuild-plugin-solid-layouts";
import { resolve } from "node:path";

export default defineConfig({
  root: __dirname,
  plugins: [
    // The *application* variant, as AgencyZero uses. The library variant
    // compiles `*.layout.tsx` sources; this one wires `solid-layouts` for a
    // consumer, which is what the harness is.
    pluginSolidLayoutsApplication(),
    pluginBabel({ include: /\.(?:jsx|tsx)$/ }),
    // `moduleName`/`generate` for the same reason `rslib.config.ts` sets them:
    // `@rsbuild/plugin-solid` resolves a nested Solid 1 preset whose transform
    // emits `solid-js/web`, a subpath Solid 2 dropped. Without this the harness
    // builds and then fails to resolve at runtime.
    pluginSolid({
      solidPresetOptions: { moduleName: "@solidjs/web", generate: "dom" },
    }),
  ],
  source: {
    entry: { index: resolve(__dirname, "App.tsx") },
  },
  /*
   * Resolve to `dist`, as a real consumer does, and rebuild the library before
   * running the harness (`qa:build` does both). Aliasing to `src` instead pulls
   * `solid-layouts` in uncompiled, which fails to link.
   *
   * This still tests the working tree rather than the last publish, because the
   * `dist` being read is the one just built from it.
   */
  resolve: {
    alias: {
      "@pathscale/ui": resolve(__dirname, "../dist/index.js"),
    },
  },
  html: { template: resolve(__dirname, "index.html") },
  server: { port: 5178 },
  output: {
    distPath: { root: resolve(__dirname, "dist") },
    /*
     * One JS and one CSS file, uncompressed names, no hashing: `blitz-preview`
     * reads the first `src=` and `href=` out of index.html and inlines them, so
     * a split bundle would leave chunks it never loads and the page would mount
     * nothing.
     */
    filenameHash: false,
  },
  performance: {
    chunkSplit: { strategy: "all-in-one" },
  },
});
