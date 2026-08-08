# @pathscale/ui Review: AI smell, dead code, tests, docs

**Date:** 2026-07-27
**Scope:** whole repo, breadth-first. `src/**` (419 ts/tsx), `tests/**`, `scripts/**`,
`.github/workflows/**`, `package.json`, `biome.json`, and every markdown file:
`CLAUDE.md`, `AGENTS.md`, `CLAUDE-INTERNALS.md`, `ANALYSIS.md`, `CONTRIBUTING.md`,
`README.md`, `docs/**`.
**Commit:** Revalidated at `aa4fb58`; source findings were originally measured at `85614f1`.
**Reviewer slice:** `ai-smell-deadcode-tests-docs`. Sibling slices cover the component prop
API and the CSS/build pipeline; I do not re-derive those.

## Summary

- **The code itself is unusually disciplined.** Zero `TODO`/`FIXME`/`XXX`/`HACK` in 419
  source files. 232 line comments total, mostly explaining *why*. Only 12 hand-written
  `any`, 11 of them with a specific `biome-ignore` justification. The 29 tests that exist
  are real behavioural tests, not tautologies. This is not a slop repo.
- **The scaffolding around the code is the problem.** Neither the test suite nor Biome runs
  in CI. `bun run lint` and `bun run format` are `--write`, so they cannot gate anything and
  an agent following `AGENTS.md` will silently rewrite 249 files. Biome currently reports
  **79 errors + 109 warnings** in `src/` and **249 files** needing formatting.
- **The internal docs agents are told to read first are materially stale**, and stale in the
  direction that costs the most: four "known issues" listed in `CLAUDE-INTERNALS.md` /
  `ANALYSIS.md` are already fixed, two are undercounted by ~4x, one recommends a helper
  (`mergeRefs`) that nothing uses and that is not exported. `CONTRIBUTING.md`'s
  "non-negotiable" checklist contradicts the codebase on five of its own rules.
- **One real correctness bug fell out of the duplication census**: `Modal` and `Drawer` each
  keep a *separate* module-level `bodyLockCount` over the *same* `document.body.style`, so
  Drawer-then-Modal open/close order leaves the page permanently unscrollable (SEV-1).
- **Dead code is concentrated, not scattered.** `src/lib/` (236 lines, 10 exported symbols,
  5 modules) has **zero** consumers anywhere and is not reachable from the barrel or any
  subpath export. `src/motion/` (1,080 lines) has exactly two internal consumers.
  `scripts/copy-css.js`, `src/components/password-rules/`, and 3 constants in
  `metal-border/engine/perfConfig.ts` are dead.
- **Top 3 things to do:** (1) fix the Modal/Drawer scroll-lock bug; (2) add a non-mutating
  `check`/`test` gate to `ci.yml` and split `lint`/`lint:fix`; (3) do one honest pass over
  `CLAUDE-INTERNALS.md` + `ANALYSIS.md` + `CONTRIBUTING.md`, because every agent that touches
  this repo starts from them.

---

## Findings

### [SEV-1] `Modal` and `Drawer` keep independent ref-counts over one shared body scroll lock

- **ID:** `ui-aismell-01`
- **Severity:** High
- **Category:** Correctness
- **Confidence:** High (mechanism read directly from source; Medium that an app hits the
  exact ordering, but the ordering is a common one)
- **Location:** `src/components/modal/Modal.tsx:59-88` and `src/components/drawer/Drawer.tsx:40-63`
  (call sites `Modal.tsx:296-313`, `Drawer.tsx:265-280`)
- **What:** Both files declare their own module-level `let bodyLockCount = 0` plus their own
  snapshot vars (`previousBodyOverflow` / `prevBodyOverflow`,
  `previousBodyPaddingRight` / the Drawer equivalent). Both mutate the *same*
  `document.body.style.overflow` and `paddingRight`. The two counters do not know about each
  other, and each snapshots whatever value it finds when *its own* counter goes 0 → 1.
- **Why it matters:** Open a Drawer (snapshots `overflow: ""`, sets `hidden`), then open a
  Modal over it (snapshots `overflow: "hidden"`, sets `hidden`). Close the Drawer: its count
  hits 0 and it restores `""`, so **the page scrolls behind an open modal**. Then close the
  Modal: its count hits 0 and it restores its snapshot `"hidden"`, so **`document.body` is
  left permanently `overflow: hidden` with no overlay open**. The page cannot scroll again
  until reload. The `paddingRight` compensation desyncs the same way, producing a visible
  layout jump. A nav Drawer plus a confirm Modal is an entirely ordinary app shape.
- **Fix:** Extract one shared module, e.g. `src/components/_shared/bodyScrollLock.ts`, with a
  single `bodyLockCount` and a single snapshot pair, and have both components import
  `lockBodyScroll` / `unlockBodyScroll` from it. The per-instance `hasScrollLock` guards in
  both components are already correct and can stay as they are. Mechanical.

  ```ts
  // src/components/_shared/bodyScrollLock.ts
  let count = 0;
  let prevOverflow = "";
  let prevPaddingRight = "";
  export const lockBodyScroll = () => { /* body of Modal.tsx:63-77, verbatim */ };
  export const unlockBodyScroll = () => { /* body of Modal.tsx:79-88, verbatim */ };
  ```

- **Effort:** S
- **Blast radius:** 2 files, no public API change. Add the regression test alongside (the
  helpers are pure enough to drive from `bun:test` with a stubbed `document.body.style`).

---

### [SEV-2] The test suite and the linter gate nothing

- **ID:** `ui-aismell-02`
- **Severity:** High
- **Category:** Maintainability
- **Confidence:** High (executed)
- **Location:** `package.json:126-142`, `.github/workflows/ci.yml:30-39`,
  `.github/workflows/release.yml:120-149`
- **What:** Three separate gaps compound.
  1. **Tests never run.** There is no `test` script in `package.json` and neither `ci.yml`
     nor `release.yml` invokes `bun test`. I ran it: `29 pass, 0 fail, 65 expect() calls`
     across 4 files. They work; nothing enforces that they keep working.
  2. **Biome never runs.** CI runs `bun run check` (which is
     `scripts/check-contracts.ts`, *not* Biome), `npx tsc --noEmit`, and `bun run build`.
     Release adds `check:package`, `publint`, `smoke`. Biome appears in no workflow.
  3. **The lint scripts cannot gate even if wired up.** `"lint": "bun biome lint --write"`
     and `"format": "bun biome format --write"` both *mutate*. A CI step running them would
     apply fixes and exit 0.
- **Why it matters:** The accumulated debt is measurable. `bunx biome lint src` reports
  **79 errors, 109 warnings, 13 infos**; `bunx biome format src` reports **249 files**
  needing reformatting, and **1,240 lines in `src/` exceed the configured
  `lineWidth: 80`** (`biome.json:14`). Concretely among the lint errors: 6 genuinely unused
  imports, 41 `noDescendingSpecificity` in CSS, 14 `noImportantStyles`, 6 `noEmptyBlock`.
  Worse operationally: `AGENTS.md` ("Build & run") and `docs/frontend-conventions.md:44-49`
  both instruct every agent to run `bun run lint` and `bun run format`. An agent that obeys
  produces a 249-file diff unrelated to its task, on a repo whose `AGENTS.md` also mandates
  small rebase-able commits.
- **Fix:** Three small changes.
  ```jsonc
  "test": "bun test",
  "lint": "bun biome lint",              // read-only
  "lint:fix": "bun biome lint --write",
  "format": "bun biome format",          // read-only
  "format:fix": "bun biome format --write",
  "ci": "bun biome ci"                   // lint + format + organizeImports, non-mutating
  ```
  Add `bun run test` to `ci.yml`. Adding `bun run ci` will fail red on day one; either fix
  the 249 files in one dedicated formatting commit first, or land the gate on
  `--changed`-scoped files. That sequencing is the only part needing a decision.
- **Effort:** S for the scripts and the test gate; M if you also want the lint gate green.
- **Blast radius:** `package.json`, `ci.yml`. No source change unless you take the
  formatting commit, which touches 249 files and should be its own commit.

---

### [SEV-3] `src/lib/` is entirely dead, and `CLAUDE-INTERNALS.md` recommends using it

