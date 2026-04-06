import "./radio.css";
import { clsx } from "clsx";
import { For, Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { ComponentColor, ComponentSize, IComponentBaseProps } from "../types";

export type RadioGroupOption = {
  value: string;
  label: JSX.Element | string;
  disabled?: boolean;
};

type RadioGroupBaseProps = {
  name: string;
  label?: string;
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: ComponentSize;
  color?: ComponentColor;
  direction?: "horizontal" | "vertical";
  error?: string;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type RadioGroupProps = RadioGroupBaseProps & IComponentBaseProps;

const RadioGroup = (props: RadioGroupProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "name",
    "label",
    "options",
    "value",
    "onChange",
    "size",
    "color",
    "direction",
    "error",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const errorId = `${props.name}-error`;

  const radioClasses = () =>
    twMerge(
      "radio",
      clsx({
        "radio-xl": local.size === "xl",
        "radio-lg": local.size === "lg",
        "radio-md": local.size === "md",
        "radio-sm": local.size === "sm",
        "radio-xs": local.size === "xs",
        "radio-neutral": local.color === "neutral",
        "radio-primary": local.color === "primary",
        "radio-secondary": local.color === "secondary",
        "radio-accent": local.color === "accent",
        "radio-info": local.color === "info",
        "radio-success": local.color === "success",
        "radio-warning": local.color === "warning",
        "radio-error": local.color === "error",
      }),
    );

  const containerClasses = () =>
    twMerge(
      "flex gap-2",
      local.class,
      local.className,
      clsx({
        "flex-row": local.direction === "horizontal",
        "flex-col": local.direction !== "horizontal",
      }),
    );

  return (
    <fieldset
      role="radiogroup"
      aria-orientation={local.direction === "horizontal" ? "horizontal" : "vertical"}
      aria-describedby={local.error ? errorId : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      {...others}
    >
      {local.label && (
        <legend class="mb-1 font-semibold">{local.label}</legend>
      )}
      <div class={containerClasses()}>
        <For each={local.options}>
          {(option) => (
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={local.name}
                value={option.value}
                class={radioClasses()}
                checked={local.value === option.value}
                disabled={option.disabled}
                onChange={() => local.onChange?.(option.value)}
              />
              <span>{option.label}</span>
            </label>
          )}
        </For>
      </div>
      <Show when={local.error}>
        <p id={errorId} role="alert" class="mt-1 text-sm text-error">
          {local.error}
        </p>
      </Show>
    </fieldset>
  );
};

export default RadioGroup;
