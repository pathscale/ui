# @pathscale/ui Review: Component API Design

**Date:** 2026-07-27
**Scope:** `src/components/**`, `src/index.ts`, `src/components/types.ts`, `src/components/utils.tsx`, `src/lib/**`, `scripts/check-contracts.ts`, `package.json` exports map. Read for intent first: `CLAUDE.md`, `AGENTS.md`, `CLAUDE-INTERNALS.md`, `ANALYSIS.md`, `CONTRIBUTING.md`, `docs/frontend-conventions.md`.
**Commit:** Revalidated at `aa4fb58`; source findings were originally measured at `85614f1`.
**Reviewer slice:** component-api-design. Sibling slices cover the CSS/theme system, the build pipeline, and the docs site; none of those are judged here.

## Summary

- The library is large and genuinely disciplined in its *skeleton*: 104 component directories, 134 `.tsx` files, ~192 component functions, and effectively every one of them uses `splitProps` + `twMerge` + `data-slot`. `npx tsc --noEmit` passes clean. There are only 12 `any` occurrences in the whole of `src/`, all confined to `src/hooks/form/` and deliberately documented. That is a better baseline than most libraries this size.
- The discipline is skin-deep, though, because it is enforced by substring matching. `scripts/check-contracts.ts` checks only "does the file contain the string `splitProps`" and "does it contain `twMerge`". Every rule in `CONTRIBUTING.md` that actually shapes the API surface, `ComponentSize`/`ComponentColor`, `is*` booleans, `function X(props): JSX.Element`, aria-label on interactive parts, no hardcoded English, is unenforced, and each is violated at scale.
- **The three highest-value moves.** (1) Collapse the ~230 hand-written copies of the same four-prop scaffold into one `createPart` factory; roughly 1,700 lines of `src/components` (5% of it) is mechanical repetition, and the repetition is where the drift lives. (2) Make the shared design-token types real: `ComponentVariant`, `ComponentShape` and `ComponentPosition` are exported public API with **zero** references anywhere in the repo, while 60 components hand-declare their own overlapping unions. (3) Fix barrel hygiene: 132 symbols that component barrels export are missing from the root barrel, including `ButtonProps`, `ButtonVariant`, `ButtonSize`, `SelectProps` and `InputProps`, so a consumer cannot type a wrapper around the library's flagship component.
- Composition is the strongest part of the codebase. The `Object.assign(Root, {Part, ...})` + context-of-accessors idiom is applied consistently, controlled/uncontrolled is handled with the same three-line pattern nearly everywhere, and the roving-tabindex work in `Select`, `Menu` and `ListBox` is careful and correct. The compound layer is not where the problems are.
- Accessibility is uneven rather than absent: 89 of 134 `.tsx` files carry `aria-*`, 35 carry `role`, 27 implement `onKeyDown`. `Tabs` and `Select` are close to APG-correct. But `DrawerClose` ships as a bare `<span onClick>`, and six components bake non-overridable English into `aria-label`.
- Several repo docs are now factually wrong about this slice, in ways that will mislead the next agent: `invokeEventHandler` is duplicated in **25** files, not "~6"; `ANALYSIS.md` states there is "No polymorphic `as` prop" when four components have one.

## Findings

### [SEV-1] ~230 hand-written copies of the same four-prop component scaffold

- **ID:** `ui-component-api-design-01`
- **Severity:** High
- **Category:** Design
- **Confidence:** High
- **Location:** `src/components/surface/Surface.tsx:22-42`, `src/components/kbd/Kbd.tsx:92-165`, `src/components/separator/Separator.tsx:18-48`, `src/components/error-message/ErrorMessage.tsx:10-32`, and ~225 further DOM parts across `src/components/**`.
- **What:** Every leaf part re-implements the identical head-and-tail by hand. Measured over `src/components/**/*.tsx`: 233 `splitProps` lists contain `"dataTheme"`, 227 sites write `data-theme={local.dataTheme}`, 172 write `style={local.style}`, 172 twMerge calls end in `local.class, local.className`, 384 sites write a `data-slot`, and 80 sites write a `() => local.X ?? "default"` thunk. `Surface.tsx` is the canonical shape at 25 lines, of which 21 are scaffold and 4 are the component.
- **Why it matters:** That is roughly 1,700 lines of pure repetition out of 33,470 in `src/components` (~5%). Repetition is not the real cost, drift is: because each copy is independent, the codebase has accumulated three different declaration styles (179 `: Component<X>`, 83 `: ParentComponent<X>`, 52 `): JSX.Element =>`, and exactly 2 in the form `CONTRIBUTING.md:83` actually mandates), two class-application styles (536 `{...{ class: … }}` vs 33 `class={…}`), and three state-data-attribute styles (112 always-present `"true"/"false"`, 64 present-or-`undefined`, 45 bare boolean). None of that drift is detectable by review; it is only visible by counting.
- **Fix:** Add a `createPart` factory and derive both the props type and the variant union from the `CLASSES` map, so the two can no longer disagree. Mechanical for the ~60 pure styled leaves; the stateful roots keep their hand-written bodies.

  Before, `src/components/surface/Surface.tsx`:
  ```tsx
  export type SurfaceProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
    IComponentBaseProps & SurfaceVariants & { children?: JSX.Element };

  export function Surface(props: SurfaceProps) {
    const [local, others] = splitProps(props, [
      "children", "class", "className", "dataTheme", "style", "variant",
    ]);
    const variant = () => local.variant ?? "default";
    return (
      <div {...others}
        {...{ class: twMerge(CLASSES.base, CLASSES.variant[variant()], local.class, local.className) }}
        data-slot="surface" data-theme={local.dataTheme} style={local.style}>
        {local.children}
      </div>
    );
  }
  ```
  After:
  ```tsx
  export const Surface = createPart({
    tag: "div",
    slot: "surface",
    base: CLASSES.base,
    variants: { variant: CLASSES.variant },   // key type derived from the map
    defaults: { variant: "default" },
  });
  export type SurfaceProps = PartProps<typeof Surface>;
  ```
  The factory owns the `splitProps` list, the `twMerge` order (consumer `class`/`className` last, which the whole library depends on), `data-slot`, `data-theme`, `style`, and emits `data-<variantKey>` uniformly. Deriving `variants` from `CLASSES` also closes the class of bug visible at `src/components/tabs/Tabs.tsx:19`, where `type TabsVariant = "primary" | "secondary"` while `Tabs.classes.ts` only defines a `secondary` key, so `CLASSES.variant["primary"]` is `undefined` and the code needs a hand-written guard at `Tabs.tsx:113`.
