import "./table.css";
import { type Component, type JSX, splitProps, createContext, useContext } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

/* -------------------------------------------------------------------------------------------------
 * Table Context
 * -----------------------------------------------------------------------------------------------*/
type TableVariant = "primary" | "secondary";

const TableContext = createContext<{ variant: TableVariant }>({ variant: "primary" });

export const useTableContext = () => useContext(TableContext);

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
    <TableContext.Provider value={{ get variant() { return variant(); } }}>
      <div
        class={twMerge(
          "table-root",
          `table-root--${variant()}`,
          local.class,
          local.className,
        )}
        data-theme={local.dataTheme}
        data-slot="table"
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
      class={twMerge("table__scroll-container", local.class, local.className)}
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
  IComponentBaseProps;

const TableContent: Component<TableContentProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <table
      class={twMerge("table__content", local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="table-content"
      {...rest}
    >
      {local.children}
    </table>
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
      class={twMerge("table__header", local.class, local.className)}
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
export type TableColumnProps = JSX.ThHTMLAttributes<HTMLTableCellElement> &
  IComponentBaseProps;

const TableColumn: Component<TableColumnProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <th
      class={twMerge("table__column", local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="table-column"
      {...rest}
    >
      {local.children}
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
      class={twMerge("table__body", local.class, local.className)}
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
      class={twMerge("table__row", local.class, local.className)}
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
      class={twMerge("table__cell", local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="table-cell"
      {...rest}
    >
      {local.children}
    </td>
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
      class={twMerge("table__footer", local.class, local.className)}
      data-theme={local.dataTheme}
      data-slot="table-footer"
      {...rest}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export type { TableVariant };

export default Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollContainer: TableScrollContainer,
  Content: TableContent,
  Header: TableHeader,
  Column: TableColumn,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Footer: TableFooter,
});
