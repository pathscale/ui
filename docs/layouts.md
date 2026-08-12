# Layouts

A component-authoring pattern for SolidJS: logic in a `.ts` file, markup in a `.layout.tsx` file,
presentation declared at the call site and resolved by a recipe.

## Why this exists

`@pathscale/ui` is 106 SolidJS components. Three problems drove this work, in the order they
matter:

1. **Presentation and logic are interleaved.** A component is one file where selection state,
   keyboard handling, context, class computation and markup all live together. There is no way to
   read only the markup, and no way to change how something looks without opening a file that also
   decides how it behaves.

2. **The pattern has to survive people building their own libraries on it.** The audience is a Vue
   developer arriving at SolidJS who will write their own opinionated component library. They hit
   the hard cases on day one: variants, prop forwarding, compound parts, context, controlled
   values. An authoring experience that is only tolerable for the easy cases fails.

3. **Duplication is measurable and large.** Across the library, 254 `template()` definitions
   resolve to 82 distinct strings, and 38 components whose entire markup is a single `<div>` or
   `<span>` cost 113 KB of a 1.09 MB bundle. In `nofilter.io`, an application already built on the
   library, half of all 1,579 `class="…"` literals are exact duplicates of another.

Vue solves the first problem with single-file components: `<script setup>` and `<template>` are
separated by the compiler, and the separation cannot rot. The goal here is that property in
SolidJS, without requiring a compiler to get it.

## Status

| | |
| --- | --- |
| **BEFORE** | `@pathscale/ui` on `master`. Real, shipping code |
| **AFTER** | Proposed. **Not implemented.** A four-file prototype of an earlier revision compiles and passes the contract gate on the `solidjs` branch; the design in this document is further along than that prototype |
| **VUE3** | `pathscale/vue3-ui` on `master`. Real code, included as the reference the design is aimed at |

Numbers labelled *measured* were taken from built output or source on 2026-08-12. Numbers labelled
*estimated* have not been verified and should not be repeated as fact.

## Packages

Names follow the ecosystem's prefix conventions rather than a vendor scope, because the tools
resolve by prefix: `presets: ["solid-layouts"]` only expands to `babel-preset-solid-layouts` if
the package is named that way. All were free on npm and crates.io as of 2026-08-12.

| Package | What it is |
| --- | --- |
| `solid-layouts` | The runtime. `recipe()`, `layout()`, `defineComponent()`. What users import |
| `solid-layouts-oxc` | The Rust pass, with NAPI bindings |
| `rsbuild-plugin-solid-layouts` | Build integration |
| `vite-plugin-solid-layouts` | Same, for Vite consumers |
| `babel-preset-solid-layouts` | Only if a Babel adapter is ever built for reach |

## How to read this

Accordion is the worked example throughout, and every code block is real code from the repository
it is labelled with, trimmed but not rewritten.

Sections 1 and 3 to 8, plus 10, are three-way comparisons: the same concern in BEFORE, AFTER and
VUE3. Four sections break that shape deliberately:

- **2 (Identity)** introduces something with no BEFORE equivalent worth comparing, so it reads
  declared / used / checked, with BEFORE and VUE3 noted at the end.
- **9 (Override)** is a four-level cascade rather than a comparison, with a VUE3 note.
- **11 (Bundle)** and **12 (Implementation)** are analysis and carry the measurements.

Both a library author and an application author write the same way. `.layout.tsx` is not a
library-internal file: someone building their own component library writes exactly what section 7
shows.

---

## 1. Where parameters are defined

The call site is the presentation layer. Colors, sizes and appearance are declared there and go
straight to the class map. They never pass through the logic.

### BEFORE

Presentation and behaviour resolved together, in the component body, from one props object.

```tsx
const [local, others] = splitProps(props, [
  "value", "children", "class", "className",
  "dataTheme", "style", "isDisabled", "disabled",
]);

const variant = () => local.variant ?? "default";      // presentation
const isExpanded = () =>                                // behaviour
  accordion?.isItemExpanded(itemValue()) ?? false;
```

### AFTER

