import { type JSX, splitProps, type Component } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps } from "../types";

export type MaskProps = JSX.ImgHTMLAttributes<HTMLImageElement> &
  IComponentBaseProps & {
    variant?:
      | "squircle"
      | "heart"
      | "hexagon"
      | "hexagon-2"
      | "decagon"
      | "pentagon"
      | "diamond"
      | "square"
      | "circle"
      | "star"
      | "star-2"
      | "triangle"
      | "triangle-2"
      | "triangle-3"
      | "triangle-4"
      | "half-1"
      | "half-2";
    class?: string;
    className?: string;
    style?: JSX.CSSProperties;
  };

// standalone function to compute mask classes
export function maskClassName({
  className,
  variant,
}: Pick<MaskProps, "className" | "variant"> = {}) {
  return twMerge(
    "mask",
    className,
    clsx({
      "mask-squircle": variant === "squircle",
      "mask-heart": variant === "heart",
      "mask-hexagon": variant === "hexagon",
      "mask-hexagon-2": variant === "hexagon-2",
      "mask-decagon": variant === "decagon",
      "mask-pentagon": variant === "pentagon",
      "mask-diamond": variant === "diamond",
      "mask-square": variant === "square",
      "mask-circle": variant === "circle",
      "mask-star": variant === "star",
      "mask-star-2": variant === "star-2",
      "mask-triangle": variant === "triangle",
      "mask-triangle-2": variant === "triangle-2",
      "mask-triangle-3": variant === "triangle-3",
      "mask-triangle-4": variant === "triangle-4",
      "mask-half-1": variant === "half-1",
      "mask-half-2": variant === "half-2",
    }),
  );
}

type MaskComponent = Component<MaskProps> & {
  className: typeof maskClassName;
};

const Mask = ((props: MaskProps) => {
  const [local, others] = splitProps(props, [
    "src",
    "variant",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = () =>
    maskClassName({
      className: local.class ?? local.className,
      variant: local.variant,
    });

  return (
    <img
      {...others}
      src={local.src}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    />
  );
}) as MaskComponent;

// attach the helper for consumers
Mask.className = maskClassName;

export default Mask;
