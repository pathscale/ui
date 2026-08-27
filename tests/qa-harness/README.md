# QA harness

One component, mounted alone, driven by `ps-qa` against the real renderer.

## Why

Driving a component inside a consuming application makes every check
order-dependent. Running AgencyZero's `pillmenu`, `composer`, `select` and
`rename` groups in one process produced three failures that were nothing to do
with the components:

- `composer-effort-selects-option` failed because the previous group left the
  Effort pill on `low`, so "choosing medium changes the trigger" had nothing to
  change.
- `select-session-changes` failed because an earlier group left a popover open.
- `rename-closes-on-pointer-away` failed on a control an earlier check had
  already renamed.

None of those are defects, and in a report they are indistinguishable from
defects. Worse, the reverse also happens: real breakage hides behind a failure
blamed on ordering. One component per page, selected by URL, removes the whole
category — a reload is a full reset.

It is also simply faster. Finding one Dropdown defect by driving the whole
application took a day; the same defect on an isolated page is a single check.

## Adding a component

Add one entry to `components.ts`:

```ts
{
  id: "dropdown",          // URL id and check-id prefix
  component: "Dropdown",   // export name in @pathscale/ui
  kind: "value",           // value | mode | action | display
  subject: "Effort",       // the control a reader READS
  subjectRole: "button",   // its role, so a check cannot assert on the wrong node
  activate: "menuitem:high",
  opens: "menuitem:low",
  props: { label: "Effort" },
  options: [...],
}
```

Then `bun run qa:checks`. The generator writes the checks the kind requires,
into `tests/ps-qa/<id>.ron`. Nobody writes a check by hand, which is the point:
the weak assertion that let a broken Select report 2/2 is not spellable, because
a `value` component's "changes" check always names the trigger as its subject.

`kind` mirrors the templates in AgencyZero's `tests/qa-templates/templates.ron`.

## Running

```bash
bun run qa:checks   # regenerate checks from components.ts
bun run qa:build    # build the harness (reads ../dist, so build the library first)
bun run qa:dev      # serve it at :5178 for a browser
```

## Coverage

Every exported component has an entry in `components.ts` and a generated check
file: **71 components, 71 files**. Two (`Dropdown`, `Select`) have hand-written
fixtures and so generate their kind's full set; the rest generate their
`-mounts` paint check, which is the honest coverage for a component whose
interaction nobody has described yet. Filling in `subject`/`subjectRole` on an
entry upgrades it, with no other work.

The 23 directories under `src/components` that are not re-exported from
`src/index.ts` are deliberately absent: a consumer cannot import them, so there
is nothing for a consumer-facing harness to drive.

## Current result: 33 pass, 38 fail

`bash tests/qa-harness/run-all.sh` drives all 71, one process each. Every failure is the same
check, `<id>-renders`, reporting that the component put nothing on screen when
mounted plainly. The failures split three ways, and only the third is a defect:

**Compound components (most of the 38).** `Accordion`, `Dialog`, `Drawer`,
`Tabs`, `Popover`, `Select`, `Dropdown` and others are assembled from parts.
`<Accordion>Accordion</Accordion>` is not a usable Accordion, so it renders an
empty box. These need a hand-written fixture, exactly as `Dropdown` and `Select`
already have. Nothing is wrong with the component.

An attempt to build these automatically — reading the parts off the component
object at runtime and rendering the first few — was tried and reverted: it broke
components that had been passing, because a part rendered out of order or
without its root produces less than a bare mount does. Compound structure is
per-component knowledge, and the honest way to supply it is one fixture at a
time.

**Absolutely positioned components (false negatives).** `Badge` is an anchor
badge: it paints a real 28x28 node and contributes no height to its parent, so
the fixture region measures 1184x0 and the check calls it empty. The check is
wrong here, not the component. Fixing it needs a measure of "did this subtree
gain a node" that ps-qa does not currently express — `PaintsMore` compares one
subject across an action, and there is no action.

**Genuinely renders nothing.** What remains after the two above is the list
worth acting on. Identifying which is which needs the fixtures above written
first, because until then a compound component and a broken one fail
identically.

## Solved

**Eager imports.** A single bundle put all 71 components in one module graph, so
one that throws on import emptied the page for all of them, and an import-time
throw cannot be caught by an error boundary. Each entry now imports one
component from its own module, statically (`@pathscale/ui/components/<name>`).
Per-page JS went from 495 kB to ~105 kB. A dynamic `require` of the package root
defeats this: the bundler cannot prove which exports are reachable and keeps all
71.

**Hosting.** `blitz-preview` now takes `BLITZ_PREVIEW_DIST` and `--blitz-control`,
so ps-qa attaches to a headless host serving one component's page. The host
presents a single page as a dist, because the preview reads `index.html` and
inlines the first `src=` and `href=` it finds.

**Styling.** Component CSS bottoms out in Tailwind's palette, so `tests/qa-harness/index.css`
imports `tailwindcss` and points `@source` at the component sources, the step a
consuming application performs. Before it the Dropdown trigger was 1168x54 with
`bg=#00000000`; it is 1184x36 with `bg=#101828ff` after.

## Coverage, honestly

Two checks are generated per component:

- `<id>-page-paints` — the page built and painted. Targets the heading, which is
  named because Blitz names a node from its text.
- `<id>-renders` — the component produced a node, measured on the fixture region
  that wraps only the component.

The second exists because the first passed for Accordion while it rendered
nothing at all. Three earlier attempts at it were wrong: `aria-label` on the
component (most components do not spread unknown props, so Button rendered an
unnamed 26px box), `aria-label` on a `role="group"` wrapper (Blitz left it an
unnamed `generic`), and `PaintsMore` on the heading (it counts one subject
across an action, and there is no action).

A component with `subject`/`subjectRole` filled in also generates its kind's
full set. Only `Dropdown` and `Select` have that today.
