# @pathscale/ui Review: Theming, CSS, Build & Performance

**Date:** 2026-07-27
**Scope:** `src/index.css`, `src/styles/**`, all 88 `src/components/*/*.css`, `package.json`,
`rslib.config.ts`, `tsconfig.json`, `biome.json`, `bun.lock`, `scripts/**`, `.github/workflows/**`,
and the reactivity/DOM-side of `src/**/*.{ts,tsx}` (module-scope work, listeners, stores, effects).
**Commit:** Revalidated at `aa4fb58`; source findings were originally measured at `85614f1`.
**Reviewer slice:** `theming-css-build-perf`. Component prop APIs, a11y and per-component
behaviour are a sibling slice's job and are deliberately not covered here.

## Summary

- **The colour token layer is genuinely good. Everything below colour is not.** 97 tokens are
  defined in both themes and the top 12 carry ~800 references. But interaction and geometry
  design decisions never got tokenized: the focus ring is written 27 times in 6 different colours,
  disabled state uses 10 distinct opacity values, 135 of 158 `border-radius` declarations ignore
  the `--radius-*` tokens that exist, and z-index is 13 raw literals plus one token
  (`--z-overlay`) that **is referenced but never defined anywhere in the repo**.
- **The dark theme is a copy-paste of the light theme below the colour block.** Lines 88-135 of
  `light.css` and 87-134 of `dark.css` are byte-identical: all ~35 `--glass-*` tokens, all
  `--radius-*`/`--size-*`/`--border`/`--depth`/`--noise`. GlassPanel and GlowCard are therefore
  not themed at all: they use `white` surfaces and a light-mode shadow in dark mode.
- **16 shipped components have no CSS file and are styled entirely by raw Tailwind utility class
  names emitted from JS** (the whole `auth-*` family, `password-*`, `form/FormField`, several
  `table/*` parts). Nothing in the README tells consumers to add `@source` pointing into
  `node_modules/@pathscale/ui`, so in a stock Tailwind v4 app those components render with no
  layout at all. This is the highest-impact consumer-facing defect in the slice.
- **`package.json` declares three wrong runtime dependencies**, including
  `"@pathscale/ui": "^1.2.10"`: the package depends on an older copy of itself. Every consumer
  downloads the library twice. `@iconify/tailwind4` and `@pathscale/rsbuild-plugin-iconify` are
  build-time tools with zero imports from `src/`.
- **The Surge deploy token is still hard-coded in `.github/workflows/preview.yml:47`.**
  `ANALYSIS.md` flagged it on 2026-07-18 and it has not been rotated.
- Build shape itself is sound: bundleless ESM, `outBase: "./src"`, `sideEffects: ["**/*.css"]`,
  per-component `import "./X.css"`. Tree-shaking works, the always-shipped stylesheet is only
  21 KB, and the 286 KB of component CSS is genuinely opt-in. Two pre-publish gates
  (`check-package.ts`, `smoke-consumer.ts`) are well above average for a repo this size.
- Runtime is clean by Solid standards: **zero** props destructuring, **zero** `createStore`,
  **zero** `<Index>` misuse, no module-scope DOM work outside one guarded listener. Two real
  perf/correctness defects found, both from copy-paste drift rather than misunderstanding.

**Top 3 to do:** rotate the Surge token; fix `package.json` dependencies; document (or fix)
the Tailwind `@source` requirement for the 16 CSS-less components.

## Findings

### [SEV-1] Live Surge deploy token hard-coded in a workflow file

- **ID:** `ui-theming-css-build-perf-01`
- **Severity:** Critical
- **Category:** Security
- **Confidence:** High
- **Location:** `.github/workflows/preview.yml:45-47`
- **What:** The PR-preview job sets `SURGE_TOKEN: 256124bc72b634a53b5d5ec5f0c02258` as a literal
  `env:` value instead of reading `secrets.SURGE_TOKEN`. This is a public repository
  (`https://github.com/pathscale/ui`), so the credential is world-readable and is in every clone's
  git history.
- **Why it matters:** A Surge auth token grants full publish and teardown rights over every domain
  on that account. Anyone can overwrite `pr-ui-preview-*.surge.sh` with arbitrary content, which is
  a stored-XSS vector aimed squarely at the maintainers who click preview links from PRs, and can
  `surge teardown` existing deployments. Rotating alone is not enough: the value is in history.
- **Fix:** Revoke the token on Surge first (`surge token` regenerates), then add the new one as a
  repository secret and change the workflow to `SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}`. Treat
  the old value as permanently compromised; history rewriting is not worth it once revoked.
  Mechanical, but must be done in that order.
- **Effort:** S
- **Blast radius:** One workflow file. No API change. `ANALYSIS.md:56` already documents this,
  so the fix should also delete that entry.

### [SEV-2] The package declares itself as a runtime dependency

- **ID:** `ui-theming-css-build-perf-02`
- **Severity:** High
- **Category:** Maintainability | Performance
- **Confidence:** High
- **Location:** `package.json` `dependencies` block; `bun.lock:9` and `bun.lock:222`
- **What:** `dependencies` contains `"@pathscale/ui": "^1.2.10"`. The lockfile resolves it:
  `"@pathscale/ui": ["@pathscale/ui@1.2.10", ..., "dependencies": { ..., "@pathscale/ui": "^1.2.9" }]`.
  The self-dependency is recursive, 1.3.1 → 1.2.10 → 1.2.9. Nothing in `src/` imports
  `@pathscale/ui` (verified: 0 hits; the only hits are in `playground/`, which resolves through a
  Vite alias to `../src`).
- **Why it matters:** Every consumer of 1.3.1 installs a second, older, complete copy of this
  library into `node_modules`. That is a full duplicate of 286 KB of CSS and ~38 K lines of JS on
  disk and in the resolver graph. Worse, any consumer code that ends up resolving through the
  nested copy silently gets 1.2.10 components with 1.2.10 CSS while the app's stylesheet came from
  1.3.1. It also permanently pins a floor under `npm dedupe` and makes `npm ls` output nonsense.
- **Fix:** Delete the `"@pathscale/ui"` line from `dependencies` and re-run `bun install`. The
  playground alias means nothing in the repo breaks. Purely mechanical.
- **Effort:** S
- **Blast radius:** `package.json`, `bun.lock`. Not a breaking API change, but it changes what
  ships, so it warrants its own release.

### [SEV-3] Sixteen components have no CSS and depend on the consumer's Tailwind scanning `node_modules`

