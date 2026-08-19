import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CSS = readFileSync(
  join(import.meta.dir, "../../../src/components/radio/Radio.css"),
  "utf8",
);

/**
 * Hover has to reach a radio that carries its own indicator content.
 *
 * The component draws its own dot, so the tinting half of the hover rule is
 * written against `.radio__indicator:empty::before` — correct for that dot, and
 * inert for any radio given real content, because a non-empty indicator cannot
 * match `:empty`. That left `border-color` on `.radio__control` as the only
 * hover feedback, and a consumer restyling that border cancelled it entirely.
 *
 * AgencyZero's colour wheel is exactly that consumer: 31 petals, each a radio
 * whose indicator is a colour swatch and whose control border is overridden, so
 * nothing under the pointer changed. The fix is a `transform` on the control,
 * which is the one channel a consumer's border and background overrides do not
 * silently cancel.
 */
describe("radio hover", () => {
  const hoverBlock = CSS.slice(
    CSS.indexOf("@media (hover: hover)"),
    CSS.indexOf(".radio:active"),
  );

  it("has a hover block to begin with", () => {
    expect(hoverBlock).toContain(".radio__control");
  });

  it("lifts the control, so hover survives a restyled border", () => {
    expect(hoverBlock).toMatch(/\.radio__control\s*{[^}]*transform:\s*scale\(/);
  });

  it("still tints the dot it draws itself", () => {
    expect(hoverBlock).toContain(".radio__indicator:empty::before");
  });

  it("leaves a pressed radio pressed, since :active is ordered after hover", () => {
    expect(CSS.indexOf(".radio:active")).toBeGreaterThan(
      CSS.indexOf("@media (hover: hover)"),
    );
  });

  it("never fires on a selected or disabled radio", () => {
    expect(hoverBlock).toContain(
      '.radio:hover:not([data-selected="true"]):not([data-disabled="true"])',
    );
  });
});
