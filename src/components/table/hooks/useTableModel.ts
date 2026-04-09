import type { Accessor } from "solid-js";
import {
  createSolidTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingState,
  type Table,
} from "@tanstack/solid-table";
import { asAccessor } from "./helpers";
import type { TableSelectionState } from "./useTableSelection";

export interface UseTableModelOptions<TData> {
  data: Accessor<TData[]> | TData[];
  columns: Accessor<ColumnDef<TData, any>[]> | ColumnDef<TData, any>[];
  sorting?: Accessor<SortingState>;
  setSorting?: OnChangeFn<SortingState>;
  columnFilters?: Accessor<ColumnFiltersState>;
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  pagination?: Accessor<PaginationState>;
  setPagination?: OnChangeFn<PaginationState>;
  globalFilter?: Accessor<string>;
  setGlobalFilter?: OnChangeFn<string>;
  rowSelection?: Accessor<TableSelectionState>;
  setRowSelection?: OnChangeFn<TableSelectionState>;
  expanded?: Accessor<ExpandedState>;
  setExpanded?: OnChangeFn<ExpandedState>;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableExpanding?: boolean;
  getRowCanExpand?: (row: Row<TData>) => boolean;
}

export const useTableModel = <TData,>(
  options: UseTableModelOptions<TData>,
): Table<TData> => {
  const dataAccessor = asAccessor(options.data);
  const columnsAccessor = asAccessor(options.columns);

  return createSolidTable({
    get data() {
      return dataAccessor();
    },
    get columns() {
      return columnsAccessor();
    },
    state: {
      get sorting() {
        return options.sorting?.() ?? [];
      },
      get columnFilters() {
        return options.columnFilters?.() ?? [];
      },
      get pagination() {
        return options.pagination?.() ?? { pageIndex: 0, pageSize: 10 };
      },
      get globalFilter() {
        return options.globalFilter?.() ?? "";
      },
      get rowSelection() {
        return options.rowSelection?.() ?? {};
      },
      get expanded() {
        return options.expanded?.() ?? {};
      },
    },
    onSortingChange: options.setSorting,
    onColumnFiltersChange: options.setColumnFilters,
    onPaginationChange: options.setPagination,
    onGlobalFilterChange: options.setGlobalFilter,
    onRowSelectionChange: options.setRowSelection,
    onExpandedChange: options.setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableSorting: options.enableSorting,
    enableFilters: options.enableFilters,
    manualPagination:
      options.enablePagination === undefined ? false : !options.enablePagination,
    enableRowSelection: options.enableRowSelection,
    enableExpanding: options.enableExpanding,
    getRowCanExpand: options.getRowCanExpand,
  });
};