- **ID:** `ui-theming-css-build-perf-03`
- **Severity:** High
- **Category:** Correctness | Docs
- **Confidence:** High
- **Location:** `src/components/{auth-card,auth-error-message,auth-field-group,auth-footer-links,auth-form,auth-powered-by,auth-submit-button,auth-success-message,password-field,password-requirements,password-rules,join,size-picker,theme-color-picker,video-preview,textarea}/`
  (no `.css` file in any of them); representative emitters:
  `src/components/auth-form/AuthForm.tsx:29` (`"flex w-full flex-col gap-4"`),
  `src/components/auth-card/AuthCard.tsx:32,36,38` (`"w-full max-w-md"`, `"gap-5"`,
  `"flex items-start justify-between gap-3"`),
  `src/components/form/FormField.tsx:91` (`"flex flex-col gap-1"`),
  `src/components/form/FieldErrorMessage.tsx` (`"text-xs text-error mt-0.5"`),
  `src/components/table/ExpandToggle.tsx` (`"inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content transition-colors hover:bg-base-200"`),
  `src/components/table/InlineConfirm.tsx` (`"text-sm text-base-content/70"`),
  `src/components/password-field/PasswordField.tsx` (`"h-7 min-h-7 w-7 min-w-7"`).
- **What:** These components produce Tailwind utility class names at runtime and ship no CSS to
  back them. Tailwind v4 generates a utility only if it finds the literal string in a scanned
  source file, and **v4 does not scan `node_modules` by default**. The playground gets away with
  it because `playground/src/index.css:4` has `@source "../../src";`. A consumer installing from
  npm has no equivalent, and the README never mentions `@source`. `README.md` says only that
  Tailwind is *"optional, but required for the `@theme` token utilities"*, which understates
  it by a wide margin.
- **Why it matters:** In a stock Tailwind v4 consumer app, `AuthForm`, `AuthCard`, `FormField`,
  `PasswordField`, the table `ExpandToggle`/`InlineConfirm`/`SortIcon` parts and the rest render
  with **no layout whatsoever**: no flex, no gap, no sizing, no colour. It looks like the library
  is broken, and the failure is silent (no console error, no missing-module). `check-contracts.ts`
  does not catch it because it only requires `index.ts` + `splitProps` + `twMerge`, not a `.css`
  file. `src/components/textarea/Textarea.classes.ts` is literally `{ base: "" }`: a component
  whose entire style contract is empty, added to satisfy the contract check.
- **Fix:** Two options, and this needs a design decision, not a mechanical patch.
  1. **Short term (S, do this now):** document the requirement in `README.md` under Setup and in
     `docs/ui-usage.md` (add `@source "../node_modules/@pathscale/ui";` next to
     `@import "tailwindcss";`), and add it to `scripts/smoke-consumer.ts` so a fixture app catches regressions.
  2. **Correct fix (L):** give these 16 components real `.css` quartets driven by theme tokens like
     every other component, and add "has a `.css` file OR an explicitly whitelisted reason" to
     `scripts/check-contracts.ts` so the gap cannot reopen. This also removes the library's only
     hard dependency on the consumer running Tailwind at all.
- **Effort:** S for the docs fix, L for the real fix.
- **Blast radius:** Option 1 is docs-only. Option 2 touches 16 component directories and the
  contract script; visually it is a no-op if the CSS reproduces the current utilities, but it will
  shift specificity (utilities are unlayered-ish, `@layer components` is not) so it needs eyes.

### [SEV-4] Modal and Drawer each own a private body-scroll-lock counter

- **ID:** `ui-theming-css-build-perf-04`
- **Severity:** High
- **Category:** Correctness
- **Confidence:** High
- **Location:** `src/components/modal/Modal.tsx:59-88` (called at `:300,303,310`) and
  `src/components/drawer/Drawer.tsx:40-65` (called at `:269,272,278`)
- **What:** Both files declare their own module-level `let bodyLockCount = 0` plus
  `previousBodyOverflow`/`prevBodyOverflow` and `previousBodyPaddingRight`/`prevBodyPaddingRight`,
  and both write the same two global properties: `document.body.style.overflow` and
  `document.body.style.paddingRight`. The two counters cannot see each other. The implementations
  are otherwise near-identical, down to the scrollbar-width compensation.
- **Why it matters:** Concrete failing sequence, with a Drawer and a Modal both open (an ordinary
  pattern: a confirm modal launched from a drawer):
  1. Drawer opens. Drawer's counter 0→1, saves `prevBodyOverflow = ""`, sets `overflow: hidden`
     and `paddingRight: 15px`.
  2. Modal opens. Modal's counter 0→1, saves `previousBodyOverflow = "hidden"` and
     `previousBodyPaddingRight = "15px"`.
  3. Drawer closes. Drawer's counter 1→0, restores `overflow: ""`. **The page now scrolls
     behind an open modal.**
  4. Modal closes. Modal's counter 1→0, restores `overflow: "hidden"` and `paddingRight: "15px"`.
     **The page is now permanently scroll-locked with a phantom 15px gutter and no overlay open.**
     The only recovery is a reload.
  The same class of desync hits HMR, which `CLAUDE-INTERNALS.md:83` already notes for Modal alone;
  the cross-component case is worse because it happens in production.
- **Fix:** Extract one shared module, e.g. `src/lib/bodyScrollLock.ts`, exporting
  `lockBodyScroll()` / `unlockBodyScroll()` over a single counter and a single saved-state pair,
  and have both components import it. Delete both local copies. The extraction is mechanical (the
  bodies are already equivalent); the only judgement call is whether to also route Popover and any
  future overlay through it, which you should.
- **Effort:** S
- **Blast radius:** Two component files plus one new lib module. No public API change.

### [SEV-5] Build-time-only packages are declared as runtime dependencies

- **ID:** `ui-theming-css-build-perf-05`
- **Severity:** Medium
- **Category:** Maintainability
- **Confidence:** High
- **Location:** `package.json` `dependencies`: `@iconify/tailwind4`, `@pathscale/rsbuild-plugin-iconify`
- **What:** Neither package is imported anywhere in `src/` (verified: 0 hits each).
  `@pathscale/rsbuild-plugin-iconify` is imported only by `rslib.config.ts:1`, which is build
  configuration and never ships (`files: ["dist"]`). `@iconify/tailwind4` is a Tailwind plugin the
  *playground* loads via `@plugin "@iconify/tailwind4"` in `playground/src/index.css:5`; it also
  appears in `playground/package.json` already. The icon pipeline is fully build-time: it emits
  the committed `src/styles/icons/generated-icons.css` (7.9 KB, 14 icons), which is what actually
  ships.
- **Why it matters:** Every consumer installs an rsbuild plugin and a Tailwind plugin they will
  never execute. It also mislabels the trust surface: an rsbuild plugin is a code-execution
  dependency of a build, and declaring it as a runtime dep of a UI library invites it into
  environments that never build anything.
- **Fix:** Move both to `devDependencies`. If a consumer genuinely needs `@iconify/tailwind4` to
  extend the icon set, declare it as an *optional peer* and say so in the README, rather than a
  hard runtime dep. Mechanical.
- **Effort:** S
- **Blast radius:** `package.json`, `bun.lock`. `rslib.config.ts` keeps resolving the plugin from
  `devDependencies`, so the build is unaffected.

### [SEV-6] Dark theme is a byte-identical copy of light below the colour block

- **ID:** `ui-theming-css-build-perf-06`
- **Severity:** Medium
- **Category:** Correctness | Design
- **Confidence:** High
- **Location:** `src/styles/themes/light.css:88-135` vs `src/styles/themes/dark.css:87-134`
  (verified byte-identical with `diff`)
