import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const LAYOUT = readFileSync(
  join(import.meta.dir, "../../../src/components/input/Input.layout.tsx"),
  "utf8",
);

/**
 * A field used without an `<Input>` root has to keep working.
 *
 * Every consumer in this component reads the context as `ctx?.…`, which says
 * plainly that the root is optional: `Input.Field` on its own is a supported
 * shape and consumers rely on it. Under Solid 1 that held for free, because
 * `useContext` answered `undefined` for a missing provider and the optional
 * chain took over from there.
 *
 * Solid 2 changed the failure mode rather than the intent. `getContext` throws
 * `ContextNotFoundError` when the resolved value is `undefined`, and it throws
 * *before* the optional chain can run, so a standalone field died on a library
 * error naming no component. Giving the context a `null` default makes the
 * lookup succeed with a falsy value and restores the original behaviour.
 *
 * Two things are asserted, not one, because either alone passes on a broken
 * component:
 *
 *   1. the context carries a default at all, and
 *   2. that default is not truthy.
 *
 * `createContext<InputContextValue>({})` satisfies (1) and is the more
 * dangerous mistake: it silences the throw, then `ctx?.size()` is called on an
 * object with no `size`, which fails at the first render rather than at import
 * and reads as a completely unrelated bug.
 */
describe("input context default", () => {
  const declaration = LAYOUT.match(/const InputContext = createContext<[^>]*>\((.*)\);/);

  it("declares the context with an explicit default", () => {
    expect(declaration).not.toBeNull();
    // The captured argument list, which is empty when no default was passed.
    expect(declaration?.[1].trim()).not.toBe("");
  });

  it("uses a falsy default, so the optional reads below still short-circuit", () => {
    expect(declaration?.[1].trim()).toBe("null");
  });

  it("reads the context optionally everywhere it is consumed", () => {
    // A non-optional `ctx.` read would mean the root is genuinely required,
    // and a `null` default would move the failure from a clear library error
    // to a "cannot read property of null" at the call site.
    const nonOptional = LAYOUT.split("\n").filter(
      (line) => /\bctx\.[a-zA-Z]/.test(line) && !line.includes("ctx?."),
    );
    expect(nonOptional).toEqual([]);
  });
});
