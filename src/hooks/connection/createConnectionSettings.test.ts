import { describe, expect, test } from "bun:test";
import { createRenderEffect, createRoot, flush } from "solid-js";

// Run with `bun test --conditions=browser`, as the package script does; the
// server build of Solid never propagates a signal, and every assertion here
// would pass while testing nothing.
import { createConnectionSettings } from "./createConnectionSettings";

// Bun's test environment has no DOM storage. The store already degrades
// gracefully without one, so a stub is what makes the persistence assertions
// mean anything.
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
  });
}

const endpoints = [
  { name: "api", fallback: "wss://api.example.com" },
  { name: "auth", fallback: "wss://auth.example.com" },
];

const fresh = (key: string) => {
  localStorage.removeItem(key);
  return key;
};

describe("createConnectionSettings", () => {
  test("resolves to the fallbacks until an endpoint is overridden", () => {
    createRoot((dispose) => {
      const key = fresh("t-fallback");
      const store = createConnectionSettings({ storageKey: key, endpoints });

      expect(store.urls.api).toBe("wss://api.example.com");
      expect(store.isAtDefaults).toBe(true);

      // A URL on its own changes nothing: the override is what selects it.
      store.setUrl("api", "ws://127.0.0.1:8403");
      flush();
      expect(store.urls.api).toBe("wss://api.example.com");

      store.setOverride("api", true);

      flush();
      expect(store.urls.api).toBe("ws://127.0.0.1:8403");
      // Overriding one endpoint leaves the others alone. This is the case the
      // single-toggle version could not express.
      expect(store.urls.auth).toBe("wss://auth.example.com");
      dispose();
    });
  });

  test("an empty override falls back rather than pointing at nothing", () => {
    createRoot((dispose) => {
      const key = fresh("t-empty");
      const store = createConnectionSettings({ storageKey: key, endpoints });
      store.setOverride("api", true);
      flush();
      store.setUrl("api", "");
      flush();
      expect(store.urls.api).toBe("wss://api.example.com");
      dispose();
    });
  });

  test("setUseCustom flips every endpoint together", () => {
    createRoot((dispose) => {
      const key = fresh("t-all");
      const store = createConnectionSettings({ storageKey: key, endpoints });
      store.setUrl("api", "ws://a");
      flush();
      store.setUrl("auth", "ws://b");
      flush();
      store.setUseCustom(true);
      flush();
      expect(store.urls).toEqual({ api: "ws://a", auth: "ws://b" });
      store.setUseCustom(false);
      flush();
      expect(store.urls.api).toBe("wss://api.example.com");
      dispose();
    });
  });

  test("state is readable reactively, which is what the toggle needs", async () => {
    // The defect this replaces: a page read the flag once, outside any tracked
    // scope, so flipping the switch never revealed the fields.
    await createRoot(async (dispose) => {
      const key = fresh("t-reactive");
      const store = createConnectionSettings({ storageKey: key, endpoints });
      const seen: boolean[] = [];
      const stop = createRoot((inner) => {
        const read = () => seen.push(store.state$().overrides.api === true);
        read();
        return inner;
      });
      store.setOverride("api", true);
      flush();
      expect(store.state$().overrides.api).toBe(true);
      stop();
      dispose();
    });
  });

  test("settings survive a reload, and defaults are not written", () => {
    createRoot((dispose) => {
      const key = fresh("t-persist");
      const first = createConnectionSettings({ storageKey: key, endpoints });
      first.setUrl("api", "ws://kept");
      flush();
      first.setOverride("api", true);
      flush();
      first.setAppPublicId("app-1");
      flush();
      dispose();

      const second = createConnectionSettings({ storageKey: key, endpoints });
      expect(second.urls.api).toBe("ws://kept");
      expect(second.state.appPublicId).toBe("app-1");

      second.reset();

      flush();
      expect(second.isAtDefaults).toBe(true);
    });
  });

  test("a corrupt stored value opens at the defaults instead of throwing", () => {
    createRoot((dispose) => {
      const key = fresh("t-corrupt");
      localStorage.setItem(key, "{not json");
      const store = createConnectionSettings({ storageKey: key, endpoints });
      expect(store.urls.api).toBe("wss://api.example.com");
      localStorage.setItem(key, JSON.stringify({ urls: 7, overrides: "yes" }));
      const second = createConnectionSettings({ storageKey: key, endpoints });
      expect(second.urls.auth).toBe("wss://auth.example.com");
      dispose();
    });
  });

  test("apply hands the resolved addresses over, and reports while it runs", async () => {
    await createRoot(async (dispose) => {
      const key = fresh("t-apply");
      let given: Record<string, string> | undefined;
      const applying: boolean[] = [];
      let release: (() => void) | undefined;

      const store = createConnectionSettings({
        storageKey: key,
        endpoints,
        // A real apply reconnects a transport, so it takes time. Held open here
        // deliberately: a callback that returns within the same batch flips the
        // flag back before anything can observe it, which is true of the store
        // and not worth asserting either way.
        onApply: async (urls) => {
          given = { ...urls };
          await new Promise<void>((resolve) => {
            release = resolve;
          });
        },
      });

      createRenderEffect(
        () => store.isApplying,
        (v) => {
          // A brace, not an expression body: Solid 2 treats an effect's return
          // value as its cleanup, and `push` returns a number.
          applying.push(v);
        },
      );
      flush();

      store.setUrl("auth", "ws://local-auth");
      store.setOverride("auth", true);
      flush();

      const applied = store.apply();
      flush();
      expect(applying).toContain(true);

      release?.();
      await applied;
      flush();

      expect(given).toEqual({
        api: "wss://api.example.com",
        auth: "ws://local-auth",
      });
      expect(store.isApplying).toBe(false);
      dispose();
    });
  });
});
