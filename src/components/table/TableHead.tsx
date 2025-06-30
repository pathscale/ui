import {
  type Component,
  splitProps,
  JSX,
  For,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { type IComponentBaseProps } from "../types";

export type TableHeadProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  IComponentBaseProps & {
    noCell?: boolean;
  };

const TableHead: Component<TableHeadProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "noCell",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = createMemo(() => twMerge(clsx(local.class, local.className)));
  const resolved = resolveChildren(() => local.children);

  return (
    <thead class={classes()} data-theme={local.dataTheme} {...rest}>
      <tr>{resolved()}</tr>
    </thead>
  );
};

export default TableHead;
