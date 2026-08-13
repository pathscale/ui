import { describe, expect, it } from "bun:test";
import { shouldMountCollapsibleContent } from "../../../src/components/collapsible/Collapsible.mounting";

describe("Collapsible content mounting", () => {
  it("retains closed content by default", () => {
    expect(shouldMountCollapsibleContent(true, false)).toBeTrue();
  });

  it("mounts non-retained content only while expanded", () => {
    expect(shouldMountCollapsibleContent(false, false)).toBeFalse();
    expect(shouldMountCollapsibleContent(false, true)).toBeTrue();
  });
});
