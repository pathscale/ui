import "./Text.css";
import type { JSX } from "@solidjs/web";
import {omit, type Component} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Text.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Text.recipe";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextVariant = "default" | "muted" | "subtle" | "success" | "warning" | "danger";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
export type TextTracking = "normal" | "wide";
export type TextLeading = "normal" | "none";
export type TextFamily = "body" | "heading" | "display" | "mono";

export type TextRootProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> &
  UIBaseProps & {
    size?: TextSize;
    variant?: TextVariant;
    weight?: TextWeight;
    transform?: TextTransform;
    tracking?: TextTracking;
    leading?: TextLeading;
    family?: TextFamily;
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
  );

  const size = () => props.size ?? "base";
  const variant = () => props.variant ?? "default";

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.base, props.class) }}
      data-slot="text"
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
    </span>
  );
};

const Text = Object.assign(TextRoot, {
  Root: TextRoot,
});

export default Text;
export { Text, TextRoot };
export type { TextRootProps as TextProps };
