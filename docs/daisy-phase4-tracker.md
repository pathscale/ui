# DaisyUI Removal - Phase 4 Tracker (@pathscale/ui)

## Objective
Move styling ownership into `@pathscale/ui` so app repos can remove app-level DaisyUI plugin reliance.

## Completed in this slice
- Added library-owned compatibility stylesheet:
  - `src/styles/compat/daisy-primitives.css`
  - shipped as `dist/styles/compat/daisy-primitives.css`
- Covered primitives in this pass:
  - `btn` (+ size/color/variant helpers currently used by Button)
  - `join` and `join-item`
  - `menu` (+ active/disabled states)
  - `table` (+ zebra/hover)
  - `toggle` (+ sizes/colors)
- Updated CSS packaging contract:
  - `scripts/copy-css.js` now copies all `src/styles/**/*.css` into `dist/styles/**`
- Documented CSS usage in README.

## Remaining migration groups
- Group A (highest risk):
  - `modal`, `drawer`, `dropdown`, `tabs`
- Group B (form primitives):
  - `input`, `select`, `textarea`, `file-input`, `checkbox`, `radio`, `range`
- Group C (semantic UI primitives):
  - `badge`, `alert`, `card`, `tooltip`, `collapse`, `breadcrumbs`, `navbar`
- Group D (cleanup and parity):
  - remove remaining Daisy class assumptions in TSX render paths
  - tighten visual parity with current production usage
  - remove app-level Daisy plugin from nofilter after parity verification

## Consumer import contract (intermediate)
Apps should import:

```ts
import "@pathscale/ui/dist/styles/compat/daisy-primitives.css";
import "@pathscale/ui/dist/styles/icons/generated-icons.css";
```

This is transitional until all remaining groups are fully migrated.