- **Effort:** L for the factory plus a first batch of ~15 components; XL to migrate all ~60 leaves.
- **Blast radius:** Internal only if the emitted DOM is byte-identical. It is **not** a breaking change provided the factory reproduces the exact `twMerge` argument order and the existing `data-*` spelling per component. Migrate incrementally; the two idioms can coexist.

---

### [SEV-2] `invokeEventHandler` is copy-pasted into 25 files, in two drifted signatures

- **ID:** `ui-component-api-design-02`
- **Severity:** High
- **Category:** Design / AI-smell
- **Confidence:** High
- **Location:** `src/components/tabs/Tabs.tsx:42-51`, `src/components/select/Select.tsx:72`, `src/components/toast/Toast.tsx:33`, `src/components/card/Card.tsx:25`, `src/components/menu/Menu.tsx:40`, `src/components/menu/MenuItem.tsx:33`, `src/components/table/Table.tsx:59`, plus 18 more (`rg -n 'const invokeEventHandler' src` returns 25 hits).
- **What:** The same 10-line helper, which exists to support Solid's `[fn, data]` bound-handler form, is declared privately in 25 component files. It has already forked: 15 copies are `(handler: unknown, event: Event)` and 10 are `<T extends Event>(handler: unknown, event: T)`. `sortItemsByDomOrder` is likewise triplicated at `src/components/dropdown/Dropdown.tsx:69`, `src/components/list-box/ListBox.tsx:27` and `src/components/menu/Menu.tsx:31`, while `src/components/select/Select.tsx` open-codes a fourth `compareDocumentPosition` sort inline.
- **Why it matters:** This helper sits on the event path of essentially every interactive component in the library. A fix, say handling the `{ handleEvent }` object form, or preserving `this`, has to land in 25 places or the library behaves differently depending on which component you clicked. The generic-vs-nongeneric fork means the two groups already type-check differently at call sites.
- **Fix:** Move one generic copy to `src/lib/events/invokeEventHandler.ts`, and `sortItemsByDomOrder` to `src/lib/dom/sortByDomOrder.ts`; replace the 25 + 3 local declarations with imports. Purely mechanical, no behaviour change, no public API change. Note that `src/lib/` is currently dead (finding 05), so this doubles as the reason to keep it.
- **Effort:** S.
- **Blast radius:** 28 files, all internal. Not a breaking change.

---

### [SEV-3] The shared design-token types are public API that nothing uses

- **ID:** `ui-component-api-design-03`
- **Severity:** High
- **Category:** Design
- **Confidence:** High
- **Location:** `src/components/types.ts:15-36`; consumers counted across all of `src/`.
- **What:** `src/components/types.ts` defines and exports `ComponentSize`, `ComponentColor`, `ComponentVariant`, `ComponentShape` and `ComponentPosition`. Outside `types.ts` itself: `ComponentSize` has 2 references (`glass-panel/GlassPanel.tsx`), `ComponentColor` has 4 (`icon/Icon.tsx`, `navbar/NavbarRow.tsx`), and `ComponentVariant`, `ComponentShape` and `ComponentPosition` have **zero**. Meanwhile 60 component files declare their own local unions. `"default" | "accent" | "success" | "warning" | "danger"` is written out independently seven times (`MeterColor`, `ProgressBarColor`, `ProgressCircleColor`, `ToggleColor`, `BadgeColor`, `AvatarColor`, `ResolvedToastVariant`). `"primary" | "secondary"` is written out nine times plus four aliases. `"sm" | "md" | "lg"` is written out nine times. `CONTRIBUTING.md:66-67` states "Use `ComponentSize` for sizes" and "Use `ComponentColor` for colors" as non-negotiable.
- **Why it matters:** Two costs. For consumers, the same word means different things per component: `primary` is a *variant* on `Button` (`Button.classes.ts`) but a *color* on `Chip`, and `Badge` has both a `variant` (`primary|secondary|soft`) and a `color` (`default|accent|success|warning|danger`) so `<Badge variant="primary" color="primary">` half-typechecks. `size` is `sm|md|lg` on Button/Input/Chip/Meter/Slider but `xs|sm|md|lg|xl` on Spinner/ColorSwatch/GlassPanel, which is exactly the mismatch that makes `<Button size={mySize}/>` fail when `mySize` came from a `Spinner`. For maintainers, adding a colour to the palette means editing ~7 unrelated files. And because `ComponentVariant`/`Shape`/`Position` are exported but unreferenced, they are a public promise the library does not keep, and they cannot be changed or removed without a semver decision.
- **Fix:** Needs a design decision, not a mechanical edit. Either (a) delete `ComponentVariant`, `ComponentShape`, `ComponentPosition` outright as dead public surface and drop the `CONTRIBUTING.md` claim, or (b) commit to them: define `type SemanticColor = "default"|"accent"|"success"|"warning"|"danger"` and `type ControlSize = "sm"|"md"|"lg"` in `types.ts`, have the seven colour components and nine size components alias them, and let `createPart` (finding 01) derive the rest from `CLASSES`. Option (b) plus finding 01 is the coherent move. Either way `CONTRIBUTING.md:66-67` needs to match reality.
- **Effort:** M for (a); L for (b).
- **Blast radius:** (a) removes three exported type names: technically breaking, but nothing in the repo or playground imports them. (b) is source-compatible if the aliases keep the same members.

---

### [SEV-4] 132 symbols are exported by component barrels but missing from the root barrel

