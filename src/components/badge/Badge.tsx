import { clsx } from "clsx";
import { type JSX, createContext, splitProps, useContext } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./badge.css";

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

  const classes = () =>
    twMerge(
      "badge",
      clsx({
        "badge-xs": (local.size ?? "md") === "xs",
        "badge-sm": (local.size ?? "md") === "sm",
        "badge-md": (local.size ?? "md") === "md",
        "badge-lg": (local.size ?? "md") === "lg",
        "badge-xl": (local.size ?? "md") === "xl",
        "badge-primary": local.color === "primary",
        "badge-secondary": local.color === "secondary",
        "badge-accent": local.color === "accent",
        "badge-neutral": local.color === "neutral",
        "badge-info": local.color === "info",
        "badge-success": local.color === "success",
        "badge-warning": local.color === "warning",
        "badge-error": local.color === "error" || local.color === "danger",
        "badge-ghost": local.color === "ghost",
        "badge-soft": (local.variant ?? "primary") === "soft",
        "badge-outline": (local.variant ?? "primary") === "outline",
        "badge-dash": (local.variant ?? "primary") === "dash",
        "absolute top-0 right-0 translate-x-1/4 -translate-y-1/4":
          (local.placement ?? "top-right") === "top-right",
        "absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4":
          (local.placement ?? "top-right") === "top-left",
        "absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4":
          (local.placement ?? "top-right") === "bottom-right",
        "absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4":
          (local.placement ?? "top-right") === "bottom-left",
      }),
      local.class,
    );

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
