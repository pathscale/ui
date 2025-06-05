import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentColor,
  ComponentSize,
  ComponentVariant,
  IComponentBaseProps,
} from "../types";

type BadgeBaseProps = {
  size?: ComponentSize;
  color?: ComponentColor;
  variant?: ComponentVariant;
  responsive?: boolean;
  dataTheme?: string;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  // ARIA attributes
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  role?: "status" | "alert" | "img" | "presentation" | "none";
};

export type BadgeProps = BadgeBaseProps &
  IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, keyof BadgeBaseProps>;

const Badge = (props: BadgeProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "size",
    "color",
    "variant",
    "responsive",
    "dataTheme",
    "class",
    "className",
    "style",
    "aria-label",
    "aria-describedby",
    "aria-labelledby",
    "role",
  ]);

  const classes = () =>
    twMerge(
      "badge",
      local.class,
      local.className,
      clsx({
        "badge-xl": local.size === "xl",
        "badge-lg": local.size === "lg",
        "badge-md": local.size === "md",
        "badge-sm": local.size === "sm",
        "badge-xs": local.size === "xs",
        "badge-soft": local.variant === "soft",
        "badge-dash": local.variant === "dash",
        "badge-outline": local.variant === "outline",
        "badge-neutral": local.color === "neutral",
        "badge-primary": local.color === "primary",
        "badge-secondary": local.color === "secondary",
        "badge-accent": local.color === "accent",
        "badge-ghost": local.color === "ghost",
        "badge-info": local.color === "info",
        "badge-success": local.color === "success",
        "badge-warning": local.color === "warning",
        "badge-error": local.color === "error",
        "badge-xs md:badge-sm lg:badge-md xl:badge-lg": local.responsive,
      })
    );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
      role={local.role || "status"}
      aria-label={local["aria-label"]}
      aria-describedby={local["aria-describedby"]}
      aria-labelledby={local["aria-labelledby"]}
      aria-hidden={
        local.role === "presentation" || local.role === "none"
          ? true
          : undefined
      }
    >
      {props.children}
    </div>
  );
};

export default Badge;
