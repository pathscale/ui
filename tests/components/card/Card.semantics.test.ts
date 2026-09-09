import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cardSemantics } from "../../../src/components/card/Card.interactions";

/**
 * An interactive card must not be a second interactive element.
 *
 * `isInteractive` gave the card `role="button"` and `tabindex="0"` and offered
 * no way off either, so the ordinary way to make a whole card navigate --
 * wrapping it in a link -- produced a `button` inside a `link` with the same
 * name and the same box. Measured on one site: every card on it. Nested
 * interactive content is invalid HTML, a reader hears the card twice, and a
 * press by coordinate lands on whichever of the two is on top.
 *
 * Three things come out of the rule, and the first is what fixes the sites
 * with no call site edited: a card is a button when it looks pressable *and
 * has something to press*. `<a href><Card isInteractive /></a>` hands the card
 * no handler, because the anchor is what navigates, so the card stops claiming
 * to be a button and the nesting goes away where it stands. `isInteractive`
 * was doing two jobs and only one of them survives inside a link: it is how a
 * card asks for hover and press affordance, which is exactly what a card
 * inside a link wants and all it wants.
 *
 * `href` is the second: a card that navigates should be the anchor. An
 * explicit `role` is the third, and it was already accepted and then ignored
 * where it mattered -- `role="presentation"` replaced the role and left
 * `tabindex="0"` behind, so the only opt-out the component had produced an
 * element that was out of the accessibility tree and still stopped the
 * keyboard on the way past.
 */
describe("cardSemantics", () => {
  it("keeps the plain card a plain div", () => {
    expect(cardSemantics({})).toEqual({
      element: "div",
      role: undefined,
      tabindex: undefined,
      handlesKeyboardActivation: false,
    });
  });

  it("makes a card with a handler reachable by keyboard", () => {
    expect(cardSemantics({ isInteractive: true, hasActivation: true })).toEqual({
      element: "div",
      role: "button",
      tabindex: 0,
      handlesKeyboardActivation: true,
    });
  });

  /*
   * The reported shape, from the outside in. The card is inside a link and
   * carries no handler of its own, so it announces nothing and takes no focus,
   * and the link around it is the only interactive element in the box.
   */
  it("does not announce a card that has nothing to press", () => {
    expect(cardSemantics({ isInteractive: true })).toEqual({
      element: "div",
      role: undefined,
      tabindex: undefined,
      handlesKeyboardActivation: false,
    });
  });

  it("becomes the link rather than sitting inside one", () => {
    const semantics = cardSemantics({ href: "/pricing", isInteractive: true });
    expect(semantics.element).toBe("a");
    expect(semantics.role).toBeUndefined();
    expect(semantics.tabindex).toBeUndefined();
  });

  it("leaves Enter to the anchor, which already handles it", () => {
    expect(
      cardSemantics({ href: "/pricing", isInteractive: true })
        .handlesKeyboardActivation,
    ).toBeFalse();
  });

  /*
   * The regression this file exists for. Before the fix these two returned
   * `tabindex: 0`, which is what made the escape hatch useless: the card was
   * announced as nothing and was still in the tab order.
   */
  for (const role of ["presentation", "none"] as const) {
    it(`takes a ${role} card out of the tab order too`, () => {
      const semantics = cardSemantics({
        isInteractive: true,
        hasActivation: true,
        role,
      });
      expect(semantics.role).toBe(role);
      expect(semantics.tabindex).toBeUndefined();
      expect(semantics.handlesKeyboardActivation).toBeFalse();
    });
  }

  it("honours a role the call site chose over the one it would pick", () => {
    const semantics = cardSemantics({
      isInteractive: true,
      hasActivation: true,
      role: "listitem",
    });
    expect(semantics.role).toBe("listitem");
    expect(semantics.handlesKeyboardActivation).toBeFalse();
  });

  it("honours an explicit tabindex, including a negative one", () => {
    expect(
      cardSemantics({ isInteractive: true, hasActivation: true, tabindex: -1 })
        .tabindex,
    ).toBe(-1);
  });

  /*
   * Solid spells "remove this attribute" as `false`, and it arrives here as a
   * prop like any other. Read as a value it would suppress the fallback and
   * leave an interactive card unfocusable.
   */
  it("reads a removal request as absence, not as a choice", () => {
    expect(
      cardSemantics({
        isInteractive: true,
        hasActivation: true,
        role: false,
        tabindex: false,
      }),
    ).toEqual({
      element: "div",
      role: "button",
      tabindex: 0,
      handlesKeyboardActivation: true,
    });
  });
});

describe("Card renders what the rule decided", () => {
  const SOURCE = readFileSync(
    join(import.meta.dir, "../../../src/components/card/Card.layout.tsx"),
    "utf8",
  );
  const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "");

  it("asks the rule instead of restating it", () => {
    expect(CODE).toContain("cardSemantics({");
    expect(CODE).not.toContain('local.isInteractive ? "button" : undefined');
    expect(CODE).not.toContain("local.isInteractive ? 0 : undefined");
  });

  it("renders an anchor when the rule says anchor", () => {
    expect(CODE).toContain('semantics().element === "a"');
    expect(CODE).toContain("href={buttonHref(local.href, false)}");
  });

  /*
   * Literal elements rather than one Dynamic. Button learnt this the expensive
   * way: a Dynamic string element painted correctly under Blitz and dropped a
   * nested consumer's event binding, which on a card full of buttons is the
   * whole point of the card.
   */
  it("keeps both forms literal", () => {
    expect(CODE).not.toContain("Dynamic");
    expect(CODE).toContain("<a");
    expect(CODE).toContain("<div");
  });

  it("gates keyboard activation on the rule, not on the prop", () => {
    expect(CODE).toContain("semantics().handlesKeyboardActivation");
  });

  it("reports whether the card has an activation of its own", () => {
    expect(CODE).toContain("hasActivation: local.onClick != null");
  });
});
