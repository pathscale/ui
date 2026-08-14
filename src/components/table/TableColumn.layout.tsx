import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import {
  invokeEventHandler,
  type TableColumnChildren,
  type TableColumnRenderProps,
  type TableSortDirection,
  useTableContentContext,
} from "./Table.context";
import { CLASSES, tableColumnRecipe } from "./Table.recipe";

export type TableColumnProps = Omit<
  JSX.ThHTMLAttributes<HTMLTableCellElement>,
  "id" | "children"
> &
  UIBaseProps & {
    id: string;
    allowsSorting?: boolean;
    children?: TableColumnChildren;
  };

const TableColumn: Layout<typeof tableColumnRecipe, TableColumnProps> = () => {
  const contentContext = useTableContentContext();
  const [local, rest] = splitProps(props, [
    "id",
    "allowsSorting",
    "children",
    "class",
    "dataTheme",
    "onClick",
    "onKeyDown",
    "tabIndex",
  ]);

  const isSortable = () => Boolean(local.allowsSorting);

  const sortDirection = (): TableSortDirection | undefined => {
    const descriptor = contentContext.sortDescriptor();
    if (!descriptor || descriptor.column !== local.id) return undefined;
    return descriptor.direction;
  };

  const emitSortChange = () => {
    if (!isSortable() || !contentContext.onSortChange) return;
    contentContext.onSortChange({
      column: local.id,
      direction: sortDirection() === "ascending" ? "descending" : "ascending",
    });
  };

  const handleClick: JSX.EventHandlerUnion<HTMLTableCellElement, MouseEvent> = (
    event,
  ) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    emitSortChange();
  };

  const handleKeyDown: JSX.EventHandlerUnion<
    HTMLTableCellElement,
    KeyboardEvent
  > = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;
    if (!isSortable()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    emitSortChange();
  };

  const renderedChildren = () => {
    if (typeof local.children === "function") {
      return (local.children as (props: TableColumnRenderProps) => JSX.Element)(
        {
          sortDirection: sortDirection(),
        },
      );
    }
    return local.children;
  };

  return (
    <th
      {...{ class: twMerge(CLASSES.column, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-column"
      data-column-id={local.id}
      data-allows-sorting={isSortable() ? "true" : undefined}
      data-sort-direction={sortDirection()}
      aria-sort={isSortable() ? (sortDirection() ?? "none") : undefined}
      tabIndex={isSortable() ? (local.tabIndex ?? 0) : local.tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {renderedChildren()}
    </th>
  );
};

export default TableColumn;