- **ID:** `ui-component-api-design-04`
- **Severity:** High
- **Category:** Design / Maintainability
- **Confidence:** High
- **Location:** `src/index.ts` (922 lines, 187 export statements: 111 value re-exports, 75 `export type` blocks, 1 `export *`). Gaps span 27 of the 104 component directories.
- **What:** Each component directory has its own `index.ts` barrel, and `src/index.ts` re-exports from them by hand. The two have fallen out of sync in one direction. Diffing every name a component barrel exports against `src/index.ts` yields 132 missing symbols across 27 directories. The worst cases: `button` is missing `ButtonProps`, `ButtonVariant`, `ButtonSize`; `select` is missing 12 names including `SelectProps`; `table` is missing 30 including `TableRoot`/`TableBody`/`TableCell`; `badge` exports only `default as Badge`, so `BadgeRoot`, `BadgeLabel`, `BadgeAnchor` and all four Badge prop types are absent; `popover` is missing all six of its parts; `empty-state` and `disclosure` are missing every part they define.
- **Why it matters:** `import type { ButtonProps } from "@pathscale/ui"` does not compile. A consumer cannot write `function SubmitButton(props: ButtonProps)` against the main entry point, which is the single most common thing a design-system consumer does. The workaround, `@pathscale/ui/components/button`, exists via the `./components/*` subpath in `package.json:38-41`, but it is undocumented for this purpose and splits the public API into two tiers that nobody chose. The gaps are arbitrary, not principled: `Card` exports `CardVariant` from the root but not `CardRoot`; `Chip` exports its types but not `ChipRoot`/`ChipLabel`.
- **Fix:** Two parts. (1) Add the 132 missing re-exports; a one-off script can generate them from the component barrels. (2) Prevent recurrence by extending `scripts/check-contracts.ts` with a rule that parses each `src/components/*/index.ts` and asserts every exported name appears in `src/index.ts`. That check is ~30 lines and turns a recurring manual chore into a build failure. Also replace `export * from "./motion"` at `src/index.ts:902` with explicit names, so the root barrel has one convention rather than 186 explicit exports and one wildcard.
- **Effort:** M.
- **Blast radius:** Purely additive to the public API; nothing breaks. The new contract rule will fail the build until the 132 are added, so land both together.

---

### [SEV-5] All of `src/lib/` is dead code, including a full CVA implementation and `mergeRefs`

- **ID:** `ui-component-api-design-05`
- **Severity:** High
- **Category:** AI-smell / Design
- **Confidence:** High
- **Location:** `src/lib/style/classes.ts` (~130 lines), `src/lib/refs/mergeRefs.ts`, `src/lib/iterable.ts`, `src/lib/props/types.ts`, `src/lib/tag/createTagName.ts`, `src/lib/tag/createIsButton.ts`, plus their index files (11 files total).
- **What:** Nothing in `src/components/`, `src/hooks/`, `src/primitives/`, `src/motion/` or `playground/` imports anything from `src/lib/`. `rg 'from "[^"]*lib[/"]' src/components src/hooks src/primitives src/motion` returns nothing. `src/index.ts` re-exports nothing from `./lib`. `package.json`'s `exports` map has no `./lib/*` subpath, so consumers cannot reach it either. `mergeRefs`, `cva`, `classes`, `chain`, `OverrideProps`, `createTagName`, `createIsButton` all have exactly zero call sites.
- **Why it matters:** Two of these are actively misleading. `CLAUDE-INTERNALS.md:69` tells the next agent that "`mergeRefs` in `src/lib/refs` [is used] for multi-ref" — it is not, and 27 components instead hand-roll the `(el) => { setSignal(el); if (typeof local.ref === "function") local.ref(el); }` callback (`src/components/tabs/Tabs.tsx:174-179`, `src/components/select/Select.tsx:487`, `src/components/modal/Modal.tsx:388`, and 24 more). `CLAUDE-INTERNALS.md:89` correctly flags the `cva` as unused but describes it as a decision pending, when in fact the entire directory around it is unreachable. An agent following the docs will import a helper that has never been exercised.
- **Fix:** Decide per file. `invokeEventHandler` and `sortItemsByDomOrder` (finding 02) want a home, so keep the `src/lib/` directory and make it real: land those two there, adopt `mergeRefs` in the 27 hand-rolled sites, and delete `style/classes.ts` (the CVA), `iterable.ts`, `props/types.ts` and `tag/` unless a concrete consumer is named. Update `CLAUDE-INTERNALS.md:18` and `:69` and `ANALYSIS.md` in the same change, per `AGENTS.md`'s "Docs describe what is true now".
- **Effort:** M.
- **Blast radius:** Zero runtime impact, nothing imports it. Deleting files that `rslib` currently emits to `dist/lib/` shrinks the package; no exports map entry points there, so no consumer can break.

---

### [SEV-6] `textarea` is a no-op duplicate of `text-area`, and both are in the root barrel

- **ID:** `ui-component-api-design-06`
- **Severity:** Medium
- **Category:** Design
- **Confidence:** High
- **Location:** `src/components/textarea/Textarea.tsx:1-28`, `src/components/textarea/Textarea.classes.ts`, `src/index.ts:782-788`.
- **What:** `src/components/textarea/` wraps `src/components/text-area/` and adds `CLASSES.base`, where `Textarea.classes.ts` is in its entirety `export const CLASSES = { base: "" } as const;`. So the wrapper contributes an empty string. It also re-declares every type as an alias (`TextareaVariant = BaseTextAreaVariant`, etc.) and assembles a compound with only `{ Root }`, dropping whatever parts `TextArea` exposes. Both `TextArea` and `Textarea` are exported from `src/index.ts`.
- **Why it matters:** `import { Textarea }` and `import { TextArea }` both compile and give you subtly different objects that differ only by capitalisation. Editor autocomplete will offer both. The lesser one silently has fewer compound parts. This is the kind of API trap that produces bug reports nobody can reproduce. It is also a live counter-example for `CONTRIBUTING.md:96` ("It duplicates an existing component with fewer features").
- **Fix:** Delete `src/components/textarea/` and add `export { default as Textarea } from "./components/text-area"` as an explicit deprecated alias if the name is load-bearing for existing consumers; otherwise remove it outright. Check `js.software` and consuming apps for `Textarea` imports first.
- **Effort:** S.
- **Blast radius:** Potentially breaking for anyone importing `Textarea`. The alias route is non-breaking.

---

### [SEV-7] The `auth-*` family hardcodes one company's branding into a general-purpose library

