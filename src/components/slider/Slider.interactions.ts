export type SliderInteractionOptions = {
  isDisabled: () => boolean;
  value: () => number;
  valueFromPosition: (clientX: number) => number;
  valueFromKey: (key: string, currentValue: number) => number | undefined;
  onChange: (value: number) => void;
  onChangeEnd: (value: number) => void;
  onDraggingChange: (dragging: boolean) => void;
};

const sliderKeys = new Set([
  "ArrowRight",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

const releasePointerCapture = (target: EventTarget, pointerId: number) => {
  if (!("releasePointerCapture" in target)) return;

  try {
    if (
      !("hasPointerCapture" in target) ||
      (
        target as Element & { hasPointerCapture: (id: number) => boolean }
      ).hasPointerCapture(pointerId)
    ) {
      (
        target as Element & { releasePointerCapture: (id: number) => void }
      ).releasePointerCapture(pointerId);
    }
  } catch {
    // Pointer capture may already have been released by the host environment.
  }
};

export const createSliderInteractionHandlers = (
  options: SliderInteractionOptions,
) => {
  let pointerId: number | undefined;
  let pointerValue = 0;
  let pointerChanged = false;
  let keyboardActive = false;
  let keyboardValue = 0;
  let keyboardChanged = false;

  const emitPointerValue = (nextValue: number) => {
    if (Object.is(nextValue, pointerValue)) return;
    pointerValue = nextValue;
    pointerChanged = true;
    options.onChange(nextValue);
  };

  const finishPointer = (event: PointerEvent) => {
    if (pointerId === undefined || event.pointerId !== pointerId) return;

    const finalValue = pointerValue;
    const changed = pointerChanged;
    const activePointerId = pointerId;
    pointerId = undefined;
    pointerChanged = false;
    options.onDraggingChange(false);

    const target = event.currentTarget;
    if (target) releasePointerCapture(target, activePointerId);
    if (changed) options.onChangeEnd(finalValue);
  };

  const finishKeyboard = () => {
    if (!keyboardActive) return;

    const finalValue = keyboardValue;
    const changed = keyboardChanged;
    keyboardActive = false;
    keyboardChanged = false;
    if (changed) options.onChangeEnd(finalValue);
  };

  return {
    onPointerDown(event: PointerEvent) {
      if (options.isDisabled() || pointerId !== undefined) return;

      event.preventDefault();
      const target = event.currentTarget as Element & {
        setPointerCapture: (id: number) => void;
      };
      target.setPointerCapture(event.pointerId);
      pointerId = event.pointerId;
      pointerValue = options.value();
      pointerChanged = false;
      options.onDraggingChange(true);
      emitPointerValue(options.valueFromPosition(event.clientX));
    },

    onPointerMove(event: PointerEvent) {
      if (pointerId === undefined || event.pointerId !== pointerId) return;
      emitPointerValue(options.valueFromPosition(event.clientX));
    },

    onPointerUp: finishPointer,
    onPointerCancel: finishPointer,

    onKeyDown(event: KeyboardEvent) {
      if (options.isDisabled()) return;

      const currentValue = keyboardActive ? keyboardValue : options.value();
      const nextValue = options.valueFromKey(event.key, currentValue);
      if (nextValue === undefined) return;

      event.preventDefault();
      if (!keyboardActive) {
        keyboardActive = true;
        keyboardValue = currentValue;
        keyboardChanged = false;
      }
      if (Object.is(nextValue, keyboardValue)) return;

      keyboardValue = nextValue;
      keyboardChanged = true;
      options.onChange(nextValue);
    },

    onKeyUp(event: KeyboardEvent) {
      if (!sliderKeys.has(event.key)) return;
      finishKeyboard();
    },

    onBlur: finishKeyboard,
  };
};
