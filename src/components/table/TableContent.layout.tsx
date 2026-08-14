import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
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
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "sortDescriptor",
    "onSortChange",
  ]);

  return (
    <TableContentContext.Provider
      value={{
        sortDescriptor: () => local.sortDescriptor,
        onSortChange: local.onSortChange,
      }}
    >
      <table
        {...{ class: twMerge(CLASSES.content, local.class) }}
        data-theme={local.dataTheme}
        data-slot="table-content"
        data-sort-column={local.sortDescriptor?.column}
        data-sort-direction={local.sortDescriptor?.direction}
        {...rest}
      >
        {local.children}
      </table>
    </TableContentContext.Provider>
  );
};

export default TableContent;
