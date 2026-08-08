# Plan — the remaining frontend reference docs

Brief for the session that writes them. The `docs/frontend-conventions.md` in each of the
seven full frontend apps names four references. One is done, one should be dropped, and
two need writing — but **not in the shape originally proposed**.

| reference | status |
|---|---|
| UI conventions | ✅ done — [`ui-usage.md`](ui-usage.md), this repo |
| **validation** | **drop it** — see §1 |
| **project map** | write — as a shared doc + per-repo delta, §2 |
| **services contract** | write — as a shared pattern doc, §3 |

The seven apps: `24x.ai`, `honey.id`, `pathscale.com`, `pays.online`, `support.cafe`,
`web3.trading`, `nofilter.io`.

## Why not one doc set per repo

All seven share a near-identical `src/` skeleton:

```
api/ components/ config/ constants/ features/ hooks/ layouts/
lib/ models/ scripts/ services/ stores/ styles/ utils/
```

Present in **all seven**. Variation is thin — `pages/`, `routes.ts`, `routing/`,
`schemas/`, `types/`, `contexts/`, `test/` appear in some; only `nofilter.io` has
genuinely distinct additions (`callapp/`, `realtime/`, `webrtc.d.ts`).

So a per-repo project map would be ~90% duplicated. Twenty-one files, mostly
near-identical, is a drift generator: someone fixes one and six rot. That is the same
failure this repo's `ui-usage.md` exists to avoid.

**Target: 2 new shared docs here + a short per-repo section in each app.**

## §1 — Drop "validation"

Each app's `docs/frontend-conventions.md` already has a **Validation** section with that
repo's exact commands, generated from its own `package.json`. A separate reference would
restate it and then drift from it.

Action: remove `validation` from the References list in all seven
`docs/frontend-conventions.md`, and note in each that validation is covered above.

## §2 — `frontend-architecture.md` (new, this repo)

The shared skeleton, written **once**. Read before writing:

- `~/code/honey.id/src/` — richest example (has `contexts/`, `schemas/`, `routes.ts`)
- `~/code/support.cafe/src/` — leaner example, to see what is genuinely optional
- `~/code/nofilter.io/src/` — the outlier, to see what a real deviation looks like

Document, per directory, **what belongs there and what does not**:
`api/` · `components/` vs `features/` · `hooks/` · `layouts/` · `lib/` · `models/`
(generated — never hand-edit) · `services/` · `stores/` · `config/` · `constants/` ·
`styles/` · `utils/`

Then: routing (`routes.ts` vs a `routing/` directory — both exist, say which is current),
where state lives (`stores/` vs `contexts/`), and the feature-folder convention.

**Then add a short "Deviations" section to each app's `docs/frontend-conventions.md`** —
only what differs from the skeleton. For most apps that is two or three lines. For
`nofilter.io` it is the WebRTC/realtime surface.

## §3 — `frontend-services-contract.md` (new, this repo)

The **wiring pattern**, not an endpoint list — the endpoints are already machine-readable
in each app's `docs/*.services.json`.

Trace one endpoint end to end in `~/code/honey.id` and document the chain:

```
docs/<service>.services.json     the contract (authoritative)
  └─> src/models/<service>/      generated DTOs — NEVER hand-edit
        └─> src/api/services/    wss-adapter wiring (see src/api/configure.ts)
              └─> src/services/  business logic, error normalisation
                    └─> src/hooks/<domain>/   what components consume
```

`honey.id` is the right subject: three services JSONs (`api`, `auth`, `support`) map onto
three `src/models/` subtrees, so the symmetry is visible.

Cover: how a new endpoint is added end to end; what regenerates vs what is hand-written;
how errors surface (`src/services/authErrorNormalize.ts` is a worked example); and the
rule that if it is not in the services JSON it does not exist — say so rather than
guessing.

## Verification before opening PRs

- Every path and filename cited must exist. **Check each one** — do not describe a
  directory you have not opened. Two mistakes this session came from classifying by
  manifest instead of reading code.
- Every link resolves; no reference to a doc that is not written.
- `docs/frontend-conventions.md` in all seven apps updated: UI conventions ✅, validation
  removed, project map and services contract linked here, TODO block reduced to whatever
  genuinely remains.
- Nothing duplicated between the two new docs and `ui-usage.md`.

## Order

1. `frontend-architecture.md` here (read three apps first).
2. `frontend-services-contract.md` here (trace one endpoint in `honey.id`).
3. Update all seven `docs/frontend-conventions.md`: links, drop validation, add the
   per-repo Deviations section.
4. One PR per repo — eight in total, one here and seven in the apps.
