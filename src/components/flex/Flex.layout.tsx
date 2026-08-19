import "./Flex.css";
import { Dynamic, type JSX } from "@solidjs/web";
import clsx from "clsx";
import { createMemo, omit, children as resolveChildren } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { ResponsiveProp } from "../types";
import { mapResponsiveProp } from "../utils";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Flex.recipe";

export type FlexProps = UIBaseProps &
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
    paddingInline?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
    paddingBlock?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
    width?: ResponsiveProp<"full">;
    height?: ResponsiveProp<"full">;
    minWidth?: ResponsiveProp<"zero">;
    minHeight?: ResponsiveProp<"zero">;
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
 * px-0 px-2 px-4 px-6 px-8
 * py-0 py-2 py-4 py-6 py-8
 * w-full h-full min-w-0 min-h-0
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
 * sm:px-0 sm:px-2 sm:px-4 sm:px-6 sm:px-8
 * sm:py-0 sm:py-2 sm:py-4 sm:py-6 sm:py-8
 * sm:w-full sm:h-full sm:min-w-0 sm:min-h-0
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
 * md:px-0 md:px-2 md:px-4 md:px-6 md:px-8
 * md:py-0 md:py-2 md:py-4 md:py-6 md:py-8
 * md:w-full md:h-full md:min-w-0 md:min-h-0
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
 * lg:px-0 lg:px-2 lg:px-4 lg:px-6 lg:px-8
 * lg:py-0 lg:py-2 lg:py-4 lg:py-6 lg:py-8
 * lg:w-full lg:h-full lg:min-w-0 lg:min-h-0
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
 * xl:px-0 xl:px-2 xl:px-4 xl:px-6 xl:px-8
 * xl:py-0 xl:py-2 xl:py-4 xl:py-6 xl:py-8
 * xl:w-full xl:h-full xl:min-w-0 xl:min-h-0
 * xl:flex-grow xl:flex-grow-0
 * xl:flex-shrink xl:flex-shrink-0
 * xl:basis-0 xl:basis-8 xl:basis-16 xl:basis-24 xl:basis-32
 */

const Flex: Layout<typeof componentRecipe, FlexProps> = () => {
  const rest = omit(
    props,
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
    "paddingInline",
    "paddingBlock",
    "width",
    "height",
    "minWidth",
    "minHeight",
    "grow",
    "shrink",
    "basis",
  );

  const tag = createMemo(() => props.as || "div");
  const resolvedChildren = resolveChildren(() => props.children);

  const classes = createMemo(() =>
    twMerge(
      clsx(
        CLASSES.base,
        mapResponsiveProp(props.direction, CLASSES.direction),
        mapResponsiveProp(props.justify, CLASSES.justify),
        mapResponsiveProp(props.align, CLASSES.align),
        mapResponsiveProp(props.wrap, CLASSES.wrap),
        mapResponsiveProp(props.gap, CLASSES.gap),
        mapResponsiveProp(props.gapX, CLASSES.gapX),
        mapResponsiveProp(props.gapY, CLASSES.gapY),
        mapResponsiveProp(props.paddingInline, CLASSES.paddingInline),
        mapResponsiveProp(props.paddingBlock, CLASSES.paddingBlock),
        mapResponsiveProp(props.width, CLASSES.width),
        mapResponsiveProp(props.height, CLASSES.height),
        mapResponsiveProp(props.minWidth, CLASSES.minWidth),
        mapResponsiveProp(props.minHeight, CLASSES.minHeight),
        mapResponsiveProp(props.grow, CLASSES.grow),
        mapResponsiveProp(props.shrink, CLASSES.shrink),
        mapResponsiveProp(props.basis, CLASSES.basis),
        props.class,
      ),
    ),
  );

  return (
    <Dynamic
      component={tag()}
      {...{ class: classes() }}
      {...rest}
    >
      {resolvedChildren()}
    </Dynamic>
  );
};

export default Flex;
