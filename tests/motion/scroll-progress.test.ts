import { afterEach, describe, expect, it } from "bun:test";
import { attachScrollProgress } from "../../src/motion/scroll-progress";

type FrameCallback = (time: number) => void;

const createFixture = () => {
  let top = 0;
  let height = 1000;
  let viewportHeight = 400;
  let nextFrameId = 1;
  const frameCallbacks = new Map<number, FrameCallback>();
  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  const view = {
    get innerHeight() {
      return viewportHeight;
    },
    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      const entries = listeners.get(type) ?? new Set();
      entries.add(listener);
      listeners.set(type, entries);
    },
    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      listeners.get(type)?.delete(listener);
    },
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = nextFrameId;
      nextFrameId += 1;
      frameCallbacks.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id: number) => frameCallbacks.delete(id),
  } as unknown as Window;

  const styleValues = new Map<string, string>();
  const stylePriorities = new Map<string, string>();
  const sectionStyle = {
    setProperty(property: string, value: string, priority = "") {
      styleValues.set(property, value);
      stylePriorities.set(property, priority);
    },
    getPropertyValue: (property: string) => styleValues.get(property) ?? "",
    getPropertyPriority: (property: string) =>
      stylePriorities.get(property) ?? "",
    removeProperty: (property: string) => {
      const value = styleValues.get(property) ?? "";
      styleValues.delete(property);
      stylePriorities.delete(property);
      return value;
    },
  } as unknown as CSSStyleDeclaration;

  const section = {
    ownerDocument: { defaultView: view },
    style: sectionStyle,
    getBoundingClientRect: () => ({
      top,
      height,
      bottom: top + height,
      left: 0,
      right: 100,
      width: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }),
  } as unknown as Element;

  const fire = (type: string) => {
    const event = new Event(type);
    for (const listener of listeners.get(type) ?? []) {
      if (typeof listener === "function") listener.call(view, event);
      else listener.handleEvent(event);
    }
  };

  const runNextFrame = () => {
    const entry = frameCallbacks.entries().next().value;
    if (!entry) return;
    const [id, callback] = entry;
    frameCallbacks.delete(id);
    callback(0);
  };

  let progress = 0;
  const binding = attachScrollProgress(section, {
    onProgress: (value) => {
      progress = value;
    },
  });

  return {
    get progress() {
      return progress;
    },
    fire,
    frameCount: () => frameCallbacks.size,
    listenerCount: (type: string) => listeners.get(type)?.size ?? 0,
    styleValues,
    runNextFrame,
    setTop: (value: number) => {
      top = value;
    },
    setViewportHeight: (value: number) => {
      viewportHeight = value;
    },
    setSectionHeight: (value: number) => {
      height = value;
    },
    dispose: binding.cleanup,
  };
};

let fixtures: ReturnType<typeof createFixture>[] = [];

afterEach(() => {
  for (const fixture of fixtures) fixture.dispose();
  fixtures = [];
});

describe("attachScrollProgress", () => {
  it("tracks and clamps section progress while updating its CSS variable", () => {
    const fixture = createFixture();
    fixtures.push(fixture);

    expect(fixture.progress).toBe(0);
    expect(fixture.styleValues.get("--scroll-progress")).toBe("0");
    expect(fixture.listenerCount("scroll")).toBe(1);

    fixture.setTop(-300);
    fixture.fire("scroll");
    fixture.fire("scroll");
    expect(fixture.frameCount()).toBe(1);
    expect(fixture.progress).toBe(0);

    fixture.runNextFrame();
    expect(fixture.progress).toBe(0.5);
    expect(fixture.styleValues.get("--scroll-progress")).toBe("0.5");

    fixture.setTop(-900);
    fixture.fire("scroll");
    fixture.runNextFrame();
    expect(fixture.progress).toBe(1);

    fixture.dispose();
    expect(fixture.styleValues.has("--scroll-progress")).toBe(false);
  });

  it("remeasures its range on resize and removes listeners on cleanup", () => {
    const fixture = createFixture();
    fixtures.push(fixture);

    fixture.setViewportHeight(500);
    fixture.setTop(-250);
    fixture.fire("resize");
    expect(fixture.progress).toBe(0.5);

    fixture.dispose();
    expect(fixture.listenerCount("scroll")).toBe(0);
    expect(fixture.listenerCount("resize")).toBe(0);
    expect(fixture.styleValues.has("--scroll-progress")).toBe(false);
  });

  it("keeps zero progress when the section has no vertical travel", () => {
    const fixture = createFixture();
    fixtures.push(fixture);
    fixture.setSectionHeight(400);
    fixture.fire("resize");

    expect(fixture.progress).toBe(0);
  });
});
