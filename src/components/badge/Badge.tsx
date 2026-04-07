import { clsx } from "clsx";
import { type JSX, createContext, splitProps, useContext } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Badge.css";

/* -------------------------------------------------------------------------------------------------
 * Badge Context
 * -----------------------------------------------------------------------------------------------*/
type BadgeContextType = {
  // Reserved for future slot-based styling
};

const BadgeContext = createContext<BadgeContextType>({});

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
type BadgeColor = "default" | "accent" | "success" | "warning" | "danger" | "neutral" | "primary" | "secondary" | "info" | "error" | "ghost";
type BadgeVariant = "primary" | "secondary" | "soft" | "outline" | "dash";
type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";
type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

const BADGE_SIZE_CLASS: Record<BadgeSize, string> = {
  xs: "badge--size-xs",
  sm: "badge--size-sm",
  md: "badge--size-md",
  lg: "badge--size-lg",
  xl: "badge--size-xl",
};

const BADGE_COLOR_CLASS: Record<BadgeColor, string> = {
  default: "badge--color-default",
  accent: "badge--color-accent",
  success: "badge--color-success",
  warning: "badge--color-warning",
  danger: "badge--color-danger",
  neutral: "badge--color-neutral",
  primary: "badge--color-primary",
  secondary: "badge--color-secondary",
  info: "badge--color-info",
  error: "badge--color-error",
  ghost: "badge--color-ghost",
};

const BADGE_VARIANT_CLASS: Record<BadgeVariant, string> = {
  primary: "badge--variant-primary",
  secondary: "badge--variant-secondary",
  soft: "badge--variant-soft",
  outline: "badge--variant-outline",
  dash: "badge--variant-dash",
};

const BADGE_PLACEMENT_CLASS: Record<BadgePlacement, string> = {
  "top-right": "badge--placement-top-right",
  "top-left": "badge--placement-top-left",
  "bottom-right": "badge--placement-bottom-right",
  "bottom-left": "badge--placement-bottom-left",
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
    <BadgeContext.Provider value={{}}>
      <span {...others} class={classes()} data-slot="badge">
        {badgeChildren()}
      </span>
    </BadgeContext.Provider>
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
  useContext(BadgeContext);

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