- **What:** 48 lines are duplicated verbatim between the two themes: the daisy aliases
  (`--b1`…`--bc` are aliases so they follow, fine), all six structural tokens
  (`--radius-selector/field/box`, `--size-selector/field`, `--border`, `--depth`, `--noise`), and
  the entire ~35-token `--glass-*` set. Concretely, `dark.css:103` says
  `--glass-background-color: white`, `:123` says `--glass-rim-end-color: white`, and `:132` says
  `--glass-shadow-depth: 0 8px 32px rgb(0 0 0 / 10%)`.
- **Why it matters:** GlassPanel and GlowCard have no dark mode. A "glass" surface in dark theme
  gets a white tint, white rim highlights, white edge highlights, and a shadow tuned for a light
  background (10% black on a `gray-900` page is invisible, so the panel has no depth separation at
  all). This is the single biggest visual gap in the theme system, and it is invisible in review
  because the two files look "complete" side by side.
  Separately, `--glass-background-opacity: 0.96%` (both files, line 105/104) is suspicious: the
  fallback baked into `GlassPanel.css:6` is `38%`, and 0.96% is effectively fully transparent. I
  could not determine whether that is a deliberate near-invisible tint or a
  `0.96` → `0.96%` unit slip, so treat that sub-point as **Low confidence** and confirm visually.
- **Fix:** Two moves. (a) Split the shared, theme-invariant tokens (`--radius-*`, `--size-*`,
  `--border`, `--depth`, `--noise`) into a third file, `src/styles/themes/shared.css` in
  `@layer theme` under `:root`, imported once, because they are structural, not theme-dependent, and
  duplicating them guarantees they drift. (b) Actually author the dark glass values: at minimum
  `--glass-background-color`, `--glass-highlight-color`, `--glass-rim-end-color` and
  `--glass-shadow-depth` need dark-appropriate values. (b) needs a designer, not a mechanical edit.
- **Effort:** S for (a), M for (b).
- **Blast radius:** Both theme files plus a new shared file; visual change limited to GlassPanel,
  GlowCard and anything reading `--glass-*` when `data-theme="dark"`.

### [SEV-7] The token layer stops at colour: focus, disabled, radius and z-index are raw literals

- **ID:** `ui-theming-css-build-perf-07`
- **Severity:** Medium
- **Category:** Design
- **Confidence:** High
- **Location:** across `src/components/*/*.css`. Counts from the tree at `85614f1`:
  - **Focus ring:** 27 `outline:` declarations under `:focus-visible`, in 6 different colours:
    `var(--color-accent)` ×17, `currentColor` ×4, `var(--color-base-content)` ×3,
    `var(--color-primary)` ×1, `color-mix(in oklab, var(--color-primary) 72%, transparent)` ×1,
    and the same at `70%` ×1. `outline-offset` is `2px` ×26, `1px` ×1, `-1px` ×1.
  - **Disabled:** 10 distinct opacity values: `0.5` ×15, `0.55` ×10, `0.45` ×5, `0.6` ×4,
    `0.65` ×3, `0.7` ×2, `0.4` ×2, plus `0.85`/`0.9`/`1`.
  - **Radius:** 158 `border-radius` declarations; only 24 use `--radius-field` and 3 use
    `--radius-box`. `--radius-selector` is defined in both themes and used by **zero** components.
    Hardcoded literals: `9999px` ×51, `0.5rem` ×11, `1rem` ×10, `1.5rem` ×10, `0.75rem` ×8,
    `4px` ×4, `0.375rem` ×3, `1px` ×2, `3px`, `0.25rem`.
  - **Z-index:** 13 distinct raw values (`9999` ×2, `80` ×3, `52`, `51` ×2, `50` ×5, `40`, `30` ×2,
    `10` ×6, `2`, `1` ×9, `0` ×3, `-1`), plus `var(--z-overlay, 70)` ×5 where **`--z-overlay` is
    defined nowhere in the repo** and therefore always falls back to 70.
  - **Transitions:** 8 distinct durations (`150ms` ×19, `250ms` ×9, `200ms` ×8, `300ms` ×7,
    plus `160ms`, `120ms`, `100ms`, `0.3s`).
  - **Dead tokens:** 25 of 97 defined theme tokens are referenced by no CSS in the repo: the
    entire 14-token legacy `--color-bg-*`/`--color-fg-*` family, `--b1`, `--b3`, `--bc`,
    `--radius-selector`, `--size-selector`, `--size-field`, `--border`, `--noise`,
    `--glass-glow-ring-opacity`, `--glass-liquid-edge-size`, `--glass-liquid-inner-blur`.
  - **Phantom tokens:** 18 custom properties are read with a fallback but **set nowhere**:
    `--disabled-opacity`, `--cursor-disabled`, `--cursor-interactive`, `--border-width-field`,
    `--card-fg`, `--card-padding`, `--card-radius`, `--glass-refraction-color`,
    `--glass-depth-color`, `--glass-bottom-highlight-color`, and the six `*-group-bg*` families.
    They read as themeable knobs but nothing can be themed through them because they are never
    part of the token contract.
- **What:** Colour is properly tokenized and heavily used (`--color-base-content` ×235,
  `--color-accent` ×109). Every other design axis was written by hand per component.
- **Why it matters:** A consumer cannot restyle the focus ring, the disabled treatment, or the
  corner radius of this library, because there is no token to set: they would have to override 27,
  44 and 135 declarations respectively. Overlay stacking is unsolvable from outside: a consumer
  with an app-level sticky header at `z-index: 100` will cover the Modal but not the Toast, and
  there is no documented scale to reconcile against. And the drift is already visible to users:
  three different focus-ring colours means keyboard focus changes colour as you tab across a form.
- **Fix:** Add a `--focus-ring-color` / `--focus-ring-width` / `--focus-ring-offset` triple,
  `--disabled-opacity`, `--duration-fast/base/slow`, and a real `--z-*` scale
  (`--z-dropdown/-sticky/-overlay/-modal/-popover/-toast`) to **both** theme files, then convert
  component CSS to them. Do it as one mechanical sweep per axis, not per component, so the
  intermediate states are reviewable. Delete the 25 dead tokens and either define or delete the
  18 phantom ones. Adding `--z-overlay` to the themes is a one-line bug fix that should happen
  regardless. The choice of canonical values (which of the 10 disabled opacities wins) is a
  design decision.
- **Effort:** L
- **Blast radius:** Most of the 88 component CSS files, plus both theme files. Visually a no-op
  if the canonical values are chosen to match the majority case, but it changes 3 focus-ring
  colours and ~9 disabled opacities by definition, so it needs a visual pass.

### [SEV-8] Six copies of the field-surface token pattern, two of which have drifted into a visible bug

