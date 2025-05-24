import { type JSX, splitProps, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps, ComponentSize, ComponentShape, ComponentVariant } from "../types";
import { parseCaption } from "./utils";

type ElementType = keyof JSX.IntrinsicElements;

export type AvatarProps<E extends ElementType = "figure"> = {
  src?: string;
  dataSrc?: string;
  alt?: string;
  text?: string;
  size?: ComponentSize;
  shape?: ComponentShape;
  variant?: ComponentVariant;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
} & Omit<JSX.IntrinsicElements[E], "size" | "class" | "className"> &
  IComponentBaseProps;

const VoidElementList: ElementType[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "keygen",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const Avatar = <E extends ElementType = "figure">(props: AvatarProps<E>) => {
  const [local, others] = splitProps(props as AvatarProps, [
    "src",
    "dataSrc",
    "alt",
    "text",
    "size",
    "shape",
    "variant",
    "as",
    "class",
    "className",
    "style",
    "children",
  ]);

  const Tag = local.as || "figure";

  const imageSource = () => local.src || local.dataSrc;
  const showFallback = !imageSource();
  const fallbackText = () => local.text || parseCaption(local.alt);

  const classes = () =>
    twMerge(
      clsx(
        "flex items-center justify-center font-medium overflow-hidden",
        {
          "size-8 text-sm": local.size === "sm",
          "size-16 text-base": local.size === "md",
          "size-24 text-lg": local.size === "lg",
          "rounded-full": local.shape === "circle",
          "rounded-lg": local.shape === "rounded",
          "bg-gray-200 text-gray-800": local.variant === "filled",
          "border-2 border-gray-300 text-gray-800": local.variant === "outlined",
          "text-gray-800": local.variant === "ghost",
        },
        local.class,
        local.className
      )
    );

  if (VoidElementList.includes(Tag as ElementType)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        data-src={local.dataSrc}
        src={imageSource()}
        alt={local.alt}
        class={classes()}
        style={local.style}
      />
    );
  }

  return (
    <Dynamic component={Tag} {...others} class={classes()} style={local.style}>
      <Show when={imageSource()} fallback={<figcaption>{fallbackText()}</figcaption>}>
        <img src={imageSource()} alt={local.alt} data-src={local.dataSrc} class="size-full object-cover" />
      </Show>
      {local.children}
    </Dynamic>
  );
};

export default Avatar;
