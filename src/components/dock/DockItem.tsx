import type { JSX, Component } from "solid-js";
import { splitProps } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import type { ComponentColor } from "../types";

export type DockItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> &
  IComponentBaseProps & {
    color?: ComponentColor;
    active?: boolean;
  };

const DockItem: Component<DockItemProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "active",
    "class",
    "className",
    "color",
    "dataTheme",
    "disabled",
  ]);

  const classes = twMerge(
    local.class,
    local.className,
    clsx({
      "text-neutral": local.color === "neutral",
      "text-primary": local.color === "primary",
      "text-secondary": local.color === "secondary",
      "text-accent": local.color === "accent",
      "text-info": local.color === "info",
      "text-success": local.color === "success",
      "text-warning": local.color === "warning",
      "text-error": local.color === "error",

      "border-t-2 rounded-none": local.active,

      active: local.active,
      disabled: local.disabled,
    }),
  );

  return (
    <button
      {...others}
      data-theme={local.dataTheme}
      disabled={local.disabled}
      class={classes}
    >
      {local.children}
    </button>
  );
};

export default DockItem;
