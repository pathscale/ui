import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";
import { omit } from "solid-js";
import { twMerge } from "../../lib/twMerge";

import "./Badge.css";
import type { Layout } from "../../lib/layouts";
import {
  type Flavor,
  resolveState,
  type State,
  type Variant,
} from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Badge.recipe";

/* -------------------------------------------------------------------------------------------------
 * Badge Anchor
 * -----------------------------------------------------------------------------------------------*/
interface BadgeAnchorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  class?: string;
  children: JSX.Element;
}

const BadgeAnchor: Layout<typeof componentRecipe, BadgeAnchorProps> = () => {
  const others = omit(props, "children", "class");

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.anchor, props.class) }}
      data-slot="badge-anchor"
    >
      {props.children}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Badge Root
 * -----------------------------------------------------------------------------------------------*/
type BadgeSize = "sm" | "md" | "lg";
type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface BadgeRootProps
  extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> {
  class?: string;
  children?: JSX.Element;
  flavor?: Flavor;
  variant?: Extract<Variant, "solid" | "soft" | "outline">;
  state?: State;
  size?: BadgeSize;
  placement?: BadgePlacement;
}

const BadgeRoot: Layout<typeof componentRecipe, BadgeRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "flavor",
    "variant",
    "state",
    "size",
    "placement",
  );

  const classes = () => {
    const size = props.size ?? "md";
    /* Flavor is open, so a name the library does not ship still produces a
       class an app can style, rather than silently rendering unflavoured. */
    const flavor = props.flavor ?? "neutral";
    const flavorClass =
      CLASSES.flavor[flavor as keyof typeof CLASSES.flavor] ??
      `badge--flavor-${flavor}`;
    const variant = props.variant ?? "solid";
    const state = resolveState(props.state);
    const placement = props.placement ?? "top-right";

    return twMerge(
      clsx(
        CLASSES.base,
        CLASSES.size[size],
        flavorClass,
        CLASSES.variant[variant],
        CLASSES.state[state],
        CLASSES.placement[placement],
        props.class,
      ),
    );
  };

  const badgeChildren = () => {
    const c = props.children;
    if (typeof c === "string" || typeof c === "number") {
      return <BadgeLabel>{c}</BadgeLabel>;
    }
    return c;
  };

  return (
    <span
      {...others}
      {...{ class: classes() }}
      data-slot="badge"
    >
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
  const others = omit(props, "children", "class");

  return (
    <span
      {...{ class: twMerge(CLASSES.slot.label, props.class) }}
      data-slot="badge-label"
      {...others}
    >
      {props.children}
    </span>
  );
};

export type { BadgeAnchorProps, BadgeLabelProps, BadgeRootProps };
/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export { BadgeAnchor, BadgeLabel, BadgeRoot };