- **ID:** `ui-component-api-design-07`
- **Severity:** Medium
- **Category:** Design
- **Confidence:** High
- **Location:** `src/components/auth-powered-by/AuthPoweredBy.tsx:36-37`, and the family at `src/components/auth-{card,error-message,field-group,footer-links,form,powered-by,submit-button,success-message}/`.
- **What:** `AuthPoweredBy` defaults to `label = "Secure Auth by Honey"` and `href = "https://honey.id/"`, and is exported from the root barrel at `src/index.ts:348`. More broadly, all eight `auth-*` directories break the enforced component anatomy: they ship only `Component.tsx` + `index.ts` with no `.classes.ts` and no `.css`, styling instead with raw inline Tailwind strings (`"flex w-full"`, `"rounded-md border border-base-300 px-2.5 py-1 text-xs"`, `"w-full max-w-md"`). Several are thin passthroughs: `AuthErrorMessage` is `<Show>` wrapping `<Alert status="danger">`, `AuthCard` is `<Card variant="shadow">` with a fixed `max-w-md`.
- **Why it matters:** `CONTRIBUTING.md:93-99` lists exactly this under "What NOT to Add": "It hardcodes application-specific logic" and "It is a styled div with fewer than 3 props of real behavior". A third-party consumer who renders `<AuthPoweredBy />` with no props advertises another company. Because these eight bypass `.classes.ts`/`.css`, they are also invisible to the per-component CSS purge manifest and cannot be themed through the token system the rest of the library uses, so they will look wrong under any custom theme.
- **Fix:** Two separable changes. Short term, make the `AuthPoweredBy` label and href required props rather than defaults, which is a small breaking change with an obvious migration. Longer term, decide whether `auth-*` belongs in `@pathscale/ui` at all; if yes, give the eight the standard quartet so they participate in theming and purge. Needs a product decision, not just a refactor.
- **Effort:** S for the branding default; L to normalise the family.
- **Blast radius:** `AuthPoweredBy` prop change is breaking for anyone relying on the default. The quartet migration is internal.

---

### [SEV-8] `Icon` declares a `color` prop it never reads, and reads `width`/`height` non-reactively

- **ID:** `ui-component-api-design-08`
- **Severity:** Medium
- **Category:** Correctness / AI-smell
- **Confidence:** High
- **Location:** `src/components/icon/Icon.tsx:8-43`.
- **What:** Two independent defects in a 43-line file. (1) `IconProps` declares `color?: ComponentColor` at line 11, but `color` is absent from the `splitProps` list at lines 16-24 and never referenced in the class computation, so it falls through into `{...others}` and is spread onto the `<span>` as a raw `color="primary"` attribute that does nothing. (2) Lines 26-27 read `const width = local.width ?? 24;` and `const height = local.height ?? 24;` as plain constants in the component body rather than as thunks, then interpolate them into the `style` object at lines 38-39. In Solid, a props read at the top level of the body is captured once; the two remaining reactive reads in the same JSX (`classes()`, `local.dataTheme`) use the correct forms, which makes the inconsistency look accidental.
- **Why it matters:** `color` is a documented, typed, autocompleted prop that has never worked, on one of the most-used components in any library. `width`/`height` are frozen at first render, so `<Icon width={collapsed() ? 16 : 24} />` will not resize. Note `icon` is in the `SKIP` set of `scripts/check-contracts.ts:8-16`, so neither the contract check nor `tsc` catches either.
- **Fix:** Either implement `color` (add it to `splitProps` and map it through a `CLASSES.color` entry) or delete it from `IconProps`. Change lines 26-27 to `const width = () => local.width ?? 24;` and call them in the style object. Both mechanical.
- **Effort:** S.
- **Blast radius:** One file. Removing `color` is a breaking type change; implementing it is not. Fixing reactivity could change rendering for anyone who was accidentally relying on the frozen value, which is unlikely.

---

### [SEV-9] `DrawerClose` ships a non-focusable `<span onClick>` with no keyboard path

- **ID:** `ui-component-api-design-09`
- **Severity:** Medium
- **Category:** Correctness / Design
- **Confidence:** High
- **Location:** `src/components/drawer/Drawer.tsx:776-788`; contrast `DrawerCloseTrigger` at `src/components/drawer/Drawer.tsx:730-774`. Exported at `src/components/drawer/index.ts:14` and `src/index.ts:223`.
- **What:** `DrawerClose` renders `<span data-slot="drawer-close" onClick={handleClick}>{props.children}</span>`. It has no `splitProps`, no `twMerge`, no `class`/`className` handling, no `ref`, no `role`, no `tabindex`, and no `onKeyDown`. It is the only component part in the file that does none of these. Twelve lines above it, `DrawerCloseTrigger` does all of them correctly on a real `<button>` with `aria-label` defaulting to "Close".
- **Why it matters:** A keyboard or screen-reader user cannot reach or activate `Drawer.Close`. Because a drawer is a modal surface with a focus trap, "cannot reach the close control" means "cannot leave without pressing Escape", assuming the consumer left `isDismissable` on. `CONTRIBUTING.md:73-75` requires semantic HTML and keyboard operation for interactive components. The part also silently discards `class`, `style` and `ref`, so it does not compose with the rest of the library. The contract checker cannot see this: it only greps the whole of `Drawer.tsx` for the strings `splitProps` and `twMerge`, which the file's other 15 parts supply.
- **Fix:** Either delete `DrawerClose` in favour of `DrawerCloseTrigger` (they appear to be the same concept, and having two is itself the smell), or reimplement it on a `<button type="button">` following the `DrawerCloseTrigger` body. Check whether `DrawerClose` was intended as an unstyled "render my child as the closer" slot; if so it needs the child-as-trigger pattern (clone props onto the child), not a wrapper span.
- **Effort:** S.
- **Blast radius:** One component part. Changing the rendered element from `span` to `button` is visually breaking for anyone who styled `[data-slot="drawer-close"]`, so note it in the changelog.

---

### [SEV-10] Non-overridable English strings in six components' aria labels and visible text

