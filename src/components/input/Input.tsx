import { type JSX, splitProps, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type InputBaseProps = {
  size?: ComponentSize;
  color?: ComponentColor;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  rightIcon?: JSX.Element;
  leftIcon?: JSX.Element;
};

export type InputProps = InputBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof InputBaseProps>;

const Input = (props: InputProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "color",
    "dataTheme",
    "class",
    "className",
    "style",
    "leftIcon",
    "rightIcon",
  ]);

  const classes = () =>
    twMerge(
      "input",
      local.class,
      local.className,
      clsx({
        "input-xl": local.size === "xl",
        "input-lg": local.size === "lg",
        "input-md": local.size === "md",
        "input-sm": local.size === "sm",
        "input-xs": local.size === "xs",
        "input-primary": local.color === "primary",
        "input-secondary": local.color === "secondary",
        "input-accent": local.color === "accent",
        "input-ghost": local.color === "ghost",
        "input-info": local.color === "info",
        "input-success": local.color === "success",
        "input-warning": local.color === "warning",
        "input-error": local.color === "error",
      })
    );

  return (
    <label class={classes()} style={local.style} data-theme={local.dataTheme}>
      <Show when={local.leftIcon}>{local.leftIcon}</Show>
      <input {...others} />
      <Show when={local.rightIcon}>{local.rightIcon}</Show>
    </label>
  );
};

export default Input;
