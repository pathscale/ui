# UI and website release readiness — 12 September 2026

Status: **UI 3.2.1 is ready for owner review.** No known UI library defect
blocks the patch release. UI 3.2.0 is already published; the current patch
candidate fixes the two regressions found while proving its consumers.

No merge, package publication, or deployment is authorized by this document.
All evidence below is from local builds and native `ps-qa` runs. CI is a
secondary integration signal, not QA evidence.

## What changed after UI 3.2.0

[UI #292](https://github.com/pathscale/UI/pull/292) contains two fixes:

- UI's shipped CSS contained an Icon documentation placeholder shaped like an
  Iconify utility. Consumer production builds therefore printed
  `Invalid icon name: "..."`. The placeholder is gone from source, docs, and
  the built package.
- `ImmersiveLanding` discarded the latest destination when a controlled caller
  selected another slide during an active transition. It now preserves that
  destination, avoids a duplicate timer when its own callback updates the
  controlled route, and cleans up cancelled work.

The conventional release calculation resolves this branch to **3.2.1**.

## UI release gate

The exact branch at `4a04b24` passes:

- 93 component contracts;
- TypeScript and the 547-file library build;
- 320/320 Bun tests;
- 75/75 native component pages through `chuzz-headless`;
- Slider's expanded native contract at 10/10: Arrow keys, Home/End,
  Page Up/Down, controlled pointer dragging, and the final `onChangeEnd` value;
- the package/export gate across 1,002 shipped files;
- strict publint, with one non-blocking suggestion;
- a fresh consumer install, typecheck, Layout registration load, and browser
  bundle;
- `npm pack --dry-run`;
- Pathscale's coordinated local site/backend/Honey run at 138/138;
- the focused Pathscale rapid-carousel countercheck: UI 3.2.0 fails 21/22,
  while this candidate passes 22/22.

Exact packed-candidate consumer runs also pass:

| Consumer | Native result | Package-specific result |
| --- | ---: | --- |
| Web3 Trading | 103/103 | Production build has no phantom UI Iconify warning |
| NoFilter | 132/132 | Its separate documentation placeholder was corrected on PR #340; rebuilt output is clean |
| Pays | 45/45 | Expanded application-id refusal passes; production build has no phantom UI Iconify warning |
| Honey public surface | 13/13 | Production build has no phantom UI Iconify warning |

## Harness patch

[ps-observability #20](https://github.com/pathscale/ps-observability/pull/20)
fixes driver defects discovered during the fleet sweep. It records visible
preparation and timed actions and corrects protocol handling. The branch at
`6442d1d` passes formatting, clippy with all features, 88/88 protocol tests,
150/150 ps-qa tests, and the CLI tests.

Its required publication order is:

1. owner review and merge of ps-observability #20;
2. publish `blitz-control-protocol` 0.5.1;
3. rebuild the native hosts against that protocol;
4. publish `ps-qa` 0.7.2;
5. rerun the site suites with the published driver and rebuilt host.

The earlier one-control-surface dependency chain is complete:
`ps-blitz-dom` 0.4.8, `ps-blitz-debug-control` 0.3.8,
`tauri-runtime-blitz` 0.4.0, `blitz-control-protocol` 0.5.0, `ps-qa` 0.7.1,
and Chuzz 0.1.37 are published. ps-blitz #95's option regression was fixed and
merged; overlapping rescue PR #96 was closed.

## Website and application review queue

Every PR in this table is open and mergeable as of this review. Counts are
fresh local native results from the named PR branches. A passing surface suite
proves the behaviors it names; it does not imply an unavailable backend or an
uncovered product workflow works.

| Repository / existing PR | Local evidence | Release boundary |
| --- | --- | --- |
| [pathscale.com #17](https://github.com/pathscale/pathscale.com/pull/17) | Lint, build, and coordinated local run 138/138 | UI branch is review-ready. A real deployment needs its own production Honey registration and a reviewed backend deployment. |
| [promptsyntax.org #18](https://github.com/pathscale/promptsyntax.org/pull/18) | 129/129 | Review-ready; refresh UI lock after 3.2.1 publishes. |
| [worktables.dev #10](https://github.com/pathscale/worktables.dev/pull/10) | Lint, build, 170/170 | PR #9 is merged. The designer uses UI controls, native SVG relationships, and `@pathscale/worktable-dsl` 0.1.2. Source contains no Cytoscape, canvas, or `getContext`; #10 restores the format gate. |
| [support.cafe #12](https://github.com/pathscale/support.cafe/pull/12) | 104/104 | Signed-out product surfaces are covered. Authenticated support workflows still need a live account/backend fixture. |
| [web3.trading #18](https://github.com/pathscale/web3.trading/pull/18) | 103/103 | Public, auth validation, theme/carousel, and guest chat are covered. Authenticated trading is not yet end-to-end proven. |
| [pays.online #166](https://github.com/pathscale/pays.online/pull/166) | Typecheck, lint, build, 45/45 against UI #292 | Code review can proceed. Deployment is blocked by an obsolete production Honey UUID, no known production Pays registration, and no matching deployed backend. The frontend now refuses the invalid id locally and explains the problem. |
| [honey.id #332](https://github.com/pathscale/honey.id/pull/332) | 196 defined native checks across five roles; deployed dev 193/196; coordinated local app lifecycle 19/19; recovery runner 33/33 | UI is review-ready. Dev's three failures expose the backend's empty regenerated API key. TOTP confirmation and Telegram enrollment/login remain unproved. |
| [js.software #54](https://github.com/pathscale/js.software/pull/54) | The earlier lint/build and 332/332 suite are insufficient; the owner reports many product bugs and is preparing the concrete list. | **Not release-ready.** Reproduce and cover the reported failures before making any readiness claim; then refresh the UI lock after 3.2.1 publishes. |
| [nofilter.io #340](https://github.com/pathscale/nofilter.io/pull/340) | Lint, build, 132/132 | Public/auth validation is covered. A real two-participant WebRTC studio session remains unproved. |
| [24x.ai #11](https://github.com/pathscale/24x.ai/pull/11) | Lint, build, desktop 141/141, phone 20/20 | Session UI uses a Honey application identity workaround. 24x has a dev registration, but no working callback backend for it. |
| [kard.vip #8](https://github.com/pathscale/kard.vip/pull/8) | 223/223 | Demo behavior is covered; this is not real payment evidence. |
| [agencyzero #211](https://github.com/pathscale/agencyzero/pull/211) | Frontend gates and native UI suites pass; Rust tests pass | UI scope is review-ready. Core-specific work in #212 is reserved for a dedicated core owner. |
| [crates.vip #1](https://github.com/pathscale/crates.vip/pull/1) | 71/71 plus 24/24 glyph checks | UI is review-ready. Authentication is deliberately bypassed in this product. |
| [ui-starter-app #13](https://github.com/pathscale/ui-starter-app/pull/13) | 144/144 plus 12/12 glyph checks | Review-ready; refresh UI lock after 3.2.1 publishes. |

`consulting.parcle.ai` is intentionally excluded. It is unmaintained and was
removed locally to avoid implying ownership or release priority.

## Honey role and security coverage

Honey's 196 static outcomes are distributed across nine groups:

| Group | Checks |
| --- | ---: |
| Admin | 24 |
| Application lifecycle | 19 |
| Application | 18 |
| Controls | 18 |
| Entry | 16 |
| Platform | 32 |
| Public | 13 |
| Roles | 21 |
| Security | 35 |

The suite exercises Platform Admin, Platform Support, App Admin, App Support,
and Guest behavior, including allowed and denied actions. The reusable recovery
runner covers two login/rotation cycles, rejection of a used code, save
confirmation, unchanged-password login, and final sign-out.

The three deployed-dev failures are kept visible: regenerate, hide, and reveal
receive an empty replacement API key from the current backend. Coordinated local
branches fix that lifecycle, but their publication is blocked on the WorkTable
core dependency. The related review branches are:

- [honey_id-types #17](https://github.com/pathscale/honey_id-types/pull/17);
- [auth.honey.id-backend #42](https://github.com/pathscale/auth.honey.id-backend/pull/42);
- [api.honey.id-backend #29](https://github.com/pathscale/api.honey.id-backend/pull/29).

AppAdmin is already present on the API backend master branch. It must not be
reimplemented. The remaining Telegram/TOTP and WorkTable work belongs in the
backend/core handoff after the UI release review.

## Release order after owner review

1. Review UI #292 and ps-observability #20.
2. Merge and publish only after explicit owner approval: UI 3.2.1 and the
   protocol/driver sequence above.
3. Refresh each site's lockfile or clean install so it resolves the published
   UI 3.2.1, then repeat its complete native suite locally.
4. Review and merge the UI-complete site PRs individually.
5. Deploy only approved sites. Before creating or changing a Fly dev instance,
   contact the owner so they can be online.
6. Hand Honey persistence, Telegram/TOTP, AgencyZero core, and product-specific
   backend gaps to their dedicated owners with the failing native outcomes kept
   as acceptance criteria.

## Checkout and branch state

The maintained active checkouts match their upstream PR branches. They are
clean except for an intentional AgencyZero local overlay in
`apps/gui/Cargo.toml`, `apps/gui/src/main.rs`, `scripts/qa-full-local.sh`, and
`docs/performance-measurement-todo.md`; those files are outside the UI PR and
must be preserved.

Merged WorkTables PRs #5 through #8 and their dead remote branches are gone.
JS Software's dead `feat/ui-2.3` branch is gone. Chuzz's merged temporary
branches and prunable worktree are gone. Chuzz retains two real local feature
branches, `feat/network-apis` and `feat/diagnostics-tool-client`, because they
contain unique commits.

Pays retains `feat/engine-console` and `wip/local-save-20260815`; both contain
unique, unreviewed backend/payment work and are not part of the UI release.
The ps-observability and Pathscale backend pre-rebase backup branches are kept
deliberately. No release branch depends on the deleted scratchpad tree.
