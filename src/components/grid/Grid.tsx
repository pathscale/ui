import { splitProps, type JSX, mergeProps, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import clsx from "clsx";
import { ResponsiveProp } from "../types";

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

function mapResponsiveProp<T extends string>(
  prop: ResponsiveProp<T> | undefined,
  classMap: Record<T, string>
): string[] {
  if (!prop) return [];
  if (typeof prop === "string") {
    return classMap[prop] ? [classMap[prop]] : [];
  }

  return Object.entries(prop).flatMap(([key, val]) => {
    const className = classMap[val as T];
    if (!className) return [];
    return key === "base" ? className : `${key}:${className}`;
  });
}

const Grid = (props: GridProps) => {
  const merged = mergeProps({ as: "div" }, props);
  const [local, rest] = splitProps(merged, [
    "as",
    "class",
    "className",
    "cols",
    "rows",
    "flow",
    "gap",
    "autoCols",
    "autoRows",
  ]);

  const classes = createMemo(() => {
    return twMerge(
      "grid",
      ...mapResponsiveProp(local.cols, colsMap),
      ...mapResponsiveProp(local.rows, rowsMap),
      ...mapResponsiveProp(local.flow, flowMap),
      ...mapResponsiveProp(local.gap, gapMap),
      ...mapResponsiveProp(local.autoCols, autoColsMap),
      ...mapResponsiveProp(local.autoRows, autoRowsMap),
      local.class,
      local.className
    );
  });

  return <Dynamic component={local.as} class={classes()} {...rest} />;
};

export default Grid;
