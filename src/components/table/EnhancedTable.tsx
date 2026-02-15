import {
  createEffect,
  createMemo,
  For,
  Show,
  splitProps,
  type Accessor,
  type JSX,
  createSignal,
  onCleanup,
} from "solid-js";
import { Portal } from "solid-js/web";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type OnChangeFn,
  type ExpandedState,
} from "@tanstack/solid-table";
import clsx from "clsx";
import Checkbox from "../checkbox/Checkbox";
import Table, { type TableProps } from "./Table";
import Button from "../button/Button";
import Input from "../input/Input";
import Dropdown from "../dropdown/Dropdown";
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
  rowSelection?: Accessor<Record<string, boolean>>;
  setRowSelection?: OnChangeFn<Record<string, boolean>>;
  expanded?: Accessor<ExpandedState>;
  setExpanded?: OnChangeFn<ExpandedState>;
  enableSorting?: boolean;
  enableFilters?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  expandable?: {
    expandedRowRender: (props: { row: any }) => JSX.Element;
  };
  renderEmpty?: () => JSX.Element;
  loading?: boolean;
  renderLoading?: () => JSX.Element;
  filterIcon: JSX.Element;
  sortAscIcon: JSX.Element;
  sortDescIcon: JSX.Element;
  sortNeutralIcon?: JSX.Element;
  expandIcon?: JSX.Element;
  collapseIcon?: JSX.Element;
  filterPanelClass?: string;
  paginationPosition?: "bottomLeft" | "bottomCenter" | "bottomRight";
  firstPageIcon?: JSX.Element;
  prevPageIcon?: JSX.Element;
  nextPageIcon?: JSX.Element;
  lastPageIcon?: JSX.Element;
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
    "rowSelection",
    "setRowSelection",
    "expanded",
    "setExpanded",
    "enableSorting",
    "enableFilters",
    "enablePagination",
    "enableRowSelection",
    "expandable",
    "renderEmpty",
    "loading",
    "renderLoading",
    "filterIcon",
    "sortAscIcon",
    "sortDescIcon",
    "sortNeutralIcon",
    "expandIcon",
    "collapseIcon",
    "filterPanelClass",
    "paginationPosition",
    "firstPageIcon",
    "prevPageIcon",
    "nextPageIcon",
    "lastPageIcon",
  ]);

  const [openFilterFor, setOpenFilterFor] = createSignal<string | null>(null);
  const [pageSizeMenuOpen, setPageSizeMenuOpen] = createSignal(false);
  const [pageSizeMenuStyle, setPageSizeMenuStyle] = createSignal<JSX.CSSProperties>({
    position: "fixed",
    top: "0px",
    left: "0px",
    "min-width": "96px",
    "z-index": 1300,
  });

  const pageSizeOptions = [10, 25, 50, 100] as const;
  let pageSizeToggleRef: HTMLButtonElement | undefined;
  let pageSizeMenuRef: HTMLDivElement | undefined;

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
      get rowSelection() {
        return local.rowSelection?.() || {};
      },
      get expanded() {
        return local.expanded?.() || {};
      },
    },
    onSortingChange: local.setSorting,
    onColumnFiltersChange: local.setColumnFilters,
    onPaginationChange: local.setPagination,
    onGlobalFilterChange: local.setGlobalFilter,
    onRowSelectionChange: local.setRowSelection,
    onExpandedChange: local.setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableSorting: local.enableSorting !== false,
    enableFilters: !!local.enableFilters,
    manualPagination: !local.enablePagination,
    enableRowSelection: !!local.enableRowSelection,
    enableExpanding: true,
    getRowCanExpand: () => !!local.expandable,
  });

  const tableRows = createMemo(() => {
    if (local.loading) return [];
    const rows = table.getRowModel().rows;
    if (rows.length === 0 && local.renderEmpty) return [];
    return rows;
  });

  const shouldShowPagination = createMemo(() => {
    if (!local.enablePagination) return false;
    const pageCount = table.getPageCount();
    const pageSize = table.getState().pagination.pageSize;
    const totalRows = table.getCoreRowModel().rows.length;

    return pageCount > 1 || totalRows > pageSize;
  });

  const headerGroups = () => table.getHeaderGroups();

  const totalColumns = createMemo(
    () =>
      table.getVisibleLeafColumns().length +
      (local.enableRowSelection ? 1 : 0) +
      (local.expandable ? 1 : 0),
  );

  const anyFilterActive = () =>
    (table.getState().columnFilters as any[]).length > 0;

  const FilterIconTrigger = (props: { colId: string; disabled?: boolean }) => (
    <span
      class="cursor-pointer ml-auto"
      classList={{
        "opacity-50 pointer-events-none": props.disabled,
        "text-primary": openFilterFor() === props.colId,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!props.disabled)
          setOpenFilterFor((c) => (c === props.colId ? null : props.colId));
      }}
    >
      {local.filterIcon}
    </span>
  );

  const FilterPanel = (props: { column: any }) => {
    const col = props.column;
    const colId = col.id as string;
    return (
      <Show when={openFilterFor() === colId}>
        <div
          class={
            local.filterPanelClass ??
            "absolute right-0 top-full mt-1 z-20 bg-base-100 border border-base-300 shadow rounded-box p-2 w-56"
          }
          onClick={(e) => e.stopPropagation()}
        >
          <div class="mb-2">
            <ColumnFilter column={col} />
          </div>
          <div class="flex gap-2 justify-end">
            <Button
              size="xs"
              color="neutral"
              variant="outline"
              onClick={() => {
                col.setFilterValue(undefined);
                setOpenFilterFor(null);
              }}
            >
              Clear
            </Button>
            <Button
              size="xs"
              color="primary"
              onClick={() => setOpenFilterFor(null)}
            >
              Apply
            </Button>
          </div>
        </div>
      </Show>
    );
  };

  const ensurePortalRoot = () => {
    if (typeof document === "undefined") return undefined;
    const existing = document.getElementById(
      "enhanced-table-overlay-root",
    ) as HTMLDivElement | null;
    if (existing) return existing;
    const root = document.createElement("div");
    root.id = "enhanced-table-overlay-root";
    document.body.append(root);
    return root;
  };

  const updatePageSizeMenuPosition = () => {
    const toggleEl = pageSizeToggleRef;
    const menuEl = pageSizeMenuRef;
    if (!toggleEl || !menuEl) return;

    const viewportPadding = 8;
    const gap = 4;
    const toggleRect = toggleEl.getBoundingClientRect();
    const menuRect = menuEl.getBoundingClientRect();
    const menuWidth = menuRect.width || Math.max(toggleRect.width, 96);
    const menuHeight = menuRect.height || 0;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = toggleRect.right - menuWidth;
    left = Math.max(
      viewportPadding,
      Math.min(left, viewportWidth - menuWidth - viewportPadding),
    );

    const spaceBelow = viewportHeight - toggleRect.bottom;
    const spaceAbove = toggleRect.top;
    const shouldOpenUp =
      spaceBelow < menuHeight + gap && spaceAbove > menuHeight + gap;

    let top = shouldOpenUp
      ? toggleRect.top - menuHeight - gap
      : toggleRect.bottom + gap;
    top = Math.max(
      viewportPadding,
      Math.min(top, viewportHeight - menuHeight - viewportPadding),
    );

    setPageSizeMenuStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      "min-width": `${Math.max(toggleRect.width, 96)}px`,
      "z-index": 1300,
    });
  };

  const closePageSizeMenu = () => setPageSizeMenuOpen(false);
  const togglePageSizeMenu = () => setPageSizeMenuOpen((current) => !current);

  createEffect(() => {
    if (!shouldShowPagination()) {
      closePageSizeMenu();
    }
  });

  createEffect(() => {
    if (!pageSizeMenuOpen()) return;
    ensurePortalRoot();

    requestAnimationFrame(() => {
      updatePageSizeMenuPosition();
      requestAnimationFrame(updatePageSizeMenuPosition);
    });

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (pageSizeToggleRef?.contains(target)) return;
      if (pageSizeMenuRef?.contains(target)) return;
      closePageSizeMenu();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePageSizeMenu();
    };

    const onViewportChange = () => updatePageSizeMenuPosition();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    onCleanup(() => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    });
  });

  return (
    <>
      <div class="enhanced-table-root flex h-full min-h-0 w-full flex-col">
        <div class="enhanced-table-scroll flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <Table
            {...tableProps}
            class={clsx(tableProps.class, "table-auto")}
          >
            <Table.Head noCell>
              <For each={headerGroups()}>
                {(hg) => (
                  <Table.Row>
                    <Show when={local.expandable}>
                      <Table.HeadCell class="w-6" />
                    </Show>

                    <Show when={local.enableRowSelection}>
                      <Table.HeadCell class="w-8">
                        <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          indeterminate={table.getIsSomePageRowsSelected()}
                          onChange={table.getToggleAllPageRowsSelectedHandler()}
                        />
                      </Table.HeadCell>
                    </Show>

                    <For each={hg.headers}>
                      {(header) => {
                        const colId = header.column.id as string;
                        const canSort =
                          local.enableSorting &&
                          header.column.columnDef.enableSorting !== false &&
                          header.column.getCanSort();
                        const canFilter =
                          local.enableFilters &&
                          header.column.columnDef.enableColumnFilter !== false &&
                          header.column.getCanFilter();

                        return (
                          <Table.HeadCell
                            class={
                              canSort
                                ? "relative cursor-pointer select-none"
                                : "relative"
                            }
                            onClick={
                              canSort
                                ? header.column.getToggleSortingHandler()
                                : undefined
                            }
                          >
                            <div class="flex items-center gap-2">
                              <div class="truncate">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </div>
                              <Show when={header.column.getIsSorted() === "asc"}>
                                {local.sortAscIcon}
                              </Show>
                              <Show when={header.column.getIsSorted() === "desc"}>
                                {local.sortDescIcon}
                              </Show>
                              <Show
                                when={
                                  canSort &&
                                  header.column.getIsSorted() === false &&
                                  local.sortNeutralIcon
                                }
                              >
                                {local.sortNeutralIcon}
                              </Show>
                              <div class="grow" />
                              <Show when={canFilter}>
                                <FilterIconTrigger colId={colId} />
                              </Show>
                              <Show when={canFilter}>
                                <FilterPanel column={header.column} />
                              </Show>
                            </div>
                          </Table.HeadCell>
                        );
                      }}
                    </For>
                  </Table.Row>
                )}
              </For>
            </Table.Head>

            <Table.Body>
              {local.loading ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={totalColumns()}
                    class="text-center py-6"
                  >
                    {local.renderLoading ? (
                      local.renderLoading()
                    ) : (
                      <Loading
                        variant="spinner"
                        size="lg"
                        color="primary"
                      />
                    )}
                  </Table.Cell>
                </Table.Row>
              ) : tableRows().length === 0 && local.renderEmpty ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={totalColumns()}
                    class="text-center py-4"
                  >
                    {local.renderEmpty()}
                  </Table.Cell>
                </Table.Row>
              ) : (
                <For each={tableRows()}>
                  {(row) => (
                    <>
                      <Table.Row>
                        <Show when={local.expandable}>
                          <Table.Cell class="w-6">
                            <Button
                              size="xs"
                              color="ghost"
                              shape="circle"
                              onClick={row.getToggleExpandedHandler()}
                            >
                              {row.getIsExpanded()
                                ? (local.collapseIcon ?? "v")
                                : (local.expandIcon ?? ">")}
                            </Button>
                          </Table.Cell>
                        </Show>
                        <Show when={local.enableRowSelection}>
                          <Table.Cell class="w-8">
                            <Checkbox
                              checked={row.getIsSelected()}
                              onChange={row.getToggleSelectedHandler()}
                            />
                          </Table.Cell>
                        </Show>
                        <For each={row.getVisibleCells()}>
                          {(cell) => (
                            <Table.Cell>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Table.Cell>
                          )}
                        </For>
                      </Table.Row>
                      <Show when={row.getIsExpanded() && local.expandable}>
                        <Table.Row>
                          <Table.Cell colSpan={totalColumns()}>
                            {local.expandable?.expandedRowRender({ row })}
                          </Table.Cell>
                        </Table.Row>
                      </Show>
                    </>
                  )}
                </For>
              )}
            </Table.Body>
          </Table>
        </div>
        <Show when={shouldShowPagination()}>
          <div class="enhanced-table-footer shrink-0 border-t border-base-300">
            <div class="px-4 py-3">
              <div
                class={clsx(
                  "flex items-center w-full",
                  local.paginationPosition === "bottomLeft" && "justify-start",
                  local.paginationPosition === "bottomCenter" &&
                    "justify-center",
                  local.paginationPosition === "bottomRight" && "justify-end",
                )}
              >
                <div class="flex items-center gap-2">
                  <span class="opacity-70">Rows per page</span>
                  <Button
                    size="sm"
                    color="neutral"
                    aria-haspopup="menu"
                    aria-expanded={pageSizeMenuOpen()}
                    onClick={(event) => {
                      event.stopPropagation();
                      togglePageSizeMenu();
                    }}
                    ref={(el) => {
                      pageSizeToggleRef = el as HTMLButtonElement;
                    }}
                  >
                    {table.getState().pagination.pageSize}
                  </Button>
                </div>
                <div class="flex items-center gap-3 ml-4">
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
                      {local.firstPageIcon ?? "|<<"}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!table.getCanPreviousPage()}
                      onClick={() => table.previousPage()}
                    >
                      {local.prevPageIcon ?? "<<"}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!table.getCanNextPage()}
                      onClick={() => table.nextPage()}
                    >
                      {local.nextPageIcon ?? ">>"}
                    </Button>
                    <Button
                      size="sm"
                      disabled={!table.getCanNextPage()}
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                    >
                      {local.lastPageIcon ?? ">>|"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
      <Show when={pageSizeMenuOpen()}>
        <Portal mount={ensurePortalRoot()}>
          <div
            ref={(el) => {
              pageSizeMenuRef = el;
            }}
            style={pageSizeMenuStyle()}
            class="menu p-2 shadow bg-base-100 rounded-box border border-base-300 w-24"
            role="menu"
            aria-label="Rows per page"
          >
            <For each={pageSizeOptions}>
              {(size) => (
                <button
                  type="button"
                  class={clsx(
                    "btn btn-sm btn-ghost justify-start",
                    table.getState().pagination.pageSize === size && "btn-active",
                  )}
                  aria-pressed={table.getState().pagination.pageSize === size}
                  onClick={() => {
                    table.setPageSize(size);
                    closePageSizeMenu();
                  }}
                >
                  {size}
                </button>
              )}
            </For>
          </div>
        </Portal>
      </Show>
    </>
  );
}

