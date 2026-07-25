# @pathscale/ui — Internals & Modification Guide (for Claude)

How the library works inside and how to change it safely. Usage reference: [CLAUDE.md](CLAUDE.md). Human analysis: [ANALYSIS.md](ANALYSIS.md).

## Repo map

```
src/index.ts                 # 922-line barrel = the ONLY public surface; every new export goes here
src/index.css                # imports styles/base, themes/{dark,light}, icons; Tailwind v4 @theme token block
src/components/<kebab>/      # one dir per component (quartet, see below)
src/components/_shared/      # overlayPosition.ts (createOverlayPosition) — bespoke floating-ui
src/components/types.ts      # IComponentBaseProps {dataTheme, class, className, style}, ComponentSize/Color/Variant/Position/Shape, ResponsiveProp
src/components/utils.tsx     # wrapWithElementIfInvalid (Dynamic wrapper for raw children)
src/hooks/{date,form,layout,table}/
src/primitives/{virtualizer,streaming}/
src/motion/                  # tween engine + solid/ components
src/lib/{iterable,refs,props,style,tag}/
src/styles/{base,themes,icons}/
scripts/check-contracts.ts   # build gate (see Contract section)
tests/                       # bun:test, pure functions only, NOT run in CI
playground/                  # Vite app aliasing @pathscale/ui -> ../src (hot dev)
docs/component-migration-map.md
```

## Build & toolchain

- `bun run build` = `check-contracts.ts` → `rslib build` → `postbuild:manifest` (purge-manifest generator from `@pathscale/rsbuild-plugin-ui-css-purge` → `dist/purge-manifest.json`).
- rslib (`rslib.config.ts`): entry glob `./src/**/*.{ts,tsx}`, `bundle:false` (dist mirrors src, `outBase: "./src"`), ESM only, d.ts unbundled, deps/peers auto-external. CSS is **copied verbatim** (not processed): `src/styles/**/*.css → dist/styles`, `src/components/**/*.css → dist/components`, `src/index.css → dist/`. Plugins: babel(+solid) and `pluginIconify` (targetDir `src/styles/icons`, scans for `icon-[set--name]`, resolves from @iconify/json, writes committed `generated-icons.css` — only icons actually referenced).
- Tailwind directives in the CSS (`@theme`, `@layer`, `@source`) are resolved by the **consumer's** Tailwind v4 pipeline, not this build.
- Dev: `bun run dev` (rslib watch) or, better, `bun run playground:dev` (Vite alias → instant HMR of src). Lint/format: Biome (`bun run lint`, `bun run format`; 2-space, 80 cols, double quotes). Types: `npx tsc --noEmit` (TS strict, `~/*` and `@src/*` → `src/*`). Tests: `bun test` (no npm script; NOT in CI).
- CI (`.github/workflows/ci.yml`, master): checks out `pathscale/rsbuild-plugin-ui-css-purge` and symlinks it to `../rsbuild-plugin-ui-css-purge`, then `bun install`, `bun run check`, `tsc --noEmit`, `bun run build`. Preview workflow deploys playground to Surge per-PR (⚠️ hardcoded Surge token in the workflow file — known leak). Versioning: manual bare-version commits (e.g. `1.2.11`); publish is manual; `files: ["dist"]`.

## The contract (enforced — build fails otherwise)

`scripts/check-contracts.ts` scans every `src/components/*` dir (skip-list: `types.ts, utils.tsx, showcase, showcase-section, props-table, icon, form`) and requires:
1. `index.ts` barrel exists and exports a type (must contain the string `type `).
2. `PascalCase.tsx` (derived from kebab dir name), if present, contains **both `splitProps` and `twMerge`**.
3. No purely-static inline `style={{...}}` (dynamic markers `${`, backtick, spread, call, ternary are allowed).

CONTRIBUTING.md adds (not machine-checked): `is*` booleans default false, `ComponentSize`/`ComponentColor` enums, events pass values not events, aria/keyboard requirements, `function` components with explicit `: JSX.Element`, no hardcoded English strings, comments explain why, `class` canonical (`className` compat only).

## Component anatomy (the quartet)

