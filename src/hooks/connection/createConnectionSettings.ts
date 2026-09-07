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
 * Anchored at both ends, and the port is digits.
 *
 * Unanchored, this matched a valid-looking *prefix*: `wss://host other` passed
 * because the pattern stopped at the space and nothing required it to have
 * reached the end. So did `wss://host:abc`, an unparseable port, because the
 * host run accepted `:` as an ordinary character.
 *
 * Still deliberately weak about everything else, and still not `new URL()`, for
 * the reason above. Weak is a decision about how much of an address to inspect;
 * matching a prefix of a string it then reports as valid is not weakness, it is
 * the wrong answer.
 *
 * The host alternates a bracketed IPv6 literal with an ordinary run: excluding
 * `:` from the host, which is what isolates the port, otherwise rejects
 * `http://[::1]:80`.
 */
const ABSOLUTE_URL =
  /^[a-z][a-z0-9+.-]*:\/\/(?:\[[0-9a-f:.]+\]|[^\s/?#:]+)(?::\d+)?(?:[/?#]\S*)?$/i;

export const isAbsoluteUrl = (url: string): string | undefined =>
  ABSOLUTE_URL.test(url)
    ? undefined
    : `${url} is not an absolute address (expected scheme://host)`;

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
  setUrl(name: string, url: string): void;
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

      for (const endpoint of endpoints) {
        if (storedOverrides[endpoint.name] === true)
          overrides[endpoint.name] = true;
        const url = storedUrls[endpoint.name];
        if (typeof url === "string" && url !== "") urls[endpoint.name] = url;
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

  const resolved = (): Record<string, string> => {
    const current = state();
    return Object.fromEntries(
      endpoints.map((e) => {
        const override =
          current.overrides[e.name] === true ? current.urls[e.name] : undefined;
        return [e.name, override && override !== "" ? override : e.fallback];
      }),
    );
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
    setUrl(name, url) {
      update((c) => ({ ...c, urls: { ...c.urls, [name]: url } }));
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
       * Snapshotted before the await, from the committed value rather than the
       * signal. This is the promise the doc comment on `apply` makes -- persist,
       * then hand over what was persisted -- and it only holds if both halves
       * read the same object. Taken once, so a concurrent write between the
       * write and the callback cannot hand `onApply` a third state.
       */
      const current = committed;
      try {
        await onApply?.({
          urls: resolveFrom(current),
          appPublicId: current.appPublicId,
          overrides: { ...current.overrides },
        });
      } finally {
        inFlight -= 1;
        if (inFlight === 0) setIsApplying(false);
      }
    },
  };
};
