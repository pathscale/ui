# @pathscale/ui — Usage Reference

**This is the source of truth for `@pathscale/ui` usage conventions**, for humans and
agents alike, and for every consuming application. Those apps link here rather than
keeping their own copy — one library, one set of conventions, no drift.

SolidJS component library, HeroUI-parity API, daisyUI-style theming. ~104 components.

This file is **how to USE the library** (as a consumer, or when writing demos and
examples). For **modifying the library itself**, read
[`../CLAUDE-INTERNALS.md`](../CLAUDE-INTERNALS.md). Repo analysis:
[`../ANALYSIS.md`](../ANALYSIS.md).

## Install & setup

```sh
bun add @pathscale/ui        # peer deps: solid-js ^1.9, @solid-primitives/*, @tanstack/solid-form|table, popmotion (optional), @standard-schema/spec (optional)
```

```ts
import { Button, Flex, Modal, toast } from "@pathscale/ui";   // everything is in the root barrel
import "@pathscale/ui/index.css";                              // tokens + themes + base + icons
```

Subpath exports also exist: `./components/*`, `./primitives/*`, `./hooks/*`, `./motion`,
`./styles/*`.

## Theming

- Two themes: `light` (default when no attribute) and `dark`. Switch: `document.documentElement.setAttribute("data-theme", "dark")`.
- Tokens are CSS vars: `--color-primary(/-content)`, `--color-secondary`, `--color-accent`, `--color-neutral`, `--color-info/success/warning/error`, `--color-danger`, surfaces `--color-base-100/200/300`, `--color-base-content`, HeroUI-style `--color-default(/-foreground/-hover)`, `--color-background/foreground`, daisy short aliases `--b1/--b2/--b3/--bc`, radii `--radius-selector/-field/-box`, and a ~35-var `--glass-*` set (runtime-tweakable on `documentElement.style`).
- `src/index.css` has a Tailwind v4 `@theme` block, so in a Tailwind v4 app `bg-primary`, `text-base-content`, `bg-base-100` etc. work.
- Any component accepts `dataTheme` prop → rendered as `data-theme` attr (scoped theming).

## Component conventions (consumer-facing)

- Booleans are HeroUI-style `is*`: `isDisabled`, `isOpen`, `isInvalid`, `isPending`, `isIconOnly`, `isHoverable`, `isPressable`. Native `disabled` also honored.
- Sizes and colour-ish props are **per-component, not a shared union in practice**.
  `ComponentSize` and `ComponentColor` are declared in `src/components/types.ts` with the
  full unions, but **they are not re-exported from the root barrel**, so consumers cannot
  import them, and individual components narrow them. `Button` takes
  `variant` (`primary | secondary | tertiary | outline | ghost | danger | danger-soft`)
  and `size` (`sm | md | lg`); `Badge`, `Chip`, `Avatar`, `Spinner`, `Toggle`, `Meter` and
  the progress components take `color`. Read the component's own props before assuming.
- Both `class` and `className` accepted everywhere; consumer classes win (merged last via twMerge).
- Controlled/uncontrolled triples: `isOpen/defaultOpen/onOpenChange`, `value/defaultValue/onChange`, `selectedKey/defaultSelectedKey/onSelectionChange`. Event callbacks pass **values, not events**.
- Compound components: `Modal.Trigger`, `Tabs.List`, `Select.Option`, etc. (`Object.assign` statics; also exported flat: `AccordionRoot`, `AlertTitle`, …). Parts are styleable/testable via `data-slot="..."` and state attrs (`data-open`, `data-selected`, `data-invalid`).
- No polymorphic `as` prop.

```tsx
<Flex direction="col" gap="sm">
  <Button variant="primary" size="md" isPending={saving()}>Save</Button>
</Flex>
```

## Component inventory (by family)

