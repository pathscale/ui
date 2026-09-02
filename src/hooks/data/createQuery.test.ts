import { describe, expect, test } from "bun:test";
import { createRenderEffect, createRoot, flush } from "solid-js";

// Run with `bun test --conditions=browser`, which the package script does.
// Without it Bun resolves Solid's server build, where effects run once and
// signals never propagate, and every assertion below would pass while testing
// nothing.
import { createMutation } from "./createMutation";
import { createQuery, invalidateQueries } from "./createQuery";

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe("createQuery", () => {
  test("a disabled query is not loading, and never throws", async () => {
    // The whole reason this hook exists. TanStack parks a disabled query at
    // `status: "pending"`, and reading a pending query under Solid 2 throws
    // NotReadyError to suspend -- forever, because a disabled query never
    // resolves. A chat widget in that state replaced an entire application
    // with a blank error page.
    let calls = 0;
    const dispose = createRoot((d) => {
      const q = createQuery(() => ({
        key: ["never"],
        enabled: false,
        fetcher: async () => {
          calls++;
          return "value";
        },
      }));
      expect(q.isLoading).toBe(false);
      expect(q.data).toBeUndefined();
      expect(q.isReady).toBe(false);
      return d;
    });
    await tick();
    expect(calls).toBe(0);
    dispose();
  });

  test("reads, and reports readiness", async () => {
    let resolveFetch: ((value: string) => void) | undefined;
    const result = await createRoot(async (dispose) => {
      const q = createQuery(() => ({
        key: ["thing"],
        fetcher: () => new Promise<string>((r) => (resolveFetch = r)),
      }));
      flush();
      const whileLoading = { loading: q.isLoading, ready: q.isReady };
      resolveFetch?.("hello");
      await tick();
      return { whileLoading, data: q.data, ready: q.isReady, dispose };
    });
    expect(result.whileLoading).toEqual({ loading: true, ready: false });
    expect(result.data).toBe("hello");
    expect(result.ready).toBe(true);
    result.dispose();
  });

  test("a failure lands on error rather than being thrown", async () => {
    const result = await createRoot(async (dispose) => {
      const q = createQuery(() => ({
        key: ["bad"],
        fetcher: async () => {
          throw new Error("nope");
        },
      }));
      flush();
      await tick();
      return { error: q.error, loading: q.isLoading, dispose };
    });
    expect((result.error as Error).message).toBe("nope");
    expect(result.loading).toBe(false);
    result.dispose();
  });

  test("invalidateQueries matches by key prefix", async () => {
    let calls = 0;
    const dispose = createRoot((d) => {
      createQuery(() => ({
        key: ["users", 1],
        fetcher: async () => {
          calls++;
          return calls;
        },
      }));
      flush();
      return d;
    });
    await tick();
    expect(calls).toBe(1);

    invalidateQueries(["users"]);
    await tick();
    expect(calls).toBe(2);

    // A prefix that does not match must not refetch.
    invalidateQueries(["apps"]);
    await tick();
    expect(calls).toBe(2);
    dispose();
  });

  test("a disposed query deregisters, so invalidation cannot reach it", async () => {
    let calls = 0;
    const dispose = createRoot((d) => {
      createQuery(() => ({
        key: ["gone"],
        fetcher: async () => {
          calls++;
          return calls;
        },
      }));
      flush();
      return d;
    });
    await tick();
    expect(calls).toBe(1);
    dispose();

    invalidateQueries(["gone"]);
    await tick();
    expect(calls).toBe(1);
  });
});

describe("property reads stay reactive", () => {
  test("a tracked scope re-runs when data lands", async () => {
    // The whole reason these are getters rather than accessors: consumers
    // carried over from solid-query are written `query.data`, thousands of
    // times. A getter over a signal only earns that spelling if reading it
    // inside a tracked scope still subscribes -- so assert the subscription,
    // not just the value.
    let resolveFetch: ((value: string) => void) | undefined;
    const seen: (string | undefined)[] = [];

    const result = await createRoot(async (dispose) => {
      const q = createQuery(() => ({
        key: ["reactive"],
        fetcher: () => new Promise<string>((r) => (resolveFetch = r)),
      }));
      createRenderEffect(
        () => q.data,
        (value) => {
          seen.push(value);
        },
      );
      flush();
      resolveFetch?.("arrived");
      await tick();
      flush();
      return { dispose };
    });

    expect(seen[0]).toBeUndefined();
    expect(seen.at(-1)).toBe("arrived");
    result.dispose();
  });
});

describe("createMutation", () => {
  test("mutate reports failure without an unhandled rejection", async () => {
    const result = await createRoot(async (dispose) => {
      const m = createMutation(() => ({
        mutationFn: async () => {
          throw new Error("write failed");
        },
      }));
      m.mutate();
      await tick();
      return { error: m.error, pending: m.isPending, dispose };
    });
    expect((result.error as Error).message).toBe("write failed");
    expect(result.pending).toBe(false);
    result.dispose();
  });

  test("mutateAsync rejects, and onSuccess sees the result", async () => {
    const seen: string[] = [];
    const result = await createRoot(async (dispose) => {
      const m = createMutation(() => ({
        mutationFn: async (name: string) => `made ${name}`,
        onSuccess: (r) => {
          seen.push(r);
        },
      }));
      const value = await m.mutateAsync("app");
      return { value, data: m.data, dispose };
    });
    expect(result.value).toBe("made app");
    expect(result.data).toBe("made app");
    expect(seen).toEqual(["made app"]);
    result.dispose();
  });
});
