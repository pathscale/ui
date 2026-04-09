import { For, createEffect, createMemo, splitProps, createSignal, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import Table from "../table";
import type { TableRootProps, TableSortDescriptor } from "../table";
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
  /** Initial sorting state (default: null) */
  initialSorting?: SortingState;
} & Omit<TableRootProps, "children">;

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
    "initialSorting",
    "class",
    "className",
  ]);

  const store: StreamingTableStore<TData> = createStreamingTableStore<TData>();

  // Sorting state
  const [sortingState, setSortingState] = createSignal<SortingState>(
    local.initialSorting ?? { columnId: null, direction: null }
  );

  createEffect(() => {
    if (local.initialSorting) {
      setSortingState(local.initialSorting);
    }
  });

  const config = {
    maxBufferSize: local.streamingConfig?.maxBufferSize ?? 1000,
    appendMode: local.streamingConfig?.appendMode ?? false,
  };

  const resolveId = (row: TData): string => {
    if (local.getRowId) return local.getRowId(row);
    const rowWithId = row as TData & { id?: string | number };
    if (rowWithId.id != null) return String(rowWithId.id);
    return JSON.stringify(row);
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
      let value: unknown;
      if (col.accessorKey) {
        value = (row as Record<string, unknown>)[col.accessorKey];
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

  const sortDescriptor = createMemo<TableSortDescriptor | undefined>(() => {
    const sorting = sortingState();
    if (!sorting.columnId || !sorting.direction) return undefined;
    return {
      column: sorting.columnId,
      direction: sorting.direction === "asc" ? "ascending" : "descending",
    };
  });

  const handleSortChange = (descriptor: TableSortDescriptor) => {
    setSortingState({
      columnId: descriptor.column,
      direction: descriptor.direction === "ascending" ? "asc" : "desc",
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
  const renderSortIndicator = (sortDirection?: "ascending" | "descending") => {
    if (!local.enableSorting) return null;

    if (!sortDirection) {
      return (
        <Icon
          name="icon-[mdi-light--unfold-more-horizontal]"
          width={16}
          height={16}
          class="opacity-30"
        />
      );
    }

    return sortDirection === "ascending" ? (
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

  return (
    <div class={twMerge(local.class, local.className)}>
      <Table {...tableProps}>
        <Table.ScrollContainer>
          <Table.Content
            sortDescriptor={sortDescriptor()}
            onSortChange={handleSortChange}
          >
            <Table.Header>
              <Table.Row>
                <For each={local.columns}>
                  {(col, index) => {
                    const columnId = getColumnId(col, index());
                    const isSortable = local.enableSorting && col.enableSorting !== false;

                    return (
                      <Table.Column id={columnId} allowsSorting={isSortable}>
                        {({ sortDirection }) => (
                          <div class={isSortable ? "flex items-center gap-2 cursor-pointer select-none" : ""}>
                            <span>{col.header}</span>
                            {renderSortIndicator(isSortable ? sortDirection : undefined)}
                          </div>
                        )}
                      </Table.Column>
                    );
                  }}
                </For>
              </Table.Row>
            </Table.Header>
            <Table.Body>
          <Show
            when={paginatedRows().length > 0}
            fallback={
              <Table.Row>
                <Table.Cell colSpan={local.columns.length} class="text-center">
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
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <Show when={enablePagination && totalPages() > 0}>
        <div class="mt-4">
          <Pagination
            page={currentPage() + 1}
            total={totalPages()}
            onChange={(page) => goToPage(page - 1)}
          />
        </div>
      </Show>
    </div>
  );
};

export default StreamingTable;