- **ID:** `ui-theming-css-build-perf-08`
- **Severity:** Medium
- **Category:** Design | Correctness
- **Confidence:** High
- **Location:**
  `src/components/text-area/TextArea.css:74,79,85,89`,
  `src/components/number-field/NumberField.css:172,177,183,188`,
  `src/components/search-field/SearchField.css:157,162,168,173`,
  `src/components/date-field/DateField.css:193,198,204,209`,
  `src/components/input-group/InputGroup.css:151,156,161,166`,
  `src/components/input-otp/InputOTP.css:128,133,139`
- **What:** The same four-declaration block (rest / hover / focus / focus-within background) is
  written six times, each inventing its own undefined private token prefix. Four of the six use
  the same chain:
  ```css
  background-color: var(--textarea-bg, var(--color-default, var(--color-base-200)));
  background-color: var(--textarea-bg-hover, var(--color-default-hover, var(--color-base-300)));
  ```
  Two have drifted and skip the `--color-default` layer entirely:
  ```css
  /* InputGroup.css:151 and InputOTP.css:128 */
  background-color: var(--input-group-bg, var(--color-base-200));
  ```
- **Why it matters:** `--color-default` and `--color-base-200` are **different colours in dark
  theme**: `dark.css:59` sets `--color-default: var(--color-gray-700)` while `dark.css:67` sets
  `--color-base-200: var(--color-gray-800)`. So in dark mode an `InputGroup` or `InputOTP` slot
  renders one step darker than a `TextArea`, `NumberField`, `SearchField` or `DateField` sitting
  next to it in the same form. In light mode both resolve close enough (`gray-200` vs `gray-100`)
  that it is easy to miss in review. All 18 prefix tokens are undefined, so none of the six is
  actually themeable.
- **Fix:** Define one pair of real tokens in both themes (`--field-surface`,
  `--field-surface-hover`, `--field-surface-focus`), and replace all six blocks with them. Delete
  the private prefixes. Mechanical once the token names are agreed; the only judgement is whether
  `--color-default` or `--color-base-200` is the intended base (the 4-to-2 majority and the
  HeroUI lineage both say `--color-default`).
- **Effort:** S
- **Blast radius:** Six CSS files, both theme files. Visible colour change for InputGroup and
  InputOTP in dark mode, which is the point.

### [SEV-9] `@layer` order is never declared, and component CSS arrives in import order

- **ID:** `ui-theming-css-build-perf-09`
- **Severity:** Medium
- **Category:** Correctness
- **Confidence:** Medium (needs one consumer-app reproduction to confirm the failure mode)
- **Location:** all 88 `src/components/*/*.css` (88 `@layer components` blocks, 3 `@layer base`,
  2 `@layer theme`); `src/index.css:1-4`; `README.md` Setup snippet. No `@layer a, b, c;` ordering
  statement exists anywhere in the repo (verified).
- **What:** CSS cascade-layer priority is fixed by the order in which layer *names* are first
  seen. Tailwind v4's `@import "tailwindcss"` emits `@layer theme, base, components, utilities;`
  up front, which is what makes `@layer components` land correctly between Preflight and the
  utilities. This library never emits such a statement and instead relies on the consumer's
  Tailwind stylesheet being evaluated first. Whether it is depends purely on module-graph order:
  component CSS reaches the document through 89 `import "./X.css"` statements inside `.tsx` files.
  The playground gets it right by accident: `playground/src/index.tsx:3` has
  `import "./index.css"` (which starts with `@import "tailwindcss"`) *before* `import App`. The
  README's own Setup snippet gets it backwards:
  ```tsx
  import { Button, Flex } from "@pathscale/ui";   // ← all component CSS registers here
  import "@pathscale/ui/index.css";               // ← theme + base register after
  ```
- **Why it matters:** If `@layer components` is registered before Tailwind's ordering statement,
  the resulting order is `components, theme, base, utilities`, so `base` (Preflight) then outranks
  every component style. Preflight's `button { background-color: transparent; }` would beat
  `.button { background: var(--color-primary) }`. The symptom is "the library looks fine in one
  app and unstyled in another, for no reason anyone can find", and it is sensitive to unrelated
  import reordering, so it is a nightmare to bisect.
- **Fix:** Cheap and mechanical: emit `@layer theme, base, components, utilities;` as the first
  line of `src/index.css`, and also as the first line of every shipped component CSS file (a
  repeated ordering statement is idempotent, since the first one wins and later ones are no-ops). That
  makes each component stylesheet self-describing regardless of arrival order. A generation step
  in the build (or a `check-contracts.ts` rule requiring the line) keeps it from regressing.
  Also fix the README snippet to import the stylesheet first.
- **Effort:** S
- **Blast radius:** 89 CSS files (one prepended line each) plus the README. No API change. Should
  be verified once in a real Tailwind v4 consumer app before and after.

### [SEV-10] The `@theme` block redeclares 56 tokens, self-referentially, with conflicting values

- **ID:** `ui-theming-css-build-perf-10`
- **Severity:** Medium
- **Category:** Maintainability | Correctness
- **Confidence:** Medium (the specificity analysis is solid; whether Tailwind's emission order
  saves it in practice needs a compiled-CSS check)
- **Location:** `src/index.css:6-77` vs `src/styles/themes/light.css:1-135` and
  `src/styles/themes/dark.css:1-135`
- **What:** The `@theme` block declares 56 variables, 51 of which are written as
  `--color-primary: var(--color-primary);`, self-referential placeholders whose real values come
  from the theme files. The intent is clear (tell Tailwind these names exist so `bg-primary` gets
  generated) but the mechanism is fragile:
  - **Self-reference is a CSS cycle.** `--x: var(--x)` is invalid at computed-value time and
    resolves to guaranteed-invalid, i.e. unset. It only works because a higher-priority
    declaration overrides it. For light, `:root:not([data-theme])` is specificity (0,2,0) and beats
    `@theme`'s `:root` (0,1,0). For **dark, `[data-theme="dark"]` is (0,1,0), a tie with `:root`**,
    so the winner is decided by source order inside `@layer theme`, which is Tailwind's emission
    order, not something this repo controls.
  - **A custom `data-theme` value breaks everything.** `:root:not([data-theme])` stops matching the
    moment a consumer sets any attribute value other than `"light"`/`"dark"`, including their own
    third theme, which the `dataTheme` prop and the daisy-style tokens actively invite. At that
    point the only surviving declaration is the self-referential cycle and every colour token
    becomes unset.
  - **Five tokens contradict the theme files.** `index.css:67` says
    `--color-bg-tertiary: var(--color-neutral)` while `light.css:77` says `var(--color-gray-300)`;
    `index.css:74` says `--color-fg-primary: var(--color-base-content)` while `light.css:83` says
    `var(--color-gray-800)`; likewise `--color-fg-secondary`, `--color-fg-positive` and
    `--color-fg-destructive`. Two sources of truth for the same names.
  - Asymmetry in both directions: `--color-bg-inverse`/`--color-fg-inverse` are defined in the
    themes but absent from `@theme` (so no `bg-inverse` utility), while 44 tokens
    (all `--glass-*`, `--radius-*`, `--size-*`, `--b1`…`--bc`) are in the themes and absent from
    `@theme`.
