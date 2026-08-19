import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type tableExpandedRowRecipe } from "./Table.recipe";
import TableCell from "./TableCell.generated";
import TableRow from "./TableRow.generated";

export type TableExpandedRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  UIBaseProps & {
    colspan: number;
    cellClass?: string;
    cellClassName?: string;
    cellDataTheme?: string;
  };

const TableExpandedRow: Layout<
  typeof tableExpandedRowRecipe,
  TableExpandedRowProps
> = () => {
  const rest = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "colspan",
    "cellClass",
    "cellClassName",
    "cellDataTheme",
  );

  return (
    <TableRow
      {...{ class: twMerge(CLASSES.expandedRow, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-expanded-row"
      {...rest}
    >
      <TableCell
        colspan={props.colspan}
        {...{
          class: twMerge(
            CLASSES.expandedCell,
            props.cellClass,
            props.cellClassName,
          ),
        }}
        dataTheme={props.cellDataTheme ?? props.dataTheme}
      >
        {props.children}
      </TableCell>
    </TableRow>
  );
};

export default TableExpandedRow;
