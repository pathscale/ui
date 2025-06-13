import {
  type JSX,
  splitProps,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps, ComponentColor } from "../types";

export type NavbarRowProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    bordered?: boolean;
    padded?: boolean;
    color?: ComponentColor;
  };

const NavbarRow = (props: NavbarRowProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "bordered",
    "padded",
    "color",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      "flex items-center",
      clsx({
        "border-b border-gray-200": local.bordered === true,
        "px-4 py-2": local.padded !== false,
        "bg-base-100": !local.color || local.color === "ghost", // Default to base-100 (usually light bg, dark text)
        "bg-neutral text-neutral-content": local.color === "neutral",
        "bg-primary text-primary-content": local.color === "primary",
        "bg-secondary text-secondary-content": local.color === "secondary",
        "bg-accent text-accent-content": local.color === "accent",
        "bg-info text-info-content": local.color === "info",
        "bg-success text-success-content": local.color === "success",
        "bg-warning text-warning-content": local.color === "warning",
        "bg-error text-error-content": local.color === "error",
      }),
      local.class,
      local.className
    )
  );

  return (
    <div
      class={classes()}
      style={local.style}
      data-theme={local.dataTheme}
      {...others}
    >
      {resolvedChildren()}
    </div>
  );
};

export default NavbarRow;
