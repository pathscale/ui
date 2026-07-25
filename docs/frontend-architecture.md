# Frontend architecture — the shared `src/` skeleton

**This is the source of truth for how a pathscale frontend app is laid out**, for humans
and agents alike. Seven apps share it: `24x.ai`, `honey.id`, `pathscale.com`,
`pays.online`, `support.cafe`, `web3.trading`, `nofilter.io`. They link here rather than
each keeping a copy — one skeleton, one description, no drift.

Scope: **where code goes and why**. Two neighbours cover the rest:

- [`ui-usage.md`](ui-usage.md) — how to use `@pathscale/ui` (components, theming, forms).
- [`frontend-services-contract.md`](frontend-services-contract.md) — how a backend
  endpoint is wired from contract to hook.

Anything a single app does differently belongs in **that app's**
`docs/frontend-conventions.md`, under its "Deviations" section — not here.

## The skeleton

Present in **all seven** apps, without exception:

```
src/
  api/         config/     features/   layouts/   models/    services/  styles/
  assets/      constants/  hooks/      lib/       scripts/   stores/    utils/
```

Plus five root files, also in all seven: `App.tsx`, `config.ts`, `env.d.ts`,
`index.css`, `index.tsx`.

Optional, present in some:

| directory | in |
|---|---|
| `pages/` | honey.id, pathscale.com, pays.online, web3.trading, nofilter.io |
| `routes.ts` | same five |
| `types/` | same five |
| `schemas/` | honey.id, web3.trading, nofilter.io |
| `routing/` (dir) | pathscale.com, nofilter.io — `pays.online` has `routing.ts` as a file |
| `test/` | pathscale.com, nofilter.io |
| `contexts/` | honey.id only |
| `callapp/`, `realtime/`, `webrtc.d.ts` | nofilter.io only |

`24x.ai` and `support.cafe` are the lean end — skeleton only, no `pages/`, no route table.

Note `config.ts` (file) and `config/` (directory) coexist in every app. They are not
duplicates: see below.

## What belongs where

### `api/` — transport wiring, nothing else

`configure.ts` builds the `@pathscale/wss-adapter` configuration — remote URLs, the
method map, `onError`, `onDisconnect` — and calls `wssAdapter.configure()`. `index.ts`
exports the ready-to-call session objects (`authApi`, `apiApi`, …) that hooks import.

`api/services/` is **generated output**, not hand-written wiring: one JSON method map per
service, emitted by `bun run schema`. Do not edit it, and do not add code files to it.

**Does not belong:** business logic, retries with domain meaning, anything importing from
`features/`.

### `models/` — generated DTOs, never hand-edited

Every type describing a backend payload. Generated from the services JSON; edits are
silently destroyed on the next `bun run schema`.

Two layouts are in the wild. Newer apps group by contract first
(`src/models/api/userApi/GetUsersDto.ts` in `honey.id`); older ones are flat by service
(`src/models/paymentApi/` in `pays.online`). Both are generated; follow whichever your
repo already uses.

**The exception worth knowing:** a few hand-written files sit at the *top level* of
`models/` — `honey.id` has `src/models/roles.ts` and
`src/models/supportCafeChatMessage.ts`. The never-hand-edit rule applies to the generated
*subdirectories*, not to these. Generated files carry a "DO NOT MODIFY IT BY HAND" banner;
if a file has no banner, it is hand-written.

### `services/` — business logic and error normalisation

Where an API call becomes a domain operation: sequencing multiple calls, normalising
errors into something a component can act on, owning connection lifecycle.

Two roles live here in practice:

- **`serviceStore.ts`** — connection and session lifecycle. Present in all seven. Hooks
  import it for the `servicesInitialized` readiness gate.
- **`authServices.ts` / `authErrorNormalize.ts`** — domain logic proper.

**Not every call passes through here.** A plain read often goes hook → `api/` directly.
`services/` is entered when there is logic to own, not as a mandatory relay layer.

**Does not belong:** JSX, component imports, route knowledge.

### `hooks/` — what components actually consume

One hook per endpoint or per interaction, wrapping `@tanstack/solid-query` and returning
reactive state. Subdirectory grouping differs by app and both are fine: by domain
(`src/hooks/users/`, `src/hooks/metrics/` in `honey.id`) or by service
(`src/hooks/userApi/`, `src/hooks/adminApi/` in `support.cafe`).

