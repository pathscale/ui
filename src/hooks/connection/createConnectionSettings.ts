import type { Accessor } from "solid-js";
import { createEffect, createRoot, createSignal } from "solid-js";

/**
 * Where an application points itself, and how that survives a reload.
 *
 * Every property in this family ships a "connection settings" page: a toggle,
 * one or more backend URLs, an app id, and a save that reconfigures the
 * transport. Six of them had written it separately, in two different shapes and
 * with different bugs, which is what this replaces.
 *
 * The storage model is per-endpoint rather than global. Four sites had a single
 * `useCustomUrl` covering every backend at once; two had already grown a flag
 * per backend, because pointing the API at a local instance while leaving auth
 * on production is the ordinary case. Per-endpoint is the shape that covers
 * both, and {@link ConnectionSettingsStore.setUseCustom} flips them together
 * for a page that only wants one switch.
 */

export interface ConnectionEndpoint {
  /** Stable key. Names the value in storage and in {@link ConnectionSettingsStore.urls}. */
  name: string;
  /** The address used whenever this endpoint's override is off. */
  fallback: string;
  /**
   * Reject an address before it is saved. Return a message to refuse it, or
   * nothing to accept.
   *
   * Defaults to {@link isAbsoluteUrl}: the value has to parse as an absolute
   * URL. That is deliberately weak, because this hook does not know what a
   * given endpoint speaks. An endpoint that knows should say so -- a WebSocket
   * transport handed `http://…` fails at connect time, long after the page
   * that could have explained it has gone.
   */
  validate?: (url: string) => string | undefined;
}

/** What {@link ConnectionSettingsStore.apply} hands to `onApply`. */
export interface ConnectionSettingsApplied {
  /** Resolved per endpoint, overrides taken into account. Never empty. */
  urls: Readonly<Record<string, string>>;
  appPublicId: string;
  /** Which endpoints the resolved address came from an override for. */
  overrides: Readonly<Record<string, boolean>>;
}

/**
 * The default endpoint check: scheme, `://`, and something to connect to.
 *
 * Exported because a caller writing its own `validate` usually wants this and
 * something else, rather than this replaced.
 *
 * Deliberately not `new URL()`. The native renderer this library is tested
 * against has no `URL` global, so a validator built on it throws, is caught,
 * and reports every address as invalid -- refusing every save while passing
 * every test written in a browser. A check that a settings page cannot run is
 * worse than a looser one it can.
 */
/*
 * Anchored at both ends, with the host and port captured so they can be
 * checked as values rather than as character runs.
 *
 * Unanchored, this matched a valid-looking *prefix*: `wss://host other` passed
 * because the pattern stopped at the space and nothing required it to have
 * reached the end. So did `wss://host:abc`, an unparseable port, because the
 * host run accepted `:` as an ordinary character.
 *
 * Anchoring fixed those and left two more, which are the same mistake one level
 * down: a run of digits is not a port, and a run of hex and colons is not an
 * address. `wss://host:99999` and `https://[1:2:3]` both matched, and both are
 * parse failures rather than addresses this validator is choosing not to judge.
 * The two checks below decide them.
 *
 * Still not `new URL()`, for the reason above: the native renderer this library
 * is tested against has no `URL` global. Still deliberately weak about the rest
 * of the address -- weak is a decision about how much to inspect, while
 * accepting a string that cannot parse is just the wrong answer.
 */
