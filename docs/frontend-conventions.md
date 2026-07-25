# Frontend conventions — UI

Read this **before** opening implementation files, so context stays small and existing
conventions are followed. It covers implementing, debugging, reviewing and refactoring pages, hooks, stores, services, routing and `@pathscale/ui` usage.

Stack: **SolidJS**, **rsbuild**, **Bun**, **Biome**, **`@pathscale/ui`**.

## Non-negotiables

- **SolidJS, not React.** No `useState`/`useEffect` reflexes, no virtual-DOM
  assumptions. Use signals, `<Show>`, `<For>`, and `class=` (not `className=`).
- Follow the existing hooks, stores, routes, guards and feature structure **before**
  introducing a new pattern. Find one analogous implementation and mirror it.
- **This repo *is* `@pathscale/ui`.** You are building the components, not consuming
  them — so any change to a component's props or behaviour is an API change for every
  consuming app. Check `docs/component-migration-map.md` and existing usage patterns
  before altering a public surface.
- **User-facing strings:** this repo has no i18n system today. If one is added, route
  every user-facing string through it — don't hand-roll a second mechanism alongside it.
- **Use Bun and Biome**, and this repository's actual validation commands (below) —
  not a remembered command from another project.

## Context-efficient workflow

1. **Classify the task before reading files:** auth · data/hooks · feature page ·
   routing · stores · UI/styling.
2. **Search narrowly before reading.** Prefer symbols, exact strings and matching line
   ranges over opening whole files.
3. **Start with at most five directly relevant files.** Expand only when there is a
   concrete unanswered question.
4. **Mirror an analogous implementation** before creating a new pattern.
5. **This repo has no backend services contract** — there is no services JSON to
   consult. Don't look for one.
6. **Don't repeat a search whose result you already have**, and don't reread unchanged
   files without a reason.
7. **Verify existing `@pathscale/ui` usage** before assuming a component API.
8. **Validate incrementally:** smallest relevant check first, broader checks only when
   needed.
9. **Report only:** changed files · validation results · remaining risks · contract
   limitations.

## Validation

```bash
bun run lint
bun run format
bun run check
bun run build
```

Run the smallest relevant check first; widen only if it passes or the failure is unclear.

## References

Load only the reference needed for the current task — not all of them automatically:

- **project map** — feature structure, routes, stores and app flow
- **services contract** — endpoint wiring, hooks and generated DTO rules
- **UI conventions** — [`ui-usage.md`](ui-usage.md) ✅ *(this repo owns it)*
- **validation** — exact commands for this repository (see above)

> **TODO — these reference docs do not exist yet.** The names above are the intended
> split; writing them is a follow-up project. Until they exist, this file plus the
> services JSON is the reference. Don't go looking for files that aren't there.
