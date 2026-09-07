import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The form module's field-level components are reachable from the package root.
 *
 * `Form` attaches no members -- there is no `Form.FieldErrorMessage` -- so the
 * root is the only way an application reaches these. `FieldErrorMessage` was
 * absent from it while its props type `FieldErrorMessageProps` was exported,
 * which is the worst version of the mistake: the type resolves, so the
 * omission reads as deliberate, and `docs/api-contract.md` documents the
 * component either way because it extracts from the built declarations rather
 * than from the export list.
 *
 * What it cost: pathscale.com's signup form marked the confirm-password field
 * `aria-invalid="true"` and rendered no message, because the component that
 * renders the message could not be imported. Pressing the button did nothing
 * visible and gave no reason.
 *
 * `FormRoot` is deliberately not in this set. Every component in the library
 * has an `XRoot` emitted by the layout compiler, and none of them are root
 * exports; it is the compiled inner element, not part of the API.
 */
const FIELD_LEVEL = ["FieldErrorMessage", "FormField", "FormSubmitButton"];

const SRC = join(import.meta.dir, "../../src");

describe("form field-level components are exported from the root", () => {
  const barrel = readFileSync(join(SRC, "components/form/index.ts"), "utf8");
  const root = readFileSync(join(SRC, "index.ts"), "utf8");

  // Value exports only. A `type` specifier inside the braces, or an
  // `export type { ... }` block, does not make a component importable.
  const valueExports = (text: string): Set<string> => {
    const names = new Set<string>();
    for (const block of text.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
      if (/export\s+type\s*\{/.test(block[0])) continue;
      for (const raw of block[1].split(",")) {
        const specifier = raw.trim();
        if (!specifier || specifier.startsWith("type ")) continue;
        names.add(specifier.split(/\s+as\s+/).pop() as string);
      }
    }
    return names;
  };

  it("reads both export lists, so a broken parse cannot pass silently", () => {
    expect(valueExports(barrel).size).toBeGreaterThan(3);
    expect(valueExports(root).size).toBeGreaterThan(50);
  });

  it("exports every field-level component the form module defines", () => {
    const fromBarrel = valueExports(barrel);
    const fromRoot = valueExports(root);

    // The set is only meaningful while the module still defines them.
    expect(FIELD_LEVEL.filter((name) => !fromBarrel.has(name))).toEqual([]);
    expect(FIELD_LEVEL.filter((name) => !fromRoot.has(name))).toEqual([]);
  });
});
