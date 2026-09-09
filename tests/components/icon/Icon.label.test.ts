import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A meaningful icon can be named through the component.
 *
 * `aria-hidden="true"` was written straight into the markup with nothing
 * conditioning it and no `label` prop to condition it with. The default is
 * correct -- most icons in the fleet sit beside text that already says what
 * they mean, and announcing them repeats it -- but it was the only behaviour
 * there was. `aria-hidden` removes an element from the tree whatever else it
 * carries, so a call site that passed `aria-label` through got an icon wearing
 * a name that nothing could read. A status glyph in a table cell, a lone mark
 * in a square button and a trend arrow beside a bare number were all
 * unreachable.
 *
 * Read from the source rather than from a render, which is the only thing a
 * `.layout.tsx` allows before the library compiler runs. What that leaves
 * unproven is the compiler's own faithfulness, and the component sweep covers
 * that against a real browser.
 */
const SOURCE = readFileSync(
  join(import.meta.dir, "../../../src/components/icon/Icon.layout.tsx"),
  "utf8",
);

/*
 * Comments removed before anything is asserted. The prose above the component
 * quotes the attribute this file forbids, and a regex over the whole file
 * cannot tell the two apart -- which is how a rule ends up failing on its own
 * explanation, or passing because someone deleted the explanation.
 */
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(
  /^\s*\/\/.*$/gm,
  "",
);

describe("Icon.label", () => {
  it("declares the prop, so the escape hatch is part of the type", () => {
    expect(CODE).toMatch(/\blabel\?:\s*string;/);
  });

  it("never hides an icon unconditionally", () => {
    expect(CODE).not.toContain('aria-hidden="true"');
    expect(CODE).toContain('aria-hidden={local.label ? undefined : "true"}');
  });

  it("gives a named icon a role and a name together", () => {
    expect(CODE).toContain('role={local.label ? "img" : undefined}');
    expect(CODE).toContain("aria-label={local.label}");
  });

  /*
   * Both halves or neither. `role="img"` with no name is an unnamed image, and
   * `aria-label` on a `span` with no role names nothing: the two conditions
   * have to read the same prop.
   */
  it("conditions the role and the name on the same prop", () => {
    const role = CODE.match(/role=\{local\.(\w+)\s*\?/)?.[1];
    const hidden = CODE.match(/aria-hidden=\{local\.(\w+)\s*\?/)?.[1];
    expect(role).toBe("label");
    expect(hidden).toBe("label");
  });
});