- **Layout/primitives**: Flex, Grid, Join, Surface, Card, GlassPanel, Separator, ScrollShadow, Skeleton, EmptyState, Footer, Header, Navbar, Toolbar, FloatingDock
- **Typography/misc**: Text, Link, Kbd, Badge, Chip, Tag/TagGroup, Avatar, Icon, Tooltip, Breadcrumbs, Pagination, Meter, ProgressBar, ProgressCircle, Spinner (alias: Loading)
- **Inputs**: Input, InputGroup, InputOTP, TextField, TextArea (and textarea), NumberField, SearchField, PasswordField (+ password-requirements/rules, `passwordRules.ts`), ColorField, Checkbox(+Group), Radio(+Group), Toggle, Slider, Select, ComboBox, ListBox, SizePicker, Form pieces (Label, Description, ErrorMessage, FieldError, Fieldset)
- **Dates**: Calendar, RangeCalendar, DatePicker, DateRangePicker (internal date engine); DateField, TimeField (separate segmented editors)
- **Color**: ColorPicker, ColorArea, ColorSlider, ColorSwatch(+Picker), ColorWheelFlower, ThemeColorPicker
- **Overlays**: Modal, Drawer, Popover, Dropdown, Menu, Toast, Disclosure(+Group), Accordion
- **Data**: Table (headless compound + hooks), plus primitives `useVirtualRows`, `useStreamingBuffer`, `useStreamingSubscription`
- **Auth kit**: AuthForm, AuthCard, AuthFieldGroup, AuthSubmitButton, AuthFooterLinks, AuthPoweredBy, AuthErrorMessage, AuthSuccessMessage — thin Tailwind-utility wrappers composing Button/Card/fields
- **Visual FX**: MetalBorder (WebGL liquid-metal border; presets `chromatic|silver|gold`, `kind="pill"|"circle"`, `glow`, `strength` 0-100, `theme="dark"|"light"|"auto"`), GlowCard (mouse-tracking glow), NoiseBackground (animated gradient blobs), ImmersiveLanding (full mini-app w/ PWA widgets), VideoPreview, LiveChat, ChatBubble, LanguageSwitcher

Renames from old versions (see `docs/component-migration-map.md`): Loading→Spinner, DropdownSelect→Select, RadialProgress→ProgressCircle, RangeSlider→Slider, Progress→ProgressBar/ProgressCircle. ~40 components removed outright (Carousel, Rating, Steps, Stats, FileInput, …).

`ColorWheelFlower` follows the root `data-theme` by default. Its built-in light and dark
palettes share hue positions, while dark mode uses genuinely darker values. Pass
`mode="light"|"dark"` to make the mode explicit, or `palette={colors}` to render a custom
31-color literal palette (12 outer, 12 middle, 6 inner, 1 center). A picked swatch emits
the same normalized hex that it displays.

## Forms (TanStack Form + Standard Schema)

```tsx
import { createForm, Form, FormField, FormSubmitButton } from "@pathscale/ui";

const form = createForm({
  defaultValues: { email: "", password: "" },
  schema: loginSchema,                    // any Standard Schema: Zod v4 / Valibot / ArkType
  onSubmit: async (values) => { await login(values); },
});

<Form form={form} class="space-y-4">
  <FormField name="email" label="Email" />
  <FormField name="password" label="Password" inputProps={{ type: "password" }} />
  <FormSubmitButton>Log in</FormSubmitButton>
</Form>
```

- `Form` without a `form` prop = plain styled `<form>` (`FormRoot`). With `form` = context provider + wired submit.
- Inside a `<Form>`: `useField(name)` → `{value, error, touched, invalid, handleChange, handleBlur}`. **Errors are touch-gated** — `error()` is `undefined` until the field blurs. `FormSubmitButton` disables on `!canSubmit` (not touch-gated), so the button can be disabled with no visible error.
- Escape hatch: `form._tsForm` is the raw TanStack form API (typed `any` on purpose).
- Schema validation runs on change+blur+submit; blur errors clear immediately on change once valid.

## Table (headless assembly)

```tsx
import { useTableModel, useTableSorting, useTablePagination, TableRoot, TableContent, ... } from "@pathscale/ui";

const sorting = useTableSorting();
const pagination = useTablePagination();          // default page sizes [10,25,50,100]
const table = useTableModel({
  data: () => rows(), columns,
  sorting: sorting.sorting, setSorting: sorting.setSorting,
  pagination: pagination.pagination, setPagination: pagination.setPagination,
  enableSorting: true, enablePagination: true,
});
// render table.getHeaderGroups()/getRowModel().rows into:
// <TableContent sortDescriptor={sorting.sortDescriptor()} onSortChange={sorting.setSortDescriptor}>…
```

- State-slice hooks (all controlled-or-uncontrolled): `useTableSorting`, `useTableSelection`, `useTableFiltering` (per-column popovers + `getColumnFilterProps`), `useTablePagination` (⚠️ `nextPage(max)`/`lastPage(max)` need caller-supplied max page index), `useTableExpansion`.
- Parts: TableRoot/ScrollContainer/Content/Header/Column/Body/Row/Cell/ExpandedRow/Footer/PageSize/ResizableContainer/ColumnResizer/LoadMore(+Content), plus SortIcon, ExpandToggle, InlineConfirm, MobileListView (responsive card fallback), VirtualSpacerRow.
- **Virtualization is not built in**: combine `useVirtualRows` (wraps @tanstack/solid-virtual) + `VirtualSpacerRow` yourself. Playground has examples: `playground/src/examples/Table*.tsx`.

## Motion

