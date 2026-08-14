# How to set up a playground

There is no playground in this repository, and there should not be one. The old
`playground/` demoed every component against the pre-2.2 API and rotted into 477
typecheck errors, because a second copy of the API living beside the API only
ever drifts from it.

The showcase belongs in **[js.software](https://github.com/pathscale/js.software)**,
which is already the kitchen sink and already consumes the published package. It
is on `^2.1.1` today and will need the 2.2 upgrade below.

For local work on this library, you want the smallest thing that renders a
component, and you have two ways to get one. They test different things, so pick
by what you are doing.

---

## Which one

| | aliased to `src/` | installed from the tarball |
| --- | --- | --- |
| feedback | hot reload, no rebuild | rebuild and reinstall per change |
| tests | your source | the artifact a consumer receives |
| catches | render and styling bugs | packaging, exports, dependency declarations |

Use the alias while iterating. Use the tarball before you believe anything,
because it is the only one that would have caught `clsx` sitting in
`devDependencies` while every compiled Layout imported it.

---

## Option A: alias to `src/`

A throwaway Vite app outside this repository.

```bash
bun create vite my-playground --template solid-ts
cd my-playground
bun add -d @tailwindcss/vite vite-plugin-solid vite-tsconfig-paths
bun add @iconify/tailwind4 @iconify/json
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import paths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

const UI = resolve(__dirname, "../UI");   // wherever this repo is checked out

export default defineConfig({
  plugins: [solid(), paths(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@pathscale\/ui$/, replacement: resolve(UI, "src/index.ts") },
      { find: /^@pathscale\/ui\/lab$/, replacement: resolve(UI, "src/lab.ts") },
      { find: /^@pathscale\/ui\/(.*)$/, replacement: resolve(UI, "src/$1") },
    ],
  },
  // Vite refuses to serve outside its root without this.
  server: { fs: { allow: [UI] } },
});
```

`src/index.css`:

```css
@import "tailwindcss";
@import "../../UI/src/index.css";

/* Tailwind only sees classes in files it is told to scan, and half of them
   live in the library. */
@source "./";
@source "../../UI/src";

/* The library ships no glyphs. This is what resolves icon-[...] tokens, and it
   scans YOUR source, so an icon only exists if you wrote it. */
@plugin "@iconify/tailwind4";
```

`src/index.tsx`:

```tsx
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";

// Nothing sets a theme for you, and an unthemed page has no tokens.
document.documentElement.setAttribute("data-theme", "dark");

render(() => <App />, document.getElementById("root")!);
```

### The one that will bite you

**Run `bun run check` in this repo first, and after every recipe or layout change.**

`src/index.ts` re-exports from `*.generated.tsx`, which the Layout compiler
writes and which are gitignored. On a fresh clone they do not exist, so aliasing
straight at `src/` gives you a barrel pointing at missing files. `bun run check`
generates them. A `--watch` on the library is the ergonomic version:

```bash
bun run build:watch
```

---

## Option B: install the tarball

This is what `scripts/smoke-consumer.ts` automates, and what CI runs.

```bash
cd /path/to/UI && bun run build && bun pm pack
cd /path/to/my-playground && bun add file:/path/to/UI/pathscale-ui-2.2.0.tgz
```

Then import `@pathscale/ui` normally, and `@pathscale/ui/index.css` for the
styles. No aliases, no `server.fs.allow`, no generate step: you are consuming
the built package, so what you see is what an app sees.

Repeat the pack and add after every change. That friction is the point of
Option A existing.

---

## Writing the demos

The three axes, which is the whole of 2.2:

```tsx
import { Button, Card, Icon } from "@pathscale/ui";

<Button flavor="primary" variant="solid" size="md" state="loading">Save</Button>
<Icon src="lucide--check" flavor="success" />
<Card material="glass" elevation="lg" />
```

- `flavor` is what a thing **is**, and it is open: your own name yields
  `button--flavor-<name>` for you to style.
- `state` is what is **happening** to it, closed at
  `default | loading | error | invalid | disabled | hidden`. There are no
  `isDisabled` or `isLoading` booleans.
- `variant` is **shape**: `solid | soft | outline | ghost | plain`.

Validity is not a prop you assert. Pass `issues: Issue[]` and the component
derives it, or force it with `state="invalid"`.

Unadopted components live behind a separate entry point:

```tsx
import { ColorWheelFlower } from "@pathscale/ui/lab";
```

---

## Upgrading js.software to 2.2

Mechanical, and the compiler finds all of it:

| replace | with |
| --- | --- |
| `className=` | `class=` |
| `color=` | `flavor=`, `danger` becomes `destructive`, `default` becomes `neutral` |
| `isDisabled` / `isLoading` | `state="disabled"` / `state="loading"` |
| `isInvalid` | `issues={…}`, or `state="invalid"` |
| `isRequired` | `required` |
| `isOpen` | `open` |
| `<Icon name="icon-[x]" />` | `<Icon src="x" />` |
| `Modal` `Toggle` `TextArea` `Disclosure` `EmptyState` `ProgressBar` `ProgressCircle` `ScrollShadow` `Breadcrumbs` `FloatingDock` | `Dialog` `Switch` `Textarea` `Collapsible` `Empty` `Progress` `RadialProgress` `ScrollArea` `Breadcrumb` `Dock` |

Then add the iconify plugin, because the library no longer ships glyph CSS and
icons will silently render as empty boxes without it.
