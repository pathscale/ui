# UI release review — 12 September 2026

Status: **not ready to deploy**. This is the working release gate, not a sign-off.
The owner reviews the existing PRs before deployment. Do not land a branch that
automatically deploys or publishes without approval. Before creating a Fly dev
instance, contact the owner so they can be online for questions.

## Concrete TODO

The release script currently computes **3.2.0** from npm's 3.1.0 baseline and
the branch's conventional commits. This is a proposed release, not a published
version; CI remains responsible for assigning and publishing it after approval.

- [x] Build the candidate ps-qa and font-enabled host; verify post-action paint,
  explicit gridcell targets, keyboard shortcuts, and transformed pointer actions.
- [ ] Resolve ps-blitz CI's old-host boundary and verify the coordinated stack.
- [ ] Build and pack fresh UI source with solid-layouts 0.2.4; run the full native
  component sweep, API/package gates, and clean consumer builds.
- [ ] Resolve Honey's cold first-submit failure; verify allowed and denied actions
  for Platform Admin, App Admin, and Guest, including session and security flows.
- [ ] Verify Worktables editing, cancellation, undo, findings, and zoom; rerun
  js.software calendar/navigation and website theme contrast with the fixed driver.
- [ ] Repeat scoped site E2E against the final package, recording missing backend
  contracts separately from library regressions.
- [ ] Push verified changes to the existing PRs and reconcile their descriptions
  and CI results with this evidence for owner review.
- [ ] After owner approval, release the dependency chain in order, verify registry
  availability, and deploy only the approved website changes.

## Release sequence

