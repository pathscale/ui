import {
  createMemo,
  For,
  splitProps,
  type JSX,
  type Component,
  type Accessor,
} from "solid-js";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  getFilteredRowModel,
  getPaginationRowModel,
  type OnChangeFn,
} from "@tanstack/solid-table";
import Table, { type TableProps } from "./Table";

export type EnhancedTableProps<TData> = Omit<TableProps, "children"> & {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  sorting?: Accessor<SortingState>;
  setSorting?: OnChangeFn<SortingState>;
  columnFilters?: Accessor<ColumnFiltersState>;
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  pagination?: Accessor<PaginationState>;
  setPagination?: OnChangeFn<PaginationState>;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  renderRowSubComponent?: (props: { row: any }) => JSX.Element;
  renderEmpty?: () => JSX.Element;
};

function EnhancedTable<TData>(props: EnhancedTableProps<TData>): JSX.Element {
  const [local, tableProps] = splitProps(props, [
    "data",
    "columns",
    "sorting",
    "setSorting",
    "columnFilters",
    "setColumnFilters",
    "pagination",
    "setPagination",
    "enableSorting",
    "enableFilters",
    "enablePagination",
    "renderRowSubComponent",
    "renderEmpty",
  ]);

  const table = createSolidTable({
    get data() {
      return local.data;
    },
    get columns() {
      return local.columns;
    },
    state: {
      get sorting() {
        return local.sorting?.() || [];
      },
      get columnFilters() {
        return local.columnFilters?.() || [];
      },
      get pagination() {
        return local.pagination?.() || { pageIndex: 0, pageSize: 10 };
      },
    },
    onSortingChange: local.setSorting,
    onColumnFiltersChange: local.setColumnFilters,
    onPaginationChange: local.setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: local.enableSorting !== false,
    enableFilters: !!local.enableFilters,
    manualPagination: !local.enablePagination,
  });

  const tableRows = createMemo(() => {
    const rows = table.getRowModel().rows;
    if (rows.length === 0 && local.renderEmpty) {
      return [];
    }
    return rows;
  });

  return (
    <Table {...tableProps}>
      <Table.Head>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <For each={headerGroup.headers}>
              {(header) => (
                <Table.HeadCell
                  class={
                    header.column.getCanSort()
                      ? "cursor-pointer select-none"
                      : ""
                  }
                  onClick={
                    header.column.getCanSort()
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                >
                  <div class="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && <span>↑</span>}
                    {header.column.getIsSorted() === "desc" && <span>↓</span>}
                  </div>
                </Table.HeadCell>
              )}
            </For>
          )}
        </For>
      </Table.Head>
      <Table.Body>
        {tableRows().length === 0 && local.renderEmpty ? (
          <Table.Row>
            <Table.Cell
              colSpan={table.getAllColumns().length}
              class="text-center py-4"
            >
              {local.renderEmpty()}
            </Table.Cell>
          </Table.Row>
        ) : (
          <For each={tableRows()}>
            {(row) => (
              <>
                <Table.Row class={row.getIsExpanded() ? "bg-base-200" : ""}>
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <Table.Cell>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Cell>
                    )}
                  </For>
                </Table.Row>
                {row.getIsExpanded() && local.renderRowSubComponent && (
                  <Table.Row>
                    <Table.Cell colSpan={row.getVisibleCells().length}>
                      {local.renderRowSubComponent({ row })}
                    </Table.Cell>
                  </Table.Row>
                )}
              </>
            )}
          </For>
        )}
      </Table.Body>
    </Table>
  );
}

export default EnhancedTable;
