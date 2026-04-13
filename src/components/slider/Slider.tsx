import "./Slider.css";
import {
  Show,
  createSignal,
  createUniqueId,
  splitProps,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Slider.classes";

export type SliderSize = "sm" | "md" | "lg";

type SliderBaseProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  size?: SliderSize;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type SliderProps = SliderBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof SliderBaseProps>;

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function snapToStep(val: number, min: number, max: number, step: number) {
  const snapped = Math.round((val - min) / step) * step + min;
  return clamp(snapped, min, max);
}

const Slider: Component<SliderProps> = (props) => {
  let trackRef: HTMLDivElement | undefined;

  const [local] = splitProps(props, [
    "label",
    "value",
    "onChange",
    "min",
    "max",
    "step",
    "disabled",
    "formatValue",
    "size",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const min = () => local.min ?? 0;
  const max = () => local.max ?? 100;
  const step = () => local.step ?? 1;
  const size = () => local.size ?? "md";
  const isDisabled = () => Boolean(local.disabled);

  const labelId = createUniqueId();
  const [dragging, setDragging] = createSignal(false);
  const [focusVisible, setFocusVisible] = createSignal(false);

  const fraction = () => {
    const range = max() - min();
    if (range <= 0) return 0;
    return (local.value - min()) / range;
  };

  const formattedValue = () =>
    local.formatValue ? local.formatValue(local.value) : String(local.value);

  const thumbLeft = () => {
    const f = fraction();
    return `calc(${f} * 100% + (0.5 - ${f}) * var(--slider-thumb-w) + ${1 - 2 * f} * var(--slider-pad))`;
  };

  const fillWidth = () => {
    const f = fraction();
    return `calc(${f} * 100% + ${1 - f} * var(--slider-thumb-w) + ${2 - 2 * f} * var(--slider-pad))`;
  };

  const getValueFromPosition = (clientX: number) => {
    if (!trackRef) return local.value;
    const rect = trackRef.getBoundingClientRect();
    const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min() + frac * (max() - min());
    return snapToStep(raw, min(), max(), step());
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isDisabled()) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    const val = getValueFromPosition(e.clientX);
    if (val !== local.value) local.onChange(val);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragging()) return;
    const val = getValueFromPosition(e.clientX);
    if (val !== local.value) local.onChange(val);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isDisabled()) return;
    let newVal = local.value;
    const s = step();
    const bigStep = (max() - min()) / 10;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        newVal = clamp(local.value + s, min(), max());
        break;
      case "ArrowLeft":
      case "ArrowDown":
        newVal = clamp(local.value - s, min(), max());
        break;
      case "PageUp":
        newVal = clamp(local.value + bigStep, min(), max());
        break;
      case "PageDown":
        newVal = clamp(local.value - bigStep, min(), max());
        break;
      case "Home":
        newVal = min();
        break;
      case "End":
        newVal = max();
        break;
      default:
        return;
    }

    e.preventDefault();
    if (newVal !== local.value) local.onChange(snapToStep(newVal, min(), max(), s));
  };

  const handleFocus = () => setFocusVisible(true);
  const handleBlur = () => setFocusVisible(false);

  return (
    <div
      class={twMerge(
        CLASSES.base,
        CLASSES.size[size()],
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="slider"
      data-disabled={isDisabled() ? "true" : "false"}
      style={local.style}
    >
      <Show when={local.label}>
        <span id={labelId} class={CLASSES.label} data-slot="label">
          {local.label}
        </span>
        <span class={CLASSES.output} data-slot="slider-output" aria-live="polite">
          {formattedValue()}
        </span>
      </Show>

      <div
        ref={trackRef}
        class={CLASSES.track}
        data-slot="slider-track"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          class={CLASSES.fill}
          data-slot="slider-fill"
          style={{ width: fillWidth() }}
        />
        <div
          class={CLASSES.thumb}
          data-slot="slider-thumb"
          data-dragging={dragging() ? "true" : "false"}
          data-disabled={isDisabled() ? "true" : "false"}
          data-focus-visible={focusVisible() ? "true" : "false"}
          style={{ left: thumbLeft() }}
          role="slider"
          tabIndex={isDisabled() ? -1 : 0}
          aria-valuemin={min()}
          aria-valuemax={max()}
          aria-valuenow={local.value}
          aria-valuetext={formattedValue()}
          aria-labelledby={local.label ? labelId : undefined}
          aria-disabled={isDisabled() ? "true" : undefined}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};

export default Slider;
