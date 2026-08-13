import { describe, expect, it } from "bun:test";
import { shouldMountDisclosureContent } from "../../../src/components/disclosure/Disclosure.mounting";

describe("Disclosure content mounting", () => {
  it("retains closed content by default", () => {
    expect(shouldMountDisclosureContent(true, false)).toBeTrue();
  });

  it("mounts non-retained content only while expanded", () => {
    expect(shouldMountDisclosureContent(false, false)).toBeFalse();
    expect(shouldMountDisclosureContent(false, true)).toBeTrue();
  });
});
