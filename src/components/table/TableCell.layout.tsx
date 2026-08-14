import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableCellRecipe } from "./Table.recipe";

export type TableCellProps = JSX.TdHTMLAttributes<HTMLTableCellElement> &
  UIBaseProps;

const TableCell: Layout<typeof tableCellRecipe, TableCellProps> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <td
      {...{ class: twMerge(CLASSES.cell, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-cell"
      {...rest}
    >
      {local.children}
    </td>
  );
};

export default TableCell;
