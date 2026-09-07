/**
 * Which overlay owns the keyboard when overlays overlap.
 *
 * Every bug this manager exists for is an arrangement rather than a component:
 * two things open at once, and no single listener able to see both. A
 * component sweep cannot set that up -- each fixture mounts one component
 * alone on its own page -- so the arrangement is asserted here.
 *
 * Against `focusScope` rather than through a rendered document, because this
 * repository deliberately has no DOM in its unit tests: the QA harness is the
 * DOM-level instrument. The decision this covers is which elements form the
 * scope, which is the half that was wrong; moving focus between them is
 * `trapFocus`, and it is the same code both overlays already used.
 */
import { describe, expect, it } from "bun:test";
import { focusScope } from "../../src/lib/overlay";

/** A stand-in for an overlay's portalled content. */
const element = (name: string) => ({ name }) as unknown as HTMLElement;

const dialog = element("dialog");
const drawer = element("drawer");
const popover = element("popover");

describe("focusScope", () => {
  it("is empty when nothing open contains focus", () => {
    // A popover on its own does not take the keyboard from the page.
    expect(
      focusScope([
        { dismiss: () => {}, dismissable: () => true, element: () => popover },
      ]),
    ).toEqual([]);
  });

  it("is the modal's own content when it is the only overlay", () => {
    expect(
      focusScope([
        {
          dismiss: () => {},
          dismissable: () => true,
          element: () => dialog,
          modal: true,
        },
      ]),
    ).toEqual([dialog]);
  });

  it("includes a popover opened from inside the modal", () => {
    /*
     * The regression. The popover is on top and is not modal, so asking only
     * the top entry left Tab unhandled and focus walked out to the page behind
     * an open dialog. Trapping in the dialog alone is the opposite failure:
     * the popover's content is portalled outside it and Tab could not reach it.
     */
    expect(
      focusScope([
        {
          dismiss: () => {},
          dismissable: () => true,
          element: () => dialog,
          modal: true,
        },
        { dismiss: () => {}, dismissable: () => true, element: () => popover },
      ]),
    ).toEqual([dialog, popover]);
  });

  it("is owned by the innermost modal, not the outermost", () => {
    // A dialog opened from inside a drawer contains focus; the drawer behind
    // it does not get to widen the scope back out.
    expect(
      focusScope([
        {
          dismiss: () => {},
          dismissable: () => true,
          element: () => drawer,
          modal: true,
        },
        {
          dismiss: () => {},
          dismissable: () => true,
          element: () => dialog,
          modal: true,
        },
      ]),
    ).toEqual([dialog]);
  });

  it("ignores an overlay that declares no content", () => {
    // `element` is asked at key time and the content is portalled, so it can
    // legitimately be missing for a frame. A missing element must not put
    // `undefined` in the scope.
    expect(
      focusScope([
        {
          dismiss: () => {},
          dismissable: () => true,
          element: () => dialog,
          modal: true,
        },
        { dismiss: () => {}, dismissable: () => true, element: () => undefined },
      ]),
    ).toEqual([dialog]);
  });

  it("does not contain focus for a drawer that opted out", () => {
    // `trapFocus={false}` is a caller saying this drawer does not contain
    // focus. It still contributes content to a scope something else owns.
    expect(
      focusScope([
        {
          dismiss: () => {},
          dismissable: () => true,
          element: () => drawer,
          modal: false,
        },
      ]),
    ).toEqual([]);
  });
});