- **ID:** `ui-component-api-design-10`
- **Severity:** Medium
- **Category:** Design
- **Confidence:** High
- **Location:** `src/components/pagination/Pagination.tsx:65,72,83,100,126`, `src/components/calendar/Calendar.tsx:297,336`, `src/components/breadcrumbs/Breadcrumbs.tsx:90`, `src/components/navbar/Navbar.tsx:35`, `src/components/combo-box/ComboBox.tsx:750`, `src/components/floating-dock/FloatingDock.tsx:379`, `src/components/color-wheel-flower/ColorWheelFlower.tsx:609`, `src/components/immersive-landing/ImmersiveLanding{Arrows,Navigation}.tsx`.
- **What:** The library has two tiers of hardcoded English. The acceptable tier, ~14 sites, uses an overridable default: `aria-label={local["aria-label"] ?? "Close"}` (`close-button/CloseButton.tsx:43`, `modal/Modal.tsx:774`, `toast/Toast.tsx:657`, and similar). The unacceptable tier has no escape hatch at all: `Pagination` writes literal `aria-label="Go to previous page"`, `aria-label="Go to next page"`, `` aria-label={`Go to page ${token}`} ``, `aria-label="pagination"` and renders visible text `Page {currentPage()} of {safeTotal()}`; `Calendar` writes `aria-label="Previous month"` / `"Next month"`; `Breadcrumbs` writes `aria-label="Breadcrumbs"`; `ComboBox` writes `aria-label="Toggle options"`.
- **Why it matters:** `CONTRIBUTING.md:88` states "No hardcoded English strings — accept as props with sensible defaults". A non-English consumer of `Pagination` cannot localise it at all; the visible "Page 3 of 9" is not reachable through any prop. The repo already ships `createI18n` (`src/components/language-switcher/createI18n.tsx`), so the capability exists and simply is not wired here. `Pagination` is the sharpest case because the untranslatable string is *visible*, not just announced.
- **Fix:** Follow the pattern the other 14 sites already use. Add optional label props with the current strings as defaults: `previousLabel`, `nextLabel`, `summaryLabel?: (page: number, total: number) => string` for `Pagination`; `previousMonthLabel`/`nextMonthLabel` for `Calendar`; `aria-label` passthrough for `Breadcrumbs`/`Navbar`/`ComboBox`. Purely additive.
- **Effort:** M.
- **Blast radius:** Six components, additive props only, no breakage.

---

### [SEV-11] Overlay and selection prop vocabularies disagree across sibling components

- **ID:** `ui-component-api-design-11`
- **Severity:** Medium
- **Category:** Design
- **Confidence:** High
- **Location:** `src/components/dropdown/Dropdown.tsx:78-88`, `src/components/glass-panel/GlassPanel.tsx:14-20`, versus `src/components/modal/Modal.tsx`, `src/components/drawer/Drawer.tsx`, `src/components/popover/Popover.tsx:54-58`, `src/components/tooltip/Tooltip.tsx:66-70`, `src/components/disclosure/Disclosure.tsx`.
- **What:** Three inconsistencies, each verified by reading the public props types rather than the internals. (1) **Open state.** `Modal`, `Drawer`, `Popover`, `Tooltip`, `Disclosure`, `DatePicker`, `DateRangePicker` and `ComboBox` all use `isOpen` / `defaultOpen` / `onOpenChange`. `Dropdown` uses `open`. `GlassPanel` uses `open` + `onToggle`. (2) **Disabled.** The library declares 161 `is*`-prefixed booleans against 142 plain ones; `Dropdown.tsx:85` takes `disabled?: boolean` where its peers take `isDisabled`. Even within a single component the two mix: `Button.tsx:14-18` has `isIconOnly`, `isDisabled`, `isPending` alongside a bare `fullWidth` (`fullWidth` appears as a plain boolean in 15 places). (3) **Selection.** `Tabs` uses `selectedKey`/`onSelectionChange`, `ListBox`/`Menu`/`TagGroup`/`Select` use `selectedKeys`/`onSelectionChange`, `Accordion` uses `value`/`onValueChange`, `RadioGroup`/`CheckboxGroup` use `value`/`onChange`. Four spellings for one concept. `Dropdown.tsx:86-87` also declares `dataTheme?: string; className?: string;` inline instead of extending `IComponentBaseProps`, which 114 other files do.
- **Why it matters:** This is the cost users feel most directly, because it defeats muscle memory: having learned `<Modal isOpen>`, you write `<Dropdown isOpen>` and it silently does nothing, since `isOpen` is not in `DropdownRootProps` but the type is an intersection with `JSX.HTMLAttributes` so it may not even error at the call site. `CONTRIBUTING.md:65` mandates the `is*` form and nothing checks it.
- **Fix:** Rename `Dropdown`'s `open`→`isOpen` and `disabled`→`isDisabled`, and `GlassPanel`'s `open`→`isOpen` and `onToggle`→`onOpenChange`, accepting the old names as deprecated aliases for one minor version (`local.isOpen ?? local.open`). Have `Dropdown` extend `IComponentBaseProps`. The selection-vocabulary split is a larger design conversation and probably should not be forced: `value` for single-value form controls and `selectedKeys` for collections is a defensible split, but `Tabs`'s singular `selectedKey` and `Accordion`'s `value` should pick a side. Then add a contract rule rejecting new plain-boolean props outside a small native-attribute allowlist (`disabled`, `required`, `checked`, `readonly`).
- **Effort:** M.
- **Blast radius:** Breaking for `Dropdown` and `GlassPanel` consumers unless aliased. Update `docs/ui-usage.md` in the same change per `AGENTS.md`.

---

### [SEV-12] The contract checker enforces the two weakest rules, and only on one file per component

- **ID:** `ui-component-api-design-12`
- **Severity:** Medium
- **Category:** Design / Docs
- **Confidence:** High
- **Location:** `scripts/check-contracts.ts:62-99`; skip list at lines 8-16.
- **What:** The build gate does four substring checks against a single file, `src/components/<kebab>/<Pascal>.tsx`: contains `"splitProps"`, contains `"twMerge"`, no purely-static inline `style={{}}`, and `index.ts` contains the substring `"type "`. Three structural weaknesses. (1) **One file only** — line 52-56 `continue`s if `<Pascal>.tsx` is absent, and never looks at siblings, so `menu/MenuItem.tsx` (391 lines), `list-box/ListBoxItem.tsx`, `avatar/AvatarGroup.tsx` and `table/InlineConfirm.tsx` are unchecked. (2) **Whole-file substring** — one `splitProps` anywhere satisfies the rule for all parts in the file, which is precisely how `DrawerClose` (finding 09) passes. (3) **Stale skip list** — of the five names in `SKIP` at lines 8-16, three directory names, `showcase`, `showcase-section` and `props-table` do not exist in `src/components/`.
- **Why it matters:** The gate creates false confidence. `CONTRIBUTING.md:45` says "Every component MUST follow these rules. This is non-negotiable", and CI green implies compliance, but the measurements in findings 01, 03, 10 and 11 show the checklist's substantive rules are violated at scale. Most starkly: `CONTRIBUTING.md:83` requires "`function` component with explicit return type `: JSX.Element`", and across ~192 component functions exactly 2 are in that form. A rule that nothing enforces and nothing follows should be deleted or made real.
- **Fix:** Two moves. First, reconcile the doc: delete rules the codebase has consciously abandoned (the `function`+`: JSX.Element` form is a good candidate given 179 files use `: Component<P>`), and keep only what is true. Second, make the checker structural: parse with the TypeScript compiler API (already a devDependency) instead of `String.includes`, walk every `.tsx` in the directory, and check per exported component rather than per file. That unlocks the checks that would actually have caught findings 04, 08, 09 and 11: every exported component splits `class`, every barrel export appears in `src/index.ts`, no declared prop is unread, no plain-boolean props outside the allowlist. Prune the three phantom skip entries while you are in there.
- **Effort:** L.
- **Blast radius:** `scripts/check-contracts.ts` and `CONTRIBUTING.md`. Expect a large one-time violation list; land the checker with an allowlist of known violations and burn it down.

