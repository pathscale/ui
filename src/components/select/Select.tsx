import { splitProps, type JSX, type Component, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { mergeProps } from "solid-js";

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
  placeholder?: string;
  value?: string | string[] | number;
};

export type SelectProps = SelectBaseProps &
  IComponentBaseProps &
  Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, keyof SelectBaseProps>;

const Select: Component<SelectProps> = (props) => {
  const merged = mergeProps(
    { value: "", placeholder: "Please, select an option" },
    props,
  );
  const [local, others] = splitProps(merged, [
    "color",
    "size",
    "dataTheme",
    "class",
    "className",
    "style",
    "placeholder",
    "value",
    "children",
  ]);

  const classes = createMemo(() =>
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
      }),
    ),
  );

  const hasValue = createMemo(
    () => local.value !== undefined && local.value !== "",
  );

  return (
    <select
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
      value={local.value}
    >
      <option
        value=""
        disabled
        hidden
        selected={!hasValue()}
      >
        {local.placeholder}
      </option>
      {local.children}
    </select>
  );
};

export default Select;