- **ID:** `ui-aismell-03`
- **Severity:** High
- **Category:** AI-smell / Docs
- **Confidence:** High (exhaustive grep, both directions)
- **Location:** `src/lib/**` (236 lines: `iterable.ts`, `props/`, `refs/`, `style/`, `tag/`).
  Doc claims at `CLAUDE-INTERNALS.md:69`, `CLAUDE-INTERNALS.md:89`, `ANALYSIS.md:23`,
  `ANALYSIS.md:61`.
- **What:** Every exported symbol in `src/lib/` has zero consumers: `mergeRefs`,
  `OverrideProps`, `ElementOf`, `classes`, `cva`, `createIsButton`, `isButton`,
  `BUTTON_INPUT_TYPES`, `createTagName`, `chain`. The single import of anything under
  `lib/` is `lib/refs/mergeRefs.ts:1` importing `chain` from `lib/iterable.ts`, i.e. `lib`
  importing itself. `src/index.ts` exports none of it (grep for `mergeRefs|OverrideProps|
  createTagName|createIsButton|chain|cva` in the barrel returns nothing), and
  `package.json:36-60` declares no `./lib/*` subpath. So it is unreachable internally *and*
  externally, yet it is compiled and shipped in `dist`.
- **Why it matters:** Two costs. (a) The docs point agents at it: `CLAUDE-INTERNALS.md:69`
  says "`mergeRefs` in `src/lib/refs` for multi-ref", presenting a dead 13-line helper as the
  house idiom for a pattern that 19 files actually solve by hand
  (`typeof local.ref === "function"`, 25 occurrences). An agent will "follow the convention"
  into dead code. (b) The docs also *understate* the problem: both `CLAUDE-INTERNALS.md:89`
  and `ANALYSIS.md:61` flag only `cva` as dead, so a reader concludes the other four modules
  are live.
- **Secondary smell:** the style of this tree is visibly not this repo's. `lib/` uses full
  `@param`/`@returns` JSDoc blocks that appear nowhere else in 419 files;
  `lib/style/classes.ts` is a line-for-line port of the `class-variance-authority` package
  (128 lines, including its `falsyToString` helper and its `// biome-ignore lint: valid`
  with no reason text at line 109); `lib/tag/createIsButton.ts` is Ariakit-shaped. This is
  vendored scaffolding from a scaffolding pass, never wired in.
- **Fix:** Delete `src/lib/`, then fix `CLAUDE-INTERNALS.md:69` to describe the actual
  ref-forwarding idiom (callback wrapping, which the same line already documents) and drop
  `lib/` from the repo maps at `CLAUDE-INTERNALS.md:17` and `ANALYSIS.md:23`. If you want to
  keep `mergeRefs`, the honest version is to adopt it in the 19 files that hand-roll ref
  forwarding, which is a separate refactor.
- **Effort:** S to delete, M if you adopt `mergeRefs` instead.
- **Blast radius:** Nothing imports it, so deletion is inert for source. It *does* remove
  files from `dist`; since no export path reaches them, no documented consumer breaks, but a
  consumer deep-importing `@pathscale/ui/dist/lib/...` would. Treat as non-breaking.

---

### [SEV-4] Duplication census: the same helpers are copy-pasted 25x, 4x and 2x

- **ID:** `ui-aismell-04`
- **Severity:** High
- **Category:** AI-smell / Design
- **Confidence:** High (mechanical counts, reproducible below)
- **Location:** see table
- **What:** Counts from a 6-line normalized-window duplicate scan over `src/**` plus targeted
  greps. There are **102 distinct 6-line windows that appear verbatim in 3 or more files**.
  The load-bearing ones:

  | shape | files | occurrences | evidence |
  |---|---:|---:|---|
  | `const invokeEventHandler = ...` (identical 9-line body, 2 signature variants) | **25** | 25 | `rg -n "const invokeEventHandler" src` |
  | `splitProps(props, ["children","class","className","dataTheme","style", ...])` preamble | **41** | 98 | window scan |
  | DOM-order sort via `compareDocumentPosition` | **4** | 4 | `Dropdown.tsx:69`, `Menu.tsx:31`, `ListBox.tsx:27`, `Select.tsx:115` (last one renamed `sortOptionsByDomOrder`) |
  | overlay `local.style` string/object merge block | **4** | 4 | `Dropdown`, `Tooltip`, `Popover`, `Select` (`Object.entries(overlayStyle)`) |
  | `twMerge(CLASSES.Root.base, CLASSES.Root.variant[variant()], fullWidth() && …)` | **6** | 6 | `DateField`, `NumberField`, `TimeField`, `InputGroup`, `ComboBox`, `SearchField` |
  | ref-callback wrapping `typeof local.ref === "function"` | **19** | 25 | `rg -n 'typeof local\.ref === "function"' src` |
  | body scroll lock helper (see SEV-1) | 2 | 2 | `Modal.tsx:59-88`, `Drawer.tsx:40-63` |
  | `const isControlled = () => local.X !== undefined` triple | 21 | 21 | `rg -n "const isControlled = \(\) =>" src` |
  | `data-theme={local.dataTheme}` | 100+ | **227** | `rg -c` |
  | `style={local.style}` | 100+ | **172** | `rg -c` |

  `invokeEventHandler` has **zero** import statements anywhere: all 25 are independent
  definitions. Two shapes exist, `(handler: unknown, event: Event)` (13 copies) and
  `<T extends Event>(handler: unknown, event: T)` (12 copies), so the copies have already
  started to drift.
- **Why it matters:** `invokeEventHandler` exists to support Solid's `[fn, data]` bound-handler
  form. A bug in that dispatch (a missing `Array.isArray` guard, a wrong argument order)
  needs 25 edits, and the two signature variants mean a mechanical find-and-replace will not
  work. Same for the four DOM-order sorts, which is the ordering behind arrow-key roving in
  Dropdown/Menu/ListBox/Select. This is the single largest maintenance tax in the repo.
- **Fix:** Add `src/components/_shared/` helpers and import them. `_shared/` already exists
  and already hosts exactly this kind of thing (`overlayPosition.ts`), so there is no new
  concept to introduce:
  ```ts
  // src/components/_shared/events.ts
  export const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => { … };
  // src/components/_shared/domOrder.ts
  export const sortByDomOrder = <T extends { ref: HTMLElement }>(items: T[]): T[] => { … };
  ```
  The `<T extends Event>` variant subsumes the non-generic one, so one definition covers all
  25 sites. Mechanical, 25 + 4 one-line import edits. The `splitProps` preamble and the
  `data-theme`/`style` repetition are a deeper API-shape question that the prop-API sibling
  slice owns; I flag the counts here and leave the design to them.
- **Effort:** S for `invokeEventHandler` + `sortByDomOrder`; M with the overlay style merge.
- **Blast radius:** 29 component files, all internal, no public API change.
- **Doc correction required:** `CLAUDE-INTERNALS.md:85` and `:133` and `ANALYSIS.md:60` all
  say `invokeEventHandler` is in "~6 files (Card, Dropdown, Tabs, Toast, Select, Table)" and
  `sortItemsByDomOrder` is in "Dropdown, Select". Actual: **25** and **4**, and the Select
  copy is named differently so a grep for the documented name misses it.

---

### [SEV-5] `CLAUDE-INTERNALS.md` and `ANALYSIS.md` "Known issues" are stale in both directions

- **ID:** `ui-aismell-05`
- **Severity:** High
- **Category:** Docs
- **Confidence:** High (each row verified against the cited code)
- **Location:** `CLAUDE-INTERNALS.md:126-134`, `ANALYSIS.md:53-62`, plus the cross-links at
  `CLAUDE-INTERNALS.md:3` and `ANALYSIS.md:68`
