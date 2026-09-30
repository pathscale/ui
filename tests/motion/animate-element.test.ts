import { afterEach, describe, expect, it } from "bun:test";
import { animateElement } from "../../src/motion/animate-element";

let matchMediaDescriptor: PropertyDescriptor | undefined;
let matchMediaInstalled = false;

const restoreMatchMedia = () => {
  if (!matchMediaInstalled) return;
  if (matchMediaDescriptor) {
    Object.defineProperty(globalThis, "matchMedia", matchMediaDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "matchMedia");
  }
  matchMediaDescriptor = undefined;
  matchMediaInstalled = false;
};

const installMatchMedia = (query: MediaQueryList) => {
  matchMediaDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "matchMedia",
  );
  matchMediaInstalled = true;
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: () => query,
  });
};

afterEach(restoreMatchMedia);

describe("animateElement", () => {
  it("applies the final keyframe and resolves when WAAPI is unavailable", async () => {
    const properties = new Map<string, string>();
    const style = {
      opacity: "0",
      setProperty: (property: string, value: string) =>
        properties.set(property, value),
    };
    const element = { style } as unknown as Element;

    const animation = animateElement(element, [
      { opacity: 0, "--progress": "0" },
      { opacity: 1, "--progress": "1" },
    ]);

    await animation.finished;
    animation.cancel();
    expect(style.opacity).toBe("1");
    expect(properties.get("--progress")).toBe("1");
  });

  it("passes timing options to WAAPI and resolves on cancellation", async () => {
    let receivedDuration: number | undefined;
    let receivedDelay: number | undefined;
    let receivedEasing: string | undefined;
    let cancelCount = 0;
    const neverFinishes = new Promise<void>(() => {});
    const element = {
      animate: (
        _keyframes: Keyframe[] | PropertyIndexedKeyframes,
        options?: KeyframeAnimationOptions,
      ) => {
        receivedDuration = options?.duration as number;
        receivedDelay = options?.delay as number;
        receivedEasing = options?.easing;
        return {
          cancel: () => {
            cancelCount += 1;
          },
          finished: neverFinishes,
        } as unknown as Animation;
      },
    } as unknown as Element;

    const animation = animateElement(
      element,
      [{ opacity: 0 }, { opacity: 1 }],
      {
        duration: 180,
        delay: 40,
        easing: "linear",
      },
    );
    animation.cancel();
    await animation.finished;

    expect(receivedDuration).toBe(180);
    expect(receivedDelay).toBe(40);
    expect(receivedEasing).toBe("linear");
    expect(cancelCount).toBe(1);
  });

  it("resolves when the WAAPI finished promise resolves", async () => {
    let finish: (() => void) | undefined;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const element = {
      animate: () =>
        ({
          cancel: () => {},
          finished,
        }) as unknown as Animation,
    } as unknown as Element;

    const animation = animateElement(
      element,
      [{ opacity: 0 }, { opacity: 1 }],
      {
        respectReducedMotion: false,
      },
    );
    finish?.();
    await animation.finished;

    expect(finish).toBeDefined();
  });

  it("finishes an active animation when reduced motion turns on", async () => {
    let change: EventListenerOrEventListenerObject | undefined;
    let removedChange: EventListenerOrEventListenerObject | undefined;
    let cancelCount = 0;
    let prefersReducedMotion = false;
    const properties = new Map<string, string>();
    const media = {
      get matches() {
        return prefersReducedMotion;
      },
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        change = listener;
      },
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject,
      ) => {
        removedChange = listener;
      },
    } as unknown as MediaQueryList;
    installMatchMedia(media);

    const element = {
      style: {
        opacity: "0",
        setProperty: (property: string, value: string) =>
          properties.set(property, value),
      },
      animate: () =>
        ({
          cancel: () => {
            cancelCount += 1;
          },
          finished: new Promise<void>(() => {}),
        }) as unknown as Animation,
    } as unknown as Element;

    const animation = animateElement(element, [{ opacity: 0 }, { opacity: 1 }]);
    prefersReducedMotion = true;
    if (typeof change === "function") {
      change({ matches: true } as MediaQueryListEvent);
    } else {
      change?.handleEvent({ matches: true } as MediaQueryListEvent);
    }
    await animation.finished;

    expect(
      (element as Element & { style: CSSStyleDeclaration }).style.opacity,
    ).toBe("1");
    expect(cancelCount).toBe(1);
    expect(removedChange).toBe(change);
  });
});
