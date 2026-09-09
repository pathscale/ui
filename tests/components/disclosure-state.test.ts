import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * What a closed `Accordion` or `Collapsible` panel is, and what it is not.
 *
 * A sweep reported that these "expose no expanded state": an unnamed `region`
 * that keeps its box when closed and only flips hidden, with no expanded
 * attribute on the trigger. Two of those three are not what the components do,
 * and the assertions below pin the parts that were already right so a rewrite
 * of the report cannot become a rewrite of the component:
 *
 *   - the trigger carries `aria-expanded` and `data-expanded`, both keyed on
 *     the same state, in both components;
 *   - the panel is a `region` named by `aria-labelledby` pointing at the
 *     trigger's own id, which the trigger sets from the same accessor.
 *
 * The third is real, and it is worse than "keeps its box". `keepMounted` is
 * the default, so a closed panel stays in the document; it was flattened with
 * `grid-template-rows: 0fr` and `opacity: 0` and marked `aria-hidden="true"`,
 * and neither of those CSS properties takes anything out of the tab order.
 * Every link and button inside a closed panel was still tabbable, so Tab moved
 * focus into a panel nobody can see -- and into an `aria-hidden` subtree,
 * which is the one thing `aria-hidden` must never contain.
 *
 * `visibility: hidden` is what removes descendants from both the tab order and
 * the accessibility tree. It is delayed by the length of the collapse so the
 * animation still plays, and undelayed on open so the panel is visible for the
 * whole expansion.
 */
const read = (...parts: string[]) =>
  readFileSync(join(import.meta.dir, "..", "..", "src", ...parts), "utf8");

const strip = (source: string) => source.replace(/\/\*[\s\S]*?\*\//g, "");

const DISCLOSURES = [
  {
    name: "Accordion",
    layout: strip(read("components", "accordion", "Accordion.layout.tsx")),
    css: read("components", "accordion", "Accordion.css"),
    closed: ".accordion__content",
    open: ".accordion__content--expanded",
  },
  {
    name: "Collapsible",
    layout: strip(read("components", "collapsible", "Collapsible.layout.tsx")),
    css: read("components", "collapsible", "Collapsible.css"),
    closed: ".collapsible__content",
    open: '.collapsible__content[data-expanded="true"]',
  },
];

/** The declarations of one rule, by exact selector, as authored. */
const ruleBody = (css: string, selector: string) => {
  const at = css.indexOf(`${selector} {`);
  expect(at, `${selector} is not in the stylesheet`).toBeGreaterThanOrEqual(0);
  return css.slice(at, css.indexOf("\n  }", at));
};

for (const disclosure of DISCLOSURES) {
  describe(`${disclosure.name} already states whether it is open`, () => {
    it("puts an expanded attribute on the trigger", () => {
      expect(disclosure.layout).toContain("aria-expanded={");
      expect(disclosure.layout).toContain("data-expanded={");
    });

    it("names the panel after the trigger that controls it", () => {
      expect(disclosure.layout).toContain('role="region"');
      expect(disclosure.layout).toMatch(/aria-labelledby=\{[^}]*triggerId\(\)/);
      expect(disclosure.layout).toMatch(/id=\{[^}]*triggerId\(\)/);
    });

    it("points the trigger at the panel it controls", () => {
      expect(disclosure.layout).toMatch(/aria-controls=\{[^}]*contentId\(\)/);
      expect(disclosure.layout).toMatch(/id=\{[^}]*contentId\(\)/);
    });
  });

  describe(`${disclosure.name} takes a closed panel out of the tab order`, () => {
    it("hides the closed panel rather than only flattening it", () => {
      const closed = ruleBody(disclosure.css, disclosure.closed);
      expect(closed).toContain("visibility: hidden;");
    });

    it("shows it again when open", () => {
      const open = ruleBody(disclosure.css, disclosure.open);
      expect(open).toContain("visibility: visible;");
    });

    /*
     * Without the delay the panel vanishes on the first frame of the collapse
     * and the animation plays on nothing. Without the undelayed counterpart on
     * the open rule, the expansion would play the same way.
     */
    it("waits for the collapse before disappearing", () => {
      expect(ruleBody(disclosure.css, disclosure.closed)).toContain(
        "visibility 0s linear 200ms",
      );
      expect(ruleBody(disclosure.css, disclosure.open)).toContain(
        "visibility 0s linear 0s",
      );
    });

    /*
     * `aria-hidden` on a subtree that still holds focusable elements is the
     * combination this rule exists to make impossible. The panel keeps the
     * attribute, so the CSS is what has to be right.
     */
    it("still marks the closed panel hidden", () => {
      expect(disclosure.layout).toMatch(/aria-hidden=\{expanded\(\)/);
    });
  });
}
