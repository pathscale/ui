import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Badge.css";
import { CLASSES } from "./Badge.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Badge.recipe";
import { resolveState, type Flavor, type State, type Variant } from "../vocabulary";

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
type BadgeSize = "sm" | "md" | "lg";
type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface BadgeRootProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> {
  class?: string;
  children?: JSX.Element;
  flavor?: Flavor;
  variant?: Extract<Variant, "solid" | "soft" | "outline">;
  state?: State;
  size?: BadgeSize;
  placement?: BadgePlacement;
}

const BadgeRoot: Layout<typeof componentRecipe, BadgeRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "flavor",
    "variant",
    "state",
    "size",
    "placement",
  ]);

  const classes = () => {
    const size = local.size ?? "md";
    /* Flavor is open, so a name the library does not ship still produces a
       class an app can style, rather than silently rendering unflavoured. */
    const flavor = local.flavor ?? "neutral";
    const flavorClass =
      CLASSES.flavor[flavor as keyof typeof CLASSES.flavor] ?? `badge--flavor-${flavor}`;
    const variant = local.variant ?? "solid";
    const state = resolveState(local.state);
    const placement = local.placement ?? "top-right";

    return twMerge(
      clsx(
        CLASSES.base,
        CLASSES.size[size],
        flavorClass,
        CLASSES.variant[variant],
        CLASSES.state[state],
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
