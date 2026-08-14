import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tableExpandedRowRecipe } from "./Table.recipe";
import TableCell from "./TableCell.generated";
import TableRow from "./TableRow.generated";

export type TableExpandedRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  UIBaseProps & {
    colSpan: number;
    cellClass?: string;
    cellClassName?: string;
    cellDataTheme?: string;
  };

const TableExpandedRow: Layout<
  typeof tableExpandedRowRecipe,
  TableExpandedRowProps
> = () => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "colSpan",
    "cellClass",
    "cellClassName",
    "cellDataTheme",
  ]);

  return (
    <TableRow
      {...{ class: twMerge(CLASSES.expandedRow, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-expanded-row"
      {...rest}
    >
      <TableCell
        colSpan={local.colSpan}
        {...{
          class: twMerge(
            CLASSES.expandedCell,
            local.cellClass,
            local.cellClassName,
          ),
        }}
        dataTheme={local.cellDataTheme ?? local.dataTheme}
      >
        {local.children}
      </TableCell>
    </TableRow>
  );
};

export default TableExpandedRow;