```
<Accordion variant="surface" size="md"   selectionMode="multiple" value={open}>
           └──── presentation ────┘      └──────── behaviour ──────────┘
                      │                              │
                      ▼                              ▼
            Accordion.recipe.ts                accordion.ts
              props: { variant, size }         createAccordion(behaviour)
                      │                              │
                      │                              └──► state: { expanded, disabled }
                      │                                        │
                      └──────────────┬────────────────────────-┘
                                     ▼
                          p.slot.root = class + data-*
                                     ▼
                     <div {...p.slot.root}>   Accordion.layout.tsx
```

The setup function never sees a presentation prop. Its argument type contains behaviour only.

### VUE3

```vue
<v-accordion
  :header-is-trigger="true"
  :expanded="section.open">
```

---

## 2. Identity

Every element a component renders has a **declared slot name**. Slots are required, unique within
the component, and checked at build time.

This is deliberately strict. It is what lets logic address an element without a ref, lets a
generator verify that a reference resolves, and gives tests and the agent control plane a
deterministic selector.

### Two different things, which is why it is not a DOM `id`

A component can render more than once on a page, so a literal `id="trigger"` would emit duplicate
ids and be invalid HTML. The two concepts separate:

| | Scope | Emitted as | Purpose |
| --- | --- | --- | --- |
| **Slot name** | per definition | `data-slot="accordion-trigger"` | what the element *is*. Static, addressable, checkable |
| **Instance id** | per render | `id="accordion-item-3-trigger"` | aria wiring only. Emitted when `aria-controls` or `aria-labelledby` needs it |

The `data-slot` value is `${component}-${slot}`, so it is unique across the whole library by
construction rather than by convention.

### Declared

```ts
export const accordionTrigger = recipe({
  component: "accordion-trigger",
  element: "button",
  slots: {
    root:      { base: "accordion__trigger" },
    indicator: { base: "accordion__indicator" },
  },
  // ...
});
```

### Used

```tsx
import type { Layout } from "solid-layouts";
import { accordionTrigger } from "./Accordion.recipe";

export const AccordionTriggerLayout: Layout<typeof accordionTrigger> =
  ({ slot, children }, p) => (
    <button {...slot.root} type="button">
      {children}
      <span {...slot.indicator} />
    </button>
  );
```

### Checked

```ts
type Slots = SlotsOf<typeof accordionTrigger>;   // "root" | "indicator"

p.slot.indicator     // ok
p.slot.indictor      // Type error: not a slot of accordion-trigger
```

Build time, the generator additionally rejects a declared slot that is never rendered, and a
rendered slot that was never declared. Neither is catchable by types alone, because a layout can
render conditionally.

### BEFORE

`data-slot` is written by hand on each element, with nothing checking it:

```tsx
data-slot="accordion-item"
```

Typos are silent. Nothing relates the string to the class map, so a renamed component leaves a
stale selector behind in tests and CSS.

### VUE3

No equivalent. vue3-ui emits no `data-slot` and has no element-level identity. Scoped styles give
it CSS isolation without needing one, which is a different solution to a narrower problem.

---

## 3. Files on disk

### BEFORE

```
accordion/
  Accordion.tsx          497 lines
                         selection state, controlled/uncontrolled,
                         arrow-key roving, two contexts, five
                         sub-components, every class computation,
                         a private copy of invokeEventHandler
  Accordion.classes.ts
  Accordion.css
  index.ts
```

### AFTER

A component with one slot, no state and no bespoke markup is **one file**:

```
badge/
  Badge.recipe.ts        element, slots, presentation props, computed state
```

`index.ts` is generated (section 12), so it exists and ships but nobody writes it.

Add files only when you need them:

```
accordion/
  accordion.ts           behaviour. no JSX, no presentation props
  Accordion.recipe.ts
  Accordion.defaults.ts  only if it has non-obvious defaults
  Accordion.layout.tsx   only if it has more than one slot
  Accordion.css
```

`index.ts` is generated in both cases.

### VUE3

```
Accordion/
  Accordion.vue          <script setup> + <template>
```

---

## 4. Variants to classes

### BEFORE

```ts
export const CLASSES = {
  Item: {
    base: "accordion__item",
    flag: {
      expanded:      "accordion__item--expanded",
      disabled:      "accordion__item--disabled",
      hideSeparator: "accordion__item--hide-separator",
    },
  },
} as const;
```

```tsx
const variant = () => local.variant ?? "default";      // defaults live in the .tsx
isExpanded() && CLASSES.Item.flag.expanded,            // flags re-applied at every use site
```

### AFTER

