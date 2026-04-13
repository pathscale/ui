import "./Table.css";
import { type Accessor, type Component, type JSX, splitProps, createContext, useContext } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Table.classes";

/* -------------------------------------------------------------------------------------------------
 * Table Context
 * -----------------------------------------------------------------------------------------------*/
type TableVariant = "primary" | "secondary";
type TableSortDirection = "ascending" | "descending";

type TableSortDescriptor = {
  column: string;
  direction: TableSortDirection;
};

type TableColumnRenderProps = {
  sortDirection: TableSortDirection | undefined;
};

type TableColumnChildren =
  | JSX.Element
  | ((props: TableColumnRenderProps) => JSX.Element);

type TableContextValue = {
  variant: Accessor<TableVariant>;
};

const TableContext = createContext<TableContextValue>();

type TableContentContextValue = {
  sortDescriptor: Accessor<TableSortDescriptor | undefined>;
  onSortChange?: (descriptor: TableSortDescriptor) => void;
};

const TableContentContext = createContext<TableContentContextValue>();

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

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

/* -------------------------------------------------------------------------------------------------
 * Table Root
 * -----------------------------------------------------------------------------------------------*/
export type TableRootProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    variant?: TableVariant;
  };

const TableRoot: Component<TableRootProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "variant",
    "class",
    "className",
    "dataTheme",
  ]);

  const variant = () => local.variant ?? "primary";

  return (
    <TableContext.Provider value={{ variant }}>
      <div
        {...{ class: twMerge(
          CLASSES.root.base,
          CLASSES.root.variant[variant()],
          local.class,
          local.className,
        ) }}
        data-theme={local.dataTheme}
        data-slot="table"
        data-variant={variant()}
        {...rest}
      >
        {local.children}
      </div>
    </TableContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Scroll Container
 * -----------------------------------------------------------------------------------------------*/
export type TableScrollContainerProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const TableScrollContainer: Component<TableScrollContainerProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...{ class: twMerge(CLASSES.scroll, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-scroll-container"
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Content (<table>)
 * -----------------------------------------------------------------------------------------------*/
export type TableContentProps = JSX.HTMLAttributes<HTMLTableElement> &
  IComponentBaseProps & {
    sortDescriptor?: TableSortDescriptor;
    onSortChange?: (descriptor: TableSortDescriptor) => void;
  };

const TableContent: Component<TableContentProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
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
        {...{ class: twMerge(CLASSES.content, local.class, local.className) }}
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

/* -------------------------------------------------------------------------------------------------
 * Table Header (<thead>)
 * -----------------------------------------------------------------------------------------------*/
export type TableHeaderProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  IComponentBaseProps;

const TableHeader: Component<TableHeaderProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <thead
      {...{ class: twMerge(CLASSES.header, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-header"
      {...rest}
    >
      {local.children}
    </thead>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Column (<th>)
 * -----------------------------------------------------------------------------------------------*/
export type TableColumnProps = Omit<JSX.ThHTMLAttributes<HTMLTableCellElement>, "id" | "children"> &
  IComponentBaseProps & {
    id: string;
    allowsSorting?: boolean;
    children?: TableColumnChildren;
  };

const TableColumn: Component<TableColumnProps> = (props) => {
  const contentContext = useTableContentContext();
  const [local, rest] = splitProps(props, [
    "id",
    "allowsSorting",
    "children",
    "class",
    "className",
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

  const handleClick: JSX.EventHandlerUnion<HTMLTableCellElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    emitSortChange();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLTableCellElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;
    if (!isSortable()) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    emitSortChange();
  };

  const renderedChildren = () => {
    if (typeof local.children === "function") {
      return (local.children as (props: TableColumnRenderProps) => JSX.Element)({
        sortDirection: sortDirection(),
      });
    }
    return local.children;
  };

  return (
    <th
      {...{ class: twMerge(CLASSES.column, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-column"
      data-column-id={local.id}
      data-allows-sorting={isSortable() ? "true" : undefined}
      data-sort-direction={sortDirection()}
      aria-sort={isSortable() ? sortDirection() ?? "none" : undefined}
      tabIndex={isSortable() ? (local.tabIndex ?? 0) : local.tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {renderedChildren()}
    </th>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Body (<tbody>)
 * -----------------------------------------------------------------------------------------------*/
export type TableBodyProps = JSX.HTMLAttributes<HTMLTableSectionElement> &
  IComponentBaseProps;

const TableBody: Component<TableBodyProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <tbody
      {...{ class: twMerge(CLASSES.body, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-body"
      {...rest}
    >
      {local.children}
    </tbody>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Row (<tr>)
 * -----------------------------------------------------------------------------------------------*/
export type TableRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  IComponentBaseProps;

const TableRow: Component<TableRowProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <tr
      {...{ class: twMerge(CLASSES.row, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-row"
      {...rest}
    >
      {local.children}
    </tr>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Cell (<td>)
 * -----------------------------------------------------------------------------------------------*/
export type TableCellProps = JSX.TdHTMLAttributes<HTMLTableCellElement> &
  IComponentBaseProps;

const TableCell: Component<TableCellProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <td
      {...{ class: twMerge(CLASSES.cell, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-cell"
      {...rest}
    >
      {local.children}
    </td>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Expanded Row
 * -----------------------------------------------------------------------------------------------*/
export type TableExpandedRowProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  IComponentBaseProps & {
    colSpan: number;
    cellClass?: string;
    cellClassName?: string;
    cellDataTheme?: string;
  };

const TableExpandedRow: Component<TableExpandedRowProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "colSpan",
    "cellClass",
    "cellClassName",
    "cellDataTheme",
  ]);

  return (
    <TableRow
      {...{ class: twMerge(CLASSES.expandedRow, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-expanded-row"
      {...rest}
    >
      <TableCell
        colSpan={local.colSpan}
        {...{ class: twMerge(CLASSES.expandedCell, local.cellClass, local.cellClassName) }}
        dataTheme={local.cellDataTheme ?? local.dataTheme}
      >
        {local.children}
      </TableCell>
    </TableRow>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Footer (div outside <table>)
 * -----------------------------------------------------------------------------------------------*/
export type TableFooterProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const TableFooter: Component<TableFooterProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...{ class: twMerge(CLASSES.footer, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-footer"
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Page Size
 * -----------------------------------------------------------------------------------------------*/
export type TablePageSizeProps = Omit<
  JSX.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> &
  IComponentBaseProps & {
    value: number;
    options: readonly number[];
    onChange: (value: number) => void;
    label?: JSX.Element;
    selectClass?: string;
    selectClassName?: string;
  };

const TablePageSize: Component<TablePageSizeProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "value",
    "options",
    "onChange",
    "label",
    "selectClass",
    "selectClassName",
  ]);

  return (
    <label
      {...{ class: twMerge(CLASSES.pageSize, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-page-size"
    >
      <span {...{ class: CLASSES.pageSizeLabel }} data-slot="table-page-size-label">
        {local.label ?? "Rows"}
      </span>
      <select
        {...rest}
        {...{ class: twMerge(
          CLASSES.pageSizeSelect,
          local.selectClass,
          local.selectClassName,
        ) }}
        value={local.value}
        onChange={(event) => local.onChange(Number(event.currentTarget.value))}
      >
        {local.options.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Resizable Container
 * -----------------------------------------------------------------------------------------------*/
export type TableResizableContainerProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const TableResizableContainer: Component<TableResizableContainerProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...{ class: twMerge(CLASSES.resizableContainer, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-resizable-container"
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Column Resizer
 * -----------------------------------------------------------------------------------------------*/
export type TableColumnResizerProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const TableColumnResizer: Component<TableColumnResizerProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "role",
    "aria-orientation",
  ]);

  return (
    <div
      role={local.role ?? "separator"}
      aria-orientation={local["aria-orientation"] ?? "vertical"}
      {...{ class: twMerge(CLASSES.columnResizer, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-column-resizer"
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Load More Row
 * -----------------------------------------------------------------------------------------------*/
export type TableLoadMoreProps = JSX.HTMLAttributes<HTMLTableRowElement> &
  IComponentBaseProps;

const TableLoadMore: Component<TableLoadMoreProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <tr
      {...{ class: twMerge(CLASSES.loadMore, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-load-more"
      {...rest}
    >
      {local.children}
    </tr>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Table Load More Content
 * -----------------------------------------------------------------------------------------------*/
export type TableLoadMoreContentProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const TableLoadMoreContent: Component<TableLoadMoreContentProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...{ class: twMerge(CLASSES.loadMoreContent, local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-load-more-content"
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export type {
  TableVariant,
  TableSortDirection,
  TableSortDescriptor,
  TableColumnRenderProps,
};

export {
  TableRoot,
  TableScrollContainer,
  TableContent,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableExpandedRow,
  TableFooter,
  TablePageSize,
  TableResizableContainer,
  TableColumnResizer,
  TableLoadMore,
  TableLoadMoreContent,
};

export default Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollContainer: TableScrollContainer,
  Content: TableContent,
  Header: TableHeader,
  Column: TableColumn,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  ExpandedRow: TableExpandedRow,
  Footer: TableFooter,
  PageSize: TablePageSize,
  ResizableContainer: TableResizableContainer,
  ColumnResizer: TableColumnResizer,
  LoadMore: TableLoadMore,
  LoadMoreContent: TableLoadMoreContent,
});