```ts
import { enablePopmotion } from "@pathscale/ui";
import { animate } from "popmotion";
enablePopmotion((opts) => animate({ ...opts }));   // ⚠️ WITHOUT this, all JS animations SNAP to end state
```

- `runMotion(el, from, to, transition?, onComplete?)` — animates `opacity/x/y/scale`; **durations in seconds**.
- Presets via `getPreset/resolvePreset` (`route`, `routeAuth`, `authSwap`, `fade`, `fadeUp`, `scaleIn`, `toast`, `routeDashboard`); `registerPreset` mutates the global set; `createMotionSystem()` for isolated instances; `createRouteTransitionResolver({rules, fallback})` for route rules.
- Solid components: `<Presence when={open()}>{(isExiting, onExitComplete) => <MotionDiv initial animate exit isExiting={isExiting()} onExitComplete={onExitComplete}>…` — Presence force-unmounts after 800ms if `onExitComplete` never fires. `<AnimatedCollapse open duration=0.24>` for height collapse.
- `resolvePreset(name, {reduceMotion})` returns the `noMotion` preset under prefers-reduced-motion. Note Modal/Toast/Drawer animate via CSS, not this system.

## Streaming

```ts
const buf = useStreamingBuffer<Row>({ strategy: "upsert", maxSize: 500, getKey: r => r.id });
useStreamingSubscription<Row>({
  subscribe: (o) => { const es = new EventSource(url); es.onmessage = e => o.next(JSON.parse(e.data)); return () => es.close(); },
  onData: buf.add,
});
// buf.rows() is the reactive, capped, deduped array
```
Strategies: `append` (ignore duplicate keys) | `upsert` (replace in place) | `replace`. Subscription returns `{isLive, isConnecting, error, eventCount, start, stop}`; auto-starts unless `enabled` is false.

## Toast (imperative singleton)

```ts
import { toast, ToastProvider } from "@pathscale/ui";
// mount <ToastProvider/> once, then anywhere:
toast.success("Saved"); toast.danger("Failed"); toast.promise(p, {loading, success, error});
```

## Icons

Icons are Iconify classes: `<Icon name="icon-[mdi--close]" />` or bare `class="icon-[lucide--search]"`. In this repo they're baked at build time into `src/styles/icons/generated-icons.css` (only icons actually used get emitted). Consumer apps with Tailwind v4 can use `@plugin "@iconify/tailwind4"` for arbitrary icons (playground does this).

## Dates

Calendar/DatePicker/RangeCalendar/DateRangePicker use the internal engine (native Date + Intl; no date lib). Values are `Date` objects; ranges are `{start: Date, end: Date}`. Controlled via `value/defaultValue/onChange`. `DateField`/`TimeField` are separate segmented text editors, not calendar-backed.

## Playground (fastest way to try things)

```sh
bun install && cd playground && bun install && cd ..
bun run playground:dev     # Vite; @pathscale/ui aliased to local src/ — edits hot-reload, no rebuild
```
`playground/src/App.tsx` (~7,300 lines) demos every component; examples in `playground/src/examples/` (Form, Motion, Streaming, Table×3). Playground forces `data-theme="dark"` at runtime in `playground/src/index.tsx`.

---

## Mirroring to the public showcase (js.software)

**Decision (2026-07-26): hand-port this to TSX in js.software.** It has no markdown
pipeline — docs pages are hand-written TSX under `src/pages/docs/` — and adding one was
judged not worth it.

**Entry point: a third homepage button, "Usage Cheatsheet".** `src/pages/Home.tsx`
currently has two (`Start Building Today` → `ROUTES.DOCS_INSTALLATION`, `Explore
Components` → `ROUTES.SHOWCASES`). A third is right rather than folding this into
Installation, because the three serve different intents: *get started* (first five
minutes), *browse* (visual), *look something up while working* (this document). Burying
a reference inside a getting-started flow hides it from the people who need it most.
Style it subordinate to the existing two — `btn-ghost`, not a third `btn-primary` — so
the hero stays a hero and not a menu.

**Build it with `@pathscale/ui` components**, not raw markup — the showcase should be
built from the library it documents. Follow the existing page conventions in
`src/pages/docs/Installation.tsx`: `ContentContainer`, `CodeBlock`, `Callout`, and
`Flex` from `@pathscale/ui`.

**Drift control — this matters.** This file stays the source of truth. Port the *stable*
narrative sections (Install, Component conventions, Forms, Table, Toast, Icons, Dates)
and have **Theming tokens** and the **Component inventory** link back here rather than
duplicating them: those two change whenever the library changes, and a TSX copy has
nothing keeping it honest. The inventory alone is ~40 lines that go stale the moment a
component is added.
