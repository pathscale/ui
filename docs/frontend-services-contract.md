# Frontend services contract — contract to hook

**This is the source of truth for how a backend endpoint reaches a component**, for humans
and agents alike, across `24x.ai`, `honey.id`, `pathscale.com`, `pays.online`,
`support.cafe`, `web3.trading` and `nofilter.io`. They link here rather than each keeping
a copy.

This documents the **wiring pattern**. It is deliberately not an endpoint list — the
endpoints are already machine-readable in each app's `docs/*.services.json`, and any list
here would be stale within a week.

Neighbours: [`frontend-architecture.md`](frontend-architecture.md) for where code lives,
[`ui-usage.md`](ui-usage.md) for `@pathscale/ui`.

## The rule that comes before everything

**`docs/*.services.json` is the contract, and it is authoritative.** Endpoints,
parameters, returns, error variants, roles — if it is not in there, it does not exist as
far as the frontend is concerned.

Do not invent an endpoint, add a parameter the contract doesn't declare, or assume a
return shape because it would be convenient. When something you need is missing, **say so
and stop** — that is a backend conversation, not a frontend workaround. Guessing produces
code that typechecks, passes review, and fails against a real server.

Apps carry one or more contracts. `honey.id` has three — `docs/api.services.json`,
`docs/auth.services.json`, `docs/support.services.json` — which is why its `src/models/`
has three subtrees. Most apps have one.

## The chain

```
docs/<service>.services.json          the contract — authoritative, hand-maintained
  │
  ├─(bun run schema)─> src/models/<contract>/…          generated DTOs + enums + errorCatalog
  └─(bun run schema)─> src/api/services/<contract>/…    generated method maps (JSON)

src/api/configure.ts    reads docs/*.services.json directly, configures @pathscale/wss-adapter
  └─> src/api/index.ts        exports callable sessions (authApi, apiApi, …)
        └─> src/hooks/<group>/useX.ts     solid-query wrapper — what components consume
              └─> src/services/…          only where there is domain logic to own
```

Two things about this diagram are easy to get wrong, so they are worth stating plainly:

**`src/api/services/` is generated, and `configure.ts` does not read it.** The method map
`configure.ts` passes to the adapter is built in-process from `docs/*.services.json`
(`buildMethods()`). The JSON under `src/api/services/` is a *separate emission* of the same
information, and is imported by hand in only a couple of places — in `honey.id`, just
`src/features/auth/reauth/reauthSession.ts`. Do not treat that directory as the wiring.

**`src/services/` is not a mandatory hop.** A plain read goes hook → `api/`. The
`services/` layer is entered when there is real logic — multi-step flows, error
normalisation, connection lifecycle. Routing every call through it "for consistency" adds
a pass-through file that does nothing.

## Worked trace — `GetUsers` in `honey.id`

**1. The contract.** `docs/api.services.json` declares endpoint code `10000`, name
`GetUsers`, parameters `appPublicId`, `page`, `pageSize`.

**2. Generation.** `bun run schema` (which is `bun run src/scripts/schema.js` in every one
of the seven apps) reads the contract and writes:

- `src/models/api/userApi/GetUsersDto.ts` — `GetUsersParams` and `GetUsersResponse`,
  carrying a "DO NOT MODIFY IT BY HAND" banner
- `src/models/api/userApi/index.ts` — barrel re-export
- `src/models/api/enums/` — the contract's enums, one file each, plus an `index.ts`
- `src/api/services/api/userApi.json` — `{"10000": {"name": "GetUsers", "parameters": [...]}}`

**3. Transport.** `src/api/configure.ts` builds the adapter configuration — remote URL per
service, the method map, `timeout`, an `onError` handler and per-service `onDisconnect` —
and calls `wssAdapter.configure()`. `src/api/index.ts` exports the resulting session
objects.

**4. The hook.** `src/hooks/users/useGetUsers.ts` is the whole consumer-facing surface:

```ts
export const useGetUsers = (params: GetUsersParams, options?: { enabled?: boolean }) =>
  useQuery<NormalizedGetUsersResponse>(() => ({
    queryKey: userApiKeys.users(params.appPublicId, keyParams),
    enabled: (options?.enabled ?? true) && serviceStore.servicesInitialized && !!params.appPublicId,
    queryFn: async () => {
      const res = await apiApi.GetUsers(params);
      const payload = (res as { params?: GetUsersResponse }).params ?? res;
      return { ...payload, data: (payload.data ?? []) as UserListItem[] };
    },
  }));
```

Four conventions are visible in those few lines, and all four are load-bearing:

- **Types come from `models/`**, never hand-declared alongside the hook.
- **The key comes from `src/constants/queryKeys.ts`** (`userApiKeys.users(...)`), never
  inlined.
- **`enabled` gates on `serviceStore.servicesInitialized`.** Without it the query fires
  before the socket is up and fails on first paint.
- **The response is unwrapped defensively** — `res.params ?? res` — because the adapter
  may hand back either shape.

**5. Components** call `useGetUsers(...)` and read `.data` / `.isLoading`. They never touch
`apiApi`.

## Adding an endpoint

1. **Confirm it exists in `docs/*.services.json`.** If not, stop — nothing below is valid.
2. **Regenerate:** `bun run schema`. Never hand-write the DTO.
3. **Commit the generated output** alongside your change; it is checked in.
4. **Add a query key** to `src/constants/queryKeys.ts`.
5. **Write the hook** in `src/hooks/<group>/`, mirroring the nearest existing one —
   same unwrapping, same `enabled` gate.
6. **Add a `services/` function only if there is logic to own.** Otherwise skip it.
7. **Consume the hook** from the component.

Regenerated, never hand-edited: `src/models/**` and `src/api/services/**`.
Hand-written: everything in `hooks/`, `services/`, `constants/queryKeys.ts`, and
`api/configure.ts`.

## How errors surface

`src/services/authErrorNormalize.ts` in `honey.id` is the worked example, and it closes the
loop back to the contract: it imports `AUTH_ERROR_CATALOG` and `ERROR_CODE_NAME_BY_VALUE`
from `src/models/auth/errorCatalog.ts` — themselves generated from the `errors` blocks in
`docs/auth.services.json`. Backend error variants are therefore typed, not guessed at from
strings.

Four rules it encodes, all worth copying:

- **Never branch on a message string.** Control flow keys off `kind` and `code`; the
  `NormalizedAuthError.message` field is commented "never use for control flow" precisely
  because messages are display text and will change.
- **Allowlist what reaches the UI.** `SAFE_PARAM_KEYS` passes through timing and count
  fields (`retryAfter`, `attemptsRemaining`, …) and drops everything else, so a backend
  that starts attaching a token to an error payload cannot leak it into a component.
- **Never surface the raw error.** It is kept on `raw` for logging and not rendered.
- **Distinguish known from unknown.** `isKnownServiceError` separates a declared contract
  variant from anything else, so unknown failures get a generic message rather than an
  unhandled branch.

Transport-level failures are handled once, centrally, in `configure.ts`'s `onError`:
auth failures invalidate the session through `authStore`, and everything else is logged.
Individual hooks do not re-implement that.

## When the contract and the code disagree

The contract wins. If `src/models/` looks wrong, regenerate before you debug — the most
common cause is a contract that moved and generated files that didn't. If the contract
itself looks wrong, that is a backend conversation. Do not paper over it in a hook.
