# UI release review — 12 September 2026

Status: **UI 3.2.0 package release approved and locally verified**. Website
deployments remain separately reviewed. Before creating a Fly dev instance,
contact the owner so they can be online for questions.

## Concrete TODO

The release script computes **3.2.0** from npm's 3.1.0 baseline and the branch's
conventional commits. Local release verification is complete; the repository's
release workflow assigns and publishes the version after the fast-forward.

- [x] Build the candidate ps-qa and font-enabled host; verify post-action paint,
  explicit gridcell targets, keyboard shortcuts, and transformed pointer actions.
- [x] Verify ps-blitz CI with the pinned coordinated stack. Run 34632611122
  passes at 97ca22ca, including the WebSocket listener and contrast-settling fixes.
- [x] Build and pack fresh UI source with solid-layouts 0.2.4; run the full native
  component sweep, API/package gates, and consumer builds against the packed candidate.
- [x] Resolve Honey's cold first-submit failure and run the expanded 196-check suite,
  including Platform Admin, App Admin, Guest, and password change/restore.
- [x] Finish reproducible recovery-code coverage. TOTP confirmation and Telegram
  enrollment/login remain separate security gates for Honey.
- [x] Verify Worktables editing, cancellation, undo, findings, and zoom (112/112).
- [x] Confirm the packed Calendar fix in js.software (316/316).
- [x] Resolve Web3 carousel settling. Its complete final run passes 103/103 after
  the landing surface was scoped away from the independently animated chat halo.
- [x] Repeat scoped site E2E against the final package, recording missing backend
  contracts separately from library regressions.
- [x] Push the verified library, driver, runtime, and host changes to their
  existing release branches and reconcile their descriptions with local evidence.
- [x] Release ps-blitz 0.4.8, blitz-control-protocol 0.5.0, ps-qa 0.7.1,
  tauri-runtime-blitz 0.4.0, and the Chuzz 0.1.37 host in dependency order.
- [ ] Release UI 3.2.0 and verify a fresh consumer install from npm.
- [ ] Deploy only the separately reviewed website changes.

## Release sequence

