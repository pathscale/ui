import "./Text.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextVariant = "default" | "muted" | "success" | "warning" | "danger";

export type TextRootProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> &
  IComponentBaseProps & {
    size?: TextSize;
    variant?: TextVariant;
    children?: JSX.Element;
  };

const TextRoot: Component<TextRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "size",
    "variant",
  ]);

  const size = () => local.size ?? "base";
  const variant = () => local.variant ?? "default";

  return (
    <span
      {...others}
      class={twMerge("text", local.class, local.className)}
      data-slot="text"
      data-size={size()}
      data-variant={variant()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </span>
  );
};

const Text = Object.assign(TextRoot, {
  Root: TextRoot,
});

export default Text;
export { Text, TextRoot };
export type { TextRootProps as TextProps };
