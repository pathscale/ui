import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Badge.css";
import { CLASSES } from "./Badge.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Badge.recipe";

/* -------------------------------------------------------------------------------------------------
 * Badge Anchor
 * -----------------------------------------------------------------------------------------------*/
interface BadgeAnchorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  class?: string;
  children: JSX.Element;
}

const BadgeAnchor: Layout<typeof componentRecipe, BadgeAnchorProps> = () => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.anchor, local.class) }}
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

interface BadgeRootProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> {
  class?: string;
  children?: JSX.Element;
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: BadgeSize;
  placement?: BadgePlacement;
}

const BadgeRoot: Layout<typeof componentRecipe, BadgeRootProps> = () => {
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
        CLASSES.base,
        CLASSES.size[size],
        CLASSES.color[color],
        CLASSES.variant[variant],
        CLASSES.placement[placement],
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
    <span {...others} {...{ class: classes() }} data-slot="badge">
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

const BadgeLabel: Layout<typeof componentRecipe, BadgeLabelProps> = () => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <span
      {...{ class: twMerge(CLASSES.slot.label, local.class) }}
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
