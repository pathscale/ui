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
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Slider.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Slider.recipe";
import { createSliderInteractionHandlers } from "./Slider.interactions";

export type SliderSize = "sm" | "md" | "lg";

type SliderBaseProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  size?: SliderSize;
  dataTheme?: string;
  class?: string;
  style?: JSX.CSSProperties;
};

export type SliderProps = SliderBaseProps &
  UIBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof SliderBaseProps>;

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function snapToStep(val: number, min: number, max: number, step: number) {
  const snapped = Math.round((val - min) / step) * step + min;
  return clamp(snapped, min, max);
}

const Slider: Layout<typeof componentRecipe, SliderProps> = () => {
  let trackRef: HTMLDivElement | undefined;

  const [local] = splitProps(props, [
    "label",
    "value",
    "onChange",
    "onChangeEnd",
    "min",
    "max",
    "step",
    "disabled",
    "formatValue",
    "size",
    "dataTheme",
    "class",
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

  const getValueFromKey = (key: string, currentValue: number) => {
    let newVal = currentValue;
    const s = step();
    const bigStep = (max() - min()) / 10;

    switch (key) {
      case "ArrowRight":
      case "ArrowUp":
        newVal = clamp(currentValue + s, min(), max());
        break;
      case "ArrowLeft":
      case "ArrowDown":
        newVal = clamp(currentValue - s, min(), max());
        break;
      case "PageUp":
        newVal = clamp(currentValue + bigStep, min(), max());
        break;
      case "PageDown":
        newVal = clamp(currentValue - bigStep, min(), max());
        break;
      case "Home":
        newVal = min();
        break;
      case "End":
        newVal = max();
        break;
      default:
        return undefined;
    }

    return snapToStep(newVal, min(), max(), s);
  };

  const interactions = createSliderInteractionHandlers({
    isDisabled,
    value: () => local.value,
    valueFromPosition: getValueFromPosition,
    valueFromKey: getValueFromKey,
    onChange: (value) => local.onChange(value),
    onChangeEnd: (value) => local.onChangeEnd?.(value),
    onDraggingChange: setDragging,
  });

  const handleFocus = () => setFocusVisible(true);
  const handleBlur = () => setFocusVisible(false);

  return (
    <div
      {...{ class: twMerge(
        CLASSES.base,
        CLASSES.size[size()],
        local.class,
      ) }}
      data-theme={local.dataTheme}
      data-slot="slider"
      data-disabled={isDisabled() ? "true" : "false"}
      style={local.style}
    >
      <Show when={local.label}>
        <span id={labelId} {...{ class: CLASSES.label }} data-slot="label">
          {local.label}
        </span>
        <span {...{ class: CLASSES.output }} data-slot="slider-output" aria-live="polite">
          {formattedValue()}
        </span>
      </Show>

      <div
        ref={trackRef}
        {...{ class: CLASSES.track }}
        data-slot="slider-track"
        onPointerDown={interactions.onPointerDown}
        onPointerMove={interactions.onPointerMove}
        onPointerUp={interactions.onPointerUp}
        onPointerCancel={interactions.onPointerCancel}
      >
        <div
          {...{ class: CLASSES.fill }}
          data-slot="slider-fill"
          style={{ width: fillWidth() }}
        />
        <div
          {...{ class: CLASSES.thumb }}
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
          onKeyDown={interactions.onKeyDown}
          onKeyUp={interactions.onKeyUp}
          onFocus={handleFocus}
          onBlur={() => {
            interactions.onBlur();
            handleBlur();
          }}
        />
      </div>
    </div>
  );
};

export default Slider;
