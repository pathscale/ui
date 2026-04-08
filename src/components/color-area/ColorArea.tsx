import "./ColorArea.css";
import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type ColorAreaValue = {
  h: number;
  s: number;
  v: number;
};

export type ColorAreaProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    value?: ColorAreaValue;
    onChange?: (value: ColorAreaValue) => void;
    isDisabled?: boolean;
  };

const DEFAULT_VALUE: ColorAreaValue = {
  h: 0,
  s: 100,
  v: 100,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeValue = (value: ColorAreaValue): ColorAreaValue => ({
  h: ((value.h % 360) + 360) % 360,
  s: clamp(value.s, 0, 100),
  v: clamp(value.v, 0, 100),
});

const hsvToRgb = (h: number, s: number, v: number) => {
  const saturation = clamp(s, 0, 100) / 100;
  const brightness = clamp(v, 0, 100) / 100;
  const hue = ((h % 360) + 360) % 360;

  const chroma = brightness * saturation;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const match = brightness - chroma;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (huePrime >= 0 && huePrime < 1) {
    rPrime = chroma;
    gPrime = x;
  } else if (huePrime < 2) {
    rPrime = x;
    gPrime = chroma;
  } else if (huePrime < 3) {
    gPrime = chroma;
    bPrime = x;
  } else if (huePrime < 4) {
    gPrime = x;
    bPrime = chroma;
  } else if (huePrime < 5) {
    rPrime = x;
    bPrime = chroma;
  } else {
    rPrime = chroma;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + match) * 255),
    g: Math.round((gPrime + match) * 255),
    b: Math.round((bPrime + match) * 255),
  };
};

const ColorArea: Component<ColorAreaProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "value",
    "onChange",
    "isDisabled",
    "dataTheme",
    "style",
    "aria-label",
  ]);

  const [internalValue, setInternalValue] = createSignal<ColorAreaValue>(DEFAULT_VALUE);
  const [isDragging, setIsDragging] = createSignal(false);
  let areaRef: HTMLDivElement | undefined;

  const isControlled = () => local.value !== undefined;
  const currentValue = () => normalizeValue(local.value ?? internalValue());
  const isDisabled = () => Boolean(local.isDisabled);

  const emitChange = (next: ColorAreaValue) => {
    const normalized = normalizeValue(next);
    if (!isControlled()) {
      setInternalValue(normalized);
    }
    local.onChange?.(normalized);
  };

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!areaRef || isDisabled()) return;

    const rect = areaRef.getBoundingClientRect();
    const saturation = ((clientX - rect.left) / rect.width) * 100;
    const vertical = ((clientY - rect.top) / rect.height) * 100;
    const brightness = 100 - vertical;

    emitChange({
      h: currentValue().h,
      s: saturation,
      v: brightness,
    });
  };

  const handlePointerDown: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (isDisabled()) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (!isDragging()) return;
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerUp: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleLostPointerCapture: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = () => {
    setIsDragging(false);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    if (isDisabled()) return;

    const step = event.shiftKey ? 10 : 1;
    const value = currentValue();

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      emitChange({ ...value, s: value.s - step });
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      emitChange({ ...value, s: value.s + step });
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      emitChange({ ...value, v: value.v + step });
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      emitChange({ ...value, v: value.v - step });
    }
  };

  const style = (): JSX.CSSProperties => {
    const color = currentValue();
    const thumb = hsvToRgb(color.h, color.s, color.v);
    const userStyle = local.style as JSX.CSSProperties | undefined;

    return {
      "--color-area-background": `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${color.h} 100% 50%))`,
      "--color-area-thumb-color": `rgb(${thumb.r} ${thumb.g} ${thumb.b})`,
      ...userStyle,
    };
  };

  return (
    <div
      {...others}
      ref={areaRef}
      class={twMerge("color-area", local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="color-area"
      data-disabled={isDisabled() ? "true" : "false"}
      tabIndex={isDisabled() ? -1 : 0}
      role="slider"
      aria-label={local["aria-label"] ?? "Color area"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(currentValue().s)}
      aria-valuetext={`Saturation ${Math.round(currentValue().s)}%, Brightness ${Math.round(currentValue().v)}%`}
      aria-disabled={isDisabled() ? "true" : "false"}
      style={style()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onLostPointerCapture={handleLostPointerCapture}
      onKeyDown={handleKeyDown}
    >
      <div
        class="color-area__thumb"
        data-slot="color-area-thumb"
        data-dragging={isDragging() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        style={{
          left: `${currentValue().s}%`,
          top: `${100 - currentValue().v}%`,
          "background-color": "var(--color-area-thumb-color)",
        }}
      />
    </div>
  );
};

export default ColorArea;