---

### [SEV-13] `TabsRoot` passes a reactive memo as its context value, which recreates the subtree

- **ID:** `ui-component-api-design-13`
- **Severity:** Low
- **Category:** Correctness
- **Confidence:** Medium — needs a runtime check to confirm the subtree actually tears down.
- **Location:** `src/components/tabs/Tabs.tsx:117-130`.
- **What:** `TabsRoot` builds its context with `createMemo<TabsContextValue>(() => ({ orientation: local.orientation ?? "horizontal", variant: local.variant ?? "primary", selectedKey, setSelectedKey, ... }))` and passes `value={context()}`. `orientation` and `variant` are stored as **plain values**, read inside the memo body, so the memo has real reactive dependencies. Solid's `Provider` reads `props.value` inside a render effect, so a changing value re-runs it and recreates the provider's children. Every other field in the object (`selectedKey`, `setSelectedKey`, `registerTab`, …) is a stable accessor, which is the documented idiom at `CLAUDE-INTERNALS.md:74`; `orientation` and `variant` are the two that break it.
- **Why it matters:** Toggling `orientation` or `variant` at runtime would tear down and rebuild every `Tab` and `TabPanel`, running `onCleanup`→`unregisterTab` and `onMount`→`registerTab` for each, and losing any DOM state inside the panels. Both props are usually static, which is why this has not been noticed, but responsive layouts that flip `orientation` on breakpoint are the obvious trigger. Worth contrasting: `color-picker/ColorPicker.tsx:400` and `color-swatch-picker/ColorSwatchPicker.tsx:140` use the same `createMemo` + `value={context()}` shape but put every field behind an accessor, so their memos have no dependencies and never recompute. Those two are harmless but the `createMemo` is pointless there.
- **Fix:** Change `TabsContextValue.orientation` and `.variant` to `Accessor<TabsOrientation>` / `Accessor<TabsVariant>`, make the context a plain object literal rather than a memo, and update the six read sites (`Tabs.tsx:204`, `:209`, `:266`, `:269`, `:342`, `:426`). That also removes the duplicated defaulting at `Tabs.tsx:135`, where `data-orientation={local.orientation ?? "horizontal"}` re-derives what the context already computed. While there, drop the redundant `createMemo` in `ColorPicker` and `ColorSwatchPicker`.
- **Effort:** S.
- **Blast radius:** `Tabs.tsx` only; `TabsContextValue` is not exported, so no public API change.

---

### [SEV-14] Dead branch in `wrapWithElementIfInvalid`, and a `TabIndicator` that renders nothing

- **ID:** `ui-component-api-design-14`
- **Severity:** Low
- **Category:** AI-smell
- **Confidence:** High
- **Location:** `src/components/utils.tsx:7-46`; `src/components/tabs/Tabs.tsx:398-402`.
- **What:** Two invented abstractions with no behaviour. (1) `wrapWithElementIfInvalid` computes a five-clause condition over `node` and then returns **byte-identical JSX in both branches** — `<Dynamic component={wrapper} class={className}>{node}</Dynamic>` either way. The helper `isJSXElement` exists only to feed that dead condition. The whole function collapses to its `return`, and the name is a lie: it wraps unconditionally. (2) `TabIndicator` is `const TabIndicator = (): JSX.Element | null => { return null; }` — it takes no parameters, yet a `TabIndicatorProps` type is declared for it, it is exported as `Tabs.Indicator` and as a bare `TabIndicator`, and both the component and its props type are re-exported from the root barrel. The real indicator is a `<span>` rendered inside `TabList` at `Tabs.tsx:272-278`.
- **Why it matters:** Small, but both are load-bearing for a reader's trust. Anyone maintaining `Tabs` has to work out that `Tabs.Indicator` is a decoy before they can reason about the indicator; anyone touching `utils.tsx` has to prove to themselves the condition is dead. `TabIndicator` is worse than dead code because it is public: a consumer who reasonably writes `<Tabs.Indicator />` gets silence.
- **Fix:** Reduce `wrapWithElementIfInvalid` to its single return and delete `isJSXElement`, or rename it to `wrapInElement` to match what it does. Delete `TabIndicator`, `TabIndicatorProps` and the `Indicator` key from the `Object.assign`, and remove them from `src/index.ts`.
- **Effort:** S.
- **Blast radius:** Removing `Tabs.Indicator` is technically breaking, but it renders `null` today so no visual change is possible.

---

### [SEV-15] `@pathscale/ui` lists itself as a runtime dependency

- **ID:** `ui-component-api-design-15`
- **Severity:** Low
- **Category:** Correctness
- **Confidence:** High
- **Location:** `package.json:97` (`"@pathscale/ui": "^1.2.10"` inside `dependencies`), against `package.json:2` (`"name": "@pathscale/ui"`).
- **What:** The package depends on an older published copy of itself. Nothing in `src/` imports `"@pathscale/ui"` — the only such imports are in `playground/src/`, which resolves through the Vite alias to local `src/` per `CONTRIBUTING.md:27`.
- **Why it matters:** Every consumer installing `@pathscale/ui@1.3.1` also pulls `@pathscale/ui@1.2.x` into `node_modules`, roughly doubling install weight for the package and, more importantly, creating two copies of the library. If any transitive resolution picks the nested copy, a consumer gets two sets of contexts, so `useContext(ModalContext)` from one copy will not see a provider from the other, producing the "compound component throws outside its provider" failure that is very hard to diagnose. Cosmetically it also makes the dependency graph self-referential.
- **Fix:** Delete line 97 and re-run `bun install` so the lockfile drops it. Confirm nothing under `src/` or `scripts/` resolves the package by name first (verified here: nothing does). This is a `package.json` change, so it borders the build-pipeline slice; flagging it because the consequence is a component-API failure mode.
- **Effort:** S.
- **Blast radius:** Lockfile plus published metadata. No source change.

