import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableRowRecipe } from "./Table.recipe";

export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  UIBaseProps;

const TableRow: Layout<typeof tableRowRecipe, TableRowProps> = () => {
  const [local, rest] = splitProps(props, ["children", "class", "dataTheme"]);

  return (
    <tr
      {...{ class: twMerge(CLASSES.row, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-row"
      {...rest}
    >
      {local.children}
    </tr>
  );
};

export default TableRow;
