import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A `Switch`, `Radio` or `Checkbox` can be named, and the name reaches the
 * control.
 *
 * Four sites reported an anonymous 1x1 switch they could not drive, and a
 * sweep of the showcase measured 13 switches on `/switch` and 8 of 10 radios
 * on `/radio` with no accessible name at all. The 1x1 visually hidden input is
 * the ordinary pattern and the styled sibling beside it is correctly
 * presentational, so what was measured is not a markup defect: it is what
 * these components render when nobody gives them a name.
 *
 * There are two ways to give one and both work. Children are the label, and
 * the wrapping `<label>` element is what associates them -- which is why the
 * two named radios of the ten were named. `aria-label` is the other, for a
 * control whose meaning is carried by the row it sits in.
 *
 * This file guards the second, because it is the one a refactor can lose
 * without anything else changing. Each component builds an `others` bag by
 * omitting the props it handles itself and spreads the rest onto the `<input>`;
 * adding a naming attribute to that omit list, or moving the spread off the
 * input, would silently take every `aria-label` in the fleet out of the tree
 * and leave the markup looking correct.
 *
 * What it cannot prove is the rendered result: these are `.layout.tsx` files
 * and the suite has no DOM, by choice. The component sweep covers that against
 * a real browser.
 */
const TOGGLES = ["switch/Switch", "radio/Radio", "checkbox/Checkbox"];

/** Naming and identity belong to the control, never to the wrapper. */
const CONTROL_ATTRIBUTES = ["aria-label", "aria-labelledby", "aria-describedby"];

for (const path of TOGGLES) {
  const [, name] = path.split("/");
  const source = readFileSync(
    join(import.meta.dir, "../../src/components", `${path}.layout.tsx`),
    "utf8",
  ).replace(/\/\*[\s\S]*?\*\//g, "");

  const omitted = source.slice(
    source.indexOf("omit("),
    source.indexOf(");", source.indexOf("omit(")),
  );

  describe(`${name} lets a call site name it`, () => {
    it("keeps naming attributes out of the omit list", () => {
      for (const attribute of CONTROL_ATTRIBUTES) {
        expect(
          omitted,
          `${name} swallows ${attribute} before it reaches the input`,
        ).not.toContain(`"${attribute}"`);
      }
    });

    it("spreads the remaining props onto the input", () => {
      const input = source.slice(source.indexOf("<input"));
      expect(input.slice(0, 200)).toContain("{...others}");
    });

    /*
     * Children are the other way, and the wrapping `<label>` is what makes
     * them the name. Rendering the label content outside the label, or
     * dropping the element for a `div`, would break every named control in the
     * fleet at once.
     */
    it("wraps the control in a label so children name it", () => {
      expect(source).toContain("<label");
      const label = source.slice(source.indexOf("<label"));
      expect(label).toContain("<input");
    });

    /*
     * The styled control beside the input is decoration. If it stopped being
     * `aria-hidden` it would join the name computation and every named toggle
     * would announce its own graphics.
     */
    it("keeps the painted control out of the name", () => {
      expect(source).toContain('aria-hidden="true"');
    });
  });
}
