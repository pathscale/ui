import { type Component, splitProps, type JSX, createMemo } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { children as resolveChildren } from "solid-js";

export type TableCellProps = JSX.HTMLAttributes<HTMLTableCellElement> &
  IComponentBaseProps & {
    colSpan?: number;
  };

const TableCell: Component<TableCellProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "colSpan",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = createMemo(() => twMerge(clsx(local.class, local.className)));
  const resolvedChildren = resolveChildren(() => local.children);

  return (
    <td
      class={classes()}
      data-theme={local.dataTheme}
      colSpan={local.colSpan}
      {...rest}
    >
      {resolvedChildren()}
    </td>
  );
};

export default TableCell;
