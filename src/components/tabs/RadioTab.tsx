import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ComponentColor } from "../types";

export type RadioTabProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "color"
> & {
  color?: ComponentColor;
  bgColor?: string;
  borderColor?: string;
  active?: boolean;
  disabled?: boolean;
  label: string;
  name: string;
  contentClassName?: string;
  children?: JSX.Element;
  className?: string;
};

const RadioTab = (props: RadioTabProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "color",
    "bgColor",
    "borderColor",
    "active",
    "disabled",
    "label",
    "name",
    "contentClassName",
  ]);

  const classes = () =>
    twMerge(
      "tab",
      local.class,
      local.className,
      clsx({
        [`[--tab-bg:${local.bgColor}]`]: local.bgColor,
        [`[--tab-border-color:${local.borderColor}]`]: local.borderColor,
        "text-neutral": local.color === "neutral",
        "text-primary": local.color === "primary",
        "text-secondary": local.color === "secondary",
        "text-accent": local.color === "accent",
        "text-info": local.color === "info",
        "text-success": local.color === "success",
        "text-warning": local.color === "warning",
        "text-error": local.color === "error",
        "tab-active": local.active,
        "tab-disabled": local.disabled,
      }),
    );

  const contentClasses = () => twMerge("tab-content", local.contentClassName);

  return (
    <>
      <input
        class={classes()}
        role="tab"
        type="radio"
        name={local.name}
        aria-label={local.label}
        disabled={local.disabled}
        {...others}
      />
      <div class={contentClasses()}>{local.children}</div>
    </>
  );
};

export default RadioTab;
