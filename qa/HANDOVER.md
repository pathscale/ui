# Handover

## ⚠️ READ THIS FIRST: NEVER LAUNCH A WINDOW ⚠️

**Run the QA harness HEADLESS. Always. No exceptions.**

A sweep covers 71 components. Every windowed run opens a window per component,
steals focus from whatever the owner is doing, and makes the machine unusable.
This happened repeatedly and it is the single most important rule in this
directory.

### The headless command

```bash
AGENCYZERO_BLITZ_CAPTURE=/tmp/out.png \
AGENCYZERO_BLITZ_TREE=/tmp/out.tree \
BLITZ_CAPTURE_DIST=/tmp/staged-component \
  ~/code/agencyzero/apps/blitz-preview/target/release/agencyzero-blitz-preview
```

No window. No display server. Works on macOS and on a Linux CI runner.
`AGENCYZERO_BLITZ_TREE` writes the semantic tree — id, role, accessible name per
node — which is what a check actually reads. The PNG is incidental; ignore it.

### What must never be used for a sweep

```
--blitz-control            # opens a window to host the inspector socket
--offscreen                # still opens a window, just positioned off screen
BLITZ_PREVIEW_DIST=...     # the windowed path
```

`qa/run-all.sh` STILL USES THE WINDOWED PATH. **Do not run it as-is.** Rewriting
it to use `AGENCYZERO_BLITZ_TREE` is the first task below.

### Why it is still windowed

`ps-qa` attaches over a control socket, and `agent_control_server::start` is
`pub(crate)` in `tauri-runtime-blitz`, so nothing outside that crate can host the
socket. The windowed path was the only way to get a socket, so the runner kept
using it. The headless tree dump removes that need: read the tree file directly
instead of querying ps-qa.

### If a window appears anyway

```bash
pkill -9 -f agencyzero-blitz-preview
```

---

## Where the work is

**AZ #188** — https://github.com/pathscale/agencyzero/pull/188, tip `2929639`
Branch `fix-blank-window-visibility`. Carries three preview commits:

- `fe9c199` host any dist (`BLITZ_PREVIEW_DIST`) and expose the control socket
- `800816c` fix the anyrender conflict so `capture` builds
- `2929639` headless semantic tree dump (`AGENCYZERO_BLITZ_TREE`)

Uncommitted on that branch: the owner's caret/dependency work (drops the pinned
UI SHA overlay in `qa-panel.yml`, `cargo install ps-qa --version '^0.4.1'`).

**UI #275** — https://github.com/pathscale/ui/pull/275, tip `a7eacb0`
Branch `fix-overlay-hit-testing`. Carries the overlay host, the Select overlay
fix (ui#274 folded in and closed), the whole `qa/` harness, and the CI lint gate.

Uncommitted in `~/code/ui`: `qa/components.ts` role corrections from the
measurement pass, plus this file.

**Merge order:** UI #275, then AZ #188. Independent in code; #188's CI overlays
UI at a pinned SHA, so merging UI first lets that pin be replaced with the
published version.

---

## The anyrender fix, since it kept coming up

One line. `ps-blitz-paint` takes `package = "ps-anyrender"`; the preview manifest
took plain `anyrender`. Two copies of the `PaintScene` trait in the graph, so the
vello-cpu painter could not satisfy the one blitz-paint wanted. Both now come
from the fork, and `capture` builds for the first time. That is what made the
headless path possible at all.

---

## What is actually verified

71 components are in `qa/components.ts`, each with a generated check file.

- **Verified working:** Button, Dropdown, and the `display` components whose
  whole contract is painting.
- **Measured but not yet re-run:** every component's real role was measured from
  the headless tree. 23 expose an interactive role; 48 render only generic
  containers when mounted plainly. The manifest was updated from that
  measurement, and the sweep has NOT been re-run since (see the headless rule).

`qa/README.md` records the earlier 33-pass and 60-pass runs and what the failures
meant. Those numbers predate the role corrections.

---

## Known real defects

**Select renders nothing in isolation.** Mounted alone, the root drops all
children: even a plain `<span>` inside `<Select>` never paints. This is the root
cause of the select-selection bug and it is NOT what ui#274 fixed. Not yet
diagnosed. Reproduce it on a 12-node page rather than in the application.

**Dropdown/Select overlays** had a real Portal and `visibility`-transition defect,
fixed in the commit folded into #275. Real, but separate from the above.

---

## Next tasks, in order

1. **Rewrite `qa/run-all.sh` to be headless.** Drop `--blitz-control` and
   `--offscreen`, use `AGENCYZERO_BLITZ_TREE`, and assert against the tree file.
   Nothing else should run until this is done.
2. Re-run the sweep headlessly and record the real pass count.
3. Diagnose why `Select` drops its children.
4. Give the compound components (Dialog, Drawer, Tabs, Popover) real fixtures;
   a bare mount renders an empty box for all of them.

---

## Mistakes worth not repeating

- **Launching windows.** Stated above, and it is the reason this file starts the
  way it does.
- A duplicate `component` prop in `mount.tsx` made all 71 pages render an empty
  box. JSX takes the last of a duplicated prop. It read as 71 broken components
  and was one line. `qa:lint` now runs Biome over `qa/`, which catches exactly
  that.
- `set_activation_policy(Accessory)` ran after the `Prohibited` set at the top of
  `main` and silently undid it, so every "focus fix" was reverted a few hundred
  lines later.
- Roles were guessed rather than measured, and 30 checks asserted against nodes
  that do not exist. Measure from the tree dump; never guess a role.
