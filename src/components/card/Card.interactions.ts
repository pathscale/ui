/**
 * What an interactive card *is*, as one function.
 *
 * `isInteractive` gave a card `role="button"` and `tabindex="0"` with no way
 * off either. That is right for a card that is the only activatable thing in
 * its box, and wrong the moment a card is put inside a link, which is the
 * ordinary way to make a whole card navigate. Measured on one site: every card
 * on it was a `button` inside a `link`, same name, same box. Nested
 * interactive content is invalid HTML, a reader hears the card twice, and a
 * press by coordinate lands on whichever of the two is on top.
 *
 * Three things come out of this, and the first is what fixes the sites without
 * anyone editing a call site. A card is announced as a button when it looks
 * pressable *and has something to press*: `<a href><Card isInteractive /></a>`
 * hands the card no handler, because the anchor is what navigates, so the card
 * stops claiming to be a button and the nesting goes away where it stands.
 * `isInteractive` was doing two jobs at once and only one of them survives
 * inside a link: it is how a card asks for hover and press affordance, which is
 * exactly what a card inside a link wants, and all it wants.
 *
 * The second is `href`: a card that navigates should *be* the anchor rather
 * than sit inside one, exactly as `Button` already does. The third is an
 * explicit `role`, which was accepted and then half-ignored --
 * `role="presentation"` left `tabindex="0"` behind, so the escape hatch
 * produced a presentational element that was still in the tab order and still
 * announced as focusable.
 *
 * A `.layout.tsx` binds free identifiers to props, so the rule lives beside
 * the markup rather than inside it, and the repository's tests are pure.
 */

import type { JSX } from "@solidjs/web";

/*
 * Solid types every attribute as `T | RemoveAttribute`, where the second member
 * is `false` and means "do not emit this". Both halves arrive here and only the
 * first can be reasoned about, so `given` collapses the other to `undefined`
 * once, at the boundary.
 */
type RoleAttribute = JSX.HTMLAttributes<HTMLElement>["role"];
type TabIndexAttribute = JSX.HTMLAttributes<HTMLElement>["tabindex"];
type Role = Exclude<RoleAttribute, false | undefined>;
type TabIndex = Exclude<TabIndexAttribute, false | undefined>;

export type CardSemanticsInput = {
  href?: string | false;
  isInteractive?: boolean;
  /**
   * Whether the card has an activation of its own.
   *
   * This is the half that fixes the fleet without anyone editing a call site.
   * `<a href><Card isInteractive /></a>` gives the card no handler: the anchor
   * is what navigates. A card with nothing to activate is not a button, so it
   * stops claiming to be one, and the nesting goes away where it is.
   *
   * `isInteractive` alone was read as "announce this as a button", and it
   * cannot be: it is also how a card asks for hover and press *affordance*,
   * which is exactly what a card inside a link wants and all it wants.
   */
  hasActivation?: boolean;
  /** An explicit `role` from the call site. Wins outright. */
  role?: RoleAttribute;
  /** An explicit `tabindex` from the call site. Wins outright. */
  tabindex?: TabIndexAttribute;
};

export type CardSemantics = {
  element: "a" | "div";
  role: Role | undefined;
  tabindex: TabIndex | undefined;
  /**
   * Whether the card has to implement Enter and Space itself.
   *
   * Only a `div` wearing `role="button"` does. An anchor activates on Enter
   * natively, and a presentational card activates on nothing.
   */
  handlesKeyboardActivation: boolean;
};

const given = <T>(value: T | false | undefined): T | undefined =>
  value === false || value === undefined ? undefined : value;

export const cardSemantics = (input: CardSemanticsInput): CardSemantics => {
  const role = given(input.role);
  const tabindex = given(input.tabindex);

  /*
   * An anchor is already a link, already focusable and already activated by
   * Enter. Adding `role="button"` on top of it would replace the one thing a
   * reader wants to know about it, and adding `tabindex` would say nothing it
   * did not already say.
   */
  if (typeof input.href === "string") {
    return {
      element: "a",
      role,
      tabindex,
      handlesKeyboardActivation: false,
    };
  }

  /*
   * A button, but only when there is something to press. `isInteractive` says
   * "look pressable"; a handler is what makes it pressable. A card that looks
   * pressable because the link around it is, and announces itself as a button
   * that does nothing, is the whole reported defect.
   */
  const resolvedRole =
    role ??
    (input.isInteractive && input.hasActivation ? "button" : undefined);
  return {
    element: "div",
    role: resolvedRole,
    /*
     * Focusable exactly when it is a button, and otherwise only if the call
     * site asked. Two cases were wrong before, in opposite directions:
     * `role="presentation"` kept `tabindex="0"`, which is an element out of
     * the accessibility tree that still stops the keyboard on the way past and
     * made the component's only opt-out useless; and a card with no activation
     * of its own was focusable while there was nothing to activate.
     */
    tabindex: tabindex ?? (resolvedRole === "button" ? 0 : undefined),
    handlesKeyboardActivation: resolvedRole === "button",
  };
};