---

<details>
<summary>Nits (one line each)</summary>

- `src/components/badge/Badge.tsx:63-77` wraps `twMerge(clsx(...))` where every `clsx` argument is a plain string, so `clsx` is a no-op; Badge is also 1 of only 2 `.tsx` files that omit `className` support entirely.
- `src/components/badge/Badge.tsx:100-110` spreads `{...others}` **after** `class` and `data-slot`, inverting the documented "spread first, explicit attrs win" idiom (`CLAUDE-INTERNALS.md:66`) and letting a consumer overwrite `data-slot`.
- `src/components/close-button/CloseButton.tsx:8`, `src/components/link/Link.tsx:8`, `src/components/scroll-shadow/ScrollShadow.tsx:22` export single-member variant unions (`"default"`, `"default"`, `"fade"`), so the prop cannot change anything.
- 96 `CLASSES` sub-maps across 92 `.classes.ts` files have exactly one key, mostly `{ base: "..." }` wrappers that could be plain string constants.
- `.classes.ts` uses two incompatible schemas: 63 files key on lowercase `base`/`variant`/`size`/`flag`/`slot`, 24 key on PascalCase part names (`Header`, `Body`, `Trigger`); nothing indicates which a given component uses without opening it.
- State data-attributes use three conventions (112 always-present `"true"/"false"`, 64 present-or-`undefined`, 45 bare boolean), so a consumer writing `[data-disabled]` in CSS matches `data-disabled="false"` on 112 sites and works correctly on 64.
- `src/components/tabs/Tabs.tsx:19` declares `TabsVariant` but never exports it, so consumers cannot name the type of a prop they can pass.
- `src/components/tabs/Tabs.tsx:378` sets `ref={tabRef}` after `{...others}` without splitting `"ref"` out, unlike `TabList` at `:181-186` which correctly forwards `local.ref`; a consumer ref on `Tab` is at best unspecified.
- `src/components/tabs/Tabs.tsx:177-179` (`TabList`) and `:412-414` (`TabPanel`) degrade to a plain `<div>` when context is missing but drop `local.class` in the process, so the fallback is unstyled rather than merely unwired; `Tab`'s equivalent fallback at `:301-305` does keep it.
- `src/components/flex/Flex.tsx:17` types `Omit<JSX.HTMLAttributes<HTMLElement>, "ref">`, making `Flex` the one layout primitive that cannot take a ref.
- `as` is typed as bare `keyof JSX.IntrinsicElements` in `Flex`, `Grid` and `Navbar` with no generic narrowing of the resulting props, so `<Flex as="a" href="…">` does not type-check; only `avatar/AvatarGroup.tsx:19-26` attempts the generic `PropsOf<E>` form.
- `src/components/text-field/TextField.tsx:92` puts `aria-invalid` on the wrapper `<div>`, where assistive tech ignores it; it belongs on the input the consumer supplies.
- `src/index.ts:902` is the barrel's only `export *` (from `./motion`), against 186 explicit statements.
- `src/hooks/form/useFieldNew.ts` exports `useField`; the `New` suffix is residue from a migration that finished.

</details>

## Cross-cutting recommendations

1. **Build `createPart` and migrate the leaves (findings 01, 03, 13).** This is the single highest-leverage change in the slice. One factory owning `splitProps`, `twMerge` ordering, `data-slot`, `data-theme`, `style` and `data-<variant>` removes ~1,700 lines and, more importantly, makes drift impossible rather than merely discouraged. Deriving the variant union from `CLASSES` via `keyof typeof` means a type and its class map can never disagree again. *Plan:* land the factory plus `PartProps<T>` in `src/lib/component/`, migrate 10 leaves (`Surface`, `Separator`, `Kbd`, `ErrorMessage`, `Text`, `Link`, `Chip`, `Tag`, `Skeleton`, `Spinner`), diff the rendered DOM in the playground, then batch the rest. *What breaks:* nothing, if the `twMerge` argument order is preserved exactly. Consumer `class`/`className` must stay last; the whole override story depends on it.

2. **Make the contract checker structural, then delete the rules you are not going to keep (finding 12).** Today the gate is four `String.includes` calls on one file per directory, and it is the reason findings 04, 08, 09 and 11 survived. Rewriting it against the TypeScript compiler API, already a devDependency, lets it check per exported component across every file in the directory. *Plan:* start with the two rules that pay for themselves immediately, "every name a component barrel exports appears in `src/index.ts`" and "every declared prop is read", then add the boolean-naming and class-forwarding rules behind a burn-down allowlist. *What breaks:* CI, loudly, on first run. Land with the allowlist populated.

3. **Close the barrel gap and pick one public-API tier (finding 04).** 132 missing symbols is not a slow leak, it is a structural absence, and `ButtonProps` being unreachable from the main entry is a daily papercut for every consumer. *Plan:* generate the missing re-exports from the component barrels, then guard with the check from move 2. Decide explicitly whether `@pathscale/ui/components/*` is a supported entry point or an implementation detail, and say so in `docs/ui-usage.md`. *What breaks:* nothing; the change is purely additive.

4. **Give the duplicated micro-helpers a home and make `src/lib/` real (findings 02, 05).** `invokeEventHandler` in 25 files with two signatures is a latent inconsistency on the event path of every interactive component, and `src/lib/` is an empty shell that the docs actively recommend. Solving them together is natural: `src/lib/` gains two real residents and loses the CVA. *Plan:* extract `invokeEventHandler` and `sortItemsByDomOrder`, adopt `mergeRefs` at the 27 hand-rolled ref sites, delete the rest of `src/lib/`, and correct `CLAUDE-INTERNALS.md:18,69,85` and `ANALYSIS.md` in the same commit. *What breaks:* nothing at runtime.

5. **Converge the overlay and disabled vocabularies before the next minor (finding 11).** `Dropdown`'s `open`/`disabled` and `GlassPanel`'s `open`/`onToggle` are the last two holdouts against an otherwise consistent `isOpen`/`isDisabled`/`onOpenChange`, so the cost of fixing them is at its minimum now and only grows. *Plan:* accept both spellings for one minor with `local.isOpen ?? local.open`, mark the old names deprecated in the type, remove in the following major. `AGENTS.md` requires `docs/ui-usage.md` to be updated in the same change. *What breaks:* `Dropdown` and `GlassPanel` consumers, on the removal, not the deprecation.

