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
  - Group A baseline classes: `modal`, `drawer`, `dropdown`, `tabs`
  - Group B baseline + parity pass: `input`, `select`, `textarea`, `file-input`, `checkbox`, `radio`, `range`
  - Group C baseline classes (start): `badge`, `alert`, `card`, `tooltip`, `collapse`, `breadcrumbs`, `navbar`
  - No-Daisy playground baseline:
    - `playground/src/index.css` no longer imports `@plugin "daisyui"`
    - `bun run playground:build` succeeds with compat styles only
- Updated CSS packaging contract:
  - `scripts/copy-css.js` now copies all `src/styles/**/*.css` into `dist/styles/**`
- Documented CSS usage in README.

## Remaining migration groups
- Group A (highest risk):
  - baseline compatibility styles are implemented
  - pending parity pass against all modal/drawer/dropdown/tabs variants used by app consumers
- Group B (form primitives):
  - complete in this branch:
    - parity pass for `input`, `select`, `textarea`, `file-input`, `checkbox`, `radio`, `range`
- Group C (semantic UI primitives):
  - baseline compatibility styles implemented for:
    - `badge`, `alert`, `card`, `tooltip`, `collapse`, `breadcrumbs`, `navbar`
  - parity status in this branch:
    - playground parity pass completed against baseline states/variants
  - pending parity pass against full app usage (sizes, variants, open/interactive states)
- Group D (cleanup and parity):
  - started:
    - removed Daisy-dependent `@apply btn ...` from `src/components/sidenav/Sidenav.css`
    - removed Daisy-prefixed responsive class assumptions in component render paths:
      - `Button` -> `btn-responsive`
      - `Badge` -> `badge-responsive`
      - `Menu` -> `menu-responsive`
      - `Modal` / `ModalLegacy` -> `modal-responsive-middle`
      - `Card` responsive side variants -> `card-side-{xs,sm,md,lg}`
    - replaced Daisy-only utility tokens in TSX:
      - `Avatar`: `rounded-btn` -> `rounded-lg`, `bg-neutral-focus` -> `bg-neutral`
      - `LiveChatPanel`: `hover:bg-primary-focus` -> `hover:bg-primary/90`
    - added compat utility aliases for transition safety:
      - `rounded-box`, `rounded-field`, `rounded-btn`, `bg-primary-focus`
    - added missing Phase D compat state classes used by components:
      - button: `btn-active`, `btn-soft`, `btn-dash`
      - menu: `menu-focus`, `menu-dropdown-toggle`, `menu-dropdown-show`
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
