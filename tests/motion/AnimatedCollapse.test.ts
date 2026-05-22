import { describe, expect, it } from "bun:test";
import {
  computeCollapseStyle,
  nextCollapsePhase,
} from "../../src/motion/solid/AnimatedCollapse";

describe("nextCollapsePhase", () => {
  it("transitions closed -> opening when open=true", () => {
    expect(nextCollapsePhase("closed", true)).toBe("opening");
  });

  it("stays opening if already opening", () => {
    expect(nextCollapsePhase("opening", true)).toBe("opening");
  });

  it("stays open if already open", () => {
    expect(nextCollapsePhase("open", true)).toBe("open");
  });

  it("transitions open -> closing when open=false", () => {
    expect(nextCollapsePhase("open", false)).toBe("closing");
  });

  it("transitions opening -> closing if interrupted by open=false", () => {
    expect(nextCollapsePhase("opening", false)).toBe("closing");
  });

  it("stays closed if already closed and still closed", () => {
    expect(nextCollapsePhase("closed", false)).toBe("closed");
  });

  it("re-opens from closing when open flips back to true", () => {
    expect(nextCollapsePhase("closing", true)).toBe("opening");
  });
});

describe("computeCollapseStyle", () => {
  it("zeroes height and hides overflow when closed", () => {
    const style = computeCollapseStyle("closed", 0, true);
    expect(style.overflow).toBe("hidden");
    expect(style.height).toBe("0px");
    expect(style.opacity).toBe(0);
  });

  it("omits height (lets layout flow) when fully open", () => {
    const style = computeCollapseStyle("open", null, true);
    expect(style.height).toBeUndefined();
    expect(style.overflow).toBe("visible");
    expect(style.opacity).toBe(1);
  });

  it("applies measured height in px during opening", () => {
    const style = computeCollapseStyle("opening", 124, true);
    expect(style.height).toBe("124px");
    expect(style.overflow).toBe("hidden");
  });

  it("applies measured height in px during closing", () => {
    const style = computeCollapseStyle("closing", 80, true);
    expect(style.height).toBe("80px");
    expect(style.overflow).toBe("hidden");
  });

  it("omits opacity when animateOpacity is false", () => {
    const closed = computeCollapseStyle("closed", 0, false);
    expect(closed.opacity).toBeUndefined();
    const open = computeCollapseStyle("open", null, false);
    expect(open.opacity).toBeUndefined();
  });

  it("does not write inline height when height is unknown (null) during transitions", () => {
    const style = computeCollapseStyle("opening", null, true);
    expect(style.height).toBeUndefined();
    expect(style.overflow).toBe("hidden");
  });
});