- **Why it matters:** Theming is the library's headline feature and its correctness currently
  rests on an undocumented specificity coincidence. The custom-`data-theme` case is the one most
  likely to bite: it is exactly what a consumer building a third theme will do, and the failure
  is total (every colour unset), not partial.
- **Fix:** Three changes, all mechanical, one design call.
  1. Change the theme selectors from `:root:not([data-theme])` to `:root, [data-theme="light"]`
     and accept that a custom theme inherits light as its base. This removes the cliff.
  2. Give `@theme` real values instead of self-references: put the light palette there once and
     let `[data-theme="dark"]` override it. That is the idiomatic Tailwind v4 shape and removes
     the cycle entirely.
  3. Delete the five contradicting legacy aliases from `@theme` (or from the themes) so each
     token has one definition site. Given finding SEV-7 shows the whole `--color-bg-*`/`--color-fg-*`
     family has zero references, deleting it outright is the better move.
  Verify by compiling the playground and grepping the output CSS for
  `--color-primary: var(--color-primary)`.
- **Effort:** M
- **Blast radius:** `src/index.css` and both theme files. Potentially breaking for any consumer
  currently overriding tokens by matching `:root:not([data-theme])`.

### [SEV-11] `useAnchoredOverlayPosition` runs unbatched layout reads on every scroll event

- **ID:** `ui-theming-css-build-perf-11`
- **Severity:** Medium
- **Category:** Performance
- **Confidence:** High
- **Location:** `src/hooks/table/useAnchoredOverlayPosition.ts:88-103`; compare
  `src/components/_shared/overlayPosition.ts:203-211`
- **What:** Two parallel implementations of the same job. The `_shared` one batches:
  ```ts
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
  window.addEventListener("scroll", schedule, true);
  ```
  The table one does not:
  ```ts
  const onViewportChange = () => updatePosition();
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, true);
  ```
  `updatePosition` reads `getBoundingClientRect()` on the trigger and overlay, then writes an
  inline style object.
- **Why it matters:** `capture: true` on `window` means this fires for **every** scroll event in
  the document, including every nested scroller, not just the window. Each invocation does a
  read-then-write against layout, which forces synchronous layout on the next read. A table filter
  popover open inside a scrollable table body therefore forces a layout flush per scroll event
  rather than per frame. On a trackpad that is comfortably 100+ forced reflows per second, on the
  main thread, while the user is scrolling a data grid. This is exactly the drift the rAF batching
  in the `_shared` twin was added to prevent.
- **Fix:** Copy the `schedule` pattern from `_shared/overlayPosition.ts` (cancel + request one rAF).
  Better: delete `useAnchoredOverlayPosition` and have the table popovers use
  `createOverlayPosition` from `_shared`, which already handles flip, clamp and
  `matchTriggerWidth`. `CLAUDE-INTERNALS.md:82` calls the table version "the parallel
  `useAnchoredOverlayPosition`" without noting that it is strictly worse.
- **Effort:** S for the rAF fix, M for the consolidation.
- **Blast radius:** One hook file for the quick fix; the table filter popovers for the
  consolidation. No public API change (the hook is not in the exports map).

### [SEV-12] `invokeEventHandler` is copy-pasted into 25 files in two already-divergent variants

- **ID:** `ui-theming-css-build-perf-12`
- **Severity:** Medium
- **Category:** AI-smell | Design
- **Confidence:** High
- **Location:** 25 files. Variant A (16 copies, `(handler: unknown, event: Event)`) in
  `tabs/Tabs.tsx`, `color-swatch/ColorSwatch.tsx`, `tag/Tag.tsx`,
  `color-swatch-picker/ColorSwatchPicker.tsx`, `card/Card.tsx`, `toast/Toast.tsx`,
  `select/Select.tsx`, `dropdown/Dropdown.tsx`, `table/Table.tsx`, `menu/Menu.tsx`,
  `menu/MenuItem.tsx`, `list-box/ListBox.tsx`, `list-box/ListBoxItem.tsx`,
  `accordion/Accordion.tsx`, `combo-box/ComboBox.tsx`, `color-field/ColorField.tsx`.
  Variant B (9 copies, generic `<T extends Event>(handler: unknown, event: T)`) in
  `input-group/InputGroup.tsx`, `date-field/DateField.tsx`, `input-otp/InputOTP.tsx`,
  `search-field/SearchField.tsx`, `number-field/NumberField.tsx`, `time-field/TimeField.tsx`,
  `toggle/Toggle.tsx`, `checkbox/Checkbox.tsx`, `radio/Radio.tsx`.
  `sortItemsByDomOrder` is separately duplicated in `dropdown/Dropdown.tsx`,
  `list-box/ListBox.tsx` and `menu/Menu.tsx`.
- **What:** A 6-line helper that unwraps Solid's `[fn, data]` bound-handler form, pasted 25 times.
  The two variants are semantically identical but typed differently, which is the tell that they
  were edited independently after the copy.
- **Why it matters:** Any fix to Solid's bound-handler semantics (or to the `Array.isArray` guard,
  which currently misfires on any array-valued prop whose first element happens to be a function)
  must land in 25 places, and a reviewer has no way to know all 25 exist. `src/lib/` already exists
  and is the obvious home. Note also that `ANALYSIS.md:60` and `CLAUDE-INTERNALS.md:85` both say
  "~6 files"; the real number is 25, so the docs understate the cost by 4×.
- **Fix:** Add `export const invokeEventHandler = <T extends Event>(handler: unknown, event: T)`
  to `src/lib/props/` (or a new `src/lib/events.ts`), export it from the barrel if consumers need
  it, and replace all 25 definitions with imports. Same for `sortItemsByDomOrder` into
  `src/lib/` or `src/components/_shared/`. Add a `check-contracts.ts` rule forbidding a local
  redefinition of either name so it cannot regress. Fully mechanical.
- **Effort:** M (25 files, but each edit is a delete-and-import)
- **Blast radius:** 25 component files plus one new lib module. No public API change. Also fix the
  count in `ANALYSIS.md:60` and `CLAUDE-INTERNALS.md:85`.

### [SEV-13] No `prefers-color-scheme` support: dark mode requires JavaScript

- **ID:** `ui-theming-css-build-perf-13`
- **Severity:** Low
- **Category:** Design
- **Confidence:** High
- **Location:** `src/styles/themes/dark.css:2` (`[data-theme="dark"]` is the only selector);
  `README.md` Theming section (`document.documentElement.setAttribute("data-theme", "dark")`)
- **What:** Dark theme activates only via an explicit `data-theme` attribute. There is no
  `@media (prefers-color-scheme: dark)` block anywhere in `src/styles/`.
- **Why it matters:** Every consumer must ship their own theme-detection script, and every
  consumer that does will have a light flash on first paint unless they inline a blocking script
  in `<head>`. It also means SSR output is always light regardless of the user's OS preference.
  This may well be deliberate (the `dataTheme` per-subtree prop implies attribute-driven theming
  is the intended model) but it is not documented as a decision, and the cost lands on every
  consumer identically.
