import { type JSX, splitProps, children as resolveChildren } from "solid-js";
import { Dynamic } from "solid-js/web";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type FlexProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLElement> & {
    as?: keyof JSX.IntrinsicElements;
    direction?: "row" | "col" | "row-reverse" | "col-reverse";
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    wrap?: "wrap" | "nowrap" | "wrap-reverse";
    gap?: "none" | "sm" | "md" | "lg" | "xl";
    class?: string;
  };

const gapMap = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const Flex = (props: FlexProps) => {
  const [local, rest] = splitProps(props, [
    "as",
    "class",
    "children",
    "direction",
    "justify",
    "align",
    "wrap",
    "gap",
  ]);

  const tag = local.as || "div";
  const resolvedChildren = resolveChildren(() => local.children);

  return (
    <Dynamic
      component={tag}
      class={twMerge(
        clsx(
          "flex",
          local.direction && `flex-${local.direction}`,
          local.justify && `justify-${local.justify}`,
          local.align && `items-${local.align}`,
          local.wrap && `flex-${local.wrap}`,
          local.gap && gapMap[local.gap],
          local.class
        )
      )}
      {...rest}
    >
      {resolvedChildren()}
    </Dynamic>
  );
};

export default Flex;
