import "./range.css";
import { clsx } from "clsx";
import { createUniqueId, Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type SliderFieldBaseProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  color?: ComponentColor;
  size?: ComponentSize;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type SliderFieldProps = SliderFieldBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof SliderFieldBaseProps>;

const SliderField = (props: SliderFieldProps): JSX.Element => {
  const [local, inputRest] = splitProps(props, [
    "label",
    "value",
    "onChange",
    "min",
    "max",
    "step",
    "disabled",
    "formatValue",
    "color",
    "size",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const min = () => local.min ?? 0;
  const max = () => local.max ?? 100;
  const step = () => local.step ?? 1;

  const formattedValue = () =>
    local.formatValue ? local.formatValue(local.value) : String(local.value);

  const rangeClasses = () =>
    twMerge(
      "range",
      clsx({
        "range-xl": local.size === "xl",
        "range-lg": local.size === "lg",
        "range-md": local.size === "md",
        "range-sm": local.size === "sm",
        "range-xs": local.size === "xs",
        "range-neutral": local.color === "neutral",
        "range-primary": local.color === "primary",
        "range-secondary": local.color === "secondary",
        "range-accent": local.color === "accent",
        "range-info": local.color === "info",
        "range-success": local.color === "success",
        "range-warning": local.color === "warning",
        "range-error": local.color === "error",
      }),
    );

  const containerClasses = () =>
    twMerge("flex flex-col gap-1", local.class, local.className);

  const inputId = `range-slider-${createUniqueId()}`;

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (e) => {
    local.onChange(Number(e.currentTarget.value));
  };

  return (
    <div
      data-theme={local.dataTheme}
      class={containerClasses()}
      style={local.style}
    >
      <Show when={local.label}>
        <div class="flex items-center justify-between">
          <label for={inputId} class="text-sm font-medium">
            {local.label}
          </label>
          <span class="text-sm" aria-live="polite">
            {formattedValue()}
          </span>
        </div>
      </Show>
      <input
        {...inputRest}
        id={inputId}
        type="range"
        class={rangeClasses()}
        min={min()}
        max={max()}
        step={step()}
        disabled={local.disabled}
        value={local.value}
        onInput={handleInput}
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={local.value}
        aria-valuetext={formattedValue()}
      />
    </div>
  );
};

export default SliderField;
