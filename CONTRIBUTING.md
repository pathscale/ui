# Contributing to @pathscale/ui

## Before You Start

- **Open an issue first** before working on new components or significant changes
- For new components, use the [Component Proposal Template](#proposing-a-new-component) below
- Keep PRs small — one component or feature per PR

## Setup

```bash
bun install
bun run dev      # dev server
bun run build    # production build
bun run lint
bun run format
```

### Trying a change

There is no in-repo playground. It demoed every component against the pre-2.2 API
and had become 477 typecheck errors of dead demos, so it was deleted rather than
rewritten: a copy of the API living beside the API only ever drifts from it. The
showcase belongs in [js.software](https://github.com/pathscale/js.software).

[`docs/how-to-setup-playground.md`](docs/how-to-setup-playground.md) has two
recipes, one aliased at `src/` for hot reload and one installed from the tarball.

The quickest check without either:

```bash
bun run build
bun run smoke        # scripts/smoke-consumer.ts, imports the built artifact
```

## Commit Convention

```
type(scope): message
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Examples:
- `feat(radio-group): add error state prop`
- `fix(dropdown-select): return focus to trigger on close`

## Component Checklist

Every component MUST follow these rules. This is non-negotiable.

### Structure

```
src/components/component-name/
  ComponentName.tsx    # Implementation
  index.ts             # Barrel export
```

Barrel export pattern:
```ts
export { default as ComponentName, type ComponentNameProps } from "./ComponentName";
```

### The recipe is a value import, never `import type`

A `.layout.tsx` uses its recipe only in a type position — `Layout<typeof
componentRecipe, Props>` — so a type-only import looks correct and typechecks.
It is not: the generator emits `defineComponent({ recipe: componentRecipe, … })`
into the `.generated.tsx` beside it, and that is a **value** use. Narrowing the
import breaks the declaration build with a message that names the generated
file, which is gitignored and easy to mistake for a stale artefact:

```
error TS1361: 'componentRecipe' cannot be used as a value because it was
imported using 'import type'.
```

Two things enforce this so it cannot be reintroduced:

- `tests/layouts/recipe-imports.test.ts` fails on any layout that type-imports a
  symbol it also passes to `Layout<typeof …>`.
- `biome.json` turns **`style/useImportType` off**. That rule is otherwise
  reasonable, but it only ever sees the `.layout.tsx` source, so it "fixes" the
  import to `import type` and breaks the build every time someone runs
  `biome check --write`. It has done so more than once. Do not turn it back on
  without teaching it about the generated file.

### `bun run check` regenerates every layout

`check` runs `layouts:generate` first, which rewrites **all** `.generated.tsx`
from their `.layout.tsx` sources — not just the one you are working on. They are
gitignored, so a clean tree stays clean, but two consequences are worth knowing:

- Adding one component makes the generator process the whole library, so a
  contract violation anywhere surfaces on *your* branch. Check whether it
  reproduces on `master` before treating it as yours.
- A `.generated.tsx` with no `.layout.tsx` beside it is a hard contract error
  (`stale-generated`). Switching branches leaves these behind, because git does
  not clean ignored files: `git status` is silent and `check` fails with a
  component you have never heard of. Delete the orphan directory.

### Props

- [ ] Extend `IComponentBaseProps` when the component needs `dataTheme` support. All components should accept `class` and `style` at minimum.
- [ ] Use Solid 2's `omit` (or legacy `splitProps`) to separate component props from HTML pass-through
- [ ] Use `twMerge()` for class merging — never string concatenation. Add `clsx()` inside only when you have conditional classes (e.g., `twMerge(clsx({"btn-active": isActive}), local.class)`)
- [ ] Boolean props default to `false`
- [ ] Use `ComponentSize` for sizes (`xs | sm | md | lg | xl`)
- [ ] Use `ComponentColor` for colors (`primary | secondary | accent | info | success | warning | error`)
- [ ] Events: `onChange`, `onValueChange` — pass the value, not the raw event
- [ ] Accept `JSX.Element` for labels/content when consumers might need rich content

### Accessibility

- [ ] Interactive components MUST have `aria-label` or `aria-labelledby`
- [ ] Use semantic HTML (`<button>`, `<fieldset>`, `<dialog>`) — not styled divs
- [ ] Keyboard navigation: Tab, Arrow keys, Enter/Space, Escape where applicable
- [ ] `aria-describedby` for descriptions and error messages
- [ ] Focus visible styles on all interactive elements
- [ ] `@media (prefers-reduced-motion: reduce)` for animations
- [ ] `role` attributes where HTML semantics are insufficient

### Code Style

- [ ] `function` component with explicit return type `: JSX.Element`
- [ ] Follow existing export pattern — `export default` in component file, re-export as named in barrel `index.ts`
- [ ] No hardcoded English strings — accept as props with sensible defaults
- [ ] No inline `style={{}}` when a Tailwind class exists — use classes instead. Dynamic values (animations, user-controlled sizes, calculated positions) are OK.
- [ ] No `className` dual support — use `class` only (SolidJS convention). `className` is accepted via `IComponentBaseProps` for compat but `class` is canonical.
- [ ] No `any` types — use proper TypeScript types
- [ ] Comments explain **why**, not **what**

### What NOT to Add

A component does NOT belong in this library if:

- It is a styled div with fewer than 3 props of real behavior
- It hardcodes application-specific logic (user roles, session IDs, API calls)
- It duplicates an existing component with fewer features
- It is a layout shortcut that consumers can compose with `Flex` + existing primitives
- No major UI library (Radix, Chakra, Mantine, Ant Design, MUI) ships an equivalent

### Showcase

- [ ] Every component MUST have a showcase page in js.software
- [ ] Showcase includes: default, variants, sizes, interactive examples, Props table
- [ ] Follow the existing pattern in `src/components/*Showcase.tsx`

### Exporting something new fails the suite until it is documented

`tests/api-contract.test.ts` compares the root barrel against
[`docs/api-contract.md`](docs/api-contract.md) in **both** directions, so adding
an export without documenting it fails with:

```
FlexGrid is exported but documented nowhere
```

That is the check working, not a broken test. The fix is one command:

```sh
bun run check:api -- --write   # regenerates docs/api-contract.md
git diff docs/api-contract.md  # read it: the diff is the review
```

The list is committed on purpose. It exists because a component can ship,
publish and still be invisible to consumers for a day behind a doc that looked
correct the whole time — so the doc is enforced rather than trusted.

Documenting the *export* is the minimum. A component anyone is expected to reach
for also belongs in [`docs/ui-usage.md`](docs/ui-usage.md), which is the source
of truth every consuming app links to, and per `AGENTS.md` a public API change
must update it in the same commit.

## Proposing a New Component

Open an issue with this template:

```markdown
## Component Proposal: [Name]

### What it does
One sentence.

### Why it belongs in the library
- Which apps need it?
- Does an equivalent exist in Radix/Chakra/Mantine/Ant Design?
- Can it be composed from existing primitives instead?

### Proposed API
```tsx
<ComponentName
  prop1="value"
  prop2={true}
  onChange={(value) => {}}
/>
```

### Accessibility
- ARIA pattern it follows (link to WAI-ARIA APG)
- Keyboard interactions planned

### Alternatives considered
Why not use existing components or compose from primitives?
```

## PR Checklist

Before submitting:

- [ ] Component follows all rules in the [Component Checklist](#component-checklist)
- [ ] `bun build` passes
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Showcase page created/updated in js.software
- [ ] Commit message follows convention