1. [ps-blitz #95](https://github.com/pathscale/ps-blitz/pull/95): publish 0.4.8
   after the select accessibility and transformed geometry changes are verified.
2. [ps-observability #21](https://github.com/pathscale/ps-observability/pull/21):
   publish blitz-control-protocol 0.5.0 and ps-qa 0.7.1 against that engine.
3. [tauri-runtime-blitz #57](https://github.com/pathscale/tauri-runtime-blitz/pull/57):
   publish 0.4.0 against the shared protocol.
4. [chuzz #45](https://github.com/pathscale/chuzz/pull/45): shared document actions,
   headless build gating, and a font-enabled website QA host.
5. [UI #289](https://github.com/pathscale/UI/pull/289): verify the packaged library
   and its consumers with the released host and driver, then publish through CI.
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
| Native option labels and selected state disappeared in the control refactor | Six regression tests restored; native select fixture passes in Linux CI and with the final local stack | Verify published protocol integration |
| Transformed client rectangles disagreed with painted controls | Four geometry tests, inline fragment tests, and full Linux suite pass; final pointer fixture and Worktables zoom/drag checks pass | CI host boundary and published integration |
| New pointer fixture runs against old chuzz in ps-blitz CI | Geometry passes; pointer action is rejected as unsupported by the host | Run the coordinated candidate stack and resolve the CI host version boundary |
| Responsive layout classes were purged from consumers | Purge manifest includes responsive Grid/Flex classes; 24x landing checks passed | Full consumer rebuilds from the final package |
| Form submission discarded schema output | Typed schema output preserved; six native form checks passed | Honey cold first-submit failure still unresolved |
| ConnectionSettings missing from layout manifest | Export added; isolated package consumer build passed | Pays runtime checks |
| CI weakened paint checks on a fontless host | Font-enabled host builds; UI CI selects full checks; fresh local sweep passes 270 checks across 75 component fixtures | Repeat website theme checks; verify Linux CI after dependency release |
| ps-qa measured contrast and other paint assertions before their declared action | Verdict reads moved after input; native regression passes both restoring and breaking contrast | Repeat website theme checks |
| ps-qa rejected explicit gridcell targets | Explicit role selectors now bypass the generic inventory role list while retaining actionability checks | Native role regression and js.software calendar rerun |
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
| [honey.id #332](https://github.com/pathscale/honey.id/pull/332) | Earlier 177-check baseline passed. Expanded application lifecycle exposes a cold first-submit failure; final three-role coverage is incomplete. |
| [worktables.dev #9](https://github.com/pathscale/worktables.dev/pull/9) | UI/SVG editor replaces Cytoscape/ELK. Fresh package run passes 112/112, including 33 designer and 7 findings checks. Real pointer movement, cancellation, undo, zoom, and emitted schema edits pass. Clean install still awaits house DSL SDK 0.1.2; final visual inspection is pending. |
| [crates.vip #1](https://github.com/pathscale/crates.vip/pull/1) | Earlier 71/71; authentication is deliberately bypassed in both client and backend, so this is not evidence of authenticated role coverage. |
| [24x.ai #11](https://github.com/pathscale/24x.ai/pull/11) | Earlier 137/141; corrected responsive landing 16/16. Auth app identity/backend setup still needs final verification. |
| [js.software #53](https://github.com/pathscale/js.software/pull/53) | Latest observed 309/316; explicit gridcell target fix and unique Layouts page marker prepared. CI now includes all declared groups. Fresh run pending. |
| [kard.vip #8](https://github.com/pathscale/kard.vip/pull/8) | Earlier 223/223; demo actions do not prove payment functionality. |
| [nofilter.io #340](https://github.com/pathscale/nofilter.io/pull/340) | Earlier 127/129; Guest login route failures and suspended dev backend. |
| [pathscale.com #17](https://github.com/pathscale/pathscale.com/pull/17) | Public site remains in scope. Owner confirmed the old portal has little value and need not block UI. Configured `pathscale-be` no longer exists; do not recreate without a reviewed deployment plan. |
| [pays.online #166](https://github.com/pathscale/pays.online/pull/166) | Package build passes after ConnectionSettings export fix. Wallet settings call methods absent from the backend schema; onboarding contains unfinished handlers. The configured Honey app id is a UUID rather than the required 16-character public id. Real payment actions require a defined dev setup and review. |
| [promptsyntax.org #18](https://github.com/pathscale/promptsyntax.org/pull/18) | Earlier 129/129; final package rerun pending. |
| [support.cafe #12](https://github.com/pathscale/support.cafe/pull/12) | Earlier 104/104; final package rerun pending. |
| [web3.trading #18](https://github.com/pathscale/web3.trading/pull/18) | Earlier 102/103 after shared scroll action fix; cookie/theme contrast remains. |
| [ui-starter-app #13](https://github.com/pathscale/ui-starter-app/pull/13) | Earlier 144/144; final package rerun pending. |
| [agencyzero #211](https://github.com/pathscale/agencyzero/pull/211), [#212](https://github.com/pathscale/agencyzero/pull/212) | UI and control integration in scope; core-specific features are handed to a dedicated owner after UI is ready. |

Honey verification must cover **Platform Admin, App Admin, and Guest** with real
allowed and denied behavior. Application creation, saved edits, deletion, logout,
session recovery, and relevant security settings need outcomes, not just screen
presence. TOTP/recovery verification remains incomplete. Only uniquely named
disposable QA applications may be changed or deleted by the lifecycle checks.

Honey's creation handler now awaits its mutation, so the form's submitting state
covers the backend request. This is not yet evidence that the cold-submit failure
is fixed. For that investigation, note that the native runtime reports thrown
jobs but installs no Boa promise-rejection tracker; an ignored rejected submit
promise may therefore leave no runtime diagnostic. Capture the submit rejection
directly in a temporary diagnostic build before concluding that no exception occurs.

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
Worktables has four local commits ahead of its existing PR branch plus the editor
replacement. These changes must be reviewed and pushed together after verification.

Two ps-blitz patch-identity exceptions were inspected: `fix/engine-gaps`' response
metadata fetch is present in the release branch with later configurable user-agent
changes, and `release/engine-fixes`' remaining unique commit only bumps the old
version to 0.3.7. Neither needs replaying onto 0.4.8.

The original `solid-layouts` checkout contains other local work; the published root
style fix was made in `/Users/revenge/code/solid-layouts-ui-release` to preserve it.

## Pending final run

The shared build window completed: the font-enabled host, driver, UI package,
Honey and Worktables build successfully. UI's full native sweep passes 270 checks
across 75 fixtures; API/package checks pass across 187 components and 1,002 files.
The native gesture/paint regression and ps-qa clippy/tests pass. Worktables passes
112/112. Honey still fails its cold first application submission.

The core task has another requested 5–10 minute measurement window; heavy local
work is held during it. Next: inspect Honey's disposable bundle with logging
injected after minification (the production optimizer removes source logging),
then finish remaining consumers and CI integration. No deployment sign-off yet.
