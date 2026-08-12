import "./Text.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import { TextLayout } from "./Text.layout";
import { text } from "./Text.recipe";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextVariant =
  | "default"
  | "muted"
  | "success"
  | "warning"
  | "danger";

export type TextRootProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> &
  IComponentBaseProps & {
    size?: TextSize;
    variant?: TextVariant;
    children?: JSX.Element;
  };

const TextRoot = defineComponent({
  recipe: text,
  name: "Text",
  defaults: { size: "base", variant: "default" },
  layout: TextLayout,
}) as unknown as (props: TextRootProps) => JSX.Element;

const Text = Object.assign(TextRoot, {
  Root: TextRoot,
});

export default Text;
export type { TextRootProps as TextProps };
export { Text, TextRoot };
