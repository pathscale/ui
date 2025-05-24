import { splitProps, createEffect, onMount, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type CheckboxBaseProps = {
  color?: Exclude<ComponentColor, "ghost">;
  size?: ComponentSize;
  indeterminate?: boolean;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type CheckboxProps = CheckboxBaseProps &
  IComponentBaseProps &
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof CheckboxBaseProps>;

const Checkbox = (props: CheckboxProps): JSX.Element => {
  let inputRef: HTMLInputElement | undefined;

  const [local, others] = splitProps(props, [
    "color",
    "size",
    "indeterminate",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "checkbox",
      local.class,
      local.className,
      clsx({
        "checkbox-xl": local.size === "xl",
        "checkbox-lg": local.size === "lg",
        "checkbox-md": local.size === "md",
        "checkbox-sm": local.size === "sm",
        "checkbox-xs": local.size === "xs",
        "checkbox-neutral": local.color === "neutral",
        "checkbox-primary": local.color === "primary",
        "checkbox-secondary": local.color === "secondary",
        "checkbox-accent": local.color === "accent",
        "checkbox-info": local.color === "info",
        "checkbox-success": local.color === "success",
        "checkbox-warning": local.color === "warning",
        "checkbox-error": local.color === "error",
      })
    );

  onMount(() => {
    if (inputRef && local.indeterminate !== undefined) {
      inputRef.indeterminate = local.indeterminate;
    }
  });

  createEffect(() => {
    if (inputRef) {
      inputRef.indeterminate = !!local.indeterminate;
    }
  });

  return (
    <input
      {...others}
      ref={(el) => (inputRef = el)}
      type="checkbox"
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    />
  );
};

export default Checkbox;
