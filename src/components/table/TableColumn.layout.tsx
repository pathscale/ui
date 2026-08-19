import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import {
  invokeEventHandler,
  type TableColumnChildren,
  type TableColumnRenderProps,
  type TableSortDirection,
  useTableContentContext,
} from "./Table.context";
import { CLASSES, type tableColumnRecipe } from "./Table.recipe";

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
  const rest = omit(
    props,
    "id",
    "allowsSorting",
    "children",
    "class",
    "dataTheme",
    "onClick",
    "onKeyDown",
    "tabindex",
  );

  const isSortable = () => Boolean(props.allowsSorting);

  const sortDirection = (): TableSortDirection | undefined => {
    const descriptor = contentContext.sortDescriptor();
    if (!descriptor || descriptor.column !== props.id) return undefined;
    return descriptor.direction;
  };

  const emitSortChange = () => {
    if (!isSortable() || !contentContext.onSortChange) return;
    contentContext.onSortChange({
      column: props.id,
      direction: sortDirection() === "ascending" ? "descending" : "ascending",
    });
  };

  const handleClick: JSX.EventHandlerUnion<HTMLTableCellElement, MouseEvent> = (
    event,
  ) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented) return;
    emitSortChange();
  };

  const handleKeyDown: JSX.EventHandlerUnion<
    HTMLTableCellElement,
    KeyboardEvent
  > = (event) => {
    invokeEventHandler(props.onKeyDown, event);
    if (event.defaultPrevented) return;
    if (!isSortable()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    emitSortChange();
  };

  const renderedChildren = () => {
    if (typeof props.children === "function") {
      return (props.children as (props: TableColumnRenderProps) => JSX.Element)(
        {
          sortDirection: sortDirection(),
        },
      );
    }
    return props.children;
  };

  return (
    <th
      {...{ class: twMerge(CLASSES.column, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-column"
      data-column-id={props.id}
      data-allows-sorting={isSortable() ? "true" : undefined}
      data-sort-direction={sortDirection()}
      aria-sort={isSortable() ? (sortDirection() ?? "none") : undefined}
      tabindex={isSortable() ? (props.tabindex ?? 0) : props.tabindex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {renderedChildren()}
    </th>
  );
};

export default TableColumn;
