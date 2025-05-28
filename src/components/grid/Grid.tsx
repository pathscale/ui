import { splitProps, type JSX, mergeProps, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

type GridFlow = "row" | "col" | "row-dense" | "col-dense";
type GridSize =
  | "none"
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
    cols?: GridSize;
    rows?: GridSize;
    flow?: GridFlow;
    gap?: GridGap;
    autoCols?: AutoSize;
    autoRows?: AutoSize;
  };

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
      clsx(
        local.cols && `grid-cols-${local.cols}`,
        local.rows && `grid-rows-${local.rows}`,
        local.flow && `grid-flow-${local.flow}`,
        local.gap &&
          {
            none: "gap-0",
            sm: "gap-2",
            md: "gap-4",
            lg: "gap-6",
            xl: "gap-8",
          }[local.gap],
        local.autoCols && `auto-cols-${local.autoCols}`,
        local.autoRows && `auto-rows-${local.autoRows}`,
        local.class,
        local.className
      )
    );
  });

  return <Dynamic component={local.as} class={classes()} {...rest} />;
};

export default Grid;