```ts
// Accordion.recipe.ts
export const accordionItem = recipe({
  component: "accordion-item",
  element: "div",

  slots: {
    root: { base: "accordion__item" },
  },

  // Set at the call site. Presentation.
  props: {
    tone: {
      neutral: "accordion__item--neutral",
      primary: "accordion__item--primary",
    },
    hideSeparator: { true: "accordion__item--hide-separator" },
  },

  // Computed by accordion.ts. Never set by the caller.
  state: {
    expanded: { true: "accordion__item--expanded" },
    disabled: { true: "accordion__item--disabled" },
  },
});
```

```ts
// what a slot resolves to
p.slot.root
// {
//   class: "accordion__item accordion__item--primary accordion__item--expanded",
//   "data-slot": "accordion-item-root",
//   "data-expanded": "true",
//   "data-disabled": "false",
// }
```

```ts
type Presentation = PropsOf<typeof accordionItem>;
// { tone?: "neutral" | "primary"; hideSeparator?: boolean }
```

No `defaults` key. That moved, for the reason in section 5.

### VUE3

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: "is-primary" | "is-danger" | "is-light" | string
  size?: "is-small" | "is-medium" | "is-large"
  rounded?: boolean
  loading?: boolean
}>(), { type: "is-primary" })
</script>

<template>
  <component :is="computedTag" class="button"
    :class="[size, type, { 'is-rounded': rounded, 'is-loading': loading }]">
    <slot />
  </component>
