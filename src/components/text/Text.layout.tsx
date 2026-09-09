import "./Text.css";
import { Dynamic, type JSX } from "@solidjs/web";
import {omit, type Component} from "solid-js";

import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Text.recipe";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextVariant = "default" | "muted" | "subtle" | "success" | "warning" | "danger";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
export type TextTracking = "normal" | "wide";
export type TextLeading = "normal" | "none";
export type TextFamily = "body" | "heading" | "display" | "mono";

/**
 * The elements `Text` will render as.
 *
 * Deliberately a closed list rather than `keyof JSX.IntrinsicElements`. The
 * point of the prop is to let a title *be* a heading, and an open list makes
 * that one option among two hundred, most of which are wrong for a run of
 * text. Six heading levels, the three neutral containers, and the two
 * inline emphases that carry meaning of their own.
 */
export type TextAs =
  | "span"
  | "p"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "strong"
  | "em";

export type TextRootProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> &
  UIBaseProps & {
    size?: TextSize;
    variant?: TextVariant;
    weight?: TextWeight;
    transform?: TextTransform;
    tracking?: TextTracking;
    leading?: TextLeading;
    family?: TextFamily;
    /**
     * The element this text is.
     *
     * `span` by default, which is what it has always been and what a run of
     * text inside a sentence should stay. Reach for this whenever the text is
     * structural: `as="h1"` for a page title, `as="h2"` for a section, `as="p"`
     * for a paragraph.
     *
     * `family="heading"` is a *typeface*: it says which face to set the text
     * in, and it has never said anything about the document. Sites read the
     * two as one thing and styled titles that were not headings, so entire
     * pages, landing pages included, had no heading of any role on them and no
     * way for a reader to move between sections. This is the axis that says so.
     */
    as?: TextAs;
    children?: JSX.Element;
  };

const TextRoot: Layout<typeof componentRecipe, TextRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "size",
    "variant",
    "weight",
    "transform",
    "tracking",
    "leading",
    "family",
    "as",
  );

  const size = () => props.size ?? "base";
  const variant = () => props.variant ?? "default";
  const tag = () => props.as ?? "span";

  return (
    <Dynamic
      component={tag()}
      {...others}
      {...slot.root}
      data-size={size()}
      data-variant={variant()}
      data-weight={props.weight}
      data-transform={props.transform}
      data-tracking={props.tracking}
      data-leading={props.leading}
      data-family={props.family}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </Dynamic>
  );
};

const Text = Object.assign(TextRoot, {
  Root: TextRoot,
});

export default Text;
export { Text, TextRoot };
export type { TextRootProps as TextProps };
