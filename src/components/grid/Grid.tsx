import {
  splitProps,
  type JSX,
  mergeProps,
  children as resolveChildren,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import clsx from "clsx";
import type { ResponsiveProp } from "../types";
import { mapResponsiveProp } from "../utils";

type GridFlow = "row" | "col" | "row-dense" | "col-dense";
type GridSize =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12";
type GridGap = "none" | "sm" | "md" | "lg" | "xl";
type AutoSize = "min" | "max" | "fr";

export type GridProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    as?: keyof JSX.IntrinsicElements;
    cols?: ResponsiveProp<GridSize>;
    rows?: ResponsiveProp<GridSize>;
    flow?: ResponsiveProp<GridFlow>;
    gap?: ResponsiveProp<GridGap>;
    autoCols?: ResponsiveProp<AutoSize>;
    autoRows?: ResponsiveProp<AutoSize>;
  };

/* TAILWIND_CLASSES
 * grid
 * grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5 grid-cols-6
 * grid-cols-7 grid-cols-8 grid-cols-9 grid-cols-10 grid-cols-11 grid-cols-12
 * grid-rows-1 grid-rows-2 grid-rows-3 grid-rows-4 grid-rows-5 grid-rows-6
 * grid-rows-7 grid-rows-8 grid-rows-9 grid-rows-10 grid-rows-11 grid-rows-12
 * grid-flow-row grid-flow-col grid-flow-row-dense grid-flow-col-dense
 * gap-0 gap-2 gap-4 gap-6 gap-8
 * auto-cols-min auto-cols-max auto-cols-fr
 * auto-rows-min auto-rows-max auto-rows-fr
 * sm:grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 sm:grid-cols-4 sm:grid-cols-5 sm:grid-cols-6
 * sm:grid-cols-7 sm:grid-cols-8 sm:grid-cols-9 sm:grid-cols-10 sm:grid-cols-11 sm:grid-cols-12
 * sm:grid-rows-1 sm:grid-rows-2 sm:grid-rows-3 sm:grid-rows-4 sm:grid-rows-5 sm:grid-rows-6
 * sm:grid-rows-7 sm:grid-rows-8 sm:grid-rows-9 sm:grid-rows-10 sm:grid-rows-11 sm:grid-rows-12
 * sm:grid-flow-row sm:grid-flow-col sm:grid-flow-row-dense sm:grid-flow-col-dense
 * sm:gap-0 sm:gap-2 sm:gap-4 sm:gap-6 sm:gap-8
 * sm:auto-cols-min sm:auto-cols-max sm:auto-cols-fr
 * sm:auto-rows-min sm:auto-rows-max sm:auto-rows-fr
 * md:grid-cols-1 md:grid-cols-2 md:grid-cols-3 md:grid-cols-4 md:grid-cols-5 md:grid-cols-6
 * md:grid-cols-7 md:grid-cols-8 md:grid-cols-9 md:grid-cols-10 md:grid-cols-11 md:grid-cols-12
 * md:grid-rows-1 md:grid-rows-2 md:grid-rows-3 md:grid-rows-4 md:grid-rows-5 md:grid-rows-6
 * md:grid-rows-7 md:grid-rows-8 md:grid-rows-9 md:grid-rows-10 md:grid-rows-11 md:grid-rows-12
 * md:grid-flow-row md:grid-flow-col md:grid-flow-row-dense md:grid-flow-col-dense
 * md:gap-0 md:gap-2 md:gap-4 md:gap-6 md:gap-8
 * md:auto-cols-min md:auto-cols-max md:auto-cols-fr
 * md:auto-rows-min md:auto-rows-max md:auto-rows-fr
 * lg:grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 lg:grid-cols-5 lg:grid-cols-6
 * lg:grid-cols-7 lg:grid-cols-8 lg:grid-cols-9 lg:grid-cols-10 lg:grid-cols-11 lg:grid-cols-12
 * lg:grid-rows-1 lg:grid-rows-2 lg:grid-rows-3 lg:grid-rows-4 lg:grid-rows-5 lg:grid-rows-6
 * lg:grid-rows-7 lg:grid-rows-8 lg:grid-rows-9 lg:grid-rows-10 lg:grid-rows-11 lg:grid-rows-12
 * lg:grid-flow-row lg:grid-flow-col lg:grid-flow-row-dense lg:grid-flow-col-dense
 * lg:gap-0 lg:gap-2 lg:gap-4 lg:gap-6 lg:gap-8
 * lg:auto-cols-min lg:auto-cols-max lg:auto-cols-fr
 * lg:auto-rows-min lg:auto-rows-max lg:auto-rows-fr
 * xl:grid-cols-1 xl:grid-cols-2 xl:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5 xl:grid-cols-6
 * xl:grid-cols-7 xl:grid-cols-8 xl:grid-cols-9 xl:grid-cols-10 xl:grid-cols-11 xl:grid-cols-12
 * xl:grid-rows-1 xl:grid-rows-2 xl:grid-rows-3 xl:grid-rows-4 xl:grid-rows-5 xl:grid-rows-6
 * xl:grid-rows-7 xl:grid-rows-8 xl:grid-rows-9 xl:grid-rows-10 xl:grid-rows-11 xl:grid-rows-12
 * xl:grid-flow-row xl:grid-flow-col xl:grid-flow-row-dense xl:grid-flow-col-dense
 * xl:gap-0 xl:gap-2 xl:gap-4 xl:gap-6 xl:gap-8
 * xl:auto-cols-min xl:auto-cols-max xl:auto-cols-fr
 * xl:auto-rows-min xl:auto-rows-max xl:auto-rows-fr
 */

