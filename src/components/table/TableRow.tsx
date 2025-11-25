import {
  type Component,
  splitProps,
  children as resolveChildren,
  type JSX,
  createMemo,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  IComponentBaseProps & {
    active?: boolean;
    noCell?: boolean;
  };

const TableRow: Component<TableRowProps> = (props): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "active",
    "noCell",
    "className",
    "dataTheme",
  ]);
  const classes = createMemo(() =>
    twMerge(
      clsx({
        active: local.active,
      }),
      local.className,
      local.class,
    ),
  );

  const resolved = resolveChildren(() => local.children);

  return (
    <tr
      {...rest}
      class={classes()}
      data-theme={local.dataTheme}
    >
      {resolved()}
    </tr>
  );
};

export default TableRow;