function ColumnFilter(props: { column: any }) {
  const col = props.column;
  const value = () => col.getFilterValue() as any;
  const type = col.columnDef.meta?.filterType ?? "text";

  if (type === "text") {
    return (
      <Input
        size="sm"
        placeholder="Filter..."
        value={value() ?? ""}
        onInput={(e) =>
          col.setFilterValue(
            (e.currentTarget as HTMLInputElement).value || undefined,
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
      <div class="flex gap-2">
        <Input
          size="sm"
          type="number"
          placeholder="Min"
          value={v[0] ?? ""}
          onInput={(e) =>
            setRange((e.currentTarget as HTMLInputElement).value, v[1])
          }
        />
        <Input
          size="sm"
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

    const currentValue = () => value() ?? "";
    const currentLabel = () => {
      if (!currentValue()) return "All";
      return options.find((o) => o.value === currentValue())?.label ?? "All";
    };

    const handleSelect = (val?: string) => {
      col.setFilterValue(val || undefined);
    };

    return (
      <Dropdown class="w-full">
        <Dropdown.Toggle
          button
          size="sm"
          color="neutral"
          class="w-full justify-between"
        >
          {currentLabel()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item
            onClick={() => handleSelect("")}
            aria-selected={!currentValue()}
            class={clsx(!currentValue() && "active")}
          >
            All
          </Dropdown.Item>
          <For each={options}>
            {(o) => (
              <Dropdown.Item
                onClick={() => handleSelect(o.value)}
                aria-selected={currentValue() === o.value}
                class={clsx(currentValue() === o.value && "active")}
              >
                {o.label}
              </Dropdown.Item>
            )}
          </For>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return null;
}

export default EnhancedTable;
