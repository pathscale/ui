import {type Accessor, createContext, useContext} from "solid-js";
import type { JSX } from "@solidjs/web";

export type TableVariant = "primary" | "secondary";
export type TableSortDirection = "ascending" | "descending";

export type TableSortDescriptor = {
  column: string;
  direction: TableSortDirection;
};

export type TableColumnRenderProps = {
  sortDirection: TableSortDirection | undefined;
};

export type TableColumnChildren =
  | JSX.Element
  | ((props: TableColumnRenderProps) => JSX.Element);

export type TableContextValue = {
  variant: Accessor<TableVariant>;
};

export const TableContext = createContext<TableContextValue>();

export type TableContentContextValue = {
  sortDescriptor: Accessor<TableSortDescriptor | undefined>;
  onSortChange?: (descriptor: TableSortDescriptor) => void;
};

export const TableContentContext = createContext<TableContentContextValue>();

export const useTableContext = (): TableContextValue => {
  const context = useContext(TableContext);
  if (context) {
    return context;
  }
  return {
    variant: () => "primary",
  };
};

export const useTableContentContext = (): TableContentContextValue => {
  const context = useContext(TableContentContext);
  if (context) {
    return context;
  }
  return {
    sortDescriptor: () => undefined,
  };
};

/* A JSX event prop is either the handler or a `[handler, data]` pair; Solid
   accepts both and a Layout that wraps one has to unwrap it by hand. */
export const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};
