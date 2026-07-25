# @pathscale/ui — Internals Analysis

*Analysis of the repo at `github.com/pathscale/ui`, v1.2.11, cloned 2026-07-18.*

## What it is

A highly opinionated **SolidJS component library** (~104 component directories, 419 TS/TSX source files) targeting **HeroUI API parity** in Solid, built on a daisyUI-flavored CSS-variable theming system. It is the product of a large migration (documented in `docs/component-migration-map.md`): ~40 old components were removed, several renamed (`Loading→Spinner`, `DropdownSelect→Select`, `RadialProgress→ProgressCircle`), and the styling layer was refactored into per-component `.classes.ts` + `.css` files.

Toolchain: **Bun** (runtime, package manager, test runner), **rslib** (bundleless ESM build), **Biome** (lint/format), **Tailwind v4** (consumer-side; the library authors plain CSS + tokens), **TypeScript 6 strict**.

## Architecture at a glance

```
src/
  index.ts            # 922-line barrel — the single public surface
  index.css           # imports base + themes + icons, declares Tailwind v4 @theme tokens
  components/         # ~104 folders, each: X.tsx + X.classes.ts + X.css + index.ts
    _shared/          # createOverlayPosition — bespoke floating-ui replacement
  hooks/              # date/ (internal date engine), form/ (TanStack Form wrapper),
                      # table/ (TanStack Table state slices), layout/ (useDesktop)
  primitives/         # virtualizer/ (TanStack Virtual wrapper), streaming/ (buffer + subscription)
  motion/             # driver-based tween engine + Solid components (MotionDiv, Presence, AnimatedCollapse)
  lib/                # mergeRefs, chain, OverrideProps, homegrown cva, tag helpers
  styles/             # base/, themes/{light,dark}.css, icons/generated-icons.css
```

### The component contract (enforced by CI)

Every component is a four-file quartet: `X.tsx` (implementation), `X.classes.ts` (a `CLASSES` const mapping semantic slots/variants to BEM-ish class strings like `button--primary`), `X.css` (actual styles in `@layer components`, driven by theme CSS variables), and `index.ts` (barrel). `scripts/check-contracts.ts` runs before every build and CI, and fails the build if a component lacks an `index.ts` with a type export, lacks `splitProps` or `twMerge` in its main file, or contains a purely static inline `style={{}}`.

Conventions worth knowing:
- **Class merging**: `twMerge(CLASSES.base, CLASSES.variant[v], flag && CLASSES.flag.x, local.class, local.className)` — consumer classes always win. Both `class` and `className` are accepted (React-refugee ergonomics).
- **Boolean props are `is*`** (`isDisabled`, `isOpen`, `isInvalid`), HeroUI-style, reconciled with native attrs (`isDisabled ?? disabled`).
- **`data-slot` on every part** plus state mirrored to `data-open`/`data-selected`/`data-invalid` etc., so CSS and tests target data attributes.
- **Compound components** via `Object.assign(Root, {Trigger, Content, ...})` + Solid context holding accessors/setters; controlled/uncontrolled via the `value/defaultValue/onChange` triple pattern.
- **No polymorphic `as` prop** — element types are hardcoded per part.

### Notable subsystems

- **Overlay positioning is bespoke** (`src/components/_shared/overlayPosition.ts`) — no floating-ui. Auto-flip, viewport clamping, rAF-batched, used by Dropdown/Select/pickers. All positioning bugs live in this one file.
- **Motion** (`src/motion/`): a driver-based tween system. The default driver is **immediate** — everything snaps to its end state until the consumer installs a real driver via `enablePopmotion(animate)` (popmotion is an optional peer; `popmotion.ts` is a 17-line adapter, not vendored code). Presets (`route`, `fade`, `toast`…) are built from tokens; `Presence`/`MotionDiv`/`AnimatedCollapse` are the Solid layer. Note: most components (Modal, Toast, Drawer) animate with **CSS**, not this system.
- **Metal-border** (newest feature): a WebGL "liquid metal" plasma border. All instances share **one offscreen GL context and one ~15fps RAF loop**; each instance blits a cropped region to its own 2D canvas and punches out the interior. Includes an SVG glow subsystem driven by GPU pixel readback with a hotspot state machine. Graceful degradation when WebGL is unavailable; pauses offscreen (IntersectionObserver) and under reduced-motion.
- **Forms**: `createForm` wraps TanStack Form with Standard Schema (Zod/Valibot/Arktype) validation wired to change+blur+submit; `Form`/`FormField`/`FormSubmitButton` compose it. Field errors are touch-gated (invisible until blur).
- **Dates**: a **fully internal date engine** (native `Date` + `Intl`, all dates constructed at noon to dodge DST) powering Calendar/RangeCalendar/DatePicker/DateRangePicker. The segmented `date-field`/`time-field` inputs are a separate, unrelated code path.
- **Table**: headless — thin presentational compound parts over `src/hooks/table` state-slice hooks wrapping TanStack Table. Virtualization pieces (`useVirtualRows`, `VirtualSpacerRow`) ship separately and are **not wired in**; integration is the consumer's job.
- **Icons**: build-time Iconify pipeline. `pluginIconify` scans source for `icon-[set--name]` classes and emits `src/styles/icons/generated-icons.css` (committed, currently 14 icons) with data-URI SVG masks. The `Icon` component just merges the icon class name onto a span.
- **Theming**: 2 themes (`light` default, `dark`) switched via `data-theme` on `<html>`. Tokens are daisyUI-compatible (`--color-primary`, `--color-base-100`, `--b1`…) plus HeroUI-style (`--color-default/-foreground`) plus a ~35-variable glass-surface set. `src/index.css`'s `@theme` block re-exposes them as Tailwind v4 utilities.

