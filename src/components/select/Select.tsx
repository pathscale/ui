import { splitProps, type JSX, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type SelectBaseProps = {
  color?: ComponentColor;
  size?: ComponentSize;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type SelectProps = SelectBaseProps &
  IComponentBaseProps &
  Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, keyof SelectBaseProps>;

const Select: Component<SelectProps> = (props) => {
  const [local, others] = splitProps(props, [
    "color",
    "size",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "select",
      local.class,
      local.className,
      clsx({
        "select-xl": local.size === "xl",
        "select-lg": local.size === "lg",
        "select-md": local.size === "md",
        "select-sm": local.size === "sm",
        "select-xs": local.size === "xs",
        "select-primary": local.color === "primary",
        "select-secondary": local.color === "secondary",
        "select-accent": local.color === "accent",
        "select-ghost": local.color === "ghost",
        "select-info": local.color === "info",
        "select-success": local.color === "success",
        "select-warning": local.color === "warning",
        "select-error": local.color === "error",
      })
    );

  return (
    <select
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {props.children}
    </select>
  );
};

export default Select;
