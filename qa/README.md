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
into `qa/checks/<id>.ron`. Nobody writes a check by hand, which is the point:
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

## Blocked: eager imports

The registry in `App.tsx` imports all 71 components by name. At least one
(`Accordion`) runs code at module scope that Blitz's JS runtime cannot execute,
and it throws during *import* rather than during render:

```
TypeError: not a callable function
```

An import-time throw cannot be contained. `createErrorBoundary` catches render
failures, and the harness has one, but the module never finishes evaluating, so
the whole page is empty and all 71 checks fail on a missing control — precisely
the all-or-nothing failure isolation was supposed to end.

Two ways out, neither yet taken:

1. **One entry point per component.** Build 71 tiny bundles instead of one, so
   a component that cannot be imported takes only its own page down. This is
   the honest fix and matches the directory's premise.
2. **Fix the components that throw.** `Accordion` is one; `tests/components/
   optional-context-defaults.test.ts` already exists to catch this class, so
   the gap is that it does not cover every component.

Until then only the two hand-written fixtures can actually be driven, which is
how the Dropdown pointer defect was reproduced in 14 nodes.

## Not finished

`ps-qa` attaches to a Blitz application over its control socket. The harness
builds and serves, but nothing yet hosts it *in Blitz*:

- `blitz-preview` reads any dist via `BLITZ_CAPTURE_DIST` (Brotli-compressed
  assets, one JS and one CSS, which `qa:build` is already configured to emit),
  but exposes no control socket, so `ps-qa` cannot attach.
- `az-gui` has the inspector, but embeds `frontendDist` at compile time.

Closing this needs one of: a `blitz-control` feature on `blitz-preview`, or a
runtime frontend override on `az-gui`. The first is the cleaner of the two — it
keeps the harness independent of the consuming application, which is the thing
this directory exists to achieve.
