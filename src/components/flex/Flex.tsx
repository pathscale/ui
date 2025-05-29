import { type JSX, splitProps, children as resolveChildren } from "solid-js";
import { Dynamic } from "solid-js/web";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

type ResponsiveBreakpoints = "base" | "sm" | "md" | "lg" | "xl";
type ResponsiveProp<T> = T | Partial<Record<ResponsiveBreakpoints, T>>;

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

const breakpoints = ["base", "sm", "md", "lg", "xl"] as const;

function mapResponsiveProp<T extends string>(
  prop: ResponsiveProp<T> | undefined,
  map: Record<T, string>
) {
  if (!prop) return [];

  if (typeof prop === "string") return [map[prop]];

  return breakpoints.flatMap((bp) => {
    const value = prop[bp];
    if (!value) return [];
    const className = map[value];
    return bp === "base" ? className : `${bp}:${className}`;
  });
}

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
    local.class
  );

  return (
    <Dynamic component={tag} class={twMerge(classes)} {...rest}>
      {resolvedChildren()}
    </Dynamic>
  );
};

export default Flex;
