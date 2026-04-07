import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Badge.css";

/* -------------------------------------------------------------------------------------------------
 * Badge Anchor
 * -----------------------------------------------------------------------------------------------*/
interface BadgeAnchorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  class?: string;
  children: JSX.Element;
}

const BadgeAnchor = (props: BadgeAnchorProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <span
      {...others}
      class={twMerge("badge-anchor", local.class)}
      data-slot="badge-anchor"
    >
      {local.children}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Badge Root
 * -----------------------------------------------------------------------------------------------*/
type BadgeColor = "default" | "accent" | "success" | "warning" | "danger";
type BadgeVariant = "primary" | "secondary" | "soft";
type BadgeSize = "sm" | "md" | "lg";
type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

const BADGE_SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "badge--sm",
  md: "badge--md",
  lg: "badge--lg",
};

const BADGE_COLOR_CLASS: Record<BadgeColor, string> = {
  default: "badge--default",
  accent: "badge--accent",
  success: "badge--success",
  warning: "badge--warning",
  danger: "badge--danger",
};

const BADGE_VARIANT_CLASS: Record<BadgeVariant, string> = {
  primary: "badge--primary",
  secondary: "badge--secondary",
  soft: "badge--soft",
};

const BADGE_PLACEMENT_CLASS: Record<BadgePlacement, string> = {
  "top-right": "badge--top-right",
  "top-left": "badge--top-left",
  "bottom-right": "badge--bottom-right",
  "bottom-left": "badge--bottom-left",
};

interface BadgeRootProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> {
  class?: string;
  children?: JSX.Element;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  placement?: BadgePlacement;
}

const BadgeRoot = (props: BadgeRootProps) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "color",
    "variant",
    "size",
    "placement",
  ]);

  const classes = () => {
    const size = local.size ?? "md";
    const color = local.color ?? "default";
    const variant = local.variant ?? "primary";
    const placement = local.placement ?? "top-right";

    return twMerge(
      clsx(
        "badge",
        BADGE_SIZE_CLASS[size],
        BADGE_COLOR_CLASS[color],
        BADGE_VARIANT_CLASS[variant],
        BADGE_PLACEMENT_CLASS[placement],
        local.class,
      ),
    );
  };

  const badgeChildren = () => {
    const c = local.children;
    if (typeof c === "string" || typeof c === "number") {
      return <BadgeLabel>{c}</BadgeLabel>;
    }
    return c;
  };

  return (
    <span {...others} class={classes()} data-slot="badge">
      {badgeChildren()}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Badge Label
 * -----------------------------------------------------------------------------------------------*/
interface BadgeLabelProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  class?: string;
}

const BadgeLabel = (props: BadgeLabelProps) => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <span
      class={twMerge("badge__label", local.class)}
      data-slot="badge-label"
      {...others}
    >
      {local.children}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export { BadgeRoot, BadgeLabel, BadgeAnchor };

export type { BadgeRootProps, BadgeLabelProps, BadgeAnchorProps };
