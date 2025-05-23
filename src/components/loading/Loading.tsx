import { type Component, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import {
  type IComponentBaseProps,
  type ComponentColor,
  type ComponentSize,
} from "../types";

export type LoadingProps = {
  size?: ComponentSize;
  color?: ComponentColor;
  variant?: "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
} & IComponentBaseProps &
  JSX.HTMLAttributes<HTMLSpanElement>;

const Loading: Component<LoadingProps> = (props) => {
  const [local, others] = splitProps(props, [
    "size",
    "variant",
    "color",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "loading",
      local.class,
      local.className,
      clsx({
        "loading-xl": local.size === "xl",
        "loading-lg": local.size === "lg",
        "loading-md": local.size === "md",
        "loading-sm": local.size === "sm",
        "loading-xs": local.size === "xs",
        "loading-spinner": local.variant === "spinner",
        "loading-dots": local.variant === "dots",
        "loading-ring": local.variant === "ring",
        "loading-ball": local.variant === "ball",
        "loading-bars": local.variant === "bars",
        "loading-infinity": local.variant === "infinity",
        "text-primary": local.color === "primary",
        "text-secondary": local.color === "secondary",
        "text-accent": local.color === "accent",
        "text-info": local.color === "info",
        "text-success": local.color === "success",
        "text-warning": local.color === "warning",
        "text-error": local.color === "error",
        "text-ghost": local.color === "ghost",
      })
    );

  return (
    <span
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    />
  );
};

export default Loading;
