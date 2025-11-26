import { For, createEffect, createMemo, splitProps, createSignal, Show } from "solid-js";
import Table from "../table";
import type { TableProps } from "../table";
import Button from "../button";
import Icon from "../icon";
import Pagination from "../pagination";
import {
  createStreamingTableStore,
  type StreamingTableStore,
} from "./createStreamingTableStore";
import type {
  StreamingColumnDef,
  StreamingConfig,
  SortingState,
  SortDirection,
} from "./types";

export type StreamingTableProps<TData> = {
  data: TData[];
  columns: StreamingColumnDef<TData>[];
  getRowId?: (row: TData) => string;
  streamingConfig?: StreamingConfig;
  /** Enable filtering (default: false) */
  enableFiltering?: boolean;
  /** External control of filter value */
  filterValue?: string;
  /** Callback when filter changes */
  onFilterChange?: (value: string) => void;
  /** Custom global filter function (filters across all columns) */
  globalFilterFn?: (row: TData, filterValue: string, columns: StreamingColumnDef<TData>[]) => boolean;
  /** Enable pagination (default: false) */
  enablePagination?: boolean;
  /** Number of rows per page (default: 10) */
  pageSize?: number;
  /** Initial page index (default: 0) */
  initialPage?: number;
  /** Enable sorting (default: false) */
  enableSorting?: boolean;
} & Omit<TableProps, "children">;

