import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ComponentColor } from "../types";

export type TabProps = Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  "color"
> & {
  color?: ComponentColor;
  bgColor?: string;
  borderColor?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
};

const Tab = (props: TabProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "color",
    "bgColor",
    "borderColor",
    "active",
    "disabled",
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

  return (
    <a
      role="tab"
      class={classes()}
      {...others}
    >
      {local.children}
    </a>
  );
};

export default Tab;
