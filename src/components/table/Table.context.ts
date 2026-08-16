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

/*
 * Defaults rather than empty contexts.
 *
 * Solid 2's `useContext` throws on an `undefined` value where 1.9 returned it,
 * so a table part used outside its root would crash instead of rendering
 * plainly. Both readers below already carried these exact fallbacks inline.
 */
export const TableContext = createContext<TableContextValue>({
  variant: () => "primary",
});

export type TableContentContextValue = {
  sortDescriptor: Accessor<TableSortDescriptor | undefined>;
  onSortChange?: (descriptor: TableSortDescriptor) => void;
};

export const TableContentContext = createContext<TableContentContextValue>({
  sortDescriptor: () => undefined,
});

export const useTableContext = (): TableContextValue => useContext(TableContext);

export const useTableContentContext = (): TableContentContextValue =>
  useContext(TableContentContext);

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