const colsMap = {
  "1": "grid-cols-1",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
  "5": "grid-cols-5",
  "6": "grid-cols-6",
  "7": "grid-cols-7",
  "8": "grid-cols-8",
  "9": "grid-cols-9",
  "10": "grid-cols-10",
  "11": "grid-cols-11",
  "12": "grid-cols-12",
} as const;

const rowsMap = {
  "1": "grid-rows-1",
  "2": "grid-rows-2",
  "3": "grid-rows-3",
  "4": "grid-rows-4",
  "5": "grid-rows-5",
  "6": "grid-rows-6",
  "7": "grid-rows-7",
  "8": "grid-rows-8",
  "9": "grid-rows-9",
  "10": "grid-rows-10",
  "11": "grid-rows-11",
  "12": "grid-rows-12",
} as const;

const flowMap = {
  row: "grid-flow-row",
  col: "grid-flow-col",
  "row-dense": "grid-flow-row-dense",
  "col-dense": "grid-flow-col-dense",
} as const;

const gapMap = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

const autoColsMap = {
  min: "auto-cols-min",
  max: "auto-cols-max",
  fr: "auto-cols-fr",
} as const;

const autoRowsMap = {
  min: "auto-rows-min",
  max: "auto-rows-max",
  fr: "auto-rows-fr",
} as const;

const Grid = (props: GridProps) => {
  const merged = mergeProps({ as: "div" }, props);
  const [local, rest] = splitProps(merged, [
    "as",
    "class",
    "className",
    "children",
    "cols",
    "rows",
    "flow",
    "gap",
    "autoCols",
    "autoRows",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = clsx(
    "grid",
    mapResponsiveProp(local.cols, colsMap),
    mapResponsiveProp(local.rows, rowsMap),
    mapResponsiveProp(local.flow, flowMap),
    mapResponsiveProp(local.gap, gapMap),
    mapResponsiveProp(local.autoCols, autoColsMap),
    mapResponsiveProp(local.autoRows, autoRowsMap),
    local.class,
    local.className,
  );

  return (
    <Dynamic
      component={local.as}
      class={twMerge(classes)}
      {...rest}
    >
      {resolvedChildren()}
    </Dynamic>
  );
};

export default Grid;
