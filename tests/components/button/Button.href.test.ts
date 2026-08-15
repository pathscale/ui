import { describe, expect, it } from "bun:test";
import {
  buttonElement,
  buttonHref,
  buttonRel,
} from "../../../src/components/button/Button.interactions";

/**
 * A link that looks like a button is what every fleet application was reaching
 * outside the library for: `Button` was a `<button>` with no destination, and
 * `Link`'s variants are underline treatments rather than fills, so call sites
 * wrote raw framework classes instead. js.software alone had 46 of them.
 *
 * What matters is not that it can render an anchor but that the anchor is a
 * real one, because the whole reason to want it is middle-click,
 * open-in-new-tab and "copy link address" - every one of which a `<button>`
 * with an onClick handler takes away.
 */
describe("Button as a link", () => {
  it("is a button until there is somewhere to go", () => {
    expect(buttonElement(undefined)).toBe("button");
    expect(buttonElement("/docs")).toBe("a");
    // An empty href is a destination: it means "this document".
    expect(buttonElement("")).toBe("a");
  });

  it("carries the destination when it can be followed", () => {
    expect(buttonHref("/docs", false)).toBe("/docs");
    expect(buttonHref(undefined, false)).toBeUndefined();
  });

  /**
   * The destination is what makes an anchor activatable, so an inert one has to
   * lose it. Keeping `href` and refusing the click leaves the element
   * focusable, Enter-activatable, and still offering "open in new tab" from the
   * context menu: a disabled control that is not disabled.
   */
  it("drops the destination when inert, rather than refusing the click", () => {
    expect(buttonHref("/docs", true)).toBeUndefined();
  });

  it("defaults rel for a new tab and lets the caller override it", () => {
    expect(buttonRel(undefined, "_blank")).toBe("noopener noreferrer");
    expect(buttonRel("me", "_blank")).toBe("me");
    expect(buttonRel(undefined, undefined)).toBeUndefined();
    expect(buttonRel(undefined, "_self")).toBeUndefined();
  });
});