const ABSOLUTE_URL =
  /^[a-z][a-z0-9+.-]*:\/\/(\[[^\]\s]*\]|[^\s/?#:]+)(?::(\d{1,5}))?(?:[/?#]\S*)?$/i;

/** One 16-bit group of an IPv6 address. */
const IPV6_GROUP = "[0-9a-f]{1,4}";
/** The dotted-quad tail an IPv6 literal may end with. */
const IPV4_TAIL =
  "(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
const IPV6_FULL = new RegExp(
  `^(?:${IPV6_GROUP}:){6}(?:${IPV6_GROUP}:${IPV6_GROUP}|${IPV4_TAIL})$`,
  "i",
);
const IPV6_PIECES = new RegExp(
  `^(?:${IPV6_GROUP}(?::${IPV6_GROUP})*)?$`,
  "i",
);

/**
 * Whether a bracketed host is an IPv6 literal.
 *
 * `https://[1:2:3]` is not an address, and a character class of hex digits and
 * colons said it was. This is the shape the URL Standard describes: eight
 * 16-bit groups, or fewer with exactly one `::` standing for the run of zeroes
 * it elides, optionally ending in a dotted IPv4 form.
 *
 * Written out rather than folded into one pattern because the `::` rule is a
 * count, not a shape: each half has to parse, and together they have to leave
 * at least one group for the `::` to stand for.
 */
export const isIpv6Literal = (host: string): boolean => {
  if (IPV6_FULL.test(host)) return true;
  const halves = host.split("::");
  if (halves.length !== 2) return false;
  const [head, tail] = halves;
  /*
   * The separator comes off with the IPv4 tail, or not at all.
   *
   * Stripping a trailing `:` unconditionally accepted `1::2:` -- the tail `2:`
   * became `2` and then parsed as a group. A colon at the end of an address is
   * a separator with nothing after it, which the URL Standard's IPv6 parser
   * rejects, and this layer was persisting it.
   *
   * So the removal is tied to the thing that justifies it: the `:` before a
   * dotted-quad suffix is part of that suffix's separator. Anything else is
   * the tail exactly as written.
   */
  const embeddedV4 = new RegExp(`(?:^|:)(${IPV4_TAIL})$`, "i").exec(tail);
  const groups = embeddedV4
    ? tail.slice(0, tail.length - embeddedV4[1].length).replace(/:$/, "")
    : tail;
  if (!IPV6_PIECES.test(head)) return false;
  if (!IPV6_PIECES.test(groups)) return false;
  const count = (part: string) => (part === "" ? 0 : part.split(":").length);
  return count(head) + count(groups) + (embeddedV4 ? 2 : 0) <= 7;
};

export const isAbsoluteUrl = (url: string): string | undefined => {
  const match = ABSOLUTE_URL.exec(url);
  if (!match)
    return `${url} is not an absolute address (expected scheme://host)`;
  const [, host, port] = match;
  if (host.startsWith("[") && !isIpv6Literal(host.slice(1, -1)))
    return `${url} does not contain a valid IPv6 address`;
  // The URL Standard's port state: a port is a 16-bit number, so 65536 and up
  // is a parse failure rather than a port this validator declines to judge.
  if (port !== undefined && Number(port) > 65535)
    return `${url} has a port outside 0-65535`;
  return undefined;
};

export interface ConnectionSettingsOptions {
  /** `localStorage` key. Namespace it per application; two apps on one origin would collide. */
  storageKey: string;
  endpoints: readonly ConnectionEndpoint[];
  /** The application's own id, when it has one. Stored alongside the URLs. */
  appPublicId?: string;
  /**
   * Run after a successful save or reset, with everything that was applied.
   *
   * This is where an application reconfigures its transport. It is awaited, so
   * `isApplying` covers the reconnect rather than just the write.
   *
   * It receives the whole applied state, not only the URLs: a site that stores
   * an app id here reconfigures its identity from the same call, and passing
   * the URLs alone left it reaching back into the store it had just handed to
   * this hook.
   */
  onApply?: (applied: ConnectionSettingsApplied) => void | Promise<void>;
}

export interface ConnectionSettingsState {
  /** Per endpoint: is the override in use. Absent means no. */
  overrides: Record<string, boolean>;
  /** Per endpoint: the address to use when its override is on. */
  urls: Record<string, string>;
  appPublicId: string;
}

export interface ConnectionSettingsStore {
  /** What is stored, override flags included. Read this to populate a form. */
  readonly state: ConnectionSettingsState;
  /**
   * The address for each endpoint after overrides are applied. This is what a
   * transport should read; it never contains an empty string.
   */
  readonly urls: Readonly<Record<string, string>>;
  /** The address each endpoint falls back to, by name. What "not overridden" means. */
  readonly fallbacks: Readonly<Record<string, string>>;
  /** True while `onApply` is in flight. */
  readonly isApplying: boolean;
  /** Nothing has been overridden and the app id is untouched. */
  readonly isAtDefaults: boolean;
  /** True when this endpoint is overridden. */
  isOverridden(name: string): boolean;
  /**
   * Why this address cannot be saved for this endpoint, or `undefined` if it
   * can. Empty is always refused; beyond that the endpoint's own `validate`
   * decides, defaulting to {@link isAbsoluteUrl}.
   *
   * A settings page is the last place able to explain a bad address. Saved
   * unchecked, the value survives a failed reconnect and is still there on the
   * next launch, with nothing on screen saying why nothing connects.
   */
  validate(name: string, url: string): string | undefined;
  /**
   * Set an endpoint's override.
   *
   * Returns the reason it was refused, or `undefined` when it was stored. A
   * value written here becomes an active, persisted override, so it has to
   * pass the same check {@link ConnectionSettingsStore.validate} applies;
   * an invalid one is not stored at all. Keep it as a draft in the UI instead.
   */
  setUrl(name: string, url: string): string | undefined;
  setOverride(name: string, on: boolean): void;
  /** Flip every endpoint together, for a page with one switch. */
  setUseCustom(on: boolean): void;
  setAppPublicId(id: string): void;
  /** Drop every override and forget the stored copy. Does not apply. */
  reset(): void;
  /** Persist, then hand the resolved addresses to `onApply`. */
  apply(): Promise<void>;
  /** For a component that wants to track the state rather than read it once. */
  state$: Accessor<ConnectionSettingsState>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const createConnectionSettings = (
  options: ConnectionSettingsOptions,
): ConnectionSettingsStore => {
  const { storageKey, endpoints, appPublicId = "", onApply } = options;

  const fallbacks: Readonly<Record<string, string>> = Object.freeze(
    Object.fromEntries(endpoints.map((e) => [e.name, e.fallback])),
  );

  const defaults = (): ConnectionSettingsState => ({
    overrides: {},
    urls: Object.fromEntries(endpoints.map((e) => [e.name, e.fallback])),
    appPublicId,
  });

  /*
   * A stored value is data from outside the program: it was written by an older
   * version of this app, or edited by hand. Every field is checked, and anything
   * unrecognised falls back rather than throwing, because a settings page that
   * cannot open is a settings page that cannot be corrected.
   */
  const read = (): ConnectionSettingsState => {
    const base = defaults();
    try {
      /*
       * Inside the `try`, because reading the global is itself the risk.
       *
       * `localStorage` is a getter on `Window`, and `typeof` evaluates it. On an
       * opaque origin, or with site data blocked, that getter throws
       * `SecurityError` -- so the availability check threw before the guarded
       * access it was guarding. This store is documented as built at module
       * scope, so that escaped before anything could render: storage turned off
       * meant the application did not start.
       */
      if (typeof localStorage === "undefined") return base;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return base;
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return base;

      const overrides: Record<string, boolean> = {};
      const urls = { ...base.urls };
      const storedOverrides = isRecord(parsed.overrides)
        ? parsed.overrides
        : {};
      const storedUrls = isRecord(parsed.urls) ? parsed.urls : {};

      /*
       * Storage is input, and it is checked like input.
       *
       * What is here was written by a previous version of this application, or
       * edited by hand, or corrupted; none of those is a reason to trust it. An
       * unchecked stored address became an active override on the next launch,
       * which is the same hole `setUrl` had, reached a different way -- and the
       * worse way, because nobody typed it and nothing reported it.
       *
       * A stored value that does not parse is dropped along with its override,
       * so the endpoint falls back to its default and the application starts on
       * an address that works. It is not kept as a draft: nothing is editing it
       * yet at load time, and leaving it in `urls` with the override off is how
       * it comes back the next time Save is pressed.
       */
      for (const endpoint of endpoints) {
        const url = storedUrls[endpoint.name];
        const usable =
          typeof url === "string" &&
          url !== "" &&
          (endpoint.validate ?? isAbsoluteUrl)(url) === undefined;
        if (usable) urls[endpoint.name] = url as string;
        if (usable && storedOverrides[endpoint.name] === true)
          overrides[endpoint.name] = true;
      }

      return {
        overrides,
        urls,
        /*
         * An empty string is a stored value, not a missing one.
         *
         * Rejecting `""` here while the setter and the write both accept it
         * gave a cleared field two meanings: empty for the rest of the session,
         * and back to the configured default after a reload. Only the absence
         * of a usable value falls back.
         */
        appPublicId:
          typeof parsed.appPublicId === "string"
            ? parsed.appPublicId
            : base.appPublicId,
      };
    } catch {
      return base;
    }
  };

  /*
   * Owned by a root of its own.
   *
   * Every application creates this once, at module scope, so that the transport
   * and the settings page read the same instance. A signal created there has no
   * owner: the persistence effect never runs, and the page renders a switch
   * whose state nothing is tracking. `createRoot` gives it one. This is the
   * defect the panel had in the app while passing every check in the harness,
   * where the fixture creates the store inside a component.
   */
  const [state, setState, isApplying, setIsApplying] = createRoot(() => {
    const [s, setS] = createSignal<ConnectionSettingsState>(read());
    const [a, setA] = createSignal(false);
    return [s, setS, a, setA] as const;
  });

  const atDefaults = (value: ConnectionSettingsState): boolean =>
    value.appPublicId === appPublicId &&
    endpoints.every(
      (e) =>
        value.overrides[e.name] !== true && value.urls[e.name] === e.fallback,
    );

  const write = (value: ConnectionSettingsState): void => {
    try {
      // Inside the `try` for the same reason as in `read`: touching the global
      // is what can throw.
      if (typeof localStorage === "undefined") return;
      // Nothing customised means nothing to remember. Clearing rather than
      // storing the defaults means a later change to a default is picked up
      // instead of being masked by a stale copy of the old one.
      if (atDefaults(value)) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* A private window, or storage disabled. The settings still apply for this session. */
    }
  };

  // Inside a root of its own, for the same reason the signals are: at module
  // scope there is no owner, and an unowned effect never runs.
  //
  // Solid 2 splits an effect in two: only the compute half tracks, so the read
  // is hoisted into it and the write runs with a plain value.
  createRoot(() => {
    createEffect(
      () => state(),
      (value) => {
        write(value);
      },
    );
  });

  /*
   * The committed value, kept alongside the signal because a read straight
   * after a write does not see it.
   *
   * Measured on the pinned `solid-js@2.0.0-rc.4`, browser build:
   *
   *     setS({ n: 1 });
   *     s().n            // 0
   *     await Promise.resolve();
   *     s().n            // 1
   *
   * The server build returns `1` immediately, which is why this is easy to
   * miss: the same probe under `bun` with no export condition disproves it.
   *
   * The panel calls setters and then `apply()` in the same tick, so every read
   * inside `apply` saw the settings the user had *replaced*: `onApply` got the
   * old URLs and the old app id, the write persisted them, and the screen then
   * updated from the signal a microtask later and looked correct. Reset was the
   * same shape, reconnecting to the overrides it had just dropped.
   *
   * So the setters advance this eagerly and the signal follows for anything
   * tracking. Everything that has to agree -- what is persisted, what `onApply`
   * receives, what `isAtDefaults` reports -- reads from here.
   */
  let committed: ConnectionSettingsState = state();
  let inFlight = 0;
  /** The tail of the apply chain. See `apply`. */
  let queue: Promise<void> = Promise.resolve();

  const update = (
    change: (current: ConnectionSettingsState) => ConnectionSettingsState,
  ) => {
    committed = change(committed);
    setState(committed);
  };

  /*
   * A plain function, reading `state()` once rather than per endpoint.
   *
   * Deliberately not a memo. The store is built at module scope, so a memo here
   * lives in a detached root, and it then recomputes only while that root's
   * graph is live -- which is not a property this hook can promise, and getting
   * it wrong makes `urls` quietly stale rather than slow. It is a fold over a
   * handful of endpoints; a caller reading it per request is fine, and a caller
   * reading it in a render loop should hoist it, which is cheaper than making
   * this clever.
   */
  const resolveFrom = (
    current: ConnectionSettingsState,
  ): Record<string, string> =>
    Object.fromEntries(
      endpoints.map((e) => {
        const override =
          current.overrides[e.name] === true ? current.urls[e.name] : undefined;
        return [e.name, override && override !== "" ? override : e.fallback];
      }),
    );

  /*
   * Resolved once per state, not once per read.
   *
   * `state` is replaced wholesale on every write, so the object itself is the
   * cache key: same object, same answer, and a new object is the only way the
   * answer can change. Deliberately not a memo -- the store is built at module
   * scope, where a memo lives in a detached root and recomputes only while that
   * root's graph is live, which is not a property this hook can promise and
   * which fails by going quietly stale.
   *
   * The read still tracks the signal, so a component re-renders when the
   * settings change; what it stops doing is folding over every endpoint on the
   * way. The returned record is frozen because callers now share one.
   */
  let resolvedFor: ConnectionSettingsState | undefined;
  let resolvedValue: Readonly<Record<string, string>> = Object.freeze({});

  const resolved = (): Readonly<Record<string, string>> => {
    const current = state();
    if (resolvedFor !== current) {
      resolvedFor = current;
      resolvedValue = Object.freeze(resolveFrom(current));
    }
    return resolvedValue;
  };

  return {
    get state() {
      return state();
    },
    get urls() {
      return resolved();
    },
    validate(name, url) {
      const endpoint = endpoints.find((e) => e.name === name);
      if (!endpoint) return `${name} is not a configured endpoint`;
      if (url === "") return "an address is required";
      return (endpoint.validate ?? isAbsoluteUrl)(url);
    },
    get fallbacks() {
      return fallbacks;
    },
    get isApplying() {
      return isApplying();
    },
    get isAtDefaults() {
      // Tracks the signal so a component re-renders, but answers from the
      // committed value, which a caller reading this right after a setter needs.
      state();
      return atDefaults(committed);
    },
    state$: state,

    isOverridden(name) {
      return state().overrides[name] === true;
    },
    /*
     * Refused rather than stored, and it says why.
     *
     * Every write here becomes an active override and is persisted, so an
     * address that does not parse was being activated as though it had been
     * checked -- and `docs/ui-usage.md` promises the store validates before
     * saving. The panel already validates before it gets here, so this is not
     * the path a person takes; it is the one a caller driving the store
     * directly takes, and it was the way past the promise.
     *
     * An empty string still goes through: clearing a field is how an override
     * is removed, and `validate` refuses `""` for the different question of
     * whether it is an address.
     */
    setUrl(name, url) {
      if (url !== "") {
        const endpoint = endpoints.find((e) => e.name === name);
        const problem = endpoint
          ? (endpoint.validate ?? isAbsoluteUrl)(url)
          : `${name} is not a configured endpoint`;
        if (problem) return problem;
      }
      update((c) => ({ ...c, urls: { ...c.urls, [name]: url } }));
      return undefined;
    },
    setOverride(name, on) {
      update((c) => ({ ...c, overrides: { ...c.overrides, [name]: on } }));
    },
    setUseCustom(on) {
      update((c) => ({
        ...c,
        overrides: Object.fromEntries(endpoints.map((e) => [e.name, on])),
      }));
    },
    setAppPublicId(id) {
      update((c) => ({ ...c, appPublicId: id }));
    },
    reset() {
      committed = defaults();
      setState(committed);
    },
    async apply() {
      /*
       * Counted, not a boolean.
       *
       * Two applies can overlap -- a second panel, a Reset while a Save is in
       * flight, or a caller using the store directly -- and with a flag the
       * first to finish cleared it while the other reconnect was still running,
       * so `isApplying` reported idle mid-flight. That is the one thing this
       * flag exists to say.
       */
      inFlight += 1;
      setIsApplying(true);
      /*
       * Snapshotted before anything can await, from the committed value rather
       * than the signal, so the write and the callback cannot see two different
       * states.
       */
      const current = committed;
      /*
       * Run behind whatever is already applying, and hold the next one behind
       * this.
       *
       * Counting overlapping applies said when the last one finished; it did
       * not say which one finished last. Two saves in quick succession could
       * reconnect in either order, and the losing order leaves storage saying B
       * while the transport is configured for A -- with nothing on screen
       * disagreeing, because `isApplying` had gone quiet and both callbacks
       * resolved.
       *
       * `onApply` reconfigures somebody else's transport, so a superseded one
       * cannot be undone after the fact and cancelling it is not this store's
       * call either. Ordering them is: the reconnects run in the order the
       * saves were made, and the last save is the last thing the transport
       * hears. A queued apply waits, which is the cost, and it is the same cost
       * a caller would pay for awaiting them itself.
       */
      const reconnect = () => {
        /*
         * Persisted here, not by the effect.
         *
         * `apply` promises to persist and then hand over what was persisted,
         * and the effect that mirrors `state` into storage is deferred: it runs
         * a microtask later, after `onApply` has already been called. A
         * callback that reloads or navigates -- which is exactly what a
         * transport change often does -- read the previous settings back. The
         * effect still exists for every other write; this is what makes the
         * ordering `apply` claims actually hold.
         */
        write(current);
        return (
          onApply?.({
            urls: resolveFrom(current),
            appPublicId: current.appPublicId,
            overrides: { ...current.overrides },
          }) ?? undefined
        );
      };
      /*
       * Inline when nothing else is applying, queued when something is.
       *
       * `queue.then(...)` unconditionally would have been simpler and wrong in
       * a way that is hard to see: it puts the whole body a microtask later,
       * which is also when the deferred persistence effect runs, so the write
       * above would stop being what persists and start being a duplicate of
       * whichever ran first. The ordering would hold by luck, and a test for it
       * would pass with the write deleted -- measured, before this line existed.
       *
       * `inFlight` was incremented above, so 1 means this apply is the only one.
       */
      const run =
        inFlight === 1
          ? /*
             * An async wrapper, not `Promise.resolve(reconnect())`.
             *
             * `onApply` may be synchronous, and a synchronous one that throws
             * threw *out of the expression*, before the `try` below was
             * entered. `inFlight` was never decremented and `isApplying` never
             * cleared, so one failed reconnect left the panel disabled for the
             * lifetime of the page -- and `queue` was never assigned either, so
             * the chain was left holding whatever it had.
             *
             * An async function with no `await` before the call still runs the
             * body synchronously, so the ordering this branch exists for is
             * unchanged: `write` happens before the persistence effect, and a
             * check for that still fails if the write is removed. What changes
             * is that a synchronous throw becomes a rejection like any other.
             */
            (async () => reconnect())()
          : queue.then(reconnect).then(() => undefined);
      // The queue must survive a rejecting `onApply`, or one failed reconnect
      // deadlocks every later save. The error still reaches this caller.
      queue = run.catch(() => undefined);
      try {
        await run;
      } finally {
        inFlight -= 1;
        if (inFlight === 0) setIsApplying(false);
      }
    },
  };
};