- **What:** Both files are dated 2026-07-18 and were written against v1.2.11. Substantial
  work has landed since (`git log` shows the whole release-automation series, the README
  rewrite, the package-export fixes). Line by line:

  | doc line | claim | reality |
  |---|---|---|
  | `CLAUDE-INTERNALS.md:129`, `ANALYSIS.md:56` | "`./stores` package export is dangling" | **Fixed.** No `stores` key in `package.json:36-60`. |
  | `CLAUDE-INTERNALS.md:130`, `ANALYSIS.md:57` | "README stale: `dist/styles/compat/daisy-primitives.css` and `docs/motion.md`" | **Fixed.** README was rewritten (`8756b19`); neither string appears. |
  | `CLAUDE-INTERNALS.md:31`, `ANALYSIS.md:51` | "Versioning: manual bare-version commits (e.g. `1.2.11`); publish is manual" | **Wrong now.** `.github/workflows/release.yml` publishes automatically on push to master via conventional commits + npm OIDC trusted publishing. `package.json:3` is `1.3.1`. |
  | `CLAUDE-INTERNALS.md:31` | CI description lists only `ci.yml` and `preview.yml` | **Incomplete.** `release.yml` (5.9 KB) exists and additionally runs `check:package`, `publint --strict`, and `smoke`. `scripts/check-package.ts`, `next-version.ts`, `smoke-consumer.ts` (480 lines total) are undocumented. |
  | `CLAUDE-INTERNALS.md:85/133`, `ANALYSIS.md:60` | `invokeEventHandler` "~6 files"; `sortItemsByDomOrder` "Dropdown, Select" | **Undercounted 4x / 2x.** See SEV-4. |
  | `CLAUDE-INTERNALS.md:89/132`, `ANALYSIS.md:61` | only `cva` is dead in `lib/` | **Understated.** All of `src/lib/` is dead. See SEV-3. |
  | `CLAUDE-INTERNALS.md:69` | "`mergeRefs` in `src/lib/refs` for multi-ref" | **Points at dead code.** Zero consumers, not exported. |
  | `CLAUDE-INTERNALS.md:3` | "Usage reference: [CLAUDE.md](CLAUDE.md)" | **Broken in meaning.** `CLAUDE.md` is now a 13-line pointer to `AGENTS.md` (rewritten `2026-07-25`). The usage reference is `docs/ui-usage.md`. |
  | `ANALYSIS.md:68` | "[CLAUDE.md](CLAUDE.md) (usage reference)" | Same. |
  | `ANALYSIS.md:3` | "v1.2.11" | `1.3.1`. |

  **Verified still true** (do not "fix" these): the Surge token leak in `preview.yml:41`
  (`SURGE_TOKEN: 256124bc…`, plaintext, still there); tests not in CI; `scripts/copy-css.js`
  unused; `cally` unused; the `~30fps` comment vs `FRAME_INTERVAL_MS = 66`;
  `GLOW_READBACK_INTERVAL_MS` not applied; `AnimatedCollapse`'s no-op ResizeObserver;
  `useFieldNew.ts` exporting `useField`; the `check-contracts.ts` skip-list contents; the
  922-line barrel; `ANALYSIS.md`'s "419 TS/TSX source files" and "~104 component
  directories" (both exactly right today).
- **Why it matters:** `AGENTS.md` makes these the entry point for every agent session. An
  agent reading the current "Known issues" will (a) waste a cycle re-fixing `./stores` and
  the README, (b) under-scope a de-duplication task by 4x, (c) walk into dead code because
  the docs recommend it, and (d) hand-edit `package.json`'s version, which the release
  workflow now owns. Stale internal docs on this repo are not cosmetic, they are the
  primary interface.
- **Fix:** One editing pass. Mechanical, but requires re-verifying each line rather than
  trusting the previous pass; the table above is the checklist. Also add a dated "verified"
  stamp per section, since `CLAUDE-INTERNALS.md:126` already uses one
  ("verified 2026-07-18") and it is the only reason this was cheap to audit.
- **Effort:** S
- **Blast radius:** docs only.

---

### [SEV-6] `CONTRIBUTING.md`'s "non-negotiable" checklist contradicts the codebase on five rules

- **ID:** `ui-aismell-06`
- **Severity:** Medium
- **Category:** Docs
- **Confidence:** High (each contradiction counted)
- **Location:** `CONTRIBUTING.md:43-106`, `:144`
- **What:** `CONTRIBUTING.md:45` says "Every component MUST follow these rules. This is
  non-negotiable." Five of them are not followed by anything:

  | doc line | rule | reality |
  |---|---|---|
  | `:49-53` | component dir = `ComponentName.tsx` + `index.ts` | The enforced/real anatomy is the quartet: **92 of 104** component dirs have a `.classes.ts`, and `CLAUDE-INTERNALS.md:44-50` documents four files. `CONTRIBUTING.md` never mentions `.classes.ts` or `.css`. |
  | `:66-67` | "Use `ComponentSize` for sizes (`xs\|sm\|md\|lg\|xl`)" and `ComponentColor` | `docs/ui-usage.md:38-44` explicitly says the opposite, and it is right: neither type is exported from `src/index.ts` (grep returns nothing), and `Button` narrows `size` to `sm\|md\|lg`. Two "source of truth" docs give opposite instructions. |
  | `:83` | "`function` component with explicit return type `: JSX.Element`" | **180** components across 89 files are `const X: Component<Props> = (props) => …`. `): JSX.Element {` occurs **3** times in the whole repo, and `^function [A-Z]…(): JSX.Element` occurs **0** times. Compliance is effectively zero. |
  | `:105` | "Follow the existing pattern in `src/components/*Showcase.tsx`" | **No such file exists.** `Showcase`/`ShowcaseSection` were removed in the migration (`docs/component-migration-map.md`), and `rg -l Showcase src` returns nothing. |
  | `:144` | "`bun build` passes" | Wrong command. `bun build` is Bun's own bundler and does not run this repo's build. The script is `bun run build` (`package.json:127`). |

- **Why it matters:** `:87` ("`class` canonical, `className` for compat") and `:85`
  ("No hardcoded English strings") are good rules that *are* followed. Mixing them with five
  rules nothing follows trains readers, and agents, to ignore the whole file. The
  `ComponentSize` case is worse than noise: it is a direct instruction to use a type that
  cannot be imported.
- **Fix:** Rewrite `:47-53` to document the quartet, delete or invert `:66-67` and `:83`,
  delete `:101-105`, correct `:144`. If you want `function` + `: JSX.Element` to actually be
  the style, that is a 180-site refactor and a separate decision, not a checklist line.
- **Effort:** S for the doc; L if you decide to make `:83` true.
- **Blast radius:** docs.

---

### [SEV-7] `docs/frontend-conventions.md` is another repo's boilerplate, and `AGENTS.md` makes reading it an invariant

- **ID:** `ui-aismell-07`
- **Severity:** Medium
- **Category:** Docs / AI-smell
- **Confidence:** High
- **Location:** `docs/frontend-conventions.md` (64 lines), referenced as an invariant from
  `AGENTS.md` ("Read `docs/frontend-conventions.md` **before** opening implementation files")
- **What:** The file describes an application repo, not a component library.
  - `:4` scopes itself to "pages, hooks, stores, services, routing", but this repo has no
    `pages/`, `stores/`, `services/`, or routing. It has `components/ hooks/ lib/ motion/
    primitives/ styles/`.
  - `:11` "use `class=` (not `className=`)" directly contradicts this library's own contract:
    `CONTRIBUTING.md:87` and `README.md:90` require accepting **both**, and **123 files**
    reference `local.className`. Following `:11` in this repo means breaking every component.
  - `:6` lists **rsbuild** as the stack; this repo builds with **rslib** (`rslib.config.ts`,
    `package.json:127`).
  - `:32-33` says "This repo has no backend services contract ...
    Don't look for one." Then `:62-64` says "Until they exist, this file **plus the
    services JSON** is the reference." The file contradicts itself 30 lines apart. This is the
    fingerprint of a template filled in twice.
  - `:57-58` lists "project map" and "services contract" as references, then `:62` admits
    neither exists.
  - `:44-49` tells agents to run `bun run lint` and `bun run format`, both of which mutate
    (SEV-2), and omits `npx tsc --noEmit` and `bun test`, which are the two checks that
    actually catch things here.
- **Why it matters:** It is loaded before implementation files by contract, so it is the
  highest-leverage doc in the repo per byte, and most of its bytes are wrong for this repo.
  The `class` vs `className` line is the dangerous one.
- **Fix:** Either cut it down to the parts that are true here (the context-efficient workflow
  at `:23-40` is genuinely good and repo-agnostic; the rest is not), or demote it from
  invariant status in `AGENTS.md` and point the invariant at `docs/ui-usage.md` +
  `CLAUDE-INTERNALS.md`, which are accurate. Fix `:11`, `:6`, and the `:32`/`:64`
  contradiction regardless.
- **Effort:** S
- **Blast radius:** docs; touches `AGENTS.md` if you re-point the invariant.

---

### [SEV-8] `check-contracts.ts` silently exempts a quarter of the component files