</template>
```

---

## 5. Defaults

A default and a call-site override are the same kind of thing at different levels of one cascade
(section 9). So they are written the same way, in a file that is purely presentation.

### AFTER

```ts
// Accordion.defaults.ts
export default {
  Accordion:     { variant: "default", size: "md" },
  AccordionItem: { tone: "neutral" },
};
```

That is character-for-character the shape an application author writes:

```ts
// their app entry
configureUI({
  Accordion:     { variant: "surface" },
  AccordionItem: { tone: "primary" },
});
```

One syntax, learned once, at every level of the cascade. It is also a plain data file with no
imports and no logic, which means it can be read by tooling, diffed by a designer, or generated
from design tokens without touching a `.ts` file that does anything.

### BEFORE

Defaults are expressions inside the component body, interleaved with behaviour:

```tsx
const variant = () => local.variant ?? "default";
const selectionMode = () => local.selectionMode ?? "single";
```

To find out what a component looks like out of the box you read its implementation.

### VUE3

```vue
withDefaults(defineProps<{ ... }>(), { type: "is-primary", tag: "button" })
```

Co-located with the prop declaration, which is good, but it is inside the script block, so
appearance defaults sit in the same place as behaviour.

---

## 6. Logic

### BEFORE

```tsx
const AccordionItem: ParentComponent<AccordionItemProps> = (props) => {
  const accordion = useContext(AccordionContext);
  const [local, others] = splitProps(props, [
    "value", "children", "class", "className",
    "dataTheme", "style", "isDisabled", "disabled",
  ]);

  const uniqueId = createUniqueId();
  const itemValue = () => local.value ?? uniqueId;

  const isExpanded = () => accordion?.isItemExpanded(itemValue()) ?? false;

  const isDisabled = () =>
    Boolean(local.isDisabled) ||
    Boolean(local.disabled) ||
    Boolean(accordion?.isDisabled());

  const toggle = () => {
    if (isDisabled()) return;
    accordion?.toggleItem(itemValue());
  };

  // ...40 lines of JSX follow, in this same function
```

### AFTER

```ts
// accordion.ts
type ItemBehaviour = { value?: string; disabled?: boolean };

export function createAccordionItem(p: ItemBehaviour) {
  const accordion = useAccordion();
  const value = () => p.value ?? p.slotId("root");

  return {
    value,
    expanded: () => accordion?.isExpanded(value()) ?? false,
    disabled: () => Boolean(p.disabled) || Boolean(accordion?.disabled()),
    toggle:   () => accordion?.toggle(value()),
  };
}
```

No `tone`, no `hideSeparator`, no `class`, no `style`. The keys it returns are the recipe's
`state` keys, which is how the two halves meet. `p.slotId(name)` is how logic reaches a slot's
per-instance id, and `name` is checked against the recipe's declared slots.

### VUE3

```vue
<script setup lang="ts">
const props = defineProps<{
  expanded?: boolean
  headerIsTrigger?: boolean
  disabled?: boolean
}>()

const state = reactive({
  isExpanded: props.expanded,
  headerIsTrigger: props.headerIsTrigger,
})

const toggle = (isHeaderTrigger: boolean) => {
  if (props.disabled) return
  if ((isHeaderTrigger && props.headerIsTrigger) || !props.headerIsTrigger) {
    state.isExpanded = !state.isExpanded
  }
}
</script>
```

---

## 7. Template

### BEFORE

```tsx
return (
  <AccordionItemContext.Provider value={itemContextValue}>
    <div
      {...others}
      {...{ class: twMerge(
        CLASSES.Item.base,
        isExpanded() && CLASSES.Item.flag.expanded,
        isDisabled() && CLASSES.Item.flag.disabled,
        accordion?.hideSeparator() && CLASSES.Item.flag.hideSeparator,
        local.class,
        local.className,
      ) }}
      data-slot="accordion-item"
      data-expanded={isExpanded() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  </AccordionItemContext.Provider>
);
```

### AFTER

A single-slot component needs no template at all. The recipe's `element` picks the tag and a
shared layout renders it, so there is no file to write.

Write one only when there is more than one slot:

```tsx
// Accordion.layout.tsx
import type { Layout } from "solid-layouts";
import { accordionTrigger } from "./Accordion.recipe";

export const AccordionTriggerLayout: Layout<typeof accordionTrigger> =
  ({ slot, children }, p) => (
    <button {...slot.root} type="button">
      {children}
      <Show when={p.showIndicator}>
        <span {...slot.indicator} />
      </Show>
    </button>
  );
```

A layout is now a plain arrow function with a type annotation. There is no wrapper call, and the
only import from `solid-layouts` is `import type`, which TypeScript erases entirely. The runtime
footprint of a layout file is the JSX and nothing else.

The recipe survives only in type position, which is where it belongs: it was never runtime
information, it was the thing that gives `p` its shape. `defineComponent` constructs `p` and calls
the function.

### VUE3

```vue
<template>
  <div :class="[{ 'accordion-active': displayActive, 'accordion-type-hover': hover }]">
    <div class="accordion-header" @click="toggle(state.headerIsTrigger)">
      <slot name="header" />
      <div role="button" class="accordion-trigger-click"
           @click="toggle(!state.headerIsTrigger)">
        <slot name="trigger" />
      </div>
    </div>
    <div v-if="state.isExpanded">
      <slot name="content" />
    </div>
  </div>
</template>
```

---

## 8. Wiring

Not required. It is one call, and every field is optional except the recipe.

### BEFORE

No separate step. It is the top and bottom of the same 497-line file.

### AFTER

**Nobody writes this.** `index.ts` is generated from the recipe, the defaults and the presence of
`accordion.ts` / `Accordion.layout.tsx`. It is committed, ships as ordinary TypeScript, and shows
up in a diff and in go-to-definition. What changes is who types it, not whether it exists.

```ts
// index.ts — generated
export const Badge = defineComponent({ recipe: badge });

export const AccordionTrigger = defineComponent({
  recipe: accordionTrigger,
  layout: AccordionTriggerLayout,
});

export const AccordionItem = defineComponent({
  recipe:  accordionItem,
  setup:   createAccordionItem,     // receives behaviour props only
  layout:  AccordionItemLayout,
  provide: AccordionItemContext,
});

export const Accordion = compound(AccordionRoot, {
  Item: AccordionItem, Trigger: AccordionTrigger, Content: AccordionContent,
});
```

`defineComponent` reads the recipe to know which prop names are presentation, routes those to the
layout, and passes the rest to `setup`.

### What stays explicit, and why

`Layout<typeof accordionTrigger>` keeps naming the recipe, in type position. That annotation is
what types `p`, so `p.slot.indicator` is checkable and `p.expanded` is not `any`. Inferring it
from a sibling filename would mean `p` has no type until a build step runs, breaking the rule that
plain `tsc` works with no tooling.

The rule: **implicit where the information is derivable and the reader loses nothing, explicit
where it carries types.**

### Why the signature has two parameters

```ts
type Layout<R> = (
  stable: { slot: SlotsOf<R>; children: JSX.Element },
  p: PropsOf<R> & StateOf<R>,
) => JSX.Element;
```

Destructuring props in Solid is normally a bug, because it reads a reactive value once and pins
it. But not everything handed to a layout is reactive, and the two kinds must not share a
destructuring statement:

```tsx
const { slot, children, showIndicator } = p;   // WRONG
```

`slot` is a stable object, `children` is created once, and `showIndicator` is reactive. Written
this way the last one silently stops updating, and nothing in the line distinguishes it from the
other two.

Splitting the parameter makes the distinction structural rather than a thing to remember. The
first parameter holds only what is safe to destructure, so `{...slot.root}` and `{children}` are
bare. Everything reactive stays behind `p`, where the access is visible at the point of use. The
type system enforces it: `showIndicator` is not on the first parameter, so it cannot be
destructured by accident.

`children` here is a [`children()`](https://docs.solidjs.com/reference/component-apis/children)
memo resolved by `defineComponent`, not the raw prop, which makes it safe to reference more than
once. Raw `props.children` is not.

The alternatives considered and rejected: a `<Children />` component reading from context reads
like Vue's `<slot />` but costs a context lookup and a component boundary in every component in
the library; and marking a content-host slot so `defineComponent` inserts into a self-closing
`<button {...slot.root} />` makes the markup lie about what it renders, which defeats the point of
a readable template.

### VUE3

None. The single-file component compiler does it.

---

## 9. Override

Four places a value can come from. Later wins.

```
*.defaults.ts   →   configureUI()   →   <UIDefaults>   →   call site
   library            app, global        app, subtree       per use
```

All four are written in the same shape.

### 1. Library default

```ts
// Accordion.defaults.ts, shipped by the library
export default {
  Accordion: { variant: "default", size: "md" },
};
```

### 2. App-wide, one call at startup

```ts
configureUI({
  Button:    { size: "lg" },
  Accordion: { variant: "surface" },
});
```

Every `<Button>` in the app is now `lg` unless it says otherwise. This form is folded away at
build time: it is statically known, so `<Button>` compiles as if you had typed `size="lg"` and
there is no lookup at runtime.

### 3. A subtree

```tsx
<UIDefaults Button={{ size: "sm" }}>
  <Toolbar />        {/* buttons here are sm */}
</UIDefaults>
```

For a dense region that wants different defaults from the page. Costs a context read per
component, and can only be folded when the provider is lexically visible.

### 4. Call site

```tsx
<Button size="sm" color="danger">Delete</Button>
```

### Extending a recipe

For "I want my own Button built on theirs", rather than overriding at every call site:

```ts
export const dangerButton = button.extend({
  component: "danger-button",
  slots: { root: { base: "btn btn--danger-zone" } },
  props: { confirmed: { true: "btn--confirmed" } },
});

export const DangerButton = defineComponent({ recipe: dangerButton, as: "button" });
```

`extend` inherits the parent's slots, props and state, and merges what you add. Its defaults go in
`DangerButton.defaults.ts`, same shape as everything else.

### Escaping entirely

`class` always wins, and is merged last:

```tsx
<Button class="my-completely-custom-thing">…</Button>
```

Recipes that emit Tailwind declare `tailwind: true` and merge that tail with `twMerge`, so `p-8`
at the call site beats `p-4` from the recipe. Recipes emitting BEM concatenate, since nothing can
collide.

### VUE3

Vue has 1 and 4. Global defaults are per-app plugin config; there is no subtree scoping and no
recipe extension.

---

## 10. Using it in an app

### BEFORE

chuzz `SidePanel.tsx` today, hand-rolling an accordion:

```tsx
<div class="chrome-section" data-open={props.isOpen ? "" : undefined}>
  <button class="chrome-section-trigger" aria-expanded={props.isOpen} onClick={toggle}>
    <span class="chrome-section-title">{props.section.title}</span>
    <Chip variant="flat" color={tone} size="sm">{props.section.count}</Chip>
    <Icon class="chrome-section-indicator"
          name={props.isOpen ? "icon-[mdi--chevron-down]" : "icon-[mdi--chevron-right]"} />
  </button>
  <Show when={props.isOpen}>
    <div class="chrome-section-body">...rows</div>
  </Show>
</div>
```

Plus ~80 lines of `chrome-section*` CSS, the toggle handler, and no keyboard support.

### AFTER

```tsx
<Accordion.Item value={props.section.key} tone={props.section.tone}>
  <Accordion.Trigger>
    {props.section.title}
    <Chip variant="flat" color={props.section.tone} size="sm">
      {props.section.count}
    </Chip>
  </Accordion.Trigger>
  <Accordion.Content>
    ...rows
  </Accordion.Content>
</Accordion.Item>
```

No `chrome-section*` CSS, no toggle handler, no chevron swap, no hand-written `aria-expanded`,
and arrow-key roving arrives with the component.

### VUE3

```vue
<v-accordion :header-is-trigger="true" :expanded="section.open">
  <template #header>
    {{ section.title }}
    <v-chip size="is-small">{{ section.count }}</v-chip>
  </template>

  <template #content>
    ...rows
  </template>
</v-accordion>
```

---

## 11. Bundle

### What is already fine

Solid hoists one template per component module:

```js
var _tmpl$ = /*#__PURE__*/ template("<span>");     // once, at module level
```

Fifty `<Button>` call sites share it. Call-site duplication is not a problem that needs solving.

### What is duplicated

Measured on the current built library:

| | |
| --- | ---: |
| `template()` definitions across dist | 254 |
| Distinct template strings | 82 |
| `template("<div>")` | 70 |
| `template("<span>")` | 45 |
| `template("<button>")` | 13 |
| Components whose entire markup is one bare `<div>` or `<span>` | 38 |
| What those 38 cost | 113 KB |
| Total dist JS | 1.09 MB |

The template strings are not the problem: `"<div>"` is five bytes, so deduplicating all 254 down
to 82 saves a few KB. The cost is the ~3 KB *around* each one, near-identical every time: a
`splitProps` key array, a `mergeProps`, a `spread`, a `twMerge` over a class map, and the
data-attribute serialisation.

### What AFTER does about it

Those 38 components stop having an implementation. They become a recipe, a defaults file and a
`defineComponent` call, and one shared layout renders all of them.

**Estimated, not measured:** each drops to roughly a 400-byte recipe plus a 100-byte definition,
so ~113 KB becomes ~20 KB plus one shared layout. Call it 90 KB off a 1.09 MB dist, about 8%.
Verify on a real migration before repeating this as fact.

Sharing is the default and opting out is per-component: supply a `layout` and you get your own
markup and your own template. It is not a global mode, and a component can move either way
without affecting its neighbours.

### The same question, application side

`nofilter.io` is a real SolidJS app already built on `@pathscale/ui`: 242 `.tsx` files, 116k lines,
197 of them importing the library. Measured on its source:

| | |
| --- | ---: |
| `class="…"` literals | 1,579 |
| Distinct | 797 |
| **Exact duplicates** | **782 (50%)** |
| On raw DOM elements (`div`, `span`, `p`, `button`, …) | 830 |
| Distinct, among those | 430 |
| On a `@pathscale/ui` component (a legitimate override) | 291 |
| Raw Tailwind tokens across the app | 3,689 |

The duplication is concentrated, which is what makes it tractable:

| Named recipes | Call sites they would absorb |
| ---: | ---: |
| 10 | 227 |
| 25 | 369 |
| 50 | 532 |
| 100 | 728 (46%) |

So a ballpark: **roughly 50 recipes remove about a third of every styling decision in the app, and
100 remove close to half.**

The tail is more interesting than the numbers. `class="my-6 h-px bg-base-content/10"` appears 10
times: that is `Separator`, re-hand-rolled. `class="flex items-center justify-between gap-2"`
appears 16 times and `class="flex items-center gap-2"` 23 times, which is one `Flex` recipe with a
`justify` variant. These split into three buckets that need reading, not counting, to separate:
should have used an existing component, should become a project-local recipe, or genuinely
one-off. The first bucket is a documentation failure rather than a design one.

Caveat: this counts source occurrences, not bundle bytes. The two correlate but are not the same
number, and nobody should quote the 46% as a size saving.

### Where the real numbers come from

Every estimate in this section needs verifying against a running application, and `chuzz` is the
right place to do it. Its shell is a SolidJS app interpreted by Boa with no JIT, deliberately
built as a single bundle with `splitChunks` disabled, so both bundle size and per-instance runtime
cost are visible in a way they are not under V8. A component boundary that is free in Chrome is
not free there.

Three things to measure once a migration exists, rather than argue about now:

1. **Bundle delta** across the 38 single-slot components, against the ~90 KB estimate above.
2. **Per-instance cost** of the shared layout versus a bespoke one, which is the number that
   decides whether aggressive sharing is right.
3. **Whether the Phase 2 pass is worth building at all**, by measuring what `defineComponent` and
   the `p` getter construction actually cost per component instance under an interpreter.

---

## 12. How this gets implemented

### Phase 0 — plain TypeScript, no build step

Everything here is runtime. `recipe()`, `layout()` and `defineComponent()` are ordinary
functions. `tsc`, Biome and editors work untouched. This ships first and is usable on its own.

### Phase 1 — codegen, not a compiler

The wiring is mechanical and its output is readable TypeScript, which makes it a **code
generator**, not an AST transform. A script reads the recipe and defaults files and writes
`index.ts`; the generated file is committed and ships as ordinary source.

```
Accordion.recipe.ts  ─┐
                      ├─►  generator  ──►  index.ts   (committed, plain TS)
Accordion.defaults.ts ┘
```

No AST tooling, nothing in the bundler pipeline, output reviewable in a diff. Same shape as
`endpointgen` elsewhere in the stack.

This is also where slot validation lives: every declared slot rendered, every rendered slot
declared, no duplicate slot names within a component.

### Phase 2 — a Rust pass, only if JSX-level rewriting is wanted

Dropping the `p.` prefix and any `@once` placement means rewriting JSX, and that must happen
**before** Solid's JSX transform, which lowers JSX to `template()` and `spread()` calls after
which prop information is gone.

| Route | Verdict |
| --- | --- |
| **oxc, standalone pass** | [`oxc_traverse`](https://docs.rs/oxc_traverse) is published (0.144.0, MIT) and its `Traverse` trait is implementable by third parties. Its own docs describe it as codegen-generated and steered as internal, so pin the version and expect churn. This is a *standalone* pass, not a plugin registered into oxc's transformer, which documents only two built-in plugins and no third-party registration. |
| **[solid-jsx-oxc](https://github.com/Aeolun/solid-jsx-oxc)** | A Rust/oxc port of the Solid JSX transform with NAPI-RS bindings and Vite/Rolldown plugins. If the JSX transform is oxc-based, our pass can share the AST with it in one traversal. Community-maintained and currently forked across at least two repositories. |
| **[oxc-loader](https://github.com/Sunny-117/oxc-loader)** | Drop-in replacement for `swc-loader` / `babel-loader`, reported 3-5x faster than SWC. Runs oxc's built-in transforms; a host for the pipeline, not for a custom pass. |
| **SWC Wasm plugin** | Rspack supports these in `builtin:swc-loader`, but they are [experimental and not backward compatible](https://rspack.rs/errors/swc-plugin-version): pinned to the exact `swc_core` Rspack was built against, erroring on mismatch, with no official fix and no upstream priority. Avoid for anything other people consume. |
| **Babel** | Works today, needs no new artifact, slowest by 20-50x. Fallback only. |

### Which host

**oxc. Not Babel.**

This pass is dev-facing: it runs on every file on every rebuild, so its cost lands in the HMR
loop rather than in a release build. Babel is 20-50x slower, and on a 242-file app like
`nofilter.io` that is felt on every save. Adding a slow pass to a fast dev loop is the wrong
trade even once.

A Babel adapter would only be worth it for reach, and section 12's distribution note establishes
there is no near-term reach to buy: `solid-jsx-oxc` has 100 monthly downloads, and a PR to
`babel-preset-solid` is the wrong ask. The near-term consumers are this library, chuzz and
`nofilter.io`, all of which want the fast one.

The costs of choosing oxc, stated plainly rather than waved past:

- **Packaging is a real pipeline.** NAPI-RS plus prebuilt binaries per platform
  (darwin-arm64, darwin-x64, linux-x64-gnu, linux-arm64-gnu, win32-x64), and CI has to build all
  of them on every release. `solid-jsx-oxc` does exactly this, so there is a template to copy
  rather than a problem to solve.
- **`oxc_traverse` will churn.** Its own docs describe it as codegen-generated and internally
  steered. Pin the version and expect to bump it deliberately.

Build the conformance corpus of input/output fixtures regardless. It is what would make a Babel
adapter cheap rather than a rewrite, if external adoption ever becomes a goal worth paying for.

### Not a PR to babel-preset-solid

`babel-preset-solid` is 34 lines with a single dependency, so adding a pass to it is a three-line
diff. It should still be rejected: it would make our transform a mandatory install for 3.44M
monthly downloads, cost every Solid user an AST traversal for a feature they do not use, and ask
the Solid maintainers to adopt one vendor's component architecture into core tooling. Its stated
job is transforming JSX, and this is an authoring convention layered above that.

Publish the mirror-image package instead, which needs no upstream agreement:

```js
// babel-preset-solid-layouts — same 34-line shape
module.exports = (context, options = {}) => ({
  presets: [[require("babel-preset-solid"), options.solid]],
  plugins: [[require("./pass"), options.layouts]],
});
```

The part that is genuinely upstreamable later is the `@once` analysis, and it belongs in
`babel-plugin-jsx-dom-expressions` where `@once` is actually handled, not in the preset. That
conversation needs the corpus and the measurements first.

### Distribution

There is no free ride here, and it is worth being precise about it. npm downloads, last 30 days
to 2026-08-09:

| Package | Downloads |
| --- | ---: |
| `solid-js` | 13,287,731 |
| `babel-plugin-jsx-dom-expressions` | 3,578,978 |
| `babel-preset-solid` | 3,444,968 |
| `vite-plugin-solid` | 2,583,590 |
| `solid-jsx-oxc` | **100** |
| `vite-plugin-solid-oxc` | **76** |

`solid-jsx-oxc` is not a dependency Solid users already have, and it is not a widely adopted
community tool. At 100 downloads against 3.58M for the transform it replaces, building into it
reaches nobody, and depending on it puts the build on a package with two competing forks and
almost no usage. Using it as a *reference* for packaging a Rust NAPI transform costs nothing and
remains sensible; that is a different decision from taking it as a dependency.

The packages that would reach every Solid user are `babel-plugin-jsx-dom-expressions` and
`babel-preset-solid`. Neither is a natural home for this work: they implement JSX semantics, and
this is a component-authoring convention layered above that. Pushing it there would be both a hard
sell and architecturally wrong.

So the realistic channel is that **`@pathscale/ui` ships it**, and anyone else opts in. If the
pattern proves out across 106 components, chuzz, and libraries other people build on it, the
upstream conversation that becomes possible is about the `@once` analysis in Phase 2, not about
the authoring layer.

### How much is left for Phase 2

Less than it first appeared. The bundle win in section 11 comes from the shared layout, a runtime
change needing no tooling. After codegen removes the wiring, Phase 2 buys the `p.` prefix and the
`@once` research. Both worth doing, neither urgent, neither blocking.

**The constraint at every phase: deleting the tooling leaves working code.** If removing it
changes behaviour rather than size, the design is wrong and the phase does not ship.

---

## Notes for reviewers

Claims the AFTER design rests on, worth checking.

**Slots are required and checked.** Types cover misspelled slot references; the generator covers
declared-but-unrendered and rendered-but-undeclared. A component rendering twice produces one
`data-slot` value and two distinct instance ids.

**A layout has no runtime wrapper.** `Layout<typeof recipe>` is a type annotation; the layout
file imports nothing from `solid-layouts` at runtime.

**The two-parameter signature is load-bearing.** It is what makes `{...slot.root}` and
`{children}` safe to destructure while keeping reactive reads behind `p`. Collapsing it to one
parameter reintroduces the destructuring footgun.

**`p.slot.root` takes no arguments.** The recipe declares both `props` and `state` key names, so
`layout()` knows which to read from the call site and which from the model. A `state` key returned
by setup must match a `state` key in the recipe; a name in both groups is an error at definition
time.

**`p.expanded` is a value, not `p.expanded()`.** `layout()` builds `p` with getters over the
model's accessors, so reading it inside JSX tracks the same as calling the accessor.

**Phase 0 needs no tooling at all.** All of it is runtime and plain TypeScript.

Known gaps against VUE3: no `<template>` block, no scoped styles, and no named slots in the Vue
sense (a content slot here is just a prop holding JSX, distinct from the element slots in
section 2, and the name collision is unfortunate).

Open: `disabled` is genuinely both behaviour (cannot toggle) and presentation (dimmed). Here it is
a `state` key computed by the logic from a behaviour prop. That is where the split is least
obviously clean and the one most worth pushing on.
