import "./Table.css";
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
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type OnChangeFn,
  type ExpandedState,
} from "@tanstack/solid-table";
import clsx from "clsx";
import Checkbox from "../checkbox/Checkbox";
import Table, { type TableRootProps } from "./Table";
import Button from "../button/Button";
import Input from "../input/Input";
import Dropdown from "../dropdown/Dropdown";
import Loading from "../loading/Loading";
import Menu from "../menu/Menu";
import {
  useAnchoredOverlayPosition,
  useTableExpansion,
  useTableFiltering,
  useTableModel,
  useTablePagination,
  useTableSelection,
  useTableSorting,
} from "./hooks";

export type EnhancedTableProps<TData> = Omit<TableRootProps, "children"> & {
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

  const [pageSizeMenuOpen, setPageSizeMenuOpen] = createSignal(false);

  const sortingModel = useTableSorting({
    sorting: local.sorting,
    setSorting: local.setSorting,
    initialSorting: [],
  });

  const paginationModel = useTablePagination({
    pagination: local.pagination,
    setPagination: local.setPagination,
    initialPagination: { pageIndex: 0, pageSize: 10 },
    pageSizeOptions: [10, 25, 50, 100] as const,
  });

  const selectionModel = useTableSelection({
    rowSelection: local.rowSelection,
    setRowSelection: local.setRowSelection,
    initialRowSelection: {},
  });

  const filteringModel = useTableFiltering({
    columnFilters: local.columnFilters,
    setColumnFilters: local.setColumnFilters,
    initialColumnFilters: [],
    globalFilter: local.globalFilter,
    setGlobalFilter: local.setGlobalFilter,
    initialGlobalFilter: "",
  });

  const expansionModel = useTableExpansion({
    expanded: local.expanded,
    setExpanded: local.setExpanded,
    initialExpanded: {},
  });

  let pageSizeToggleRef: HTMLButtonElement | undefined;
  let pageSizeMenuRef: HTMLDivElement | undefined;

  const table = useTableModel({
    data: () => local.data,
    columns: () => local.columns,
    sorting: sortingModel.sorting,
    setSorting: sortingModel.setSorting,
    columnFilters: filteringModel.columnFilters,
    setColumnFilters: filteringModel.setColumnFilters,
    pagination: paginationModel.pagination,
    setPagination: paginationModel.setPagination,
    globalFilter: filteringModel.globalFilter,
    setGlobalFilter: filteringModel.setGlobalFilter,
    rowSelection: selectionModel.rowSelection,
    setRowSelection: selectionModel.setRowSelection,
    expanded: expansionModel.expanded,
    setExpanded: expansionModel.setExpanded,
    enableSorting: local.enableSorting !== false,
    enableFilters: !!local.enableFilters,
    enablePagination: !!local.enablePagination,
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

  const sortDescriptor = sortingModel.sortDescriptor;
  const handleSortChange = sortingModel.setSortDescriptor;

  const totalColumns = createMemo(
    () =>
      table.getVisibleLeafColumns().length +
      (local.enableRowSelection ? 1 : 0) +
      (local.expandable ? 1 : 0),
  );

  const filterTriggerRefs = new Map<string, HTMLSpanElement>();
  let filterPanelRef: HTMLDivElement | undefined;
  const filterPanelAnchor = () =>
    filteringModel.openFilterFor()
      ? filterTriggerRefs.get(filteringModel.openFilterFor()!)
      : undefined;
  const filterPanelPosition = useAnchoredOverlayPosition({
    isOpen: () => Boolean(filteringModel.openFilterFor()),
    getAnchor: filterPanelAnchor,
    getOverlay: () => filterPanelRef,
    width: 224,
    zIndex: 1300,
  });
  const pageSizeMenuPosition = useAnchoredOverlayPosition({
    isOpen: pageSizeMenuOpen,
    getAnchor: () => pageSizeToggleRef,
    getOverlay: () => pageSizeMenuRef,
    minWidth: () =>
      pageSizeToggleRef
        ? Math.max(pageSizeToggleRef.getBoundingClientRect().width, 96)
        : 96,
    zIndex: 1300,
  });

  const FilterIconTrigger = (props: { colId: string; disabled?: boolean }) => (
    <span
      ref={(el) => filterTriggerRefs.set(props.colId, el)}
      class="cursor-pointer ml-auto shrink-0"
      classList={{
        "opacity-50 pointer-events-none": props.disabled,
        "text-primary": filteringModel.openFilterFor() === props.colId,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!props.disabled) filteringModel.toggleFilter(props.colId);
      }}
    >
      {local.filterIcon}
    </span>
  );

  const FilterPanel = (props: { column: any }) => {
    const col = props.column;
    const colId = col.id as string;
    return (
      <Show when={filteringModel.openFilterFor() === colId}>
        <Portal mount={typeof document === "undefined" ? undefined : document.body}>
          <div
            ref={(el) => { filterPanelRef = el; }}
            style={filterPanelPosition.style()}
            class={
              local.filterPanelClass ??
              "z-[1300] w-56 border border-nf-border bg-nf-surface-1 shadow-lg rounded-box p-2"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div class="mb-2">
              <ColumnFilter column={col} />
            </div>
            <div class="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  col.setFilterValue(undefined);
                  filteringModel.closeFilter();
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => filteringModel.closeFilter()}
              >
                Apply
              </Button>
            </div>
          </div>
        </Portal>
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

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    });
  });

  return (
    <>
      <Table {...tableProps}>
        <Table.ScrollContainer class="flex-1 min-h-0 overflow-y-auto">
          <Table.Content
            class={clsx(tableProps.class, "table-auto")}
            sortDescriptor={sortDescriptor()}
            onSortChange={handleSortChange}
          >
            <Table.Header>
              <For each={headerGroups()}>
                {(hg) => (
                  <Table.Row>
                    <Show when={local.expandable}>
                      <Table.Column id="expand-control" class="w-6" />
                    </Show>

                    <Show when={local.enableRowSelection}>
                      <Table.Column id="selection-control" class="w-8">
                        <Checkbox
                          checked={table.getIsAllPageRowsSelected()}
                          indeterminate={table.getIsSomePageRowsSelected()}
                          onChange={table.getToggleAllPageRowsSelectedHandler()}
                        />
                      </Table.Column>
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
                          <Table.Column
                            id={colId}
                            allowsSorting={canSort}
                            class={
                              canSort
                                ? "relative cursor-pointer select-none"
                                : "relative"
                            }
                          >
                            {({ sortDirection }) => (
                              <div class="flex items-center gap-2">
                                <div class="truncate">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </div>
                                <Show when={sortDirection === "ascending"}>
                                  {local.sortAscIcon}
                                </Show>
                                <Show when={sortDirection === "descending"}>
                                  {local.sortDescIcon}
                                </Show>
                                <Show
                                  when={
                                    canSort &&
                                    sortDirection === undefined &&
                                    local.sortNeutralIcon
                                  }
                                >
                                  {local.sortNeutralIcon}
                                </Show>
                                <Show when={canFilter}>
                                  <FilterIconTrigger colId={colId} />
                                </Show>
                                <Show when={canFilter}>
                                  <FilterPanel column={header.column} />
                                </Show>
                              </div>
                            )}
                          </Table.Column>
                        );
                      }}
                    </For>
                  </Table.Row>
                )}
              </For>
            </Table.Header>

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
                        color="accent"
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
                              size="sm"
                              variant="ghost"
                              isIconOnly
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
          </Table.Content>
        </Table.ScrollContainer>
        <Show when={shouldShowPagination()}>
          <Table.Footer>
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
                  variant="ghost"
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
                    variant="ghost"
                    class="join-item"
                    isDisabled={!table.getCanPreviousPage()}
                    onClick={() => table.setPageIndex(0)}
                  >
                    {local.firstPageIcon ?? "|<<"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="join-item"
                    isDisabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                  >
                    {local.prevPageIcon ?? "<<"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="join-item"
                    isDisabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                  >
                    {local.nextPageIcon ?? ">>"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="join-item"
                    isDisabled={!table.getCanNextPage()}
                    onClick={() =>
                      table.setPageIndex(table.getPageCount() - 1)
                    }
                  >
                    {local.lastPageIcon ?? ">>|"}
                  </Button>
                </div>
              </div>
            </div>
          </Table.Footer>
        </Show>
      </Table>
      <Show when={pageSizeMenuOpen()}>
        <Portal mount={ensurePortalRoot()}>
          <Menu
            ref={(el) => {
              pageSizeMenuRef = el;
            }}
            style={pageSizeMenuPosition.style()}
            class="p-2 shadow bg-base-100 rounded-box border border-base-300 w-24"
            role="menu"
            aria-label="Rows per page"
          >
            <For each={paginationModel.pageSizeOptions()}>
              {(size) => (
                <Button
                  type="button"
                  size="sm"
                  variant={
                    table.getState().pagination.pageSize === size
                      ? "secondary"
                      : "ghost"
                  }
                  class="justify-start"
                  aria-pressed={table.getState().pagination.pageSize === size}
                  onClick={() => {
                    table.setPageSize(size);
                    closePageSizeMenu();
                  }}
                >
                  {size}
                </Button>
              )}
            </For>
          </Menu>
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
      <Dropdown.Root class="w-full">
        <Dropdown.Trigger class="btn btn-sm btn-neutral w-full justify-between">
          {currentLabel()}
        </Dropdown.Trigger>
        <Dropdown.Menu align="start">
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
      </Dropdown.Root>
    );
  }

  return null;
}

export default EnhancedTable;