- **ID:** `ui-aismell-08`
- **Severity:** Medium
- **Category:** AI-smell / Maintainability
- **Confidence:** High
- **Location:** `scripts/check-contracts.ts:8-16`, `:49-56`, `:77-92`
- **What:** The build gate is narrower than its reputation.
  1. **It only inspects one file per directory**, `PascalCase.tsx` derived from the kebab dir
     name (`:50`). There are **134 `.tsx` files** under `src/components`; only **101** are
     ever read. `live-chat/` is fully exempt because its files are `LiveChatPanel.tsx` and
     `LiveChatBubble.tsx`, and no `LiveChat.tsx` exists, so `:55` `continue`s. Every
     sub-part file (`MenuItem.tsx`, `ListBoxItem.tsx`, `AccordionItem`, the whole
     `immersive-landing/components/` tree) is unchecked.
  2. **That same `continue` at `:55` also skips the barrel type-export check at `:97`**, which
     is below it. So a directory with no `PascalCase.tsx` escapes *all* rules, including the
     one rule that was supposed to be structural.
  3. **The skip-list at `:8-16` names three directories that no longer exist**: `showcase`,
     `showcase-section`, `props-table`. Dead entries in a hardcoded list, which is exactly
     the "config nobody maintains" smell.
  4. **The static-inline-style rule at `:89` is defeated by its own escape hatch.** The regex
     `/\$\{|`|\.\.\.|[a-z]+\(|[?]/` skips any style block containing a lowercase word followed
     by `(` (matches almost any expression) or any `?` (matches every optional-chain and
     ternary). The rule fires almost never.
  5. **The `form` skip entry has a concrete cost**: because `form/` is skipped,
     `src/components/form/FieldErrorMessage.tsx` never gets the `splitProps` check, and it
     indeed does not use `splitProps`. See SEV-11.
- **Why it matters:** The repo's whole quality story is "one enforced component anatomy"
  (`ANALYSIS.md:27-29`). It is enforced on 75% of the files, and the gaps are exactly where
  the drift is (`live-chat`, `immersive-landing`, `form`).
- **Fix:** Iterate every `.tsx` in the directory rather than one derived filename; move the
  `index.ts` type check above the main-file lookup so it always runs; delete the three dead
  skip entries; either tighten the inline-style regex or delete the rule and say so. Each is
  a few lines.
- **Effort:** S
- **Blast radius:** `scripts/check-contracts.ts`. Tightening it will surface new violations
  in `live-chat` and `immersive-landing`; budget for that.

---

### [SEV-9] Near-duplicate and no-op components: `AuthErrorMessage`/`AuthSuccessMessage`, `Textarea`, `password-rules`

- **ID:** `ui-aismell-09`
- **Severity:** Medium
- **Category:** AI-smell
- **Confidence:** High
- **Location:** `src/components/auth-error-message/AuthErrorMessage.tsx`,
  `src/components/auth-success-message/AuthSuccessMessage.tsx`,
  `src/components/textarea/`, `src/components/password-rules/`
- **What:** Three flavours of the same generated-scaffolding pattern.
  1. **`AuthErrorMessage` (29 lines) and `AuthSuccessMessage` (30 lines) are identical except
     for three literals**: `status="danger"` vs `status="success"`, the `data-slot` value,
     and `role="alert"` vs `role="status" aria-live="polite"`. Same imports, same
     `splitProps` list, same `twMerge("text-sm", …)`, same `Show when={local.message != null
     && local.message !== ""}`. Two directories, two barrel export lines
     (`src/index.ts:344-345`), two prop types, for what is `<Alert status={…}>`.
  2. **`src/components/textarea/` is a no-op alias of `src/components/text-area/`.**
     `Textarea.classes.ts` is literally `export const CLASSES = { base: "" } as const;`, so
     `Textarea.tsx:21` computes `twMerge("", local.class, local.className)`. The component
     adds one `splitProps` call and three type aliases (`TextareaVariant = BaseTextAreaVariant`
     etc.) and nothing else. It exists to satisfy the contract rule that a component file must
     contain `splitProps` and `twMerge`: the gate produced the code rather than the code
     satisfying the gate. Both names are exported (`src/index.ts:782`, `:788`).
  3. **`src/components/password-rules/` is a directory containing exactly one file**, a
     6-line re-export of `src/passwordRules.ts`. Nothing imports it: `src/index.ts:350`
     imports directly from `./passwordRules`, and the playground does too. It exists only so
     that `@pathscale/ui/components/password-rules` resolves.
- **Why it matters:** Small individually, but they are the visible tip of "the contract check
  shaped the code". Each also costs a barrel entry, a `dist` directory, a purge-manifest
  entry, and a line in every component inventory that a human then has to maintain.
- **Fix:** Collapse `AuthErrorMessage`/`AuthSuccessMessage` into one internal component
  parameterised by status, keeping both public names as thin exports (do **not** change the
  public API, both are documented in `README.md:73`). For `Textarea`: keep the export as a
  plain alias in the barrel (`export { TextArea as Textarea }`) and delete the directory.
  For `password-rules`: delete the directory, or keep it and document it, but note it is
  currently in neither `README.md` nor `docs/ui-usage.md` as a subpath.
- **Effort:** S
- **Blast radius:** Public names stay; only file layout changes. Deleting the `textarea/` and
  `password-rules/` directories removes two `@pathscale/ui/components/*` subpaths, which is
  technically breaking for anyone deep-importing them. Neither is documented, so low risk,
  but it is a semver decision.

---

### [SEV-10] `src/motion/` is 1,080 lines with two internal consumers; two of its modules have none

- **ID:** `ui-aismell-10`
- **Severity:** Medium
- **Category:** AI-smell / Design
- **Confidence:** High
- **Location:** `src/motion/**` (1,080 lines). Zero-consumer modules:
  `src/motion/system.ts` (70 lines, `createMotionSystem`), `src/motion/route.ts` (49 lines,
  `createRouteTransitionResolver`).
- **What:** Cross-referencing every motion export against all of `src/` (excluding
  `src/motion/` and the barrel) and all of `playground/`:
  - `runMotion` → 1 consumer, `src/components/color-wheel-flower/ColorWheelFlower.tsx`.
  - `prefersReducedMotion` → 1 consumer, `src/components/metal-border/MetalBorder.tsx:5`
    (from the 2-line `reduced-motion.ts`).
  - `MotionDiv`, `Presence`, `AnimatedCollapse`, `getPreset`, `resolvePreset`,
    `registerPreset`, `createPopmotionDriver`, `enablePopmotion` → **0** component consumers;
    only `playground/src/examples/MotionExamples.tsx`.
  - `createMotionSystem` and `createRouteTransitionResolver` → **0** consumers anywhere,
    including the playground. Their only mentions repo-wide are their own definitions, the
    barrel, and two doc files.
  As `CLAUDE-INTERNALS.md:100` and `ANALYSIS.md:41` both note, Modal/Toast/Drawer animate via
  CSS, not through this system. So this is a public-API-only subsystem, which is legitimate
  for a library, but `createMotionSystem` ("instance-scoped alternative that layers custom
  presets over token-derived ones") and `createRouteTransitionResolver` ("first-truthy-rule
  engine") are invented abstractions with zero implementors and zero demos.
- **Why it matters:** 119 lines of untested, undemonstrated, never-executed public API that
  nonetheless ships, appears in the type surface, and has to be kept compiling. `route.ts` in
  particular solves route transitions for a library that has no router.
- **Fix:** Not urgent, and I would not delete `MotionDiv`/`Presence`/`AnimatedCollapse` (those
  are the documented, playground-demonstrated public surface). Do decide on `system.ts` and
  `route.ts`: either delete them, or add a playground example that exercises each, which is
  also the cheapest test. Needs a product decision, not a mechanical fix.
- **Effort:** S to delete, M to demo.
- **Blast radius:** Removing them is a breaking change to `@pathscale/ui/motion` and the root
  barrel, so it belongs in a minor/major bump. `docs/ui-usage.md:123` documents both.

---

### [SEV-11] `FormField.tsx:83` spells out `FieldApi<any × 23>` on one 231-character line

- **ID:** `ui-aismell-11`
- **Severity:** Medium
- **Category:** AI-smell
- **Confidence:** High
- **Location:** `src/components/form/FormField.tsx:83`; related `src/components/form/FieldErrorMessage.tsx:20-38`
- **What:** Line 83 is
  `children={(field: () => FieldApi<any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any, any>) => {`
  All 23 of TanStack's generic parameters written out as `any`. Biome reports 23 separate
  `noExplicitAny` diagnostics on this one line. Every other `any` in the form subsystem is a
  single erasure with a specific `biome-ignore` reason (`createForm.ts:59, 72, 74, 83, 89,
  203, 209, 211, 213`); this one has no ignore comment and no erasure, it just enumerates.
  The idiomatic version in this codebase is already written next door: `createForm.ts:60`
  `_tsForm: any;` with the documented rationale.
- **Same file, adjacent smell:** `FieldErrorMessage.tsx` does **not** use `splitProps`, and
  spreads `{...props}` (line 22) straight onto a `<p>`. `props` still carries `message` and
  `className`, so both are emitted as DOM attributes: `<p message="Password too short"
  classname="…">`. Cosmetic rather than functional, but it is the only component in the repo
  that skips `splitProps`, and it does so only because `form/` is in the contract skip-list
  (SEV-8). Confidence Medium on the exact DOM output, High that `splitProps` is missing.
- **Why it matters:** Low functional impact, high signal. It is the most obviously
  unreviewed line in 419 files, it is in the form subsystem that everything else routes
  through, and it accounts for 23 of the repo's 79 lint errors on its own.
- **Fix:** Replace the annotation with the module's own convention:
  `children={(field: () => AnyFieldApi) => {` where `AnyFieldApi = any` is declared once with
  a `biome-ignore` explaining the 23-generic erasure, mirroring `createForm.ts:59-60`. Add
  `splitProps` to `FieldErrorMessage.tsx`. Both mechanical.
- **Effort:** S
- **Blast radius:** 2 files, no API change.

---

### [SEV-12] `LiveChatPanel` ships demo scaffolding and swallows send failures

- **ID:** `ui-aismell-12`
- **Severity:** Medium
- **Category:** AI-smell / Design
- **Confidence:** High
- **Location:** `src/components/live-chat/LiveChatPanel.tsx:265-303`
- **What:** Two things in one handler.
  1. `local.mockMode` (lines 265-286) synthesises a fake agent reply after
     `setTimeout(…, 1000)` with the hardcoded string
     `"Thanks for your message! This is a demo response."`. This is demo code in a published
     npm package. `CONTRIBUTING.md:85` bans hardcoded English strings, and unlike the ~20
     other English defaults in the repo (all `local.x ?? "…"` overridable props, which are
     fine), this one is not overridable. The accompanying comment,
     `// In mock mode, just add the message locally`, restates the code.
  2. The real path (lines 296-301) does
     `catch (error) { console.error("[LiveChatPanel] Failed to send message:", error); }`.
     There is no `onError` prop and no error UI state, so a consumer whose backend rejects a
     message sees the input clear-or-not with no signal, and can only find out via the
     browser console. This is the classic swallow-and-log.
- **Why it matters:** (2) is a real consumer-facing defect: a failed send is invisible to the
  application. (1) means `mockMode` is untranslatable and unbranded for every consumer.
- **Fix:** Add an `onSendError?: (error: unknown) => void` prop and call it in the catch (keep
  the `console.error` or drop it). For `mockMode`, either take the canned reply as a prop
  (`mockResponse?: string`) or move `mockMode` out of the shipped component into the
  playground. The `onSendError` half is mechanical; the `mockMode` half is a scope decision.
- **Effort:** S
- **Blast radius:** 1 file; adding an optional prop is non-breaking.
- **Adjacent, larger scope question (flagging, not arguing):** `immersive-landing/` ships
  `CookieConsent.tsx` (370 lines), `PWAInstallPrompt.tsx` and `FirefoxPWABanner.tsx` (a
  browser-sniffing banner) plus `types/pwa.d.ts`. `CONTRIBUTING.md:96` says a component does
  not belong here if "it hardcodes application-specific logic". A cookie-consent flow and a
  Firefox-specific PWA banner are application policy, not UI primitives. This subtree also has
  the repo's highest density of restating comments (`// Load current preferences`,
  `// Handle escape key for manage modal`, `// Detect specific browsers`, `// Don't show if
  user has dismissed`) and 3 of the 6 unused imports. Worth a scope decision; I am not calling
  it a defect.

---

### [SEV-13] `@pathscale/ui` depends on itself

- **ID:** `ui-aismell-13`
- **Severity:** Medium
- **Category:** AI-smell / Correctness
- **Confidence:** High (verified by installing)
- **Location:** `package.json:97`
- **What:** `"dependencies": { …, "@pathscale/ui": "^1.2.10", … }`. Running
  `bun install --frozen-lockfile` in a clean tree prints `+ @pathscale/ui@1.2.10`. It arrived
  via `a8643c6 "chore: lock update"`. The playground does not need it (it aliases
  `@pathscale/ui` → `../src` via Vite, and `playground/package.json` does not list it).
- **Why it matters:** Every consumer installing `@pathscale/ui@1.3.1` also downloads and
  installs `@pathscale/ui@1.2.10` nested inside it: wasted install weight, a second copy of
  every component's CSS on disk, and a genuine footgun if any resolution path ever reaches the
  nested copy. It also makes the dependency graph self-referential for any tooling that walks
  it.
- **Fix:** Delete the line, `bun install`, verify `bun run build` and `bun run smoke`.
  `scripts/check-package.ts` should probably grow an assertion that the package does not
  depend on itself, since it exists precisely to catch packaging mistakes.
- **Effort:** S
- **Blast radius:** `package.json` + lockfile. I did not verify whether anything in the build
  accidentally resolves the nested copy, so run the smoke test. Note the build/packaging
  sibling slice may also raise this.

---

### [SEV-14] Dead constants and a no-op knob in `metal-border/engine/perfConfig.ts`

- **ID:** `ui-aismell-14`
- **Severity:** Low
- **Category:** AI-smell
- **Confidence:** High
- **Location:** `src/components/metal-border/engine/perfConfig.ts:7, 12, 16`;
  `src/components/metal-border/engine/renderer/core.ts:10`;
  `src/components/metal-border/engine/renderer/sampling.ts:6`
- **What:** Reference counts for every export in `perfConfig.ts`, across the whole engine:
  `REFLECTION_INTERVAL_MS` **0**, `GLOW_READBACK_INTERVAL_MS` **1** (and that one reference is
  inside a *comment* at `sampling.ts:6`, not code), `GLOW_SKIP_FRAMES` 2,
  `FRAME_INTERVAL_MS` 2, `PERIM_SAMPLES` 5, `HALO_SEGMENTS` 2, `EXTRA_SEGMENTS` 2,
  `CANONICAL_GL_SIZE` 2, `GL_DPR_CAP` 2. So:
  - `REFLECTION_INTERVAL_MS = 66` is dead.
  - `GLOW_READBACK_INTERVAL_MS = 1500` is dead, and `sampling.ts:6` claims readback happens
    "every `GLOW_READBACK_INTERVAL_MS` to avoid the expensive GPU→CPU pipeline". It does not.
    `CLAUDE-INTERNALS.md:105` already flags this, correctly; the comment in the code is the
    thing that lies.
  - `GLOW_SKIP_FRAMES = 1` is used at `loop.ts:365` as
    `SHARED.frameCount % GLOW_SKIP_FRAMES === 0`, which with N=1 is always true. The comment
    says "Only run the glow callback every Nth rendered frame", but the configured value
    disables the throttle. A knob set to its own no-op value.
  - `core.ts:10` says "The animation loop is capped at ~30fps" while `FRAME_INTERVAL_MS = 66`
    is ~15fps (`perfConfig.ts:4` says so itself). Also already flagged at
    `CLAUDE-INTERNALS.md:104`.
- **Why it matters:** Minor on its own, but `gl.readPixels` per glow frame at ~15fps is a real
  GPU→CPU sync the constant was written to avoid. Someone reading `perfConfig.ts` will believe
  the throttling exists.
- **Fix:** Delete `REFLECTION_INTERVAL_MS`. Either apply `GLOW_READBACK_INTERVAL_MS` in
  `loop.ts` or delete it and fix `sampling.ts:6`. Pick a real value for `GLOW_SKIP_FRAMES` or
  delete the mechanism. Fix the `~30fps` comment in `core.ts:10`. All mechanical except the
  readback decision, which is a perf call the perf-focused sibling may want.
- **Effort:** S
- **Blast radius:** metal-border engine only.

---

### [SEV-15] `AnimatedCollapse` allocates a ResizeObserver whose callback is empty

- **ID:** `ui-aismell-15`
- **Severity:** Low
- **Category:** AI-smell
- **Confidence:** High
- **Location:** `src/motion/solid/AnimatedCollapse.tsx:92, 107-115`
- **What:** `new ResizeObserver(() => { … })` with a body containing only a four-line comment,
  then `.observe(contentEl)`. The comment says "The observer exists in case a consumer wants
  to extend behavior later". `CLAUDE-INTERNALS.md:99` documents it as "an **intentional
  no-op placeholder**", so this is known and deliberate, not an oversight.
- **Why it matters:** It is speculative scaffolding for a state that does not exist, and it is
  not free: every mounted `AnimatedCollapse` registers a live ResizeObserver on its content
  element, so the browser does the observation work and dispatches callbacks that do nothing.
  It is also the only place in the repo that does this, and Biome flags it under
  `noEmptyBlock`.
- **Fix:** Delete lines 92 and 107-115 plus the corresponding cleanup, and delete the
  `CLAUDE-INTERNALS.md:99` note. If height-during-open really does need to react to content
  resize, that is a feature to implement, not a placeholder to keep. Mechanical.
- **Effort:** S
- **Blast radius:** 1 file. `tests/motion/AnimatedCollapse.test.ts` tests only the pure
  `nextCollapsePhase`/`computeCollapseStyle` functions, so it is unaffected.

---

### [SEV-16] Six unused imports

- **ID:** `ui-aismell-16`
- **Severity:** Low
- **Category:** Dead code
- **Confidence:** High (Biome `noUnusedImports`, all marked FIXABLE)
- **Location:** `src/components/disclosure/Disclosure.tsx:3`,
  `src/components/fieldset/Fieldset.tsx:2`,
  `src/components/immersive-landing/components/CookieConsent.tsx:4`,
  `src/components/live-chat/LiveChatPanel.tsx:4`,
  `src/components/metal-border/engine/glow/glow.ts:22`,
  `src/hooks/date/useCalendarState.ts:13`
- **What / Why / Fix:** Straightforward dead imports. They exist only because Biome does not
  run in CI (SEV-2); wiring up the gate removes this class permanently. `bunx biome lint
  --write` fixes all six, but do it as its own commit, not bundled with the 249-file format
  pass.
- **Effort:** S
- **Blast radius:** 6 files.

---

### [SEV-17] `docs/component-migration-map.md` restates its own registry as 150 lines of prose

- **ID:** `ui-aismell-17`
- **Severity:** Low
- **Category:** Docs / AI-smell
- **Confidence:** High
- **Location:** `docs/component-migration-map.md` (299 lines; `:8` and `:154-299`)
- **What:** The file opens with `export const COMPONENT_MIGRATION_MAP = { … }` presented as
  TypeScript. **That symbol exists nowhere in the codebase** (`rg COMPONENT_MIGRATION_MAP`
  hits only this doc), so the `export const` framing implies an importable module that does
  not exist. Then `:154-299` mechanically re-renders the same registry as ~45 `OLD: import
  {X} … / NEW: remove import (no replacement)` stanzas, 3 lines each, the overwhelming
  majority of which say exactly "remove import (no replacement)". Half the file is a
  generated expansion of the other half.
- **Why it matters:** Purely a maintenance tax and a credibility signal, but this file *is*
  cited as authoritative by `docs/frontend-conventions.md:16-17` ("Check
  `docs/component-migration-map.md` … before altering a public surface"). Doubling its length
  with a mechanical restatement makes it less likely to be read, and guarantees the two halves
  drift.
- **Fix:** Delete `:154-299`, keep the registry, and drop the `export const` framing (make it
  a plain table or a fenced `text` block) unless someone intends to ship it as a real module
  for codemods. If a codemod is wanted, put it in `scripts/` where it can be tested.
- **Effort:** S
- **Blast radius:** docs.

---

### [SEV-18] `docs/frontend-docs-plan.md` (untracked) re-enumerates the private repos that two recent commits deliberately removed

- **ID:** `ui-aismell-18`
- **Severity:** Low
- **Category:** Docs
- **Confidence:** Medium (the intent behind the earlier commits is inferred from their
  messages; a human should confirm the policy)
- **Location:** untracked `docs/frontend-docs-plan.md:14-15`, `:49-51`, `:80`
- **What:** The file names seven repositories in full (`24x.ai`, `honey.id`, `pathscale.com`,
  `pays.online`, `support.cafe`, `web3.trading`, `nofilter.io`) and cites local paths
  (`~/code/honey.id/src/`, `~/code/support.cafe/src/`, `~/code/nofilter.io/src/`). Two recent
  commits on this repo did the opposite on purpose: `a363ae6 "docs: stop enumerating private
  repositories in ui-usage"` and `409066e "docs: stop naming a private repo in createI18n
  comments (#202)"`. This repo is published to npm and its docs are public on GitHub.
- **Why it matters:** If it lands as written it re-introduces exactly what those two commits
  removed, in a public repo. It is currently untracked, so this is cheap to catch now.
- **Fix:** Before committing, replace the repo names with a count and a generic description
  ("the seven frontend apps"), and drop the `~/code/...` paths. Confirm the policy with
  whoever made `a363ae6` first, since I am inferring it from commit messages.
- **Effort:** S
- **Blast radius:** one untracked file.

---

## Tests: what exists, what it asserts, what is dangerously untested

**Inventory.** 4 files, 362 lines, 29 tests, 65 `expect()` calls, covering 419 source files
and ~38,000 lines. Roughly **0.95% of the codebase by line count**. Running `bun test` after
`bun install --frozen-lockfile`: **29 pass, 0 fail, 40ms**.

| file | tests | what it actually asserts |
|---|---:|---|
| `tests/motion/AnimatedCollapse.test.ts` | 13 | The two pure functions `nextCollapsePhase` (all 7 phase transitions including the interrupted `opening → closing` and `closing → opening` cases) and `computeCollapseStyle` (px height, `overflow`, `opacity`, and the `height: undefined` case when measurement is null). Genuinely good state-machine coverage. |
| `tests/components/password-field/PasswordField.test.tsx` | 8 | The visibility-toggle contract: type switch, focus/selection/value snapshot, caret restore, and the browser-value-desync path where it re-dispatches an `input` event. Uses `mock()` fields but asserts *behaviour on the field*, not the mock's own call shape, apart from `toHaveBeenCalledWith`. |
| `tests/motion/Presence.test.ts` | 6 | `nextPresenceState` transitions. |
| `tests/hooks/form/createForm.test.ts` | 2 | The blur-error-clears-on-valid-change behaviour that `CLAUDE-INTERNALS.md:113` explicitly warns not to "simplify". Drives a real TanStack form under `createRoot` with a hand-rolled Standard Schema. This is the highest-value test in the repo. |

**Quality verdict: no tautologies, no mock-assertions, no empty snapshots.** I looked for
`expect(true).toBe(true)`, assertions on mock internals, and snapshot tests with no
assertions, and found none. The four files are exactly the four places where a subtle
regression would be silent. Whoever wrote them picked well. The problem is not the tests, it
is that nothing runs them (SEV-2) and that the selection stops there.

**Specific high-risk untested behaviour**, named with the branch and why it bites:

1. **`Modal`/`Drawer` body scroll lock**, `Modal.tsx:79-88`, `Drawer.tsx:57-63`. The
   `bodyLockCount === 0` restore branch. This is SEV-1: it is already broken, and a
   ~20-line test driving `lockBodyScroll`/`unlockBodyScroll` in interleaved order would have
   caught it. Highest priority.
2. **`_shared/overlayPosition.ts` auto-flip and viewport clamp**: 233 lines, and the single
   positioning engine behind **5 components** (`Dropdown`, `Select`, `Popover`, `Tooltip`,
   `ThemeColorPicker`). `ANALYSIS.md:40` says it plainly: "All positioning bugs live in this
   one file." The flip decision and the clamp arithmetic are pure geometry over numbers and
   are trivially testable without a DOM. Currently zero tests.
3. **`useStreamingSubscription` stale-callback suppression**:
   `primitives/streaming/useStreamingSubscription.ts` (189 lines). The `runToken` counter plus
   `AbortController` is what stops a resolved-but-superseded subscription from writing into a
   restarted one. The failure mode is data from a stale connection appearing in a live buffer,
   which is silent and reproduces only under a reconnect race. Pure logic, zero tests.
4. **`useStreamingBuffer` eviction + upsert index map**:
   `primitives/streaming/useStreamingBuffer.ts` (173 lines). The `maxSize` "keep newest N"
   trim has to keep the `Map<key,index>` consistent after the trim, or `upsert` writes to the
   wrong row. Pure, deterministic, zero tests.
5. **`hooks/date/date.utils.ts`**: 174 lines, 21 exports, powering `Calendar`,
   `RangeCalendar`, `DatePicker`, `DateRangePicker`. The noon-construction DST guard, the
   42-cell `buildCalendarGrid` month-boundary padding, `normalizeRange`'s reversed-range swap,
   and strict `parseDate`. This is the most testable file in the repo (all pure, native
   `Date` + `Intl`) and the one where an off-by-one is both most likely and least visible.
   Zero tests.
6. **`hooks/table/helpers.ts`**: `resolveUpdater` (used by 4 state-slice hooks:
   `useTableFiltering`, `useTableExpansion`, `useTableSelection`, and sorting) and the
   `toSortDescriptor`/`toSortingState` bridge between TanStack `SortingState` and
   `{column, direction}`. Three pure functions, ~30 lines, on the critical path of every
   table interaction. Zero tests.
7. **`Toast`'s `ToastQueue` timers**: `Toast.tsx` (1,116 lines, the largest file in the
   repo). Per-toast timer with pause/resume on hover. The pause-then-dismiss-then-resume
   ordering is exactly the kind of thing that leaks a timer. Zero tests.

Items 2 through 6 are all pure functions with no DOM dependency, so they are cheap: a session
could plausibly add 60-80 assertions across them without touching a component. Item 1 is the
one that is already a bug.

## Docs accuracy: verified-stale list

Consolidated from SEV-5, SEV-6, SEV-7, plus the smaller items. Every row was checked against
the cited code line.

| doc:line | claim | contradicting code | verdict |
|---|---|---|---|
| `CLAUDE-INTERNALS.md:3` | "Usage reference: CLAUDE.md" | `CLAUDE.md:1-13` is an `@AGENTS.md` pointer | stale |
| `CLAUDE-INTERNALS.md:31` | "Versioning: manual bare-version commits; publish is manual" | `.github/workflows/release.yml` | stale |
| `CLAUDE-INTERNALS.md:31` | CI = `ci.yml` + `preview.yml` | `release.yml` also exists and runs `check:package`, `publint`, `smoke` | incomplete |
| `CLAUDE-INTERNALS.md:69` | use `mergeRefs` from `src/lib/refs` | zero consumers, not exported | points at dead code |
| `CLAUDE-INTERNALS.md:85`, `:133` | `invokeEventHandler` in ~6 files | 25 definitions | 4x undercount |
| `CLAUDE-INTERNALS.md:81`, `:133` | `sortItemsByDomOrder` in Dropdown + Select | 4 copies; Select's is `sortOptionsByDomOrder` | wrong |
| `CLAUDE-INTERNALS.md:89`, `:132` | only `cva` unused in `lib/` | all of `src/lib/` unused | understated |
| `CLAUDE-INTERNALS.md:129` | `./stores` export dangling | absent from `package.json:36-60` | already fixed |
| `CLAUDE-INTERNALS.md:130` | README stale (`daisy-primitives.css`, `docs/motion.md`) | README rewritten in `8756b19` | already fixed |
| `ANALYSIS.md:3` | v1.2.11 | `package.json:3` = 1.3.1 | stale |
| `ANALYSIS.md:51` | "Versioning/publishing is manual" | `release.yml` | stale |
| `ANALYSIS.md:56`, `:57`, `:60`, `:61` | as above | as above | same four |
| `ANALYSIS.md:68` | "CLAUDE.md (usage reference)" | `CLAUDE.md` is an AGENTS pointer | stale |
| `CONTRIBUTING.md:49-53` | dir = `.tsx` + `index.ts` | 92/104 dirs have `.classes.ts`; `CLAUDE-INTERNALS.md:44-50` documents 4 files | wrong |
| `CONTRIBUTING.md:66-67` | use `ComponentSize`/`ComponentColor` | not exported from `src/index.ts`; `docs/ui-usage.md:38-44` says the opposite | wrong, and self-contradictory across docs |
| `CONTRIBUTING.md:83` | `function` + `: JSX.Element` | 180 arrow `Component<>`; 3 `: JSX.Element {` repo-wide | ~0% compliance |
| `CONTRIBUTING.md:105` | `src/components/*Showcase.tsx` | no such file | stale path |
| `CONTRIBUTING.md:144` | "`bun build` passes" | script is `bun run build` | wrong command |
| `frontend-conventions.md:6` | stack is "rsbuild" | `rslib.config.ts` | wrong |
| `frontend-conventions.md:11` | "`class=` (not `className=`)" | 123 files use `local.className`; `README.md:90` requires both | wrong for this repo |
| `frontend-conventions.md:32` vs `:64` | "no services JSON, don't look for one" vs "this file plus the services JSON" | itself | self-contradiction |
| `frontend-conventions.md:57-58` | lists "project map" / "services contract" references | `:62` admits neither exists | dangling |
| `component-migration-map.md:8` | `export const COMPONENT_MIGRATION_MAP` | symbol exists nowhere | not real code |

**Verified accurate, do not touch:** `docs/ui-usage.md` end to end (I spot-checked the
`Loading` alias at `src/index.ts:493`, the `[10,25,50,100]` page sizes at
`useTablePagination.ts:5`, every motion preset name against `presets.ts`, the playground line
count `~7,300` vs actual 7,271, and the `examples/Table*.tsx` paths: all correct).
`README.md` end to end, including the "103 components" count. `ANALYSIS.md`'s "419 TS/TSX
source files" and "~104 component directories" are both exactly right today.
`CLAUDE-INTERNALS.md`'s contract skip-list transcription, the 922-line barrel, the
`~30fps`/`GLOW_READBACK_INTERVAL_MS`/`AnimatedCollapse` notes, and `useFieldNew.ts` exporting
`useField` are all still true.

**Doc gaps rather than errors:** `ButtonGroup` and `CloseButton` are exported from the barrel
but appear in neither `README.md` nor `docs/ui-usage.md` (these are the only two of 104
component dirs that are undocumented). `docs/ui-usage.md:63` omits `Alert` from the Overlays
family, which `README.md:71` includes. `scripts/check-package.ts`, `next-version.ts` and
`smoke-consumer.ts` (480 lines) are documented nowhere.

## Cross-cutting recommendations

1. **Make CI mean something (SEV-2).** Split `lint`/`lint:fix` and `format`/`format:fix`, add
   `"test": "bun test"`, add both to `ci.yml`. Land the 249-file formatting pass as its own
   isolated commit first so the gate can go green. *Why:* right now a passing CI proves the
   contract script, `tsc`, and a build; it proves nothing about behaviour or style, and the
   docs actively instruct agents to run mutating commands. *Breaks:* nothing, but the
   formatting commit is a large diff that will conflict with any open branch, so time it.

2. **One `_shared/` pass to kill the top-3 duplicated helpers (SEV-4).** `invokeEventHandler`
   (25), `sortByDomOrder` (4), body scroll lock (2, and currently a bug). `_shared/` already
   exists and already hosts `overlayPosition.ts`, so no new convention is needed. *Why:* it
   is the largest mechanical maintenance tax measured here and it fixes SEV-1 as a side
   effect. *Breaks:* nothing public; 29 internal files change imports.

3. **One honest docs pass over `CLAUDE-INTERNALS.md` + `ANALYSIS.md` + `CONTRIBUTING.md`
   (SEV-5, SEV-6).** Use the table above as the checklist, and re-verify rather than trusting
   it. Stamp each section with a verification date, which `CLAUDE-INTERNALS.md:126` already
   does and which is the only reason this audit was cheap. *Why:* every agent session starts
   here; four of the listed "known issues" are already fixed, so agents are being sent to
   redo completed work. *Breaks:* nothing.

4. **Decide what `docs/frontend-conventions.md` is (SEV-7).** It is currently an invariant in
   `AGENTS.md` and is mostly about a repo shape this repo does not have, including one rule
   (`class` not `className`) that would break every component if followed. Either trim it to
   the ~18 lines that are true here, or demote the invariant to `docs/ui-usage.md` +
   `CLAUDE-INTERNALS.md`. *Breaks:* the same file reportedly exists in seven sibling app
   repos, so coordinate.

5. **Delete `src/lib/` and decide on `motion/system.ts` + `motion/route.ts` (SEV-3, SEV-10).**
   355 lines with zero consumers between them. *Why:* dead code that the docs recommend is
   worse than dead code nobody mentions. *Breaks:* `src/lib/` is inert. The two motion modules
   are exported from the barrel and documented in `docs/ui-usage.md:123`, so removing them is
   a semver-minor decision.

6. **Add pure-function tests for the six items listed in the Tests section**, in priority
   order: body scroll lock, `overlayPosition`, `date.utils`, `hooks/table/helpers`,
   `useStreamingBuffer`, `useStreamingSubscription`. All are DOM-free or nearly so. *Why:*
   `overlayPosition.ts` alone is the single point of failure for 5 components and has no
   coverage. *Breaks:* nothing; only meaningful once recommendation 1 makes CI run them.

## What I did not cover

- **Component prop API design** (naming, `is*` conventions, controlled/uncontrolled shape,
  compound-component ergonomics, polymorphism). A sibling slice owns this. Where I counted
  prop-shape duplication (the 41-file `splitProps` preamble, 227 `data-theme`, 172
  `style={local.style}`) I report the numbers and defer the design conclusion.
- **CSS and the build pipeline** (rslib config, the Tailwind v4 `@theme` block, the purge
  manifest, `generated-icons.css`, theme token coverage). A sibling slice owns this. The 41
  `noDescendingSpecificity`, 14 `noImportantStyles` and 6 empty-CSS-block lint hits are
  reported as counts only; I did not evaluate whether any is a real style bug.
- **Security.** Out of slice, but note the plaintext Surge token at
  `.github/workflows/preview.yml:41` is **still present** and both `CLAUDE-INTERNALS.md:128`
  and `ANALYSIS.md:55` flag it as the top issue. It has been known since 2026-07-18 and not
  rotated. Whoever owns the security slice should confirm.
- **Runtime/visual verification.** I did not run the playground or open a browser. Everything
  here is static analysis plus `bun test` and `bunx biome`. The Modal/Drawer scroll-lock bug
  (SEV-1) is read from source and reasoned through, not reproduced in a browser: a human
  should confirm the sequence before it is filed as user-facing.
- **`playground/`** beyond checking which examples exist and which motion APIs they exercise.
  Its 7,271-line `App.tsx` was not reviewed.
- **Accessibility correctness.** I report Biome's 79 lint errors as a count and note that most
  are a11y rules (`useAriaPropsSupportedByRole`, `noStaticElementInteractions`). I did not
  triage which are true positives, and `CONTRIBUTING.md:71-79` sets a high a11y bar, so this
  deserves its own pass.
- **`@pathscale/rsbuild-plugin-ui-css-purge`**, the sibling repo the build depends on. Not
  checked out here.

## Quick-start for the follow-up agent

**Read in this order:**

1. `docs/ui-usage.md`: the only large doc I found to be fully accurate. Start here for what
   the library is.
2. `CLAUDE-INTERNALS.md`: best map of the internals, but read it against the stale-claims
   table above; roughly 10 lines of it are wrong.
3. `scripts/check-contracts.ts` (114 lines): the build gate. Read it before believing any
   claim about "enforced" conventions; it checks 101 of 134 `.tsx` files (SEV-8).
4. `src/components/button/Button.tsx`: the canonical component; every other component is a
   variation on it.
5. `src/components/modal/Modal.tsx:59-88` and `src/components/drawer/Drawer.tsx:40-63`: the
   SEV-1 bug, side by side.
6. `src/components/_shared/overlayPosition.ts` (233 lines): the highest-leverage untested
   file; 5 components depend on it.

**Commands (all verified working here):**

```bash
bun install --frozen-lockfile   # ~145s cold; node_modules was absent when I started
bun test                        # 29 pass, 0 fail. NOT run by CI
bun run check                   # contract check only, NOT Biome
npx tsc --noEmit                # what CI actually type-checks
bunx biome lint src             # READ-ONLY. 79 errors / 109 warnings. `bun run lint` WRITES.
bunx biome format src           # READ-ONLY. 249 files. `bun run format` WRITES.
bun run build                   # needs ../rsbuild-plugin-ui-css-purge symlinked; CI does this
bun run playground:dev          # fastest visual loop; aliases @pathscale/ui -> ./src
```

**Reproduce the duplication census:** the 6-line normalized-window scanner used for SEV-4 is
at
`/private/tmp/claude-501/-Users-revenge-code/4526fe76-867f-4d6a-a325-84ff907ebbb8/scratchpad/dup.ts`
(scratchpad, may be cleaned up; it is ~40 lines and trivial to rewrite). Spot checks:

```bash
rg -n "const invokeEventHandler" src | wc -l        # 25
rg -n "compareDocumentPosition" src/components      # 4 sites, one renamed
rg -l "mergeRefs|createTagName|cva" src --glob '!src/lib/**'   # empty => lib is dead
```

**Surprises about this repo:**

- `bun run check` is **not** Biome, it is the contract script. `bun run lint` and
  `bun run format` **write to your working tree**. Use `bunx biome lint` / `bunx biome format`
  for read-only inspection, which is what I did throughout this review.
- `node_modules/` was absent in the checked-out tree. `bun install --frozen-lockfile` restores
  it without touching `bun.lock` (verified: `git status` unchanged afterwards).
- `bun install` prints `+ @pathscale/ui@1.2.10` because the package depends on itself
  (SEV-13). That is a bug, not a local artefact.
- The version in `package.json` is now owned by `.github/workflows/release.yml`. Do not
  hand-bump it; the workflow derives it from conventional commits and publishes on push to
  master via npm OIDC. Several docs still describe the old manual process.
- `src/components/` contains two entries that are not components: `types.ts` and `utils.tsx`.
  `ls src/components | wc -l` gives 106; the real directory count is 104, of which `_shared`
  is infrastructure and `password-rules` is a re-export shim. `README.md`'s "103 components"
  is the correct consumer-facing number.
<details>
<summary>Nits (one line each)</summary>

- `src/index.ts:344` and neighbours run ~110 chars against a configured `lineWidth: 80`; 1,240 lines in `src/` exceed it.
- Section-banner comments `// Types`, `// Hook`, `// Component`, `// Context`, `// Factory`, `// Public types` appear in 5 files, all in the form subsystem (`hooks/form/createForm.ts`, `FormContext.ts`, `useFieldNew.ts`, `components/form/FormField.tsx`, `FormSubmitButton.tsx`) and nowhere else in 419 files: a different authoring generation.
- `src/hooks/form/useFieldNew.ts` exports `useField`; the "New" suffix is residue (already noted at `CLAUDE-INTERNALS.md:114`).
- `scripts/copy-css.js` is dead: not in `package.json` scripts, not in `rslib.config.ts`, not in any workflow. It is also the only `.js` among four `.ts` scripts, and its `copyTree("src/components", "dist")` target no longer matches the layout.
- `cally@^0.8.0` (`package.json:84`) is an unused devDependency; the only source "hits" are the word "automatically".
- `src/lib/style/classes.ts:109` has `// biome-ignore lint: valid` with no rule name and no reason, the only unjustified ignore in the repo, in a file nothing imports.
- 22 JSX banner comments (`{/* Header */}`, `{/* Messages */}`) exist, 18 of them in `live-chat/` and `immersive-landing/`.
- `docs/ui-usage.md:63` omits `Alert` from the Overlays family; `README.md:71` includes it.
- `ButtonGroup` and `CloseButton` are barrel-exported but absent from both `README.md` and `docs/ui-usage.md`.
- `scripts/check-package.ts`, `next-version.ts`, `smoke-consumer.ts` (480 lines, all wired into `release.yml`) are documented nowhere.
- Empty CSS blocks at `Button.css:91`, `DateField.css:188`, `TextArea.css:69`, `TextField.css:28` and `:31`, `TimeField.css:188` (CSS sibling slice owns the call).
- `src/components/textarea/Textarea.classes.ts` is `export const CLASSES = { base: "" } as const;`, making its `twMerge` call a no-op.
- `src/components/immersive-landing/types/pwa.d.ts` is the only ambient `.d.ts` under `components/`, alongside `src/css.d.ts`.

</details>
</content>
</invoke>
