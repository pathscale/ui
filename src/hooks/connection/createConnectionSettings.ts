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
}

export interface ConnectionSettingsOptions {
  /** `localStorage` key. Namespace it per application; two apps on one origin would collide. */
  storageKey: string;
  endpoints: readonly ConnectionEndpoint[];
  /** The application's own id, when it has one. Stored alongside the URLs. */
  appPublicId?: string;
  /**
   * Run after a successful save or reset, with the resolved addresses.
   *
   * This is where an application reconfigures its transport. It is awaited, so
   * `isApplying` covers the reconnect rather than just the write.
   */
  onApply?: (urls: Readonly<Record<string, string>>) => void | Promise<void>;
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
  /** True while `onApply` is in flight. */
  readonly isApplying: boolean;
  /** Nothing has been overridden and the app id is untouched. */
  readonly isAtDefaults: boolean;
  /** True when this endpoint is overridden. */
  isOverridden(name: string): boolean;
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
    if (typeof localStorage === "undefined") return base;
    try {
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
        appPublicId:
          typeof parsed.appPublicId === "string" && parsed.appPublicId !== ""
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
    if (typeof localStorage === "undefined") return;
    try {
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

  const update = (
    change: (current: ConnectionSettingsState) => ConnectionSettingsState,
  ) => setState((current) => change(current));

  const resolved = (): Record<string, string> =>
    Object.fromEntries(
      endpoints.map((e) => {
        const current = state();
        const override =
          current.overrides[e.name] === true ? current.urls[e.name] : undefined;
        return [e.name, override && override !== "" ? override : e.fallback];
      }),
    );

  return {
    get state() {
      return state();
    },
    get urls() {
      return resolved();
    },
    get isApplying() {
      return isApplying();
    },
    get isAtDefaults() {
      return atDefaults(state());
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
      setState(defaults());
    },
    async apply() {
      setIsApplying(true);
      try {
        await onApply?.(resolved());
      } finally {
        setIsApplying(false);
      }
    },
  };
};