### Build & CI

`bun run build` = contract check → `rslib build` (bundleless ESM, file-per-module, d.ts, CSS copied verbatim) → purge-manifest generation (`dist/purge-manifest.json`, consumed by `@pathscale/rsbuild-plugin-ui-css-purge` so apps can drop CSS for components they don't import). CI (GitHub Actions on `master`) runs contract check, `tsc --noEmit`, and build; PR previews are built from the playground and deployed to Surge. Versioning/publishing is manual (bare version-number commits). The playground (`playground/`, Vite + Tailwind v4) aliases `@pathscale/ui` to local `src/` for instant hot-reload — its `App.tsx` is a single ~7,300-line demo page.

## Issues found (worth acting on)

1. **🔴 Leaked credential**: `.github/workflows/preview.yml` hardcodes a Surge token in plaintext (`SURGE_TOKEN: 256124bc...`). Anyone can deploy/teardown sites on that account. Rotate the token and move it to repo secrets.
2. **Broken `./stores` export**: `package.json` exports `./stores` → `dist/stores/index.js`, but there is no `src/stores/` — the build never produces that file, so importing `@pathscale/ui/stores` throws. Remove the entry or add the module.
3. **Stale README**: it tells consumers to import `dist/styles/compat/daisy-primitives.css` (no `compat/` exists in source) and points to `docs/motion.md` (doesn't exist; only `component-migration-map.md` does).
4. **Tests exist but CI never runs them**: 4 test files under `tests/` (bun:test, pure-function coverage only) and no `test` script in package.json; CI doesn't invoke `bun test`.
5. **CI depends on a sibling checkout**: the build symlinks `pathscale/rsbuild-plugin-ui-css-purge` to `../rsbuild-plugin-ui-css-purge` — local builds may behave differently from CI if you don't replicate that layout.
6. **Duplicated helpers**: `invokeEventHandler` is copy-pasted into ~6 components (Card, Dropdown, Tabs, Toast, Select, Table), as is `sortItemsByDomOrder` — a bug fix must touch all copies.
7. **Dead/legacy code**: the homegrown `cva` in `src/lib/style/classes.ts` is imported by no component (the real styling engine is `CLASSES` + `twMerge`); `scripts/copy-css.js` is superseded by rslib's copy step; `cally` is an unused devDependency; `useFieldNew.ts` is legacy naming (exports `useField`).
8. **Minor internal inconsistencies**: metal-border's header comment says ~30fps but the constant is 66ms (~15fps); its `GLOW_READBACK_INTERVAL_MS` throttle constant isn't actually applied in the loop; `AnimatedCollapse` has an intentionally no-op ResizeObserver placeholder.

## Overall assessment

The library is coherent and unusually disciplined for its size: one enforced component anatomy, one styling contract, one state-management idiom, and heavy leverage of TanStack for the hard generic problems (form/table/virtual) while keeping bespoke code where it pays off (overlay positioning, date engine, motion seam, WebGL effects). The main risks are operational rather than architectural: the leaked CI token, the untested-in-CI test suite, dead config (`./stores`), and copy-pasted micro-helpers. The design choice that most often surprises newcomers: **nothing in the motion system animates until a driver is installed**, and **the virtualizer is intentionally not integrated into Table**.

Companion docs (for Claude's future sessions, also human-readable): [CLAUDE.md](CLAUDE.md) (usage reference) and [CLAUDE-INTERNALS.md](CLAUDE-INTERNALS.md) (modification guide).
