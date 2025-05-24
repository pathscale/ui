import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";

type TextareaBaseProps = {
  color?: ComponentColor;
  size?: ComponentSize;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

export type TextareaProps = TextareaBaseProps &
  IComponentBaseProps &
  Omit<
    JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
    keyof TextareaBaseProps
  >;

const Textarea = (props: TextareaProps): JSX.Element => {
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
      "textarea",
      local.class,
      local.className,
      clsx({
        "textarea-xl": local.size === "xl",
        "textarea-lg": local.size === "lg",
        "textarea-md": local.size === "md",
        "textarea-sm": local.size === "sm",
        "textarea-xs": local.size === "xs",
        "textarea-primary": local.color === "primary",
        "textarea-secondary": local.color === "secondary",
        "textarea-accent": local.color === "accent",
        "textarea-ghost": local.color === "ghost",
        "textarea-info": local.color === "info",
        "textarea-success": local.color === "success",
        "textarea-warning": local.color === "warning",
        "textarea-error": local.color === "error",
      })
    );

  return (
    <textarea
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    />
  );
};

export default Textarea;
