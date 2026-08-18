import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dir, "../../src");

/**
 * A context whose consumers optional-chain it must carry a default.
 *
 * Under Solid 1 a missing provider answered `undefined` and the optional chain
 * took over, so a component used without its root simply worked. Solid 2
 * changed the failure mode rather than the intent: `getContext` throws
 * `ContextNotFoundError` when the resolved value is `undefined`, and it throws
 * *before* the optional chain can run.
 *
 * The consequence is not a mis-rendered component. The throw escapes whatever
 * effect it happened inside, halts the reactive system, and takes the rest of
 * the page with it. In one consumer that presented as an out-of-memory abort:
 * boot never finished, so a `waitFor` on it polled until the process died.
 *
 * This walks the source rather than checking one component, because the bug
 * was found twice, in `Input` and then in `Checkbox`, and the second one was
 * only noticed because an application crashed.
 *
 * `null` and not `{}`: a truthy default silences the throw and then lets the
 * optional chain call methods that do not exist, which fails later and further
 * from the cause.
 */
describe("optional contexts carry a default", () => {
  const sources: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      // Generated twins mirror their layout source; checking both would report
      // every finding twice and fix neither.
      else if (/\.(ts|tsx)$/.test(entry) && !entry.includes(".generated.")) sources.push(path);
    }
  };
  walk(SRC);

  const declarations = new Map<string, { file: string; defaulted: boolean }>();
  for (const file of sources) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(
      /(?:export )?const (\w*Context) = createContext<([^>]*)>\(([^)]*)\)/g,
    )) {
      declarations.set(match[1], { file, defaulted: match[3].trim() !== "" });
    }
  }

  /*
   * Names read through `?.` and never dereferenced directly.
   *
   * The distinction matters and is the whole reason this is not a blanket
   * rule. A context read *only* through `?.` says the root is optional, and a
   * `null` default restores the Solid 1 behaviour exactly. One that is also
   * dereferenced directly says the root is required, and defaulting it would
   * trade a clear `ContextNotFoundError` for a null-property crash further
   * from the cause. Six components here are mixed - Dropdown, Menu, ComboBox,
   * ListBox, ColorSwatchPicker and Select - and each needs a decision about
   * which it means rather than a codemod.
   */
  const optionallyRead = new Set<string>();
  const directlyRead = new Set<string>();
  for (const file of sources) {
    const text = readFileSync(file, "utf8");
    for (const use of text.matchAll(/const (\w+) = useContext\((\w*Context)\)/g)) {
      const [, variable, context] = use;
      if (new RegExp(`\\b${variable}\\?\\.`).test(text)) optionallyRead.add(context);
      // A guarded call reads as direct here, which is the safe way to be wrong:
      // it keeps the context out of the automatic set.
      if (new RegExp(`\\b${variable}\\.[a-zA-Z]`).test(text)) directlyRead.add(context);
    }
  }
  for (const name of directlyRead) optionallyRead.delete(name);

  it("finds contexts to check, so a broken walk cannot pass silently", () => {
    expect(declarations.size).toBeGreaterThan(10);
    expect(optionallyRead.size).toBeGreaterThan(3);
  });

  it("gives every optionally-read context a default", () => {
    const missing = [...optionallyRead]
      .filter((name) => declarations.has(name) && !declarations.get(name)?.defaulted)
      .map((name) => `${name} (${declarations.get(name)?.file.replace(SRC, "src")})`);
    expect(missing).toEqual([]);
  });
});