const StreamingTable = <TData,>(props: StreamingTableProps<TData>) => {
  const [local, tableProps] = splitProps(props, [
    "data",
    "columns",
    "getRowId",
    "streamingConfig",
    "enableFiltering",
    "filterValue",
    "onFilterChange",
    "globalFilterFn",
    "enablePagination",
    "pageSize",
    "initialPage",
    "enableSorting",
  ]);

  const store: StreamingTableStore<TData> = createStreamingTableStore<TData>();

  // Sorting state
  const [sortingState, setSortingState] = createSignal<SortingState>({
    columnId: null,
    direction: null,
  });

  const config = {
    maxBufferSize: local.streamingConfig?.maxBufferSize ?? 1000,
    appendMode: local.streamingConfig?.appendMode ?? false,
  };

  const resolveId = (row: TData): string => {
    if (local.getRowId) return local.getRowId(row);
    const anyRow = row as any;
    if (anyRow.id != null) return String(anyRow.id);
    return JSON.stringify(anyRow);
  };

  createEffect(() => {
    const incoming = local.data ?? [];

    if (config.appendMode) {
      store.appendRows(incoming, resolveId);
      store.truncateToSize(config.maxBufferSize);
    } else {
      const idSet = new Set<string>();

      incoming.forEach((row) => {
        const id = resolveId(row);
        idSet.add(id);
        store.upsertRow(row, resolveId);
      });

      const current = store.rows();
      current.forEach((r) => {
        if (!idSet.has(r.id)) {
          store.removeRow(r.id);
        }
      });
    }
  });

  /**
   * Default global filter function: case-insensitive string matching across all columns
   */
  const defaultGlobalFilterFn = (
    row: TData,
    filterValue: string,
    columns: StreamingColumnDef<TData>[]
  ): boolean => {
    if (!filterValue || filterValue.trim() === "") return true;

    const lowerFilter = filterValue.toLowerCase();

    return columns.some((col) => {
      // Check if column has a custom filter function
      if (col.filterFn) {
        return col.filterFn(row, filterValue);
      }

      // Get the value from the row using accessor
      let value: any;
      if (col.accessorKey) {
        value = (row as any)[col.accessorKey];
      } else if (col.accessorFn) {
        value = col.accessorFn(row);
      } else {
        return false;
      }

      // Convert to string and do case-insensitive match
      if (value == null) return false;
      return String(value).toLowerCase().includes(lowerFilter);
    });
  };

  /**
   * Apply filtering to the buffered rows
   * Filtering happens AFTER data buffering but BEFORE sorting/pagination
   */
  const filteredRows = createMemo(() => {
    const rows = store.rows();

    // If filtering is not enabled, return all rows
    if (!local.enableFiltering) {
      return rows;
    }

    const currentFilterValue = local.filterValue ?? "";

    // If no filter value, return all rows
    if (!currentFilterValue || currentFilterValue.trim() === "") {
      return rows;
    }

    const filterFn = local.globalFilterFn ?? defaultGlobalFilterFn;

    return rows.filter((rowStore) => {
      const rowData = rowStore.data();
      return filterFn(rowData, currentFilterValue, local.columns);
    });
  });

  // Get column identifier (id or accessorKey)
  const getColumnId = (col: StreamingColumnDef<TData>, index: number): string => {
    return col.id ?? (col.accessorKey as string) ?? `column-${index}`;
  };

  // Toggle sort direction for a column
  const handleSort = (col: StreamingColumnDef<TData>, index: number) => {
    if (!local.enableSorting || col.enableSorting === false) return;

    const columnId = getColumnId(col, index);
    const current = sortingState();

    let newDirection: SortDirection = "asc";

    if (current.columnId === columnId) {
      // Cycle through: asc -> desc -> null
      if (current.direction === "asc") {
        newDirection = "desc";
      } else if (current.direction === "desc") {
        newDirection = null;
      }
    }

    setSortingState({
      columnId: newDirection === null ? null : columnId,
      direction: newDirection,
    });
  };

  // Get value for sorting from a row
  const getSortValue = (row: TData, col: StreamingColumnDef<TData>): any => {
    if (col.accessorKey) {
      return (row as any)[col.accessorKey];
    }
    if (col.accessorFn) {
      return col.accessorFn(row);
    }
    return null;
  };

  // Default sorting comparator
  const defaultSortFn = (a: any, b: any): number => {
    // Handle null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    // String comparison
    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b);
    }

    // Number comparison
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }

    // Boolean comparison
    if (typeof a === "boolean" && typeof b === "boolean") {
      return a === b ? 0 : a ? 1 : -1;
    }

    // Date comparison
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Fallback to string comparison
    return String(a).localeCompare(String(b));
  };

  /**
   * Apply sorting to the filtered data
   * Sorting happens AFTER filtering but BEFORE pagination
   */
  const sortedRows = createMemo(() => {
    const rows = filteredRows();
    const sorting = sortingState();

    // No sorting applied
    if (!local.enableSorting || !sorting.direction || !sorting.columnId) {
      return rows;
    }

    // Find the column definition
    const colIndex = local.columns.findIndex(
      (col, idx) => getColumnId(col, idx) === sorting.columnId
    );

    if (colIndex === -1) {
      return rows;
    }

    const col = local.columns[colIndex];

    // Create a sorted copy
    const sorted = [...rows].sort((rowStoreA, rowStoreB) => {
      const rowA = rowStoreA.data();
      const rowB = rowStoreB.data();

      let result: number;

      // Use custom sorting function if provided
      if (col.sortingFn) {
        result = col.sortingFn(rowA, rowB);
      } else {
        // Use default sorting based on accessor
        const valueA = getSortValue(rowA, col);
        const valueB = getSortValue(rowB, col);
        result = defaultSortFn(valueA, valueB);
      }

      // Apply direction
      return sorting.direction === "desc" ? -result : result;
    });

    return sorted;
  });

  // Render sort indicator
  const renderSortIndicator = (col: StreamingColumnDef<TData>, index: number) => {
    if (!local.enableSorting || col.enableSorting === false) return null;

    const columnId = getColumnId(col, index);
    const sorting = sortingState();

    if (sorting.columnId !== columnId || !sorting.direction) {
      return (
        <Icon
          name="icon-[mdi-light--unfold-more-horizontal]"
          width={16}
          height={16}
          class="opacity-30"
        />
      );
    }

    return sorting.direction === "asc" ? (
      <Icon name="icon-[mdi-light--chevron-up]" width={16} height={16} />
    ) : (
      <Icon name="icon-[mdi-light--chevron-down]" width={16} height={16} />
    );
  };

  // Pagination state
  const [currentPage, setCurrentPage] = createSignal(local.initialPage ?? 0);
  const pageSize = local.pageSize ?? 10;
  const enablePagination = local.enablePagination ?? false;

  // Reset to first page when filter or sorting changes (not when new data arrives)
  createEffect(() => {
    if (enablePagination) {
      // Track filter changes
      if (local.enableFiltering) {
        local.filterValue;
      }
      // Track sorting changes
      if (local.enableSorting) {
        sortingState();
      }
      setCurrentPage(0);
    }
  });

  /**
   * Apply pagination to the filtered/sorted data
   * Pagination happens AFTER filtering and sorting
   */
  const paginatedRows = createMemo(() => {
    const rows = sortedRows();

    if (!enablePagination) {
      return rows;
    }

    const start = currentPage() * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  });

  // Compute total pages based on sorted data
  const totalPages = createMemo(() => {
    if (!enablePagination) return 1;
    const total = sortedRows().length;
    return Math.max(1, Math.ceil(total / pageSize));
  });

  // Pagination handlers
  const goToPage = (page: number) => {
    const maxPage = totalPages() - 1;
    if (page >= 0 && page <= maxPage) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage() + 1);
  const prevPage = () => goToPage(currentPage() - 1);

  // Compute visible page numbers (show max 5)
  const visiblePageNumbers = createMemo(() => {
    const total = totalPages();
    const current = currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and 2 on each side
      let start = Math.max(0, current - 2);
      let end = Math.min(total - 1, current + 2);

      // Adjust if near the start or end
      if (current < 2) {
        end = Math.min(total - 1, 4);
      } else if (current > total - 3) {
        start = Math.max(0, total - 5);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  });

  return (
    <div>
      <Table {...tableProps}>
        <Table.Head>
          <For each={local.columns}>
            {(col, index) => {
              const isSortable = local.enableSorting && col.enableSorting !== false;

              return (
                <Table.HeadCell>
                  <div
                    class={isSortable ? "flex items-center gap-2 cursor-pointer select-none" : ""}
                    onClick={() => isSortable && handleSort(col, index())}
                  >
                    <span>{col.header}</span>
                    {renderSortIndicator(col, index())}
                  </div>
                </Table.HeadCell>
              );
            }}
          </For>
        </Table.Head>
        <tbody>
          <Show
            when={paginatedRows().length > 0}
            fallback={
              <Table.Row>
                <Table.Cell colSpan={local.columns.length} style={{ "text-align": "center" }}>
                  No data
                </Table.Cell>
              </Table.Row>
            }
          >
            <For each={paginatedRows()}>
              {(rowStore) => (
                <Table.Row>
                  <For each={local.columns}>
                    {(col) => (
                      <Table.Cell>
                        {col.cell
                          ? col.cell({ row: { original: rowStore.data() } })
                          : col.accessorKey
                            ? (rowStore.data() as any)[col.accessorKey]
                            : col.accessorFn
                              ? col.accessorFn(rowStore.data())
                              : ""}
                      </Table.Cell>
                    )}
                  </For>
                </Table.Row>
              )}
            </For>
          </Show>
        </tbody>
      </Table>

      <Show when={enablePagination && totalPages() > 0}>
        <div class="flex justify-center items-center gap-2 mt-4">
          <Pagination>
            <Button
              class="join-item"
              onClick={prevPage}
              disabled={currentPage() === 0}
              size="sm"
            >
              «
            </Button>

            <For each={visiblePageNumbers()}>
              {(pageNum) => {
                const isActive = () => pageNum === currentPage();
                return (
                  <Button
                    class="join-item"
                    onClick={() => goToPage(pageNum)}
                    active={isActive()}
                    size="sm"
                  >
                    {pageNum + 1}
                  </Button>
                );
              }}
            </For>

            <Button
              class="join-item"
              onClick={nextPage}
              disabled={currentPage() === totalPages() - 1}
              size="sm"
            >
              »
            </Button>
          </Pagination>

          <span class="text-sm ml-2">
            Page {currentPage() + 1} of {totalPages()}
          </span>
        </div>
      </Show>
    </div>
  );
};

export default StreamingTable;
