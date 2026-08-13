import { readFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(
  join(import.meta.dir, "../../../src/components/tag/Tag.css"),
  "utf8",
);

describe("Tag styles", () => {
  it("do not style syntax highlighter tag tokens", () => {
    const unsafeSelectors: string[] = [];

    postcss.parse(stylesheet).walkRules((rule) => {
      for (const selector of rule.selectors) {
        if (
          /(?:^|[\s>+~,(])\.tag(?=[:.#\s>+~,[)]|$)/.test(selector) &&
          !selector.includes(":not(.token)")
        ) {
          unsafeSelectors.push(selector);
        }
      }
    });

    expect(unsafeSelectors).toEqual([]);
  });
});
