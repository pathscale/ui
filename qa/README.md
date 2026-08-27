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
