import { type Component, splitProps, type JSX } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps, ComponentSize } from "../types";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TableRow from "./TableRow";
import TableFooter from "./TableFooter";
import EnhancedTable from "./EnhancedTable";

export type TableProps = JSX.HTMLAttributes<HTMLTableElement> &
  IComponentBaseProps & {
    size?: ComponentSize;
    zebra?: boolean;
    pinRows?: boolean;
    pinCols?: boolean;
    hover?: boolean;
  };

const Table: Component<TableProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "size",
    "zebra",
    "pinRows",
    "pinCols",
    "hover",
    "dataTheme",
    "class",
  ]);

  const classes = () =>
    twMerge(
      "table",
      local.class,
      clsx({
        "table-zebra": local.zebra,
        "table-hover": local.hover,
        "table-xl": local.size === "xl",
        "table-lg": local.size === "lg",
        "table-md": local.size === "md",
        "table-sm": local.size === "sm",
        "table-xs": local.size === "xs",
        "table-pin-rows": local.pinRows,
        "table-pin-cols": local.pinCols,
      })
    );

  return (
    <table data-theme={local.dataTheme} class={classes()} {...rest}>
      {local.children}
    </table>
  );
};

export default Object.assign(Table, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Footer: TableFooter,
  Enhanced: EnhancedTable,
});
