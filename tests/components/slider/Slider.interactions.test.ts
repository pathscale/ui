import { describe, expect, it, mock } from "bun:test";
import { createSliderInteractionHandlers } from "../../../src/components/slider/Slider.interactions";

const pointerEvent = (
  type: "down" | "move" | "up" | "cancel",
  clientX: number,
  target: Element,
) =>
  ({
    type,
    pointerId: 7,
    clientX,
    currentTarget: target,
    preventDefault: mock(() => {}),
  }) as unknown as PointerEvent;

const keyboardEvent = (key: string) =>
  ({ key, preventDefault: mock(() => {}) }) as unknown as KeyboardEvent;

const setup = (initialValue = 0, disabled = false) => {
  const changes: number[] = [];
  const commits: number[] = [];
  const dragging: boolean[] = [];
  const focusThumb = mock(() => {});
  const setPointerCapture = mock(() => {});
  const releasePointerCapture = mock(() => {});
  const target = {
    setPointerCapture,
    hasPointerCapture: () => true,
    releasePointerCapture,
  } as unknown as Element;
  const handlers = createSliderInteractionHandlers({
    isDisabled: () => disabled,
    value: () => initialValue,
    focusThumb,
    valueFromPosition: (clientX) => clientX,
    valueFromKey: (key, currentValue) => {
      if (key === "ArrowRight") return currentValue + 1;
      if (key === "ArrowLeft") return currentValue - 1;
      return undefined;
    },
    onChange: (value) => changes.push(value),
    onChangeEnd: (value) => commits.push(value),
    onDraggingChange: (value) => dragging.push(value),
  });

  return {
    handlers,
    target,
    changes,
    commits,
    dragging,
    focusThumb,
    setPointerCapture,
    releasePointerCapture,
  };
};

describe("Slider interactions", () => {
  it("emits continuous drag changes and exactly one final commit", () => {
    const result = setup();

    result.handlers.onPointerDown(pointerEvent("down", 10, result.target));
    result.handlers.onPointerMove(pointerEvent("move", 20, result.target));
    result.handlers.onPointerMove(pointerEvent("move", 20, result.target));
    result.handlers.onPointerUp(pointerEvent("up", 20, result.target));

    expect(result.changes).toEqual([10, 20]);
    expect(result.commits).toEqual([20]);
    expect(result.dragging).toEqual([true, false]);
    expect(result.focusThumb).toHaveBeenCalledTimes(1);
    expect(result.setPointerCapture).toHaveBeenCalledWith(7);
    expect(result.releasePointerCapture).toHaveBeenCalledWith(7);
  });

  it("commits the final calculated value on pointer cancellation", () => {
    const result = setup(5);

    result.handlers.onPointerDown(pointerEvent("down", 12, result.target));
    result.handlers.onPointerMove(pointerEvent("move", 18, result.target));
    result.handlers.onPointerCancel(pointerEvent("cancel", 18, result.target));

    expect(result.changes).toEqual([12, 18]);
    expect(result.commits).toEqual([18]);
    expect(result.releasePointerCapture).toHaveBeenCalledWith(7);
  });

  it("accumulates keyboard changes and commits once on key-up", () => {
    const result = setup(5);

    result.handlers.onKeyDown(keyboardEvent("ArrowRight"));
    result.handlers.onKeyDown(keyboardEvent("ArrowRight"));
    result.handlers.onKeyUp(keyboardEvent("ArrowRight"));

    expect(result.changes).toEqual([6, 7]);
    expect(result.commits).toEqual([7]);
  });

  it("uses blur as a keyboard commit fallback without duplicating key-up", () => {
    const result = setup(5);

    result.handlers.onKeyDown(keyboardEvent("ArrowLeft"));
    result.handlers.onBlur();
    result.handlers.onKeyUp(keyboardEvent("ArrowLeft"));

    expect(result.changes).toEqual([4]);
    expect(result.commits).toEqual([4]);
  });

  it("does not commit unchanged or disabled interactions", () => {
    const unchanged = setup(5);
    unchanged.handlers.onPointerDown(pointerEvent("down", 5, unchanged.target));
    unchanged.handlers.onPointerUp(pointerEvent("up", 5, unchanged.target));

    const disabled = setup(5, true);
    disabled.handlers.onPointerDown(pointerEvent("down", 10, disabled.target));
    disabled.handlers.onPointerUp(pointerEvent("up", 10, disabled.target));
    disabled.handlers.onKeyDown(keyboardEvent("ArrowRight"));
    disabled.handlers.onKeyUp(keyboardEvent("ArrowRight"));

    expect(unchanged.changes).toEqual([]);
    expect(unchanged.commits).toEqual([]);
    expect(disabled.changes).toEqual([]);
    expect(disabled.commits).toEqual([]);
    expect(disabled.setPointerCapture).not.toHaveBeenCalled();
    expect(disabled.focusThumb).not.toHaveBeenCalled();
  });
});
