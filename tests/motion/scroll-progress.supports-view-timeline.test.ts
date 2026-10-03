import { afterEach, describe, expect, it } from "bun:test";
import { supportsViewTimeline } from "../../src/motion/scroll-progress";

let cssDescriptor: PropertyDescriptor | undefined;

const installCssSupports = (
  supports: (property: string, value: string) => boolean,
) => {
  cssDescriptor = Object.getOwnPropertyDescriptor(globalThis, "CSS");
  Object.defineProperty(globalThis, "CSS", {
    configurable: true,
    value: { supports },
  });
};

const restoreCss = () => {
  if (cssDescriptor) {
    Object.defineProperty(globalThis, "CSS", cssDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "CSS");
  }
  cssDescriptor = undefined;
};

afterEach(restoreCss);

describe("supportsViewTimeline", () => {
  it("requires the named timeline and contain range declarations", () => {
    const checked: string[] = [];
    installCssSupports((property, value) => {
      checked.push(`${property}: ${value}`);
      return true;
    });

    expect(supportsViewTimeline()).toBe(true);
    expect(checked).toEqual([
      "view-timeline-name: --motion-progress",
      "view-timeline-axis: block",
      "animation-timeline: --motion-progress",
      "animation-range: contain 0% contain 100%",
    ]);
  });

  it("rejects partial support and a throwing CSS.supports implementation", () => {
    installCssSupports((property) => property !== "animation-range");
    expect(supportsViewTimeline()).toBe(false);

    restoreCss();
    installCssSupports(() => {
      throw new Error("CSS.supports unavailable");
    });
    expect(supportsViewTimeline()).toBe(false);
  });
});
