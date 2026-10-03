import { afterEach, describe, expect, it } from "bun:test";
import { attachInView } from "../../src/motion/in-view";

let intersectionObserverDescriptor: PropertyDescriptor | undefined;

const setGlobalIntersectionObserver = (value: unknown) => {
  intersectionObserverDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "IntersectionObserver",
  );
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value,
  });
};

const restoreIntersectionObserver = () => {
  if (intersectionObserverDescriptor) {
    Object.defineProperty(
      globalThis,
      "IntersectionObserver",
      intersectionObserverDescriptor,
    );
  } else {
    Reflect.deleteProperty(globalThis, "IntersectionObserver");
  }
  intersectionObserverDescriptor = undefined;
};

afterEach(restoreIntersectionObserver);

describe("attachInView", () => {
  it("starts visible and stays visible when IntersectionObserver is unavailable", () => {
    setGlobalIntersectionObserver(undefined);
    const element = {
      ownerDocument: { defaultView: {} },
    } as unknown as Element;
    let visible: boolean | undefined;

    const cleanup = attachInView(element, {}, (value) => {
      visible = value;
    });

    expect(visible).toBe(true);
    cleanup();
  });

  it("updates visibility and disconnects after the first intersection when once is true", () => {
    let report: IntersectionObserverCallback | undefined;
    let observed: Element | undefined;
    let disconnectCount = 0;
    class Observer {
      constructor(callback: IntersectionObserverCallback) {
        report = callback;
      }

      observe(element: Element) {
        observed = element;
      }

      disconnect() {
        disconnectCount += 1;
      }
    }
    const element = {
      ownerDocument: { defaultView: { IntersectionObserver: Observer } },
    } as unknown as Element;
    let visible = true;

    const cleanup = attachInView(
      element,
      { once: true, threshold: 0.25 },
      (value) => {
        visible = value;
      },
    );

    expect(visible).toBe(true);
    expect(observed).toBe(element);
    report?.(
      [
        {
          target: element,
          isIntersecting: false,
          intersectionRatio: 0,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
    expect(visible).toBe(false);

    report?.(
      [
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 0.25,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
    expect(visible).toBe(true);
    expect(disconnectCount).toBe(1);
    cleanup();
    expect(disconnectCount).toBe(1);
  });
});
