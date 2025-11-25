import { clsx } from "clsx";
import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type ToggleBaseProps = {
  color?: ComponentColor;
  size?: ComponentSize;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  // ARIA attributes
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  "aria-labelledby"?: string;
  "aria-checked"?: boolean;
};

export type ToggleProps = ToggleBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof ToggleBaseProps>;

const Toggle = (props: ToggleProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "color",
    "size",
    "dataTheme",
    "class",
    "className",
    "style",
    "aria-label",
    "aria-describedby",
    "aria-invalid",
    "aria-required",
    "aria-labelledby",
    "aria-checked",
  ]);

  const classes = () =>
    twMerge(
      "toggle",
      local.class,
      local.className,
      clsx({
        "toggle-xl": local.size === "xl",
        "toggle-lg": local.size === "lg",
        "toggle-md": local.size === "md",
        "toggle-sm": local.size === "sm",
        "toggle-xs": local.size === "xs",
        "toggle-neutral": local.color === "neutral",
        "toggle-primary": local.color === "primary",
        "toggle-secondary": local.color === "secondary",
        "toggle-accent": local.color === "accent",
        "toggle-info": local.color === "info",
        "toggle-success": local.color === "success",
        "toggle-warning": local.color === "warning",
        "toggle-error": local.color === "error",
      }),
    );

  return (
    <input
      {...others}
      type="checkbox"
      role="switch"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-invalid={local["aria-invalid"]}
      aria-required={local["aria-required"]}
      aria-labelledby={local["aria-labelledby"]}
      aria-checked={local["aria-checked"]}
    />
  );
};

export default Toggle;
