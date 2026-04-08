import "./ColorSlider.css";
import { createEffect, createMemo, createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type ColorSliderType = "hue" | "alpha";

export type ColorSliderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> &
  IComponentBaseProps & {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    type?: ColorSliderType;
    isDisabled?: boolean;
  };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeValue = (type: ColorSliderType, value: number) => {
  if (type === "alpha") {
    return clamp(value, 0, 1);
  }

  return clamp(value, 0, 360);
};

const toPercent = (type: ColorSliderType, value: number) => {
  if (type === "alpha") {
    return clamp(value, 0, 1) * 100;
  }

  return (clamp(value, 0, 360) / 360) * 100;
};

const fromPercent = (type: ColorSliderType, percent: number) => {
  const clamped = clamp(percent, 0, 100);
  if (type === "alpha") {
    return clamped / 100;
  }

  return (clamped / 100) * 360;
};

const ColorSlider: Component<ColorSliderProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "value",
    "defaultValue",
    "onChange",
    "type",
    "isDisabled",
    "style",
    "dataTheme",
    "aria-label",
  ]);

  const sliderType = () => local.type ?? "hue";
  const isDisabled = () => Boolean(local.isDisabled);

  const initialValue = () => {
    const fallback = sliderType() === "alpha" ? 1 : 0;
    return normalizeValue(sliderType(), local.value ?? local.defaultValue ?? fallback);
  };

  const [internalValue, setInternalValue] = createSignal(initialValue());
  const [isDragging, setIsDragging] = createSignal(false);
  let sliderRef: HTMLDivElement | undefined;

  const isControlled = () => local.value !== undefined;

  createEffect(() => {
    const nextType = sliderType();
    const nextValue = local.value;

    if (nextValue === undefined) {
      if (!isControlled()) {
        setInternalValue((current) => normalizeValue(nextType, current));
      }
      return;
    }

    setInternalValue(normalizeValue(nextType, nextValue));
  });

  const currentValue = createMemo(() => {
    if (isControlled()) {
      return normalizeValue(sliderType(), local.value ?? internalValue());
    }

    return normalizeValue(sliderType(), internalValue());
  });

  const emitChange = (next: number) => {
    const normalized = normalizeValue(sliderType(), next);
    if (!isControlled()) {
      setInternalValue(normalized);
    }
    local.onChange?.(normalized);
  };

  const updateFromPointer = (clientX: number) => {
    if (!sliderRef || isDisabled()) return;

    const rect = sliderRef.getBoundingClientRect();
    if (rect.width <= 0) return;

    const percent = ((clientX - rect.left) / rect.width) * 100;
    emitChange(fromPercent(sliderType(), percent));
  };

  const handlePointerDown: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (isDisabled()) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event.clientX);
  };

  const handlePointerMove: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent> = (event) => {
    if (!isDragging()) return;
    updateFromPointer(event.clientX);
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

    const key = event.key;
    const isDecrease = key === "ArrowLeft" || key === "ArrowDown";
    const isIncrease = key === "ArrowRight" || key === "ArrowUp";

    if (!isDecrease && !isIncrease) {
      return;
    }

    event.preventDefault();

    const step = sliderType() === "alpha" ? (event.shiftKey ? 0.1 : 0.01) : event.shiftKey ? 10 : 1;
    const direction = isIncrease ? 1 : -1;
    emitChange(currentValue() + direction * step);
  };

  const percent = () => toPercent(sliderType(), currentValue());

  const sliderStyle = (): JSX.CSSProperties => {
    const userStyle = local.style as JSX.CSSProperties | undefined;

    if (sliderType() === "hue") {
      return {
        "--color-slider-track-background":
          "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        "--color-slider-thumb-color": `hsl(${currentValue()} 100% 50%)`,
        ...userStyle,
      };
    }

    return {
      "--color-slider-track-background":
        "linear-gradient(to right, transparent, var(--color-slider-alpha-color, #000000)), repeating-conic-gradient(#cfd3da 0% 25%, #f3f4f6 0% 50%) 50% / 0.5rem 0.5rem",
      "--color-slider-thumb-color": "var(--color-slider-alpha-color, #000000)",
      ...userStyle,
    };
  };

  const valueText = () => {
    if (sliderType() === "alpha") {
      return `Opacity ${Math.round(currentValue() * 100)}%`;
    }

    return `Hue ${Math.round(currentValue())} degrees`;
  };

  return (
    <div
      {...others}
      ref={sliderRef}
      class={twMerge(
        "color-slider",
        sliderType() === "alpha" && "color-slider--alpha",
        isDragging() && "color-slider--dragging",
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="color-slider"
      data-type={sliderType()}
      data-disabled={isDisabled() ? "true" : "false"}
      role="slider"
      tabIndex={isDisabled() ? -1 : 0}
      aria-label={local["aria-label"] ?? (sliderType() === "alpha" ? "Alpha" : "Hue")}
      aria-valuemin={sliderType() === "alpha" ? 0 : 0}
      aria-valuemax={sliderType() === "alpha" ? 1 : 360}
      aria-valuenow={sliderType() === "alpha" ? Number(currentValue().toFixed(2)) : Math.round(currentValue())}
      aria-valuetext={valueText()}
      aria-disabled={isDisabled() ? "true" : "false"}
      style={sliderStyle()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onLostPointerCapture={handleLostPointerCapture}
      onKeyDown={handleKeyDown}
    >
      <div class="color-slider__track" data-slot="color-slider-track" />
      <div
        class="color-slider__thumb"
        data-slot="color-slider-thumb"
        data-dragging={isDragging() ? "true" : "false"}
        style={{
          left: `${percent()}%`,
          "background-color": "var(--color-slider-thumb-color)",
        }}
      />
    </div>
  );
};

export default ColorSlider;
