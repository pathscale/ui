/**
 * What `href` decides, as three functions.
 *
 * A `.layout.tsx` binds free identifiers to props, so anything with a rule in
 * it belongs beside the markup rather than inside it. These are also the parts
 * worth testing, and the repository's tests are pure: there is no DOM in the
 * suite, by choice.
 */

/** An anchor when there is somewhere to go, a button otherwise. */
export const buttonElement = (href: string | undefined): "a" | "button" =>
  typeof href === "string" ? "a" : "button";

/**
 * The destination, unless the control is inert.
 *
 * There is no `disabled` on an anchor. Keeping the `href` and refusing the
 * click leaves it focusable, activatable by Enter, and still offering "open in
 * new tab" from the context menu - a disabled control that is not disabled.
 * Removing the attribute is what makes it inert; `aria-disabled` is how it is
 * announced.
 */
export const buttonHref = (
  href: string | undefined,
  inert: boolean,
): string | undefined => (typeof href === "string" && !inert ? href : undefined);

/**
 * `rel` for a link, defaulted for new tabs.
 *
 * A `target="_blank"` without `noopener` hands the opening document to the
 * destination. Defaulted rather than forced, so a caller who means `me` or
 * `nofollow` still gets it.
 */
export const buttonRel = (
  rel: string | undefined,
  target: string | undefined,
): string | undefined =>
  rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
