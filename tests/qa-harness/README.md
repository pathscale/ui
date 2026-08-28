# Native component QA

Every exported component is mounted alone and driven through Blitz's native
inspection protocol. No browser, jsdom, desktop window, or screen coordinates
are involved.

## Contract

`components.ts` is the inventory. Each entry declares the component's kind and
the semantic controls a person uses. `generate-checks.ts` turns that declaration
into ps-qa outcomes under `tests/ps-qa`.

The current inventory contains 72 root components. Every component must build,
mount, and paint. Interactive components must also expose the real result of
their public callback or controlled state change:

- Checkbox and Switch change their selected state.
- Dropdown and Select open, change their controlled trigger value, and close on
  Escape.
- Input and Textarea accept native text input and expose the new value.
- Slider changes and restores its exposed value through keyboard input.
- InlineEdit opens its labelled textbox, commits a controlled value with Enter,
  and abandons a later draft with Escape.
- Button-like actions expose that their callback ran.
- Dialog and Popover open portalled content and close it with Escape.
- Tabs change both the selected tab and its corresponding panel.
- ComplexColorWheel changes a controlled semantic adjustment.

Purely visual components stop at rendered output. A component with an
interaction must use an interaction kind; changing it to `display` is not a
valid way to make an outcome pass.

## Running

```bash
bun run build
bun run qa:checks
bun run qa:build
bash tests/qa-harness/run-all.sh
```

Set `QA_PS_QA` or `QA_HOST` to test local builds of ps-qa or qa-inspect-host.
The script refuses stale bundles unless `QA_ALLOW_STALE=1` is explicitly set.

The sweep uses one clean headless host per component and runs that component's
outcomes in sequence. `prepare_unless` makes setup idempotent, so the same check
also runs by id against a fresh host. A complete local sweep is 72/72 in about
83 seconds.

## Adding a component

Add it to `components.ts`, add its module path to `generate-entries.ts`, and use
the narrowest truthful kind. Add a fixture in `mount.tsx` when a generic mount
cannot express the component's public API. Then regenerate checks and entries.
Both generators reject duplicate or incomplete inventory records and remove
stale generated files; CI regenerates both trees and fails on any diff.

Dismissal checks always open the overlay before sending Escape. `prepare_key`
uses a key *instead of* activating setup, so it cannot express that sequence
and must not be used for an open-then-dismiss outcome.

Generated entry points isolate import failures. A component whose module throws
can fail only its own page, rather than emptying the entire suite. The host
serves the built page over the inspection socket and never opens a window.
