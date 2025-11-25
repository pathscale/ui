import {
  type Component,
  splitProps,
  children as resolveChildren,
  type JSX,
  For,
  Show,
  createMemo,
} from "solid-js";
import type { IComponentBaseProps } from "../types";
import TableCell from "./TableCell";
import TableHeadCell from "./TableHeadCell";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export type TableFooterProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  IComponentBaseProps & {
    noCell?: boolean;
  };

const TableFooter: Component<TableFooterProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "noCell",
    "class",
    "className",
    "dataTheme",
  ]);

  const resolved = resolveChildren(() => local.children);
  const classes = createMemo(() => twMerge(clsx(local.class, local.className)));

  return (
    <tfoot
      class={classes()}
      data-theme={local.dataTheme}
      {...rest}
    >
      <Show
        when={local.noCell}
        fallback={<tr>{resolved()}</tr>}
      >
        {resolved()}
      </Show>
    </tfoot>
  );
};

export default TableFooter;
