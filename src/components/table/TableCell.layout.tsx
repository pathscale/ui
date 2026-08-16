import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableCellRecipe } from "./Table.recipe";

export type TableCellProps = JSX.TdHTMLAttributes<HTMLTableCellElement> &
  UIBaseProps;

const TableCell: Layout<typeof tableCellRecipe, TableCellProps> = () => {
  const rest = omit(props, "children", "class", "dataTheme");

  return (
    <td
      {...{ class: twMerge(CLASSES.cell, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-cell"
      {...rest}
    >
      {props.children}
    </td>
  );
};

export default TableCell;
