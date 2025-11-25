import {
  type JSX,
  splitProps,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import type { ResponsiveProp } from "../types";
import { mapResponsiveProp } from "../utils";

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

/* TAILWIND_CLASSES
 * flex
 * flex-row flex-col flex-row-reverse flex-col-reverse
 * justify-start justify-center justify-end justify-between justify-around justify-evenly
 * items-start items-center items-end items-stretch items-baseline
 * flex-wrap flex-nowrap flex-wrap-reverse
 * gap-0 gap-2 gap-4 gap-6 gap-8
 * gap-x-0 gap-x-2 gap-x-4 gap-x-6 gap-x-8
 * gap-y-0 gap-y-2 gap-y-4 gap-y-6 gap-y-8
 * flex-grow flex-grow-0
 * flex-shrink flex-shrink-0
 * basis-0 basis-8 basis-16 basis-24 basis-32
 * sm:flex-row sm:flex-col sm:flex-row-reverse sm:flex-col-reverse
 * sm:justify-start sm:justify-center sm:justify-end sm:justify-between sm:justify-around sm:justify-evenly
 * sm:items-start sm:items-center sm:items-end sm:items-stretch sm:items-baseline
 * sm:flex-wrap sm:flex-nowrap sm:flex-wrap-reverse
 * sm:gap-0 sm:gap-2 sm:gap-4 sm:gap-6 sm:gap-8
 * sm:gap-x-0 sm:gap-x-2 sm:gap-x-4 sm:gap-x-6 sm:gap-x-8
 * sm:gap-y-0 sm:gap-y-2 sm:gap-y-4 sm:gap-y-6 sm:gap-y-8
 * sm:flex-grow sm:flex-grow-0
 * sm:flex-shrink sm:flex-shrink-0
 * sm:basis-0 sm:basis-8 sm:basis-16 sm:basis-24 sm:basis-32
 * md:flex-row md:flex-col md:flex-row-reverse md:flex-col-reverse
 * md:justify-start md:justify-center md:justify-end md:justify-between md:justify-around md:justify-evenly
 * md:items-start md:items-center md:items-end md:items-stretch md:items-baseline
 * md:flex-wrap md:flex-nowrap md:flex-wrap-reverse
 * md:gap-0 md:gap-2 md:gap-4 md:gap-6 md:gap-8
 * md:gap-x-0 md:gap-x-2 md:gap-x-4 md:gap-x-6 md:gap-x-8
 * md:gap-y-0 md:gap-y-2 md:gap-y-4 md:gap-y-6 md:gap-y-8
 * md:flex-grow md:flex-grow-0
 * md:flex-shrink md:flex-shrink-0
 * md:basis-0 md:basis-8 md:basis-16 md:basis-24 md:basis-32
 * lg:flex-row lg:flex-col lg:flex-row-reverse lg:flex-col-reverse
 * lg:justify-start lg:justify-center lg:justify-end lg:justify-between lg:justify-around lg:justify-evenly
 * lg:items-start lg:items-center lg:items-end lg:items-stretch lg:items-baseline
 * lg:flex-wrap lg:flex-nowrap lg:flex-wrap-reverse
 * lg:gap-0 lg:gap-2 lg:gap-4 lg:gap-6 lg:gap-8
 * lg:gap-x-0 lg:gap-x-2 lg:gap-x-4 lg:gap-x-6 lg:gap-x-8
 * lg:gap-y-0 lg:gap-y-2 lg:gap-y-4 lg:gap-y-6 lg:gap-y-8
 * lg:flex-grow lg:flex-grow-0
 * lg:flex-shrink lg:flex-shrink-0
 * lg:basis-0 lg:basis-8 lg:basis-16 lg:basis-24 lg:basis-32
 * xl:flex-row xl:flex-col xl:flex-row-reverse xl:flex-col-reverse
 * xl:justify-start xl:justify-center xl:justify-end xl:justify-between xl:justify-around xl:justify-evenly
 * xl:items-start xl:items-center xl:items-end xl:items-stretch xl:items-baseline
 * xl:flex-wrap xl:flex-nowrap xl:flex-wrap-reverse
 * xl:gap-0 xl:gap-2 xl:gap-4 xl:gap-6 xl:gap-8
 * xl:gap-x-0 xl:gap-x-2 xl:gap-x-4 xl:gap-x-6 xl:gap-x-8
 * xl:gap-y-0 xl:gap-y-2 xl:gap-y-4 xl:gap-y-6 xl:gap-y-8
 * xl:flex-grow xl:flex-grow-0
 * xl:flex-shrink xl:flex-shrink-0
 * xl:basis-0 xl:basis-8 xl:basis-16 xl:basis-24 xl:basis-32
 */

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

const Flex = (props: FlexProps): JSX.Element => {
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

  const tag = createMemo(() => local.as || "div");
  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      clsx(
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
        local.class,
      ),
    ),
  );

  return (
    <Dynamic
      component={tag()}
      class={classes()}
      {...rest}
    >
      {resolvedChildren()}
    </Dynamic>
  );
};

export default Flex;
