import {
  type Component,
  splitProps,
  type JSX,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type TableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  IComponentBaseProps;

const TableBody: Component<TableBodyProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  const classes = createMemo(() => twMerge(clsx(local.class, local.className)));
  const resolved = resolveChildren(() => local.children);

  return (
    <tbody
      class={classes()}
      data-theme={local.dataTheme}
      {...rest}
    >
      {resolved()}
    </tbody>
  );
};

export default TableBody;