1. [ps-blitz #95](https://github.com/pathscale/ps-blitz/pull/95): 0.4.8 published.
2. [ps-observability #21](https://github.com/pathscale/ps-observability/pull/21):
   blitz-control-protocol 0.5.0 and ps-qa 0.7.1 published against that engine.
3. [tauri-runtime-blitz #57](https://github.com/pathscale/tauri-runtime-blitz/pull/57):
   0.4.0 published against the shared protocol.
4. [chuzz #45](https://github.com/pathscale/chuzz/pull/45) and
   [#46](https://github.com/pathscale/chuzz/pull/46): shared document actions,
   headless build gating, and the signed 0.1.37 host published.
5. [UI #289](https://github.com/pathscale/UI/pull/289): publish 3.2.0 after the
   packaged library and its consumers passed against the released host and driver.
6. Review and deploy approved website PRs using the published library.

The older handover put tauri-runtime-blitz before ps-observability. Its manifest
requires protocol 0.5, so that order cannot resolve. Registry dependency failures
before the upstream publications are expected and are separate from regressions.

`solid-layouts` 0.2.4 has already published through
[PR #19](https://github.com/pathscale/solid-layouts/pull/19). It forwards caller
styles to the root slot; without it, UI Card positions and dimensions are dropped.
UI and consumer manifest floors and resolvable lockfiles are updated. UI has the
published 0.2.4 installed; final clean consumer installs remain part of this gate.
Worktables' clean install still awaits the separate house DSL SDK 0.1.2 release.

## Library and harness findings

| Finding | Current evidence | Remaining verification |
| --- | --- | --- |
| Native option labels and selected state disappeared in the control refactor | Six regression tests restored; the native Select fixture passes all 7 outcomes with published ps-blitz 0.4.8, protocol 0.5.0, ps-qa 0.7.1, and Chuzz 0.1.37 | Complete |
| Transformed client rectangles disagreed with painted controls | Four geometry tests, inline fragment tests, and full Linux suite pass; final pointer fixture and Worktables zoom/drag checks pass | CI host boundary and published integration |
| CI needs the coordinated unpublished runtime stack | Exact dependency revisions pinned; nested workspace exclusions resolved Cargo inheritance. Coordinated CI run 34632611122 passes with refreshed socket/contrast revisions | Verify registry integration after approval |
| Calendar cells captured selection state once | Cell state is now reactive; six native checks verify selection changes and controlled callbacks in both directions. Packed js.software run passes 316/316 | Owner review |
| Honey CreateApp stalled during socket connection | chuzz iterated a live listener array; the first RPC removed its open listener and skipped the next. Snapshot dispatch fixes three consecutive 15-step lifecycles and the full 192-check suite; refreshed coordinated CI passes | GUI build review and registry integration |
| Responsive layout classes were purged from consumers | Purge manifest includes responsive Grid/Flex classes; 24x landing checks passed | Full consumer rebuilds from the final package |
| Form submission discarded schema output | Typed schema output preserved; six native form checks and Honey's expanded suite pass | Owner review |
| ConnectionSettings missing from layout manifest | Export added; isolated package consumer build passed | Pays runtime checks |
| A fontless host weakens paint checks | The font-enabled release host builds; a fresh local sweep against the public dependency stack passes 273 checks across 75 component fixtures | Complete |
| ps-qa measured paint before input, then sampled contrast transitions too early | Reads moved after input; contrast honors the outcome and stability windows. Six native driver scenarios pass, including delayed repair and persistent contrast failure. Web3 theme group passes 18/18 | Final stack sweeps |
| ps-qa rejected explicit gridcell targets | Explicit role selectors now bypass the generic inventory role list while retaining actionability checks; native Calendar and packed js.software checks pass | Owner review |
| ps-qa's older drag diagnostic only scrolls containers | Actual pointer dragging/cancellation added to CLI and declarative checks; native fixture and Worktables movement/cancellation/undo checks pass | PR and CI review |
| UI sweep could accept bundles older than the library source | Staleness guard now includes library source and package output; confirmed it rejects the current outdated bundle before launching a host | Fresh full build and sweep |

Use `/Users/revenge/code/ps-observability/target/debug/ps-qa` (0.7.1) and
`/Users/revenge/code/chuzz/target/release/chuzz-headless` for local candidate runs.
The installed `~/.cargo/bin/ps-qa` was 0.6.3 and is not the release candidate.
`qa-hosted --checks` takes a directory. Build before running: stale built files do
not verify source changes. Keep pointer, keyboard, scroll, paint, and persistence
failures visible; do not replace them with presence checks to obtain a pass.

## Website scope

All local checkouts are under `/Users/revenge/code`; remotes are `pathscale/<name>`.
Counts below are earlier observed runs, not a final release verdict. They do not
prove that every product feature is covered, and must be repeated against the
final package and runtime. Check definitions have changed since some runs.

| Repository / existing PR | Observed result or blocker |
| --- | --- |
| [honey.id #332](https://github.com/pathscale/honey.id/pull/332) | Expanded suite passes 193/196. The three failures truthfully identify the backend's empty API-key regeneration response; the dedicated error flow passes 18/18. Recovery-code generation, two login/rotation cycles, old-code rejection, save gates, unchanged-password login, and sign-out pass in a reusable 33/33 runner. TOTP and Telegram remain unverified. |
| [worktables.dev #9](https://github.com/pathscale/worktables.dev/pull/9) | UI/SVG editor replaces Cytoscape/ELK. Final packed-package run passes 112/112, including 33 designer and 7 findings checks. Real pointer movement, cancellation, undo, zoom, and emitted schema edits pass. Visual inspection confirms the UI cards, native SVG relationships, toolbar, and inspector. Clean install still awaits house DSL SDK 0.1.2. |
| [crates.vip #1](https://github.com/pathscale/crates.vip/pull/1) | Final packed-package run passes 71/71; authentication is deliberately bypassed in both client and backend, so this is not evidence of authenticated role coverage. |
| [24x.ai #11](https://github.com/pathscale/24x.ai/pull/11) | Final packed-package runs pass 141/141 at desktop width and 20/20 at phone width. The dev login still authenticates under Honey's dev application because 24x has no usable dev registration of its own. |
| [js.software #53](https://github.com/pathscale/js.software/pull/53) | Packed Calendar fix passes 316/316. CI includes all declared groups. |
| [kard.vip #8](https://github.com/pathscale/kard.vip/pull/8) | Final packed-package run passes 223/223; demo actions do not prove payment functionality. |
| [nofilter.io #340](https://github.com/pathscale/nofilter.io/pull/340) | Final packed-package run passes 129/129. |
| [pathscale.com #17](https://github.com/pathscale/pathscale.com/pull/17) | The public/UI flow and carousel pass against the final package. The dev run passes 105/124: the known username and wrong-password refusal work, but the correct-password callback does not create a protected session, stranding 19 dependent portal/settings checks. Owner confirmed the old portal has little value and need not block UI. Configured `pathscale-be` no longer exists; do not recreate without a reviewed deployment plan. |
| [pays.online #166](https://github.com/pathscale/pays.online/pull/166) | Packed-package typecheck and build pass after adopting shared ConnectionSettings. There is no ps-qa profile. Wallet settings call methods absent from the backend schema; onboarding contains unfinished handlers. The configured Honey app id is a UUID rather than the required 16-character public id. Real payment actions require a defined dev setup and review. |
| [promptsyntax.org #18](https://github.com/pathscale/promptsyntax.org/pull/18) | Final packed-package run passes 129/129. |
| [support.cafe #12](https://github.com/pathscale/support.cafe/pull/12) | Final packed-package run passes 104/104. |
| [web3.trading #18](https://github.com/pathscale/web3.trading/pull/18) | Final packed-package run passes 103/103. Theme contrast settles correctly, the last carousel slide remains stable for 500ms, and the guest chat closes. |
| [ui-starter-app #13](https://github.com/pathscale/ui-starter-app/pull/13) | Final packed-package run passes 144/144. |
| [agencyzero #211](https://github.com/pathscale/agencyzero/pull/211), [#212](https://github.com/pathscale/agencyzero/pull/212) | UI and control integration in scope; core-specific features are handed to a dedicated owner after UI is ready. |

Honey verification must cover **Platform Admin, App Admin, and Guest** with real
allowed and denied behavior. Application creation, saved edits, deletion, logout,
session recovery, and relevant security settings need outcomes, not just screen
presence. Recovery verification is complete; TOTP and Telegram remain incomplete. Only uniquely named
disposable QA applications may be changed or deleted by the lifecycle checks.

Honey's backend production approval has a separate security review item. The
July 27 audit's app-token trust concern still matches the inspected auth backend
at `60d37dc`: `src/services/auth/app_token.rs` checks that a caller-selected
source app exists and accepts its callback's user identity, without an explicit
source-to-target trust check. This is a source finding, not a live exploit test.
Do not treat passing recovery or UI checks as closing that backend boundary.

Do not count the current Honey or js.software `biome` scripts as validation:
their manifests install the unrelated `biome` 0.3.3 package rather than
`@biomejs/biome`. Its CLI can return success without checking files. Their
TypeScript, build, and native E2E results above are separate evidence. Repairing
the formatter dependency and stale configuration remains tooling cleanup.

The previous UI run stopped at Chuzz's stale GUI build path. Chuzz #45 and #46
fixed that release path; the published 0.1.37 host then passed the complete local
273-check component sweep. The checks were kept at the full font-enabled profile.

Honey's creation handler now awaits its mutation, so submitting covers the backend
request. Tracing showed validation completed but CreateApp was never sent when
GetApps and CreateApp queued during WebSocket connection. The first open listener
removed itself and chuzz skipped the next listener. The host now snapshots
listeners before dispatch; three clean lifecycles and the full suite pass.

Pathscale restoration, if approved, should mirror crates.vip's low-cost deployment:
shared IPv4, shared CPU, one small machine. The crates backend's `fly.toml` and
`docs/deploy.md` are the reference. Do not assume the former Pathscale placeholder
callback or diagnostic dashboard is a production feature specification.

`consulting.parcle.ai` is unmaintained, intentionally absent locally, and excluded
from this release gate.

## Local changes and branches

Preserve unrelated changes and append work to existing PRs. Do not recreate the
deleted scratchpad checkout or delete branches while auditing them.

The scoped branch comparison found most apparently orphaned engine/control commits
already present as equivalent patches. Pays' remaining local work was inspected:

- `feat/engine-console`: `6ed3396` adds a separate enforcement-engine contract,
  connection, status and payment pages. Its default backend is localhost and it
  has no verified deployment. The request-id control updates a signal after the
  form has captured its defaults, so new-id and post-send rotation need behavioral
  verification and correction before use. Preserve this feature branch; it is not
  a missing UI migration fix and is not approved payment functionality.
- The following `aa6cccd` removes old theme/table dependencies; the current release
  branch already contains the corresponding migration, so do not replay it blindly.
- `wip/local-save-20260815`: `c0560c1` and `5309222` contain signing design documents
  and their correction. Preserve these for payment/backend review; they do not
  change the shipped frontend. No remote branch contains `6ed3396` or `5309222`.

No local branch was deleted. Any later integration belongs in the existing Pays
PR and must retain its backend and payment review requirements.
Worktables' four previously local commits and the verified editor replacement are
now pushed to its existing PR. They remain subject to owner review.

Two ps-blitz patch-identity exceptions were inspected: `fix/engine-gaps`' response
metadata fetch is present in the release branch with later configurable user-agent
changes, and `release/engine-fixes`' remaining unique commit only bumps the old
version to 0.3.7. Neither needs replaying onto 0.4.8.

The original `solid-layouts` checkout contains other local work; the published root
style fix was made in `/Users/revenge/code/solid-layouts-ui-release` to preserve it.

## Final local release candidate

The font-enabled host, ps-qa 0.7.1 driver, packed UI package, Honey, and Worktables
build successfully. UI's final native sweep passes 273 checks across 75 fixtures;
API/package checks pass across 187 components and 1,002 files. The full chuzz GUI
release build, workspace tests, and clippy pass. Worktables passes 112/112, JS
Software 316/316, Web3 103/103, 24x 141/141 plus 20/20 mobile, crates 71/71,
kard 223/223, nofilter 129/129, Prompt Syntax 129/129, support.cafe 104/104,
and the starter 144/144.

Honey's complete run is 193/196 because the backend returns no regenerated API
key; the truthful error path passes 18/18 and the reusable recovery runner passes
33/33. Pathscale's public/UI flow passes, while its dev application callback does
not establish the protected session. Pays builds but has no native QA profile and
has explicit backend contract gaps. These site-specific boundaries do not indicate
a UI package regression.

No deployment sign-off is implied. The owner must review the PRs, then the five
dependency releases must publish in order before registry CI and approved website
deployments can complete.
