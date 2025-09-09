import {
  createMemo,
  For,
  Show,
  splitProps,
  type Accessor,
  type JSX,
} from "solid-js";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type OnChangeFn,
} from "@tanstack/solid-table";
import Table, { type TableProps } from "./Table";
import Button from "../button/Button";
import Input from "../input/Input";
import Select from "../select/Select";
import Loading from "../loading/Loading";

export type EnhancedTableProps<TData> = Omit<TableProps, "children"> & {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  sorting?: Accessor<SortingState>;
  setSorting?: OnChangeFn<SortingState>;
  columnFilters?: Accessor<ColumnFiltersState>;
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  pagination?: Accessor<PaginationState>;
  setPagination?: OnChangeFn<PaginationState>;
  globalFilter?: Accessor<string>;
  setGlobalFilter?: OnChangeFn<string>;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  renderRowSubComponent?: (props: { row: any }) => JSX.Element;
  renderEmpty?: () => JSX.Element;
  loading?: boolean;
  renderLoading?: () => JSX.Element;
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
    "globalFilter",
    "setGlobalFilter",
    "enableSorting",
    "enableFilters",
    "enablePagination",
    "renderRowSubComponent",
    "renderEmpty",
    "loading",
    "renderLoading",
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
      get globalFilter() {
        return local.globalFilter?.() || "";
      },
    },
    onSortingChange: local.setSorting,
    onColumnFiltersChange: local.setColumnFilters,
    onPaginationChange: local.setPagination,
    onGlobalFilterChange: local.setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: local.enableSorting !== false,
    enableFilters: !!local.enableFilters,
    manualPagination: !local.enablePagination,
  });

  const tableRows = createMemo(() => {
    if (local.loading) return [];
    const rows = table.getRowModel().rows;
    if (rows.length === 0 && local.renderEmpty) return [];
    return rows;
  });

  const headerGroups = () => table.getHeaderGroups();
  const leafHeaders = () =>
    headerGroups().length > 0
      ? headerGroups()[headerGroups().length - 1].headers
      : [];

  return (
    <Table {...tableProps}>
      {/* Toolbar */}
      <caption class="mb-3 text-left">
        <div class="flex items-center gap-2">
          <div class="join">
            <Input
              size="sm"
              placeholder="Search…"
              value={(table.getState().globalFilter as string) ?? ""}
              onInput={(e) => {
                const val = (e.currentTarget as HTMLInputElement).value;
                clearTimeout((window as any).__t);
                (window as any).__t = setTimeout(
                  () => table.setGlobalFilter(val),
                  300
                );
              }}
            />
            <Button
              size="sm"
              color="neutral"
              onClick={() => table.setGlobalFilter("")}
            >
              Clear
            </Button>
          </div>
        </div>
      </caption>

      <Table.Head noCell>
        {/* Fila de headers */}
        <For each={headerGroups()}>
          {(hg) => (
            <tr>
              <For each={hg.headers}>
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
            </tr>
          )}
        </For>

        <Show when={local.enableFilters}>
          <tr>
            <For each={leafHeaders()}>
              {(header) => (
                <Table.HeadCell>
                  {header.isPlaceholder ||
                  !header.column.getCanFilter() ? null : (
                    <ColumnFilter column={header.column} />
                  )}
                </Table.HeadCell>
              )}
            </For>
          </tr>
        </Show>
      </Table.Head>

      <Table.Body>
        {local.loading ? (
          <Table.Row>
            <Table.Cell
              colSpan={table.getAllColumns().length}
              class="text-center py-6"
            >
              {local.renderLoading ? (
                local.renderLoading()
              ) : (
                <Loading variant="spinner" size="lg" color="primary" />
              )}
            </Table.Cell>
          </Table.Row>
        ) : tableRows().length === 0 && local.renderEmpty ? (
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
              <Table.Row>
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
            )}
          </For>
        )}
      </Table.Body>

      <Table.Footer noCell>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2">
            <span class="opacity-70">Rows per page</span>
            <Select
              size="sm"
              value={String(table.getState().pagination.pageSize)}
              onChange={(e) =>
                table.setPageSize(
                  Number((e.currentTarget as HTMLSelectElement).value)
                )
              }
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
          <div class="flex items-center gap-3">
            <span class="opacity-70">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <div class="join">
              <Button
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
              >
                |⟪
              </Button>
              <Button
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Prev
              </Button>
              <Button
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Next
              </Button>
              <Button
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              >
                ⟫|
              </Button>
            </div>
          </div>
        </div>
      </Table.Footer>
    </Table>
  );
}

function ColumnFilter(props: { column: any }) {
  const col = props.column;
  const value = () => col.getFilterValue() as any;
  const type = col.columnDef.meta?.filterType ?? "text";

  if (type === "text") {
    return (
      <Input
        size="xs"
        placeholder="Filter…"
        value={value() ?? ""}
        onInput={(e) =>
          col.setFilterValue(
            (e.currentTarget as HTMLInputElement).value || undefined
          )
        }
      />
    );
  }

  if (type === "numberRange") {
    const v: [string?, string?] = value() ?? [undefined, undefined];
    const setRange = (min?: string, max?: string) => {
      if (!min && !max) return col.setFilterValue(undefined);
      col.setFilterValue([min || undefined, max || undefined]);
    };
    return (
      <div class="flex gap-1">
        <Input
          size="xs"
          type="number"
          placeholder="Min"
          value={v[0] ?? ""}
          onInput={(e) =>
            setRange((e.currentTarget as HTMLInputElement).value, v[1])
          }
        />
        <Input
          size="xs"
          type="number"
          placeholder="Max"
          value={v[1] ?? ""}
          onInput={(e) =>
            setRange(v[0], (e.currentTarget as HTMLInputElement).value)
          }
        />
      </div>
    );
  }

  if (type === "select") {
    const options: Array<{ label: string; value: string }> =
      col.columnDef.meta?.options ?? [];
    return (
      <Select
        size="xs"
        value={value() ?? ""}
        onChange={(e) =>
          col.setFilterValue(
            (e.currentTarget as HTMLSelectElement).value || undefined
          )
        }
      >
        <option value="">All</option>
        <For each={options}>
          {(o) => <option value={o.value}>{o.label}</option>}
        </For>
      </Select>
    );
  }

  return null;
}

export default EnhancedTable;
