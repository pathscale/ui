import { afterEach, describe, expect, it } from "bun:test";
import { immediateDriver, setMotionDriver } from "../../src/motion/driver";
import { runMotion } from "../../src/motion/engine";

afterEach(() => setMotionDriver(immediateDriver));

describe("runMotion", () => {
  it("settles immediately without scheduling channels already at their targets", () => {
    let calls = 0;
    let completed = 0;
    setMotionDriver(() => {
      calls += 1;
      return { stop: () => {} };
    });

    const element = { style: {} } as unknown as HTMLElement;
    runMotion(
      element,
      { opacity: 1, x: 0, y: 0, scale: 1 },
      { opacity: 1, x: 0, y: 0, scale: 1 },
      { duration: 0.3 },
      () => {
        completed += 1;
      },
    );

    expect(calls).toBe(0);
    expect(completed).toBe(1);
    expect(element.style.opacity).toBe("1");
    expect(element.style.transform).toBe("translate3d(0px, 0px, 0) scale(1)");
  });
});