```
src/components/foo-bar/
  FooBar.tsx          # implementation
  FooBar.classes.ts   # export const CLASSES = { base: "foo-bar", variant: {...}, flag: {...} } as const  — plain BEM-ish strings
  FooBar.css          # @layer components { .foo-bar { ... } } — styles via theme CSS vars, often color-mix(in oklab, ...)
  index.ts            # export { default as FooBar, type FooBarProps } from "./FooBar";
```
Then add exports to `src/index.ts`.

Canonical implementation skeleton (from Button):
```tsx
const [local, others] = splitProps(props, ["children","class","className","dataTheme","style","variant","size", ...]);
const variant = () => local.variant ?? parentCtx?.variant() ?? "primary";
const classes = () => twMerge(
  CLASSES.base, CLASSES.variant[variant()], CLASSES.size[size()],
  local.isIconOnly && CLASSES.flag.isIconOnly,
  local.class, local.className,        // consumer overrides LAST, always both
);
return <button {...others} {...{ class: classes() }} data-slot="button" data-theme={local.dataTheme} ...>
```
Idioms to preserve:
- Class applied via `{...{ class: classes() }}` spread in most components (newer visual ones use `class={...}` — both fine, don't churn).
- `{...others}` spread FIRST, explicit attrs after (component-controlled attributes win).
- `data-slot` on every DOM part; state mirrored to `data-open/data-selected/data-focused/data-disabled/data-invalid/data-entering/data-exiting` — CSS and consumers target these.
- `is*` props reconciled with native: `local.isDisabled ?? local.disabled`.
- Ref forwarding: callback wrapping (`(el) => { setSignal(el); if (typeof local.ref === "function") local.ref(el); }`); `mergeRefs` in `src/lib/refs` for multi-ref.

## Stateful/compound pattern

- Assembly: `const Tabs = Object.assign(TabsRoot, { Root, List, Tab, Panel, ... })` — flat named exports too.
- Context value = object of **accessors + setters**; `useXContext()` throws outside provider (Modal, Toast) OR sub-parts gracefully degrade with `if (!ctx) return <plain/>` (DropdownTrigger, Tab, SelectOption) OR return safe defaults (table contexts). Know which style the component uses before editing.
- Controlled/uncontrolled:
```ts
const isControlled = () => local.value !== undefined;
const value = () => isControlled() ? local.value : internal();
const setValue = (v) => { if (!isControlled()) setInternal(v); local.onChange?.(v); };
```
- Menus/lists: children `onMount` → `ctx.registerItem({key, ref, disabled})`, `onCleanup` unregister; items sorted to DOM order via `compareDocumentPosition` (`sortItemsByDomOrder` — duplicated in Dropdown and Select). Hand-rolled roving tabindex (arrows/Home/End/Escape).
- Overlays: Solid `<Portal>` + `createOverlayPosition` from `_shared/overlayPosition.ts` (accessor-driven; auto-flip, viewport clamp, matchTriggerWidth, rAF-batched, `position:fixed` + `visibility:hidden` until measured). Table filter popovers use the parallel `useAnchoredOverlayPosition` in `src/hooks/table`.
- Modal specifics: hand-rolled state machine `entering→open→exiting→closed`, focus trap + restore, and a **module-level `bodyLockCount`** ref-count for body scroll lock (HMR can desync it).
- Toast: `class ToastQueue` (signal-backed OOP store) + module singleton `toastQueue` and `toast()` API with per-toast timers/pause/resume.
- ⚠️ `invokeEventHandler` (supports Solid's `[fn, data]` bound handlers) is **copy-pasted** in Card/Dropdown/Tabs/Toast/Select/Table — fix bugs in all copies.

## Styling/theming internals

- Real styling engine = `CLASSES` maps + `twMerge` + per-component CSS. The homegrown `cva` in `src/lib/style/classes.ts` is **unused by components** — don't build on it without deciding to adopt it deliberately.
- Theme tokens defined only in `src/styles/themes/{light,dark}.css` (light = `:root:not([data-theme])`, dark = `[data-theme="dark"]`; `color-scheme` set per theme). `src/index.css` `@theme` block just re-exposes names to Tailwind. Token families: daisy (`--color-primary`, `--color-base-*`, `--b1/--b2/--b3/--bc`), HeroUI (`--color-default*`, `--color-background/foreground`), legacy `--color-bg-*/--color-fg-*`, structural (`--radius-*`, `--size-*`, `--border`, `--depth`, `--noise`), and the `--glass-*` set (~35 vars for GlassPanel/GlowCard).
- Only the auth-* family, form/FormField, table/MobileListView, and password-field use raw Tailwind utility strings inline; everything else uses the quartet.

## Subsystem internals

### Motion (`src/motion/`)
- `driver.ts`: module singleton `activeDriver`, default `immediateDriver` (snaps to end + onComplete). Drivers animate **one scalar**; `engine.ts` `runMotion` decomposes `{opacity,x,y,scale}` into per-key driver calls, batches transforms into one `translate3d(...) scale(...)` write, counts completions. Durations **seconds** (×1000 internally).
- `popmotion.ts` = 17-line adapter (`createPopmotionDriver`, `enablePopmotion`) — popmotion itself is an optional peer, never vendored.
- `tokens.ts` (durations/easings/distances) → `presets.ts` `createMotionPresets`; `motionPresets` is a **mutable global** (`registerPreset` writes into it); `noMotion` = reduced-motion fallback; `system.ts` `createMotionSystem` = instance-scoped alternative that layers custom presets over token-derived ones. `route.ts` `createRouteTransitionResolver` = first-truthy-rule engine, string results resolved via preset lookup, unresolvable names skip to next rule.
- `solid/`: `MotionDiv` (enter/exit via one createEffect guarded by hasAnimated/lastTrigger/lastIsExiting; `animateKey` re-triggers enter), `Presence` (pure `nextPresenceState`; render-prop children `(isExiting, onExitComplete)`; 800ms `exitTimeout` force-unmount; **`untrack` around state read is load-bearing** — avoids Solid infinite-loop warning), `AnimatedCollapse` (pure `nextCollapsePhase`/`computeCollapseStyle`; phases closed|opening|open|closing; measures scrollHeight, rAF-deferred; height:auto while fully open; **its ResizeObserver is an intentional no-op placeholder**; duration prop seconds, internals ms).
- `reduced-motion.ts` `prefersReducedMotion()` — consumed by resolvePreset, Presence, AnimatedCollapse, route resolver, MetalBorder. **Modal/Toast/Drawer animate via CSS** with their own `@media (prefers-reduced-motion)` blocks — not this system. Only ColorWheelFlower (imperative runMotion) and MetalBorder consume src/motion from components.

### Metal-border (`src/components/metal-border/engine/`)
- ONE shared offscreen GL canvas/program/RAF loop for ALL instances (`renderer/core.ts` module singleton `SHARED`; 96px canonical size, DPR cap 2). Each instance = visible 2D canvas; per frame `loop.ts` renders plasma (`shaders.ts` — vendored "Plasma" GLSL port; keeps dead uniforms alive via a zero-multiply term for strict Mali/Adreno drivers — don't delete), center-crops to the instance canvas, then `punchInnerHole` (destination-out roundRect) leaves only the ring.
- Loop throttled to `FRAME_INTERVAL_MS=66` (~15fps; the "~30fps" comment in core.ts is stale). Self-terminates when no visible unpaused instance; auto-pauses on tab hide; handles context lost/restored.
- Glow: SVG filter stack injected per instance (`glow/geometry.ts` pure perimeter math + `buildSvgMarkup`; `glow/glow.ts` hotspot state machine — 16 perimeter luminance samples from `gl.readPixels`, dwell 3000ms, relocate tweens, tint tweens; own tiny tween in `engine/tween.ts`, unrelated to src/motion). Bookkeeping in module-level `glowMap` + one global glow callback. `GLOW_READBACK_INTERVAL_MS` (1500ms) throttle constant is currently NOT applied in loop.ts — readPixels runs every glow frame.
- `MetalBorder.tsx`: ResizeObserver (geometry), IntersectionObserver (rootMargin 64px offscreen culling), MutationObserver (nearest `[data-theme]` for live theme). WebGL failure → effect layer removed entirely, content still renders. `effectivePaused = paused || prefersReducedMotion`.

### Dates (`src/hooks/date/`)
- Pure engine in `date.utils.ts`: native Date + Intl, all dates constructed at **noon** (DST safety), 42-cell grid (`buildCalendarGrid`), strict ISO `parseDate`, `normalizeRange` auto-swaps reversed ranges. Hooks: `useDateSelection` (single), `useRangeSelection` (two-click + hover preview + pending-start), `useCalendarNavigation` (focus roving, min/max clamp, ≤400-day disabled scan), `useCalendarState` (formatters, weeks, `getCellState` → 12-flag `CalendarCellState`), `usePickerOpenState` (outside-click + Escape via **global document listeners**).
- `date-field`/`time-field` segmented editors are a SEPARATE code path (own `*SegmentValue` types) — changes to hooks/date don't affect them.

### Forms (`src/hooks/form/` + `src/components/form/`)
- `createForm` wraps TanStack solid-form; single Standard Schema wired to onChange+onBlur+onSubmit; `createValidationLogic` re-runs blur validators on change **on purpose** (blur errors clear as you type once valid — locked by `tests/hooks/form/createForm.test.ts`, don't "simplify"). `FormApi._tsForm` is deliberately `any` (12-generic erasure).
- `useFieldNew.ts` exports `useField` (filename is legacy residue). Errors touch-gated on `isTouched`; `getFirstFieldError` collapses TanStack's mixed error arrays.
- `Form.tsx` dispatches: `form` prop → `FormWithContext` (provides FormContext, handleSubmit wiring), else `FormRoot` plain. `FormField` = Label + Input.Field + its own `FieldErrorMessage` (NOT the standalone `field-error`/`error-message` components — three distinct things). `FormField` accepts explicit `form` prop for portal/out-of-tree use.

### Table (`src/hooks/table/` + `src/components/table/`)
- `useTableModel` = createSolidTable with all row models on; every state slice takes `{accessor, OnChangeFn}` pairs (controlled) or self-manages (`resolveUpdater` helper). `toSortDescriptor`/`toSortingState` bridge TanStack SortingState ↔ `{column, direction:"ascending"|"descending"}`.
- Components are presentational only; contexts return **safe defaults** (don't throw). Virtualization deliberately unbundled: `useVirtualRows` (sole consumer of @tanstack/solid-virtual) + `VirtualSpacerRow` spacer `<tr>`; consumer wires them (see playground TableVirtualizedExample).
- `useTablePagination.nextPage/lastPage` need caller-passed maxPageIndex.

### Streaming (`src/primitives/streaming/`)
- `useStreamingBuffer`: keyed capped buffer, `Map<key,index>`, strategies append/upsert/replace, copy-on-write (referential stability), maxSize keeps newest N.
- `useStreamingSubscription`: runToken counter + AbortController make stale callbacks no-ops; resolve-without-open counts as live; auto start/stop from `enabled`.

## Known issues / dead code (verified 2026-07-18)

- 🔴 Surge token hardcoded in `.github/workflows/preview.yml`.
- `./stores` package export is dangling — no `src/stores/`; importing it throws. Remove or implement.
- README stale: `dist/styles/compat/daisy-primitives.css` and `docs/motion.md` don't exist.
- Tests not run in CI; no `test` npm script.
- `scripts/copy-css.js` unused (rslib copy supersedes); `cally` devDep unused (grep hits are the word "automatically"); `lib/style/cva` unused by components.
- Duplicated helpers: `invokeEventHandler` (~6 files), `sortItemsByDomOrder` (Dropdown, Select).

## Checklist: adding/modifying a component

1. Quartet files in `src/components/<kebab>/` (see anatomy). `index.ts` MUST export a Props type; `.tsx` MUST use `splitProps` + `twMerge`; no static inline styles.
2. Export component + types from `src/index.ts`.
3. Follow conventions: `is*` booleans (default false), ComponentSize/ComponentColor, value-passing callbacks, `data-slot` + state data-attrs, both `class`+`className` merged last, aria/keyboard per CONTRIBUTING, `@media (prefers-reduced-motion)` for CSS animations.
4. Style via theme vars in `@layer components`; add new tokens to BOTH `styles/themes/light.css` and `dark.css` (+ `@theme` block in `src/index.css` if it should be a Tailwind utility).
5. Icons: reference as `icon-[set--name]` and rebuild so pluginIconify regenerates `generated-icons.css` (committed).
6. Demo in `playground/src/App.tsx` (or `examples/`), verify with `bun run playground:dev`. External showcase lives in the separate js.software repo (per CONTRIBUTING).
7. Verify: `bun run check` && `npx tsc --noEmit` && `bun run build` (build needs the purge plugin resolvable; CI symlinks `../rsbuild-plugin-ui-css-purge`). Run `bun test` if touching motion/form/password pure logic.
8. Commit: `type(scope): message` (feat/fix/refactor/docs/test/chore).
