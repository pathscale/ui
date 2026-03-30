# Contributing to @pathscale/ui

## Before You Start

- **Open an issue first** before working on new components or significant changes
- For new components, use the [Component Proposal Template](#proposing-a-new-component) below
- Keep PRs small — one component or feature per PR

## Setup

```bash
bun install
bun dev        # dev server
bun build      # production build
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

### Props

- [ ] Extend `IComponentBaseProps` when the component needs `dataTheme` support. All components should accept `class` and `style` at minimum.
- [ ] Use `splitProps` to separate component props from HTML pass-through
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
