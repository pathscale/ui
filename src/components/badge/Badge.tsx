import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";
import type { PropsOf } from "solid-layouts";

import "./Badge.css";
import {
  BadgeAnchorLayout,
  BadgeLabelLayout,
  BadgeRootLayout,
} from "./Badge.layout";
import { badge } from "./Badge.recipe";
import defaults from "./Badge.defaults";

export type BadgeColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";
export type BadgeVariant = "primary" | "secondary" | "soft";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgePlacement =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

/**
 * `color` is omitted from the HTML attributes because the recipe declares an
 * axis of that name. Without the omission a caller gets the HTML `color`
 * attribute's type — a bare string — and every variant name typechecks.
 */
export type BadgeRootProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "color"
> &
  PropsOf<typeof badge>;

export type BadgeLabelProps = JSX.HTMLAttributes<HTMLSpanElement>;
export type BadgeAnchorProps = JSX.HTMLAttributes<HTMLSpanElement> & {
  children: JSX.Element;
};

const BadgeRoot = defineComponent({
  recipe: badge,
  name: "Badge",
  defaults: defaults.Badge,
  layout: BadgeRootLayout,
}) as (props: BadgeRootProps) => JSX.Element;

/**
 * The anchor and the label are the same recipe's other slots, so they name
 * which one they are rather than each carrying a recipe of their own. Neither
 * takes presentation props: they inherit the badge's.
 */
const BadgeAnchor = defineComponent({
  recipe: badge,
  name: "BadgeAnchor",
  slot: "anchor",
  layout: BadgeAnchorLayout,
  // Through `unknown` because the anchor's `children` is required, which a
  // `Record<string, unknown>` cannot be assignable to. The requirement is the
  // existing API and worth keeping: an anchor with nothing to anchor to is a
  // mistake the type system can catch.
}) as unknown as (props: BadgeAnchorProps) => JSX.Element;

const BadgeLabel = defineComponent({
  recipe: badge,
  name: "BadgeLabel",
  slot: "label",
  layout: BadgeLabelLayout,
}) as (props: BadgeLabelProps) => JSX.Element;

export { BadgeRoot, BadgeLabel, BadgeAnchor };
