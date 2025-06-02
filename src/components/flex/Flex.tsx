import { type JSX, splitProps, children as resolveChildren } from "solid-js";
import { Dynamic } from "solid-js/web";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { ResponsiveProp, mapResponsiveProp } from "../types";

export type FlexProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    as?: keyof JSX.IntrinsicElements;
    direction?: ResponsiveProp<"row" | "col" | "row-reverse" | "col-reverse">;
    justify?: ResponsiveProp<
      "start" | "center" | "end" | "between" | "around" | "evenly"
    >;
    align?: ResponsiveProp<"start" | "center" | "end" | "stretch" | "baseline">;
    wrap?: ResponsiveProp<"wrap" | "nowrap" | "wrap-reverse">;
    gap?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
    gapX?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
    gapY?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
    grow?: ResponsiveProp<boolean>;
    shrink?: ResponsiveProp<boolean>;
    basis?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
  };

const directionMap = {
  row: "flex-row",
  col: "flex-col",
  "row-reverse": "flex-row-reverse",
  "col-reverse": "flex-col-reverse",
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const wrapMap = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
};

const gapMap = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const gapXMap = {
  none: "gap-x-0",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
};

const gapYMap = {
  none: "gap-y-0",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
};

const growMap = {
  true: "flex-grow",
  false: "flex-grow-0",
};

const shrinkMap = {
  true: "flex-shrink",
  false: "flex-shrink-0",
};

const basisMap = {
  none: "basis-0",
  sm: "basis-8",
  md: "basis-16",
  lg: "basis-24",
  xl: "basis-32",
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
    "gapX",
    "gapY",
    "grow",
    "shrink",
    "basis",
  ]);

  const tag = local.as || "div";
  const resolvedChildren = resolveChildren(() => local.children);

  const classes = clsx(
    "flex",
    mapResponsiveProp(local.direction, directionMap),
    mapResponsiveProp(local.justify, justifyMap),
    mapResponsiveProp(local.align, alignMap),
    mapResponsiveProp(local.wrap, wrapMap),
    mapResponsiveProp(local.gap, gapMap),
    mapResponsiveProp(local.gapX, gapXMap),
    mapResponsiveProp(local.gapY, gapYMap),
    mapResponsiveProp(local.grow, growMap),
    mapResponsiveProp(local.shrink, shrinkMap),
    mapResponsiveProp(local.basis, basisMap),
    local.class
  );

  return (
    <Dynamic component={tag} class={twMerge(classes)} {...rest}>
      {resolvedChildren()}
    </Dynamic>
  );
};

export default Flex;