6. **Decide what `auth-*` is (finding 07).** Eight components in the public barrel bypass the enforced quartet, cannot be themed through the token system, are invisible to the CSS purge manifest, and one of them advertises a specific company by default. This is a product question rather than a refactor, but leaving it undecided means the exception quietly becomes precedent. *Plan:* either move the family to a consuming app, or normalise it into the quartet and strip the branding defaults. Either way, remove the hardcoded `honey.id` default first, since that one is independent of the larger decision.

## What I did not cover

- **CSS, theming and the `.css` half of each quartet.** I read `.classes.ts` files only as data about the prop API. Token naming, `@layer` structure, `color-mix` usage, light/dark parity and the purge manifest are a sibling slice. Where a finding touches CSS (the `data-*` selector convention nit, the `auth-*` styling gap) I limited myself to the API consequence.
- **The build pipeline.** `rslib.config.ts`, the Iconify plugin, d.ts emission, the CI workflow and the release scripts were not reviewed. I read `package.json` only for the `exports` map and spotted the self-dependency there; both belong to the build slice for remediation.
- **Tree-shaking measured empirically.** I reviewed the export *structure* (bundleless output, `sideEffects: ["**/*.css"]`, per-component `import "./X.css"`, the single `export *`) but did not build the package or measure a consumer bundle, so I make no claim about actual shake behaviour. The `export *` at `src/index.ts:902` is flagged as a consistency issue, not a proven bloat source.
- **Runtime behaviour.** Nothing was executed beyond `npx tsc --noEmit` (clean). Finding 13 in particular is a static reading of Solid's provider semantics and is marked Medium confidence for that reason; it wants a playground repro that toggles `orientation` and watches for `registerTab` churn.
- **Subsystem internals.** `src/motion/`, `src/hooks/date/`, `src/hooks/form/`, `src/hooks/table/`, `src/primitives/` and `src/components/metal-border/engine/` were read only where they surface in the component prop API. The 12 `any`s in `src/hooks/form/createForm.ts` are documented as deliberate TanStack generic erasure at `CLAUDE-INTERNALS.md:113` and I did not second-guess that.
- **The docs site and `playground/`.** Out of scope per the brief. `playground/src/App.tsx` was consulted once, only to confirm which import specifier it uses.
- **Per-component a11y conformance.** I sampled `Tabs`, `Select`, `Drawer`, `Pagination`, `Calendar`, `TextField`, `CloseButton` and `Icon`. A full APG audit of all 104 components was not attempted; findings 09 and 10 are the clearest cases, not an exhaustive list.

## Quick-start for the follow-up agent

**Read in this order:**

1. `CONTRIBUTING.md:43-100` — the Component Checklist. Read it as the *intended* API contract; findings 01, 03, 10, 11 and 12 are all measurements of the gap between it and the code.
2. `scripts/check-contracts.ts` — 100 lines, and the reason that gap persists. Understand what it actually checks before trusting any "the contract enforces X" claim.
3. `src/components/surface/Surface.tsx` — 42 lines, the cleanest instance of the scaffold repeated ~230 times. The `createPart` proposal in finding 01 is written against this file.
4. `src/components/button/Button.tsx` and `src/components/badge/Badge.tsx` — read back to back. Two flagship components, two incompatible variant/color taxonomies, one accepts `className` and one does not.
5. `src/components/tabs/Tabs.tsx` — the best and worst of the compound model in one file: correct roving tabindex and aria wiring, alongside findings 13 and 14 and three nits.
6. `src/index.ts` — skim, do not read. 922 lines of hand-maintained re-exports; the point is the 132 gaps, which you should regenerate rather than eyeball.

**Commands:**

```bash
bun install
bun run check            # scripts/check-contracts.ts — the build gate
npx tsc --noEmit         # passes clean at aa4fb58, ~1 min; use as the regression signal
bun run playground:dev   # Vite aliases @pathscale/ui -> ./src, instant HMR; the only way to see a change
bun test                 # 4 files, pure logic only, NOT run in CI
bun run build            # needs ../rsbuild-plugin-ui-css-purge symlinked, as CI does
```

Reproduce the counts in this document:

```bash
rg -n 'const invokeEventHandler' src | wc -l          # 25
rg -o '"dataTheme"' src/components --glob '*.tsx' | wc -l   # 233
rg -o 'local\.class,\s*local\.className' src/components --glob '*.tsx' | wc -l  # 172
rg -o '\b(ComponentVariant|ComponentShape|ComponentPosition)\b' src --glob '!*/types.ts' | wc -l  # 0
rg -n 'from "[^"]*lib[/"]' src/components src/hooks src/primitives src/motion   # empty: src/lib is dead
```

The barrel-gap figure needs a script: parse each `src/components/*/index.ts` for exported names and grep each against `src/index.ts`. That script is worth committing as a contract rule (recommendation 2) rather than re-deriving.

**Surprises about this repo:**

- `AGENTS.md` is the working agreement, and `CLAUDE.md` is a 12-line file that imports it. Read `AGENTS.md`, not `CLAUDE.md`. It bans merge commits outright and bans AI attribution in commits, PRs and comments.
- `docs/ui-usage.md` is declared the source of truth for consumers, and `AGENTS.md` requires updating it in the *same change* as any public API change. Several findings here (06, 07, 10, 11) imply edits there.
- There is uncommitted work in the tree at review time (`AGENTS.md` modified, `docs/frontend-docs-plan.md` untracked). Do not `git stash` or `git checkout`.
- Three repo docs are now stale about this slice and will mislead you: `CLAUDE-INTERNALS.md:85` says `invokeEventHandler` is in "~6 files" (it is 25); `CLAUDE-INTERNALS.md:81` says `sortItemsByDomOrder` is duplicated in "Dropdown and Select" (it is Dropdown, ListBox and Menu; Select open-codes a fourth copy); `ANALYSIS.md:36` states "**No polymorphic `as` prop** — element types are hardcoded per part" when `Flex`, `Grid`, `Navbar` and `AvatarGroup` all have one. `ANALYSIS.md:56`'s broken `./stores` export has since been fixed and is no longer in `package.json`.
- `scripts/check-contracts.ts` skips `icon` and `form`, so `src/components/icon/Icon.tsx` (finding 08) is outside the gate entirely.
- Component directories are kebab-case and the main file is PascalCase-derived; the checker relies on that mapping and silently skips any directory where it fails.
