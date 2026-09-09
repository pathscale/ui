import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  asAriaName,
  resolvePopoverDialogName,
} from "../../../src/components/popover/Popover.a11y";

/**
 * `Popover.Dialog aria-label="..."` has to name the dialog.
 *
 * It did not. `role="dialog"` is on `Popover.Content`; `Popover.Dialog` is a
 * panel inside it, so an `aria-label` written there landed on a generic and
 * named nothing that anything addresses. Two sites reported it and the fleet's
 * popover dialogs were anonymous without exception.
 *
 * The second half is the part that is easy to get wrong twice:
 * `aria-labelledby` outranks `aria-label` in the name calculation, and the
 * content already falls back to `aria-labelledby={triggerId}`. Forwarding the
 * label while leaving that fallback in place would leave the dialog named
 * after the button that opened it, with the author's own name ignored -- the
 * same silent failure, one element along.
 */
describe("the popover dialog's name reaches the dialog", () => {
  it("names the dialog from a label written on Popover.Dialog", () => {
    expect(
      resolvePopoverDialogName({
        dialogLabel: "Filters",
        triggerId: "popover-trigger-a1b2c3",
      }),
    ).toEqual({ "aria-label": "Filters", "aria-labelledby": undefined });
  });

  it("drops the trigger fallback rather than letting it outrank the name", () => {
    const name = resolvePopoverDialogName({
      dialogLabel: "Filters",
      triggerId: "popover-trigger-a1b2c3",
    });
    expect(name["aria-labelledby"]).toBeUndefined();
  });

  it("falls back to the trigger when nothing names the dialog", () => {
    expect(
      resolvePopoverDialogName({ triggerId: "popover-trigger-a1b2c3" }),
    ).toEqual({
      "aria-label": undefined,
      "aria-labelledby": "popover-trigger-a1b2c3",
    });
  });

  it("leaves the dialog unnamed when there is no trigger yet", () => {
    expect(resolvePopoverDialogName({})).toEqual({
      "aria-label": undefined,
      "aria-labelledby": undefined,
    });
  });

  it("prefers a reference to a name, because the calculation does", () => {
    expect(
      resolvePopoverDialogName({
        dialogLabel: "Filters",
        dialogLabelledBy: "filters-heading",
        triggerId: "popover-trigger-a1b2c3",
      }),
    ).toEqual({
      "aria-label": undefined,
      "aria-labelledby": "filters-heading",
    });
  });

  it("lets a name on the content itself win over one on the dialog", () => {
    expect(
      resolvePopoverDialogName({
        contentLabel: "Content wins",
        dialogLabel: "Dialog loses",
      })["aria-label"],
    ).toBe("Content wins");
  });

  it("treats an empty name as no name", () => {
    expect(
      resolvePopoverDialogName({
        dialogLabel: "",
        triggerId: "popover-trigger-a1b2c3",
      })["aria-labelledby"],
    ).toBe("popover-trigger-a1b2c3");
  });

  /*
   * Solid types every aria attribute as `string | RemoveAttribute`, and the
   * second member is `false`. Stored unnormalised it would become the string
   * "false" on the dialog, which is a name.
   */
  it("reads a removal request as no name at all", () => {
    expect(asAriaName(false)).toBeUndefined();
    expect(asAriaName(undefined)).toBeUndefined();
    expect(asAriaName("Filters")).toBe("Filters");
  });
});

/**
 * The wiring, asserted separately from the rule.
 *
 * The rule above is a pure function and cannot tell whether the component
 * calls it, nor whether `Popover.Dialog` still writes the attribute on its own
 * generic. Both are what made the original defect invisible to review.
 */
describe("Popover.Dialog hands its name up instead of wearing it", () => {
  const SOURCE = readFileSync(
    join(
      import.meta.dir,
      "../../../src/components/popover/Popover.layout.tsx",
    ),
    "utf8",
  );

  const dialogBody = SOURCE.slice(
    SOURCE.indexOf("const PopoverDialog:"),
    SOURCE.indexOf("export type PopoverArrowProps"),
  );

  const contentBody = SOURCE.slice(
    SOURCE.indexOf("const PopoverContent:"),
    SOURCE.indexOf("export type PopoverDialogProps"),
  );

  it("keeps the name off the inner generic", () => {
    expect(dialogBody).toContain('"aria-label"');
    expect(dialogBody).toContain('"aria-labelledby"');
    // Omitted from the passthrough, so the attribute cannot reach the div.
    const omitted = dialogBody.slice(
      dialogBody.indexOf("omit("),
      dialogBody.indexOf(");", dialogBody.indexOf("omit(")),
    );
    expect(omitted).toContain('"aria-label"');
    expect(omitted).toContain('"aria-labelledby"');
  });

  it("reports the name into the popover context", () => {
    expect(dialogBody).toContain("ctx.setDialogLabel(");
    expect(dialogBody).toContain("ctx.setDialogLabelledBy(");
  });

  it("withdraws the name when the panel goes away", () => {
    expect(dialogBody).toContain("ctx.setDialogLabel(undefined)");
    expect(dialogBody).toContain("ctx.setDialogLabelledBy(undefined)");
  });

  it("applies the resolved name to the node that carries the role", () => {
    expect(contentBody).toContain('role="dialog"');
    expect(contentBody).toContain("resolvePopoverDialogName(");
    expect(contentBody).toContain('aria-label={dialogName()["aria-label"]}');
    expect(contentBody).toContain(
      'aria-labelledby={dialogName()["aria-labelledby"]}',
    );
  });
});