Query keys are centralised in `src/constants/queryKeys.ts` — never inline a key string.

**Does not belong:** JSX, direct DOM work, endpoints that aren't in the services JSON.

### `components/` vs `features/` — the split that matters most

- **`components/`** — reusable and domain-agnostic. If it would still make sense in a
  different app, it goes here. Grouped by kind (`components/buttons/`,
  `components/tables/`, `components/skeletons/`).
- **`features/`** — one directory per product area, owning its own slice end to end. The
  convention inside is `components/`, `hooks/`, `pages/`, plus whatever that feature needs
  (`honey.id` has `features/auth/utils/`, `features/auth/schema/`,
  `features/admin/skeletons/`).

The test: **would this make sense outside this product area?** Yes → `components/`.
No → that feature's folder. A feature may import from `components/`; `components/` must
never import from `features/`.

### `stores/` vs `contexts/` — global state vs tree-scoped values

- **`stores/`** — module-level `createSignal` singletons, imported directly, no provider.
  This is the default and covers nearly everything: `authStore.ts`, `connectionStore.ts`,
  `i18nStore.ts` recur across apps.
- **`contexts/`** — Solid `createContext`, only for values that *cannot* be global because
  they belong to one subtree. The single example across all seven is `honey.id`'s
  `src/contexts/DashboardNavContext.tsx`, which passes a DOM element reference down one
  layout.

Reach for a store first. A context is justified only when a value is genuinely per-subtree.

### The small ones

- **`config/`** (directory) — app configuration modules: `routes.ts` (path constants),
  `featureFlags.ts`, `i18n.ts`. **`config.ts`** (root file) is the environment/runtime
  config entry — different thing, both exist everywhere.
- **`constants/`** — fixed values, no logic: `queryKeys.ts`, `connectionSettings.ts`.
- **`lib/`** — self-contained utilities with real internal complexity, often a
  subdirectory of their own (`lib/secureStorage/`, `lib/theme.ts`).
- **`utils/`** — small stateless helpers, one concern per file (`formatTimestamp.ts`,
  `roleUtils.ts`). If it grows a subdirectory and internal state, it belongs in `lib/`.
- **`layouts/`** — page shells composed by the router (`AppLayout.tsx`, `AuthLayout.tsx`,
  `RootLayout.tsx`), exported through an `index.ts`.
- **`styles/`** — global CSS and theme files. Component styling is Tailwind utilities plus
  `@pathscale/ui` tokens; see [`ui-usage.md`](ui-usage.md).
- **`scripts/`** — build and codegen scripts run through `package.json`, notably
  `schema.js`. Not application code; never imported by `src/`.
- **`assets/`** — static files (images, icons).

## Routing

Three layers. They stack — a later one never replaces an earlier one.

**1. Path constants — `src/config/routes.ts`. Present in all seven, always.** Exports a
`ROUTES` object and any path helpers. Every path string in the app comes from here; never
hard-code a route string in a component.

**2. The route table — `src/routes.ts`.** Exports `routes: RouteConfig[]`, mapping paths to
components, layouts and guards. Five apps have it; `24x.ai` and `support.cafe` instead
declare `<Route>` elements inline in `App.tsx`, with guards as wrapper components
(`RequireAuth`, `RedirectIfAuth`, `RequireRole`).

**3. Derived groupings — `src/routing/`.** Filters the route table into groups the shell
renders (`routeGroups.ts`), and in `nofilter.io` also access policy
(`src/routing/accessPolicy.ts`). This layer **imports** `~/routes` — it is a consumer of
layer 2, not an alternative to it. `pays.online` does the same thing in a single
`src/routing.ts` file.

So "`routes.ts` or `routing/`?" is a false choice: if an app has `routing/`, it has
`routes.ts` too, and both sit on `config/routes.ts`.

## Adding something new — where does it go?

| you are adding | it goes in |
|---|---|
| a backend call | `hooks/` (see [`frontend-services-contract.md`](frontend-services-contract.md)) |
| a screen | that feature's `pages/`, registered in `routes.ts` / `App.tsx` |
| a widget used by one feature | that feature's `components/` |
| a widget used by three features | `components/` |
| global state | `stores/` |
| a value scoped to one subtree | `contexts/` |
| a pure helper | `utils/`, or `lib/` if it needs its own directory |
| a path | `config/routes.ts`, always |
| a type describing backend data | nowhere by hand — regenerate `models/` |
