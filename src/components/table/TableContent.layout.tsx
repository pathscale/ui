import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { TableContentContext, type TableSortDescriptor } from "./Table.context";
import { CLASSES, tableContentRecipe } from "./Table.recipe";

export type TableContentProps = JSX.HTMLAttributes<HTMLTableElement> &
  UIBaseProps & {
    sortDescriptor?: TableSortDescriptor;
    onSortChange?: (descriptor: TableSortDescriptor) => void;
  };

const TableContent: Layout<
  typeof tableContentRecipe,
  TableContentProps
> = () => {
  const rest = omit(props, "children", "class", "dataTheme", "sortDescriptor", "onSortChange");

  return (
    <TableContentContext
      value={{
        sortDescriptor: () => props.sortDescriptor,
        onSortChange: props.onSortChange,
      }}
    >
      <table
        {...{ class: twMerge(CLASSES.content, props.class) }}
        data-theme={props.dataTheme}
        data-slot="table-content"
        data-sort-column={props.sortDescriptor?.column}
        data-sort-direction={props.sortDescriptor?.direction}
        {...rest}
      >
        {props.children}
      </table>
    </TableContentContext>
  );
};

export default TableContent;
