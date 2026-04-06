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
    const color = local.color ?? "default";
    const variant = local.variant ?? "primary";
    const size = local.size ?? "md";
    const placement = local.placement ?? "top-right";

    return twMerge(clsx(
      "badge",
      `badge--${size}`,
      `badge--${color}`,
      `badge--${variant}`,
      `badge--${placement}`,
    ), local.class);
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
