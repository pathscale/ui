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
bun add @pathscale/ui solid-layouts
bun add -d rsbuild-plugin-solid-layouts
```

```ts
import { Button, Flex, Modal, toast } from "@pathscale/ui";   // everything is in the root barrel
import "@pathscale/ui/index.css";                              // tokens + themes + base + icons
```

Subpath exports also exist: `./components/*`, `./primitives/*`, `./hooks/*`, `./motion`,
`./styles/*`.

Layout components require the application compiler before the normal Solid transform. See [Layouts](./layouts.md) for the Rsbuild configuration, exact failure behavior, and porting report.

## Theming

- Two themes: `light` (default when no attribute) and `dark`. Switch: `document.documentElement.setAttribute("data-theme", "dark")`.
- Tokens are CSS vars: `--color-primary(/-content)`, `--color-secondary`, `--color-accent`, `--color-neutral`, `--color-info/success/warning/error`, `--color-danger`, surfaces `--color-base-100/200/300`, `--color-base-content`, HeroUI-style `--color-default(/-foreground/-hover)`, `--color-background/foreground`, daisy short aliases `--b1/--b2/--b3/--bc`, radii `--radius-selector/-field/-box`, and the `--glass-*` set: six colours the theme owns, plus the rest derived from three numbers by `applyGlassTokens` (see [Glass](#glass)).
- `src/index.css` has a Tailwind v4 `@theme` block, so in a Tailwind v4 app `bg-primary`, `text-base-content`, `bg-base-100` etc. work.
- Any component accepts `dataTheme` prop → rendered as `data-theme` attr (scoped theming).

### Glass

`material="glass"` makes a surface out of what is behind it rather than a fill.
It is on `Card`, `Dialog.Content`, `Drawer.Content`, `Popover.Content`, `Menu`
and `Navbar`; `solid` is the default everywhere, so nothing changes until it is
asked for.

The look is driven by the `--glass-*` custom properties, and you do not set
those by hand — `applyGlassTokens` derives all twenty-five from three numbers:

```ts
import { applyGlassTokens, GLASS_DEFAULTS, GLASS_LIMITS } from "@pathscale/ui";

applyGlassTokens({ blur: 9, refraction: 0.31, depth: 24 }, "dark");
```

- `blur` (0–50px) how far the backdrop is smeared
- `refraction` (0–0.4) how much the surface asserts its own tint, border and highlight
- `depth` (0–30) how far off the page it sits: glow, sheen, shadow

`GLASS_LIMITS` carries those ranges and `GLASS_DEFAULTS` the per-mode defaults,
so a settings panel should read both from here rather than restating them.
`resolveGlassTokens` returns the same set as an object, and `glassTokensToCss`
as a declaration block for a theme that wants them baked in.

Pass a **complete** tuning. Three of the derived tokens are read without a CSS
fallback, and an undefined custom property makes CSS drop the whole declaration
rather than fall back — so a partial set renders a surface with no background at
all rather than a plainer one.

Nested glass is flattened to one pane on purpose, and both
`prefers-reduced-transparency` and a browser without `backdrop-filter` fall back
to a more opaque fill.

## Component conventions (consumer-facing)

- Booleans are HeroUI-style `is*`: `isDisabled`, `isOpen`, `isInvalid`, `isPending`, `isIconOnly`, `isHoverable`, `isPressable`. Native `disabled` also honored.
- Sizes and colour-ish props are **per-component, not a shared union in practice**.
  `ComponentSize` and `ComponentColor` are declared in `src/components/types.ts` with the
  full unions, but **they are not re-exported from the root barrel**, so consumers cannot
  import them, and individual components narrow them. `Button` takes
  `variant` (`primary | secondary | tertiary | outline | ghost | danger | danger-soft`)
  and `size` (`sm | md | lg`); `Badge`, `Chip`, `Avatar`, `Spinner`, `Toggle`, `Meter` and
  the progress components take `color`. Read the component's own props before assuming.
- Both `class` and `className` remain compatibility escape hatches. Prefer semantic component parameters; `solid-layouts-lint --porting --layouts @pathscale/ui` reports overrides that should move into recipes.
- Controlled/uncontrolled triples: `isOpen/defaultOpen/onOpenChange`, `value/defaultValue/onChange`, `selectedKey/defaultSelectedKey/onSelectionChange`. Event callbacks pass **values, not events**.
- `Slider.onChange` reports continuous values. Optional `Slider.onChangeEnd` reports the final changed value once on pointer release, pointer cancellation, keyboard release, or blur fallback. Its visible `label` is also copied to the semantic slider's `aria-label`, because not every renderer resolves `aria-labelledby` across a visually hidden label.
- `Collapsible.Content` retains closed content by default. Set `keepMounted={false}` to mount it only while expanded; the check is reactive, so it mounts and unmounts as the state changes.
- `Popover` accepts `anchorRect` as a rectangle or rectangle accessor when content must be positioned without a trigger element.
- Compound components: `Modal.Trigger`, `Tabs.List`, `Select.Option`, etc. (`Object.assign` statics; also exported flat: `AccordionRoot`, `AlertTitle`, …). Parts are styleable/testable via `data-slot="..."` and state attrs (`data-open`, `data-selected`, `data-invalid`).
- `Tabs` does not require `ResizeObserver`. When it is unavailable, selection and keyboard behavior remain active and the indicator is measured on selection, mount, and window resize.
- No polymorphic `as` prop.

```tsx
<Flex direction="col" gap="sm">
  <Button variant="primary" size="md" isPending={saving()}>Save</Button>
</Flex>
```

Typography presentation belongs on `Text` parameters rather than consumer utility classes:

```tsx
<Text size="xs" variant="muted" weight="semibold" transform="uppercase" tracking="wide">
  Appearance
</Text>
```

Omitted parameters do not reset inherited font family, weight, transform, tracking, or leading.

Font selection uses semantic roles rather than coupling UI to a particular font package:

```ts
import "@pathscale/fonts-metroclean";
```

```css
:root {
  --font-display: "metroclean", sans-serif;
}
```

```tsx
<Text family="display">Chuzz</Text>
```

The available roles are `body`, `heading`, `display`, and `mono`. They resolve through
`--font-body`, `--font-heading`, `--font-display`, and `--font-mono`, with `--font-sans` as
the shared fallback. This works with PathScale Fonts and application-owned font faces.

## Component inventory (by family)

- **Layout/primitives**: Flex, Grid, Join, Card, Separator, ScrollArea, Skeleton, Empty, Footer, Header, Navbar, Toolbar, Dock
- **Typography/misc**: Text, Link, Kbd, Badge, Chip, Tag/TagGroup, Avatar, Icon, Tooltip, Breadcrumbs, Pagination, Meter, ProgressBar, ProgressCircle, Spinner (alias: Loading)
- **Inputs**: Input, InputGroup, InputOTP, TextField, TextArea (and textarea), NumberField, SearchField, PasswordField (+ password-requirements/rules, `passwordRules.ts`), ColorField, Checkbox(+Group), Radio(+Group), Toggle, Slider, Select, ComboBox, ListBox, SizePicker, Form pieces (Label, Description, ErrorMessage, FieldError, Fieldset)
- **Dates**: Calendar, RangeCalendar, DatePicker, DateRangePicker (internal date engine); DateField, TimeField (separate segmented editors)
- **Color**: ColorPicker, ColorArea, ColorSlider, ColorSwatch(+Picker), ColorWheel, ComplexColorWheel, ColorWheelFlower, ThemeColorPicker
- **Overlays**: Modal, Drawer, Popover, Dropdown, Menu, Toast, Disclosure(+Group), Accordion
- **Data**: DataGrid (assembled, `createDataGrid` model), FlexGrid (incremental reveal, `createFlexGrid` model), Table (headless compound + hooks), plus primitives `useVirtualRows`, `useStreamingBuffer`, `useStreamingSubscription`
- **Auth kit**: AuthForm, AuthCard, AuthFieldGroup, AuthSubmitButton, AuthFooterLinks, AuthPoweredBy, AuthErrorMessage, AuthSuccessMessage — Layouts composing Button/Card/fields. Their spacing, alignment and tone are recipe parameters (`gap`, `align`, `variant`), so a consumer asks for the presentation it wants rather than restating utility classes. AuthCard exposes `header`, `headings`, `title`, `description`, `branding`, `body` and `footer` as `data-slot` targets.
- **Visual FX**: MetalBorder (WebGL liquid-metal border; presets `chromatic|silver|gold`, `kind="pill"|"circle"`, `glow`, `strength` 0-100, `theme="dark"|"light"|"auto"`), GlowCard (mouse-tracking glow), NoiseBackground (animated gradient blobs), ImmersiveLanding (full mini-app w/ PWA widgets), VideoPreview, LiveChat, ChatBubble, LanguageSwitcher

Renames from old versions (see `docs/component-migration-map.md`): Loading→Spinner, DropdownSelect→Select, RadialProgress→ProgressCircle, RangeSlider→Slider, Progress→ProgressBar/ProgressCircle. ~40 components removed outright (Carousel, Rating, Steps, Stats, FileInput, …).

`ColorWheelFlower` follows the root `data-theme` by default. Its built-in light and dark
palettes share hue positions, while dark mode uses genuinely darker values. Pass
`mode="light"|"dark"` to make the mode explicit, or `palette={colors}` to render a custom
31-color literal palette (12 outer, 12 middle, 6 inner, 1 center). A picked swatch emits
the same normalized hex that it displays. Surface strength, softness and accent mixing
remain consumer theme concerns; use the literal selected hex as their input rather than
making the wheel silently transform it.

Use `ColorWheel` for the ordinary controlled surface: it owns the picker context and
accepts `value`, `onChange`, `mode`, and an optional literal 31-colour palette.
`ColorWheelFlower` is the low-level context consumer and normally stays an implementation
detail.

`ComplexColorWheel` puts standard, accessible slider axes beside the controlled wheel on
a glass card. Supply explicit adjustments for the application's strength, softness, blur,
refraction, depth, or other numeric theme controls:

```tsx
<ComplexColorWheel
  aria-label="Surface colour"
  value={theme.surface}
  onChange={setSurface}
  palette={surfacePalette}
  adjustments={[
    { id: "strength", label: "Strength", value: theme.strength, min: 0, max: 100, onChange: setStrength },
    { id: "softness", label: "Softness", value: theme.softness, min: 0, max: 10, onChange: setSoftness },
    { id: "glass-blur", label: "Glass blur", value: glass.blur, min: 0, max: 50, onChange: setBlur },
  ]}
/>
```

The composition standardizes layout, glass, labels, semantic slider values, and keyboard
interaction. The application still owns its colour math: an adjustment may provide
`preview(value, selectedColour)` without hiding a token transformation inside the wheel.
Pass `stops` for a curated discrete axis; it renders named, pressed-state choices instead
of approximating a non-uniform palette with a continuous slider. `ink` adds a foreground
sample for a text-brightness axis.

## Forms (built in, plus Standard Schema)

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
- Inside a `<Form>`: `useField(name)` → `{value, error, touched, invalid, handleChange, handleBlur}`. **Errors are touch-gated** — `error()` is `undefined` until the field blurs. `FormSubmitButton` disables on `!form.isValid()` (not touch-gated), so the button can be disabled with no visible error. A failed `submit()` touches every field, so the errors it refused on all become visible at once.
- The form API is the library's own: `values()`, `getFieldValue`, `getFieldMeta`, `setFieldValue`, `validateField`, `submit()`, `isSubmitting()`, `isValid()`. There is no longer a `_tsForm` escape hatch, because there is no longer a wrapped library to escape to.
- Schema validation runs on change+blur+submit; blur errors clear immediately on change once valid.

## DataGrid (assembled)

Reach for this first. `Table` below is the headless path, fifteen parts you
assemble yourself; `DataGrid` is one tag over a model that owns the state.

```tsx
import { createDataGrid, DataGrid } from "@pathscale/ui";

const grid = createDataGrid({ pageSize: 10, selection: "multiple" });
grid.addColumn("id", "ID", "number");
grid.addColumn("firstName", "First Name", "string", { searchable: true });
grid.addColumn("status", "Status", "custom", {
  render: ({ value }) => <Chip flavor="success">{String(value)}</Chip>,
});
grid.addRow({ id: 1, firstName: "John", status: "active" });

<DataGrid model={grid} borders="rows" striping="rows" interactive />
```

**`model` is the only required prop.** There is no `sortable`, `searchable`,
`checkable`, `pagination` or `expandable` flag: each of those is already a fact
about the model, and a second copy on the tag could disagree with the thing
beside it. A column sorts because it was added sortable; the grid pages because
it was given a `pageSize`; it selects because it was given a `selection` mode.

What is left on the tag is presentation: `borders` (`none|rows|cols|both`),
`striping`, `sticky` (`none|header|columns|both`), `interactive`, `size`,
`width`, `flavor`, `caption`, `empty`, `renderExpanded`. `onSortChange`,
`onPageChange` and `onSelectionChange` are mirrors for an app keeping state in a
URL; the model stays the source, so read the URL and call `grid.setSort()`.

Model API: `addColumn(name, label, dataType?, options?)`, `addRow(row, index?)`,
`deleteRow`, `setRows`, `toggleColumn`, `sortByColumn`, `setSort`,
`searchColumn`, `resetFilters`, `filterRows`, `switchPage`, `setPageSize`,
`toggleCheck`, `toggleCheckAll`, `setGroupBy`, `groups(name)`. Accessors:
`columns`, `visibleColumns`, `columnsByName`, `rows`, `filteredRows`,
`sortedRows`, `pageRows`, `sort`, `queries`, `page`, `pageSize`, `pageCount`,
`total`, `selectedIds`, `selectedRows`, `groupBy`, `groupedRows`.

### Porting from vue3-ui's DataGrid

The verbs and their positional shapes carry over, so
`grid.addColumn("id", "ID", "number")` moves unchanged. Five differences:

| vue3 | here | why |
| --- | --- | --- |
| `caption` on a column | `label` | `caption` collides with `<caption>` |
| `dataType: string` | closed union | a typo used to typecheck and render nothing |
| `sortByColumn(col, ascendant)` | `sortByColumn(col, direction?)` | `true` meaning "ascending" is what 2.2 removed |
| `switchPage()` reading a field | `switchPage(page)` | explicit |
| `getColumns()` | `visibleColumns()` | it always returned only the visible ones |

And one behavioural difference worth knowing: in vue3, `searchColumn`,
`sortByColumn` and `switchPage` each rewrote the same `rows` array from
`originalRows`, so any two of them composed by destroying each other — paging
after a search silently restored the rows the search removed. Here `rows` is the
source and the rest is derived, so a search survives a page change and searches
accumulate across columns instead of replacing the last one. `resetFilters()`
clears them all.

Drag reordering is not ported. Cell editing is deferred.

## FlexGrid (a long list, a page at a time)

Not a smaller `DataGrid`. That one is discrete pagination — page 3 of 12, the
reader moving between fixed windows. This is the other shape: one continuous
list that starts short and grows, which is what a feed, a task log or an item
list wants. Neither can be spelled as the other without lying about where the
reader is.

```tsx
import { FlexGrid } from "@pathscale/ui";

<FlexGrid
  rows={entries()}
  pageSize={20}
  fromEnd
  more={({ count, reveal }) => (
    <Button onClick={reveal}>Show {count} earlier</Button>
  )}
>
  {(entry) => <LogRow entry={entry} />}
</FlexGrid>
```

The cost it removes is **construction, not data**. A list of 700 rows where 20
are visible still builds 700 subtrees, and a row made of library components is a
handful of instances rather than one element. The application this came from
measured a 40-row log at 122-178ms of a 203-339ms panel build for exactly that
reason, and had seven separate hand-rolled versions of the same limit signal and
"show more" button — the lists that had *not* been given one were the slow ones.

`fromEnd` is for anything read newest-first: the first page is the tail, "more"
means *earlier*, and the control moves above the rows so it does not sit under
the reader's eye. `autoLoad` (on by default) reveals as they scroll; `more` adds
an explicit control, and you can have either or both.

**It listens for `scroll`, not `IntersectionObserver`.** That is deliberate, not
dated: not every consumer runs in an engine that has observers. One renders
through Blitz, where `IntersectionObserver`, `ResizeObserver` and
`MutationObserver` are all absent, so a sentinel would never intersect and the
list would silently stop at its first page with no error to explain it. One
consequence for you: the list slot owns the scrollbar, so do not put
`overflow: auto` on an ancestor and expect reveals to fire.

`createFlexGrid` is the same logic without the markup, for a list that wants its
own container: `visible`, `total`, `remaining`, `hasMore`, `nextCount`,
`revealMore`, `revealAll`, `reset`, `onScroll`.

## InlineEdit (a value edited where it is read)

A name, a title, a label: something shown as text until someone chooses to
change it, without a dialog or a separate form. The trigger swaps the value for
a field holding a draft of it.

```tsx
import { InlineEdit } from "@pathscale/ui";

<InlineEdit
  value={project.name}
  onCommit={(name) => rename(project.id, name)}
  label={`Rename ${project.name}`}
  trigger={<Icon name="pencil" />}
/>
```

`onCommit` receives the trimmed draft and is not called when it is empty or
unchanged. Enter commits, Escape abandons, and moving focus away commits, so the
mode has an exit for a reader who never touches the keyboard. Pass `children` to
render the value as something other than plain text, such as a link that opens
what it names.

**Two things it does that a hand-rolled version usually gets wrong**, both of
which shipped as bugs in the application this came from:

The open state is a plain variable and the swap is written to the elements, not
held in a signal. A `createSignal` setter called from a click handler does not
take effect within that handler in the Solid version this targets: the write
lands a microtask later, after the handler that would have read it has finished.
A component whose whole job is "this click changes what is on screen" cannot be
built on that, and the failure is silent - the trigger looks dead.

The field ignores the blur that arrives before it has focus. Revealing the field
moves focus, and that first blur reaches the field's own handler while the mode
is still opening; committing on it closes the editor inside the click that
opened it. Same symptom, and it survives a tab switch because the state belongs
to the component rather than the surface.

Every part is a declared slot - `inline-edit-trigger`, `inline-edit-field`,
`inline-edit-read`, `inline-edit-edit`, `inline-edit-value` - so a test harness
can address the trigger and the field by name instead of guessing at the markup.

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
- **Virtualization is not built in.** `useVirtualRows` was a thin wrapper over `@tanstack/solid-virtual` that nothing in the library used; it was removed with the rest of TanStack. `VirtualSpacerRow` is still here for a caller that brings its own windowing.

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

`Icon` takes one prop, `src`, and which source it is, is the type: a string is a
preload token (`"lucide--copy"`, or the wrapped `"icon-[lucide--copy]"`), an
element is inline SVG you own.

```tsx
<Icon src="lucide--copy" />
<Icon src={<svg viewBox="0 0 24 24">…</svg>} />
```

**The library ships no glyphs.** Your app generates the CSS that resolves a
token, with `@plugin "@iconify/tailwind4"` under Tailwind v4 or
`@pathscale/rsbuild-plugin-iconify` under rsbuild, scanning your source rather
than ours. Both sources inherit colour through `currentColor`, so `flavor` works
the same either way.

## Dates

Calendar/DatePicker/RangeCalendar/DateRangePicker use the internal engine (native Date + Intl; no date lib). Values are `Date` objects; ranges are `{start: Date, end: Date}`. Controlled via `value/defaultValue/onChange`. `DateField`/`TimeField` are separate segmented text editors, not calendar-backed.


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