- **Fix:** Add an opt-in stylesheet, e.g. `src/styles/themes/auto.css`, containing
  `@media (prefers-color-scheme: dark) { :root:not([data-theme]) { /* dark token block */ } }`,
  exported as `@pathscale/ui/styles/themes/auto.css` and documented in the README. Opt-in avoids
  breaking consumers who already do their own detection. Requires the dark token block to be
  factored out first (see SEV-6's shared-file split), so sequence it after that.
- **Effort:** S (after SEV-6)
- **Blast radius:** One new stylesheet, one exports-map entry (already covered by the
  `./styles/*` wildcard), README. Non-breaking.

### [SEV-14] Unguarded `localStorage` access crashes components where storage is blocked

- **ID:** `ui-theming-css-build-perf-14`
- **Severity:** Low
- **Category:** Correctness
- **Confidence:** Medium (the throwing behaviour is browser/config dependent)
- **Location:** `src/components/size-picker/sizeStore.ts:26,36`;
  `src/components/immersive-landing/components/PWAInstallPrompt.tsx:41,48,84`;
  `src/components/immersive-landing/components/FirefoxPWABanner.tsx:93,101`;
  `src/components/immersive-landing/components/CookieConsent.tsx:146,151,154-158,167-168,184-185,196-197`
- **What:** All four modules call `localStorage.getItem`/`setItem` directly. `sizeStore.ts:25`
  guards `typeof window === "undefined"` for SSR, which is correct, but nothing guards the case
  where `window` exists and storage access *throws*: Safari with "Block all cookies", Chrome with
  third-party-storage blocking in an iframe, and Firefox ETP all raise `SecurityError` on the
  property access itself.
- **Why it matters:** The throw happens during render (`getInitial()` at
  `sizeStore.ts:31`) or inside `createEffect`, so it takes down the component tree rather than
  degrading. A cookie-consent banner that crashes when cookies are blocked is a particularly
  unfortunate failure mode.
- **Fix:** One shared `src/lib/storage.ts` with `safeGet(key)` / `safeSet(key, value)` wrapping
  both in `try/catch` and returning `null` / silently no-op'ing. Replace all 4 call sites'
  modules. Mechanical.
- **Effort:** S
- **Blast radius:** Four modules plus one new lib file. No API change.

### [SEV-15] `getDefaultSizeStore()` creates a `createEffect` outside any reactive root, and mutates the root font size

- **ID:** `ui-theming-css-build-perf-15`
- **Severity:** Low
- **Category:** Correctness | Design
- **Confidence:** Medium (depends on where a consumer calls it; nothing in `src/` calls it)
- **Location:** `src/components/size-picker/sizeStore.ts:18-19,32-38,47-53`; exported publicly at
  `src/index.ts:814-815`
- **What:** `getDefaultSizeStore()` lazily calls `createSizeStore("theme")`, which calls
  `createEffect`. Nothing inside the library calls it; it exists solely as a public export. The
  name and shape ("get the default singleton") invite a module-scope call in consumer code, which
  in Solid means the effect is created outside `createRoot`/`render` and is never disposed (Solid
  logs "computations created outside a `createRoot` or `render` will never be disposed"). The
  effect body also calls `applySize`, which sets
  `document.documentElement.style.fontSize = "112.5%"`, a global mutation of the consumer's root
  font size, i.e. it rescales their entire application including everything not built with this
  library.
- **Why it matters:** The leaked-computation case is a warning plus a permanently-live effect, not
  a crash, so it will be shipped and ignored. The root-font-size mutation is the bigger surprise:
  a component library changing `html { font-size }` is a very large blast radius for something
  reachable from a `<SizePicker>`, and it is not mentioned in the README or `docs/ui-usage.md`.
- **Fix:** Wrap the singleton construction in `createRoot(() => createSizeStore("theme"))` so the
  effect has an owner. Separately, document the root-font-size behaviour prominently, or scope it
  to an opt-in container element instead of `document.documentElement`. The first is mechanical;
  the second is a design decision.
- **Effort:** S for the root wrap, M for rescoping.
- **Blast radius:** One module. Rescoping would be a behaviour change for existing SizePicker users.

### [SEV-16] The build shells out to a non-exported `.ts` file inside another package

- **ID:** `ui-theming-css-build-perf-16`
- **Severity:** Low
- **Category:** Maintainability
- **Confidence:** High
- **Location:** `package.json` `postbuild:manifest`:
  `bun run node_modules/@pathscale/rsbuild-plugin-ui-css-purge/src/generate-manifest.ts src/components --out dist/purge-manifest.json`;
  `.github/workflows/ci.yml:15-21` and `.github/workflows/release.yml:82-88`
- **What:** The manifest step reaches into a dependency's `src/` directory by hard-coded path and
  executes a TypeScript file that is not a declared entry point of that package. CI additionally
  checks the plugin out as a sibling repository and symlinks it to `../rsbuild-plugin-ui-css-purge`,
  which is a *different* resolution path from the `node_modules` one the script uses.
- **Why it matters:** Nothing stops `@pathscale/rsbuild-plugin-ui-css-purge` from moving, renaming
  or compiling away `src/generate-manifest.ts` in a patch release, at which point `bun run build`
  fails at the last step with a file-not-found and no clear owner. The two-path setup (symlinked
  sibling in CI, `node_modules` in the script) also means a local build and a CI build can be
  exercising different code without anyone noticing.
- **Fix:** Ask the plugin to expose a `bin` entry or an `./generate-manifest` subpath export, and
  call that. Failing that, pin the plugin to an exact version rather than `^0.9.11`, since the
  contract being relied on is a private file path. Also reconcile the CI symlink with the
  `node_modules` path so there is one resolution story.
- **Effort:** S
- **Blast radius:** `package.json`, two workflows, and a coordinated change in the plugin repo.

### [SEV-17] Tests exist, cover the trickiest pure logic, and are never run

- **ID:** `ui-theming-css-build-perf-17`
- **Severity:** Low
- **Category:** Maintainability
- **Confidence:** High
- **Location:** `tests/motion/Presence.test.ts`, `tests/motion/AnimatedCollapse.test.ts`,
  `tests/hooks/form/createForm.test.ts`, `tests/components/password-field/PasswordField.test.tsx`;
  `package.json` `scripts` (no `test` entry); `.github/workflows/ci.yml` (no test step);
  `.github/workflows/release.yml` (no test step)
- **What:** Four test files, none invoked by any script or workflow. `tsconfig.json` `include` is
  `src/**` only, so `tsc --noEmit` does not typecheck them either.
- **Why it matters:** `CLAUDE-INTERNALS.md:113` states that
  `createValidationLogic` re-running blur validators on change is deliberate and is "locked by
  `tests/hooks/form/createForm.test.ts`, don't simplify". It is not locked by anything: the test
  never runs, in CI or in the release pipeline. The same applies to the `nextPresenceState` and
  `nextCollapsePhase` state machines, which are exactly the kind of pure logic where a regression
  is silent. The release workflow publishes to npm irreversibly without ever executing them.
- **Fix:** Add `"test": "bun test"` to `package.json` and a test step to both `ci.yml` and
  `release.yml` (before the publish gate). Extend `tsconfig.json` `include` to cover `tests/**` or
  add a second tsconfig for them. Run them once first to confirm they currently pass. Mechanical,
  assuming they pass.
- **Effort:** S
- **Blast radius:** `package.json`, two workflows, `tsconfig.json`.

### [SEV-18] Repo docs describe several problems that are already fixed, and undercount one that is not

- **ID:** `ui-theming-css-build-perf-18`
- **Severity:** Low
- **Category:** Docs
- **Confidence:** High
- **Location:** `ANALYSIS.md:57` (`./stores`), `ANALYSIS.md:58` (stale README),
  `ANALYSIS.md:60` and `CLAUDE-INTERNALS.md:85` (`invokeEventHandler` "~6 files"),
  `CLAUDE-INTERNALS.md:129` (`./stores` dangling), `CLAUDE-INTERNALS.md:130` (README stale),
  `CLAUDE-INTERNALS.md:31` ("Versioning: manual bare-version commits; publish is manual")
- **What:** Four stale claims, verified against the tree at `85614f1`:
  - `./stores` is **no longer** in `package.json` `exports`; it was removed and
    `scripts/check-package.ts` now gates against exactly this class of regression.
  - The README no longer mentions `dist/styles/compat/daisy-primitives.css` or `docs/motion.md`;
    it was rewritten in `8756b19`.
  - Publishing is **no longer manual**: `.github/workflows/release.yml` (added `03f1dbe`,
    `bde6c0e`) publishes automatically on push to master via npm Trusted Publishing, deriving the
    version from conventional commits.
  - `invokeEventHandler` is in **25** files, not ~6 (see SEV-12).
  The Surge token entry at `ANALYSIS.md:56` is, unfortunately, still accurate.
- **Why it matters:** `AGENTS.md` states "Docs describe what is true now" as an invariant, and both
  these files are loaded into every agent session as primary context. An agent reading
  `CLAUDE-INTERNALS.md:31` will believe publishing is manual and may hand-edit a version, which
  the automatic release workflow will then act on. An agent reading "~6 files" will fix
  `invokeEventHandler` in six places and believe it is done.
- **Fix:** Update all four claims. While there, `CLAUDE-INTERNALS.md:28` says CSS is "copied
  verbatim (not processed)" which is accurate and worth keeping; the "known leak" note at
  `:31`/`:128` should stay until SEV-1 is actually resolved.
- **Effort:** S
- **Blast radius:** Two docs.

## Cross-cutting recommendations

1. **Finish the token layer, one axis at a time.** Colour is done well; focus, disabled, radius,
   duration and z-index are not (SEV-7). Do them as five separate mechanical sweeps: add the
   tokens to both theme files, then convert component CSS with a scripted find-and-replace and a
   visual diff per sweep. Start with z-index, because `--z-overlay` is currently referenced and
   undefined and overlay stacking is the axis a consumer is most likely to need and least able to
   fix from outside. What breaks: any consumer overriding the current literals will find their
   overrides now competing with a variable instead of a value, so this belongs in a minor release
   with a note.

2. **Split the theme files into `shared` + `light` + `dark`, then actually author dark.** 48 lines
   are currently duplicated byte-for-byte (SEV-6). The structural tokens are theme-invariant and
   belong in a `:root` block in a third file; the glass tokens are theme-*dependent* and are
   currently just wrong in dark mode. Doing the split first makes the dark-glass work a small,
   reviewable diff instead of a 35-line stare-down. What breaks: nothing mechanically; the glass
   components change appearance in dark mode, which is the intent.

3. **Decide whether Tailwind is a hard requirement, and make the answer true.** Today the answer is
   "yes, plus an undocumented `@source` into node_modules" for 16 components (SEV-3), and "no,
   optional" per the README. Either give those components real CSS quartets and make Tailwind
   genuinely optional, or state the requirement loudly and add `@source` to every setup doc and to
   `scripts/smoke-consumer.ts`. Also add "has a `.css` file" to `check-contracts.ts` if you pick
   the first. This is the finding most likely to be generating support questions right now.

4. **Create `src/lib/` homes for the three duplicated helpers and enforce it in the contract
   check.** `invokeEventHandler` ×25 in two variants, `sortItemsByDomOrder` ×3, and the body-scroll
   lock ×2 (SEV-4, SEV-12). The contract script already runs on every build and already reads every
   component file; adding "this identifier must be imported, not redefined" is a handful of lines
   and permanently closes the category. What breaks: nothing; all three helpers are internal.

5. **Make the shipped CSS self-describing about layer order.** Prepending
   `@layer theme, base, components, utilities;` to `src/index.css` and to every component CSS file
   costs one line each and removes an entire class of "works in my app, not in theirs" bugs
   (SEV-9). Pair it with fixing the README's Setup snippet, which currently demonstrates the
   fragile order. Cheapest high-leverage change in this review.

6. **Close the gap between what CI runs and what ships.** Tests never run (SEV-17), the consumer
   smoke test is `continue-on-error: true` in `release.yml`, and `publint --strict` is the only
   blocking package gate. Given publishing is now fully automatic and irreversible, promote the
   smoke test to blocking (its comment says "once it has run green a few times"; check whether it
   has) and add `bun test`. What breaks: releases will start failing on real problems, which is the
   point, but do it on a quiet day.

## What I did not cover

- **Component prop APIs, a11y, keyboard behaviour and ARIA.** Sibling slice. I read component
  `.tsx` files only for reactivity patterns, DOM side effects and class-string emission.
- **I did not run `bun run build`.** `node_modules` is not installed in this working copy and the
  build requires `@pathscale/rsbuild-plugin-ui-css-purge` resolvable at a sibling path. Everything
  about the *emitted* `dist/` is therefore inferred from `rslib.config.ts` and `package.json`, not
  observed. In particular I could **not** verify the claim in `scripts/smoke-consumer.ts:88-90`
  that the shipped `.d.ts` files contain CSS side-effect imports producing 178 TS2882 errors under
  `skipLibCheck: false`. I did run `tsc --emitDeclarationOnly` directly and it produced **no** CSS
  imports and no Bun `Timer` leakage, which suggests the problem is specific to rslib's dts
  pipeline rather than to the source. A follow-up agent with a working build should check
  `dist/**/*.d.ts`. If the imports are there, consumers with `skipLibCheck: false` are affected
  and the fixture is hiding it rather than testing it.
- **No browser verification of any CSS finding.** The cascade-layer analysis (SEV-9) and the
  `@theme` specificity analysis (SEV-10) are read from the source and from the CSS spec, not from
  a rendered page. Both are marked Medium confidence for that reason.
- **Bundle size was not measured.** I counted source bytes (21 KB always-shipped CSS, 286 KB
  tree-shakeable component CSS, ~38 K lines of TS/TSX) but did not build a consumer app and
  measure what actually lands in a bundle. The `dist/purge-manifest.json` mechanism and the
  `@pathscale/rsbuild-plugin-ui-css-purge` consumer plugin were not exercised at all.
- **`playground/`** was read only for how it configures Tailwind and CSS import order. Its
  ~7,300-line `App.tsx` was not reviewed; it is not shipped.
- **`src/motion/` and `src/components/metal-border/engine/`** were read for module-scope side
  effects and the `innerHTML` sink only. The WebGL renderer's per-frame cost, the
  `GLOW_READBACK_INTERVAL_MS` throttle that `CLAUDE-INTERNALS.md:105` says is not applied, and the
  shader code were not evaluated.
- **`bun.lock` was checked for the self-dependency and nothing else.** No transitive audit, no
  check for `postinstall` scripts in the dependency tree (I confirmed this package has none).

## Quick-start for the follow-up agent

Read in this order:

1. `src/index.css` (77 lines) then `src/styles/themes/light.css` and `dark.css`. The entire token
   contract lives in these three files, and the relationship between them is the subject of SEV-6,
   SEV-7, SEV-10 and SEV-13.
2. `package.json`: the exports map, `sideEffects`, and the three wrong `dependencies` (SEV-2,
   SEV-5).
3. `rslib.config.ts` (48 lines): explains why `dist` mirrors `src`, why CSS is copied verbatim,
   and why every component CSS file must stand alone (SEV-9).
4. `scripts/check-contracts.ts`: the build gate. Three of the recommendations propose extending
   it; read what it currently enforces before proposing more.
5. `src/components/modal/Modal.tsx:59-88` next to `src/components/drawer/Drawer.tsx:40-65`: the
   clearest example of this repo's dominant failure mode, which is copy-paste that later diverges.

Commands that work in this checkout (no `node_modules` present):

```bash
git -C /Users/revenge/code/UI rev-parse --short HEAD
diff <(sed -n '88,135p' src/styles/themes/light.css) <(sed -n '87,134p' src/styles/themes/dark.css)  # SEV-6: silent
rg --no-filename -o "z-index: [^;]+;" src/components --glob '*.css' | sort | uniq -c | sort -rn      # SEV-7
rg -n -- "--z-overlay\s*:" src                                                                        # SEV-7: no hits
for d in src/components/*/; do ls "$d"*.css >/dev/null 2>&1 || echo "${d}"; done                      # SEV-3: 17 dirs
rg -l "invokeEventHandler" src | wc -l                                                                # SEV-12: 25
```

Commands that need setup:

```bash
bun install                       # then everything below works
bun run check                     # contract gate, fast
npx tsc --noEmit                  # src only; does not cover tests/
bun test                          # 4 files, not wired into any script or CI
bun run build                     # needs ../rsbuild-plugin-ui-css-purge checked out as a sibling
bun run check:package             # packs a tarball, verifies exports + README imports resolve
bun run smoke                     # installs the tarball into a throwaway consumer and typechecks
bun run playground:dev            # Vite, aliases @pathscale/ui -> ../src, the real dev loop
```

Surprises about this repo worth knowing before you judge anything:

- **`dist` mirrors `src` file-for-file.** `bundle: false` in `rslib.config.ts` means there is no
  bundling step, so "what ships" is almost exactly "what is in `src`". Reasoning about the source
  is reasoning about the artifact, with the sole exception of the d.ts pipeline.
- **CSS reaches consumers through JS, not through `index.css`.** `src/index.css` imports only base,
  the two themes and the icons (21 KB total). The 286 KB of component CSS arrives via 89
  `import "./X.css"` statements inside `.tsx` files, which is what makes `sideEffects: ["**/*.css"]`
  and tree-shaking work. This is a good design and it is easy to misread as broken.
- **Tailwind is never run by this repo's build.** `@theme`, `@layer` and `@source` in the shipped
  CSS are resolved by the *consumer's* Tailwind v4 pipeline. That is why so many findings here are
  about things this build cannot check.
- **The playground is the only place the theme system is exercised end to end**, and it configures
  Tailwind in a way no npm consumer can replicate (`@source "../../src"`). Any theming or styling
  claim verified only in the playground should be treated as unverified for real consumers.
- **Releases are fully automatic** on push to master (`.github/workflows/release.yml`), version
  derived from conventional commits, published via OIDC trusted publishing. `CLAUDE-INTERNALS.md`
  still says publishing is manual; it is not. Be careful what you push.

## Nits

- `scripts/copy-css.js` is dead (superseded by rslib's `output.copy`); delete it.
- `src/lib/style/classes.ts` (a homegrown `cva`) is imported by zero components; delete or adopt.
- `cally` is an unused devDependency (grep hits are the word "automatically").
- `tsconfig.json` sets `"types": ["bun"]` while `include` is `src/**` only; `src/` uses no Bun
  globals, and the tests that would need them are excluded. Drop it, or move it to a tests tsconfig.
- `package.json` has both `main` and `module` pointing at `./dist/index.js`; with `"type": "module"`
  and an `exports` map, both are legacy noise for any modern resolver.
- `exports` declares both `"./styles/*"` and `"./dist/styles/*"` for the same targets; the second
  is a legacy alias that should be deprecated rather than silently maintained.
- `src/components/textarea/` and `src/components/text-area/` both exist and both are exported as
  `Textarea` and `TextArea` (`src/index.ts:782,788`). `Textarea` is a thin alias whose
  `Textarea.classes.ts` is `{ base: "" }`. Confusing enough that someone will style the wrong one.
- `src/components/metal-border/engine/glow/glow.ts:87` uses `svg.innerHTML = buildSvgMarkup(...)`.
  Not exploitable: every interpolated value is an internal number or the internal counter
  `mfxg_${++glowIdSeq}` (`:82`). Worth a comment saying so, since it will trip every future
  security scan.
- `src/components/link/Link.tsx:55` correctly adds `rel="noopener"` for external links. No
  scheme validation on `href` (a `javascript:` URL passes through), which is normal for a UI
  library and is the consumer's responsibility, but is worth one line in `docs/ui-usage.md`.
- `src/hooks/layout/useDesktop.ts:8-14`: unthrottled `resize` handler reading `window.innerWidth`.
  Low impact (one layout read per event, and only while mounted) but `@solid-primitives/media` is
  already a peer dependency and `createMediaQuery` does this correctly for free.
- `src/components/immersive-landing/` ships a `CookieConsent`, a `PWAInstallPrompt` and a
  `FirefoxPWABanner` inside a component library. Not a defect, but it is the one place where the
  library's scope stops being "components" and starts being "an app", and it accounts for 3 of the
  4 unguarded-`localStorage` sites in SEV-14.
- `src/components/immersive-landing/components/PWAInstallPrompt.tsx:78` swallows an error into
  `console.debug`; `src/components/live-chat/LiveChatPanel.tsx:299` logs to `console.error`. A
  library should surface these through a callback prop rather than the consumer's console.
