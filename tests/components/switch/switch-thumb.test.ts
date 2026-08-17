import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CSS = readFileSync(join(import.meta.dir, "../../../src/components/switch/Switch.css"), "utf8");

/**
 * The thumb slides on the compositor, not through layout.
 *
 * It used to move by animating `margin-inline-start` over 300ms, which re-runs
 * layout on every frame of the travel — for the switch and for whatever shares
 * its formatting context. On a renderer where layout is the expensive phase
 * that is precisely what "the toggles don't feel smooth" is made of, and it is
 * invisible in a screenshot, so only a rule like this keeps it from coming back.
 */
describe("switch thumb", () => {
  it("animates transform rather than margin", () => {
    const thumb = CSS.slice(CSS.indexOf(".switch__thumb {"), CSS.indexOf(".switch__icon"));
    expect(thumb).toContain("transform 300ms");
    expect(thumb).not.toMatch(/transition:[^}]*\bmargin\b/);
  });

  it("moves every size with a transform", () => {
    for (const selector of [
      '.switch[data-selected="true"] .switch__thumb',
      '.switch--sm[data-selected="true"] .switch__thumb',
      '.switch--lg[data-selected="true"] .switch__thumb',
    ]) {
      const at = CSS.indexOf(selector);
      expect(at).toBeGreaterThanOrEqual(0);
      const rule = CSS.slice(at, CSS.indexOf("}", at));
      expect(rule).toContain("transform: translateX(");
      expect(rule).not.toContain("margin-inline-start");
    }
  });
});
