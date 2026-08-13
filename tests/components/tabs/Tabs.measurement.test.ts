import { describe, expect, it, mock } from "bun:test";
import { observeTabIndicator } from "../../../src/components/tabs/Tabs.measurement";

describe("Tabs indicator measurement", () => {
  it("does not require ResizeObserver", () => {
    const scheduleMeasure = mock(() => {});
    const cleanup = observeTabIndicator([], scheduleMeasure, undefined);

    expect(() => cleanup()).not.toThrow();
    expect(scheduleMeasure).not.toHaveBeenCalled();
  });

  it("observes the list and tabs when ResizeObserver is available", () => {
    const observed: Element[] = [];
    const disconnect = mock(() => {});
    let resize: ResizeObserverCallback | undefined;
    const Observer = class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }

      observe(target: Element) {
        observed.push(target);
      }

      disconnect() {
        disconnect();
      }
    };
    const list = {} as Element;
    const tab = {} as Element;
    const scheduleMeasure = mock(() => {});

    const cleanup = observeTabIndicator([list, tab], scheduleMeasure, Observer);
    resize?.([], {} as ResizeObserver);
    cleanup();

    expect(observed).toEqual([list, tab]);
    expect(scheduleMeasure).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
