import { describe, expect, it } from "bun:test";
import {
  missingRecipeFlagUsages,
  recipeFlagKeys,
} from "../scripts/component-state-contract";
import { readFileSync } from "node:fs";

const inlineEditRecipe = `
  const CLASSES = {
    base: "inline-edit",
    flag: {
      editing: "inline-edit--editing",
      fullWidth: "inline-edit--full-width",
      disabled: "inline-edit--disabled",
    },
  };
`;

describe("component state contract", () => {
  it("finds every flag, including flags nested under a slot", () => {
    const recipe = `${inlineEditRecipe}
      const nested = { row: { flag: { padded: "row--padded" } } };
    `;

    expect(recipeFlagKeys(recipe)).toEqual([
      "editing",
      "fullWidth",
      "disabled",
      "padded",
    ]);
  });

  it("rejects the exact split contract that shipped in InlineEdit", () => {
    const brokenLayout = `
      twMerge(
        CLASSES.base,
        props.fullWidth && CLASSES.flag.fullWidth,
        props.disabled && CLASSES.flag.disabled,
      );
    `;

    expect(missingRecipeFlagUsages(inlineEditRecipe, brokenLayout)).toEqual([
      "editing",
    ]);
  });

  it("accepts a layout only when every recipe flag is wired", () => {
    const layout = `
      CLASSES.flag.editing;
      CLASSES.flag.fullWidth;
      CLASSES.flag.disabled;
    `;

    expect(missingRecipeFlagUsages(inlineEditRecipe, layout)).toEqual([]);
  });

  it("constructs Select compound children through the deferred context channel", () => {
    const generated = readFileSync(
      new URL("../src/components/select/Select.generated.tsx", import.meta.url),
      "utf8",
    );
    const root = generated.slice(
      generated.indexOf("const __solidLayoutSelectRoot"),
      generated.indexOf("const SelectRoot =", generated.indexOf("const __solidLayoutSelectRoot")),
    );

    expect(root).toContain("{_stable.children}");
    expect(root).not.toContain("{p.children}");
  });
});
