# Layouts in `@pathscale/ui`

The authored component source in this repository is stage A. It is not ordinary TSX and must be compiled by the independent `solid-layouts` library compiler before it becomes the npm package C.

```text
@pathscale/ui templates (A) + solid-layouts library compiler (B)
  -> publishable @pathscale/ui (C)

published @pathscale/ui (C) + application source (D)
  + solid-layouts application compiler (E)
  -> executable assets (F)
```

The compiler is not implemented in this repository. `rsbuild-plugin-solid-layouts` calls the compiler owned by [`pathscale/solid-layouts`](https://github.com/pathscale/solid-layouts).

## Library commands

```sh
bun run layouts:generate
bun run lint:layouts
bun run check
bun run build
```

`layouts:generate` turns every `*.layout.tsx` into an ignored adjacent `*.generated.tsx`. Component barrels import generated files. Recipe files are compiled to static lookup tables by the Rslib plugin, and the completed package receives `dist/layouts.manifest.json`.

`layouts.library.json` is the public compiler contract. Its `exports` list is case-sensitive and records which root exports are Layout components. The application compiler uses that exact list: `<button>` is native HTML, while `<Button>` resolves the `Button` record.

## Lint contract

`bun run lint` runs Biome and the Rust/OXC Layout linter. The Layout linter owns rules Biome cannot infer:

- recipe import/source/export resolution;
- exact declared and rendered slots;
- static recipe shape and valid Layout signatures;
- separation of call-site presentation props from computed state;
- warnings for legacy component-shaped templates and manual class composition.

This migration contains known legacy debt recorded in `layouts.lint-baseline.json`. The baseline is a ratchet, not a suppression file: new debt fails, and removed debt makes the baseline stale until it is shrunk.

Update it only after reviewing the complete diff:

```sh
solid-layouts-lint --update-baseline
```

## Application use

Rsbuild applications install the UI package, runtime, and application compiler integration:

```sh
bun add @pathscale/ui solid-layouts
bun add -d rsbuild-plugin-solid-layouts
```

```ts
import { pluginSolidLayoutsApplication } from "rsbuild-plugin-solid-layouts";

export default defineConfig({
  plugins: [
    pluginSolidLayoutsApplication({ layouts: ["@pathscale/ui"] }),
    /*
     * Babel does the Solid transform, and `@rsbuild/plugin-solid` is
     * deliberately absent.
     *
     * It injects solid-refresh, whose `$component` wrapper calls
     * `createSignal(component)` — and Solid 2 reads a function initialiser as a
     * derivation, so it builds a computed that needs an owner. The symptom is an
     * empty body and "Cannot read properties of undefined (reading 'spec')":
     * the component is invoked with no props at all.
     *
     * `moduleName` is the second half: Solid 2 dropped the `solid-js/web`
     * subpath, so the transform has to emit `@solidjs/web`.
     */
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions: (config) => {
        config.presets ??= [];
        config.presets.push([
          "babel-preset-solid",
          { moduleName: "@solidjs/web", generate: "dom" },
        ]);
      },
    }),
  ],
});
```

The Layout plugin must run before Solid lowers JSX. A missing package, manifest, exact export, compiler, or runtime is a hard error. There is no graceful fallback.

For an advisory migration inventory:

```sh
solid-layouts-lint --porting --layouts @pathscale/ui
```

It warns about `class` and `className` overrides on imported Layout components so the application can move spacing, sizing, alignment, and state styling into semantic recipe parameters.
