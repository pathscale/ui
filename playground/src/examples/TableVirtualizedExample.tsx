import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
import {
  Button,
  Icon,
  Table,
  useVirtualRows,
  type TableSortDescriptor,
} from "@pathscale/ui";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type Updater,
} from "@tanstack/solid-table";

type VirtualizedSessionRow = {
  id: number;
  host: string;
  region: string;
  queue: string;
  status: "Live" | "Standby" | "Offline";
};

const VIRTUALIZED_ROWS: VirtualizedSessionRow[] = Array.from(
  { length: 1000 },
  (_, index) => {
    const id = index + 1;
    const status: VirtualizedSessionRow["status"] =
      id % 5 === 0 ? "Offline" : id % 2 === 0 ? "Live" : "Standby";

    return {
      id,
      host: `Host ${id}`,
      region: ["Miami", "Madrid", "Toronto", "Bogota"][id % 4],
      queue: `Session-${String(id).padStart(4, "0")}`,
      status,
    };
  },
);

const STATUS_CLASS_MAP: Record<VirtualizedSessionRow["status"], string> = {
  Live: "text-success",
  Standby: "text-warning",
  Offline: "opacity-70",
};

const VIEWPORT_HEIGHT_OPTIONS = [288, 352, 448] as const;

const VirtualizedColumnGroup = () => (
  <colgroup>
    <col style={{ width: "32%" }} />
    <col style={{ width: "24%" }} />
    <col style={{ width: "24%" }} />
    <col style={{ width: "20%" }} />
  </colgroup>
);

const getSortIconName = (direction: TableSortDescriptor["direction"] | undefined) => {
  if (direction === "ascending") return "icon-[lucide--arrow-up]";
  if (direction === "descending") return "icon-[lucide--arrow-down]";
  return "icon-[lucide--arrow-down-up]";
};

const SortIndicator = (props: { direction: TableSortDescriptor["direction"] | undefined }) => (
  <Icon
    name={getSortIconName(props.direction)}
    width={14}
    height={14}
    class={props.direction ? "opacity-80" : "opacity-50"}
  />
);

export const TableVirtualizedExample = () => {
  const [viewportHeight, setViewportHeight] = createSignal(352);

  const [basicScrollElement, setBasicScrollElement] = createSignal<HTMLDivElement | null>(null);

  const basicVirtualizer = useVirtualRows<HTMLDivElement, HTMLTableRowElement>({
    get count() {
      return VIRTUALIZED_ROWS.length;
    },
    getScrollElement: () => basicScrollElement(),
    estimateSize: () => 48,
    get initialRect() {
      return { width: 960, height: viewportHeight() };
    },
    overscan: 10,
  });

  const basicPaddingTop = createMemo(() => {
    const firstItem = basicVirtualizer.virtualItems()[0];
    return firstItem ? firstItem.start : 0;
  });

  const basicPaddingBottom = createMemo(() => {
    const items = basicVirtualizer.virtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return 0;
    return basicVirtualizer.totalSize() - lastItem.end;
  });

  const [sorting, setSorting] = createSignal<SortingState>([]);

  const columns = createMemo<ColumnDef<VirtualizedSessionRow>[]>(() => [
    {
      accessorKey: "host",
      id: "host",
      header: "Host",
      cell: ({ row }) => row.original.host,
    },
    {
      accessorKey: "region",
      id: "region",
      header: "Region",
      cell: ({ row }) => row.original.region,
    },
    {
      accessorKey: "queue",
      id: "queue",
      header: "Queue",
      cell: ({ row }) => <span class="font-mono text-xs">{row.original.queue}</span>,
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span class={STATUS_CLASS_MAP[row.original.status]}>{row.original.status}</span>
      ),
    },
  ]);

  const onSortingChange = (updater: Updater<SortingState>) => {
    setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater));
  };

  const tanstackTable = createSolidTable({
    get data() {
      return VIRTUALIZED_ROWS;
    },
    get columns() {
      return columns();
    },
    state: {
      get sorting() {
        return sorting();
      },
    },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sortedRows = createMemo(() => {
    // Tie row projection to sorting state and force a fresh array reference
    // so Solid subscribers always react when TanStack recomputes row order.
    sorting();
    return tanstackTable.getRowModel().rows.slice();
  });

  const tanstackSortDescriptor = createMemo<TableSortDescriptor | undefined>(() => {
    const activeSort = sorting()[0];
    if (!activeSort) return undefined;
    return {
      column: activeSort.id,
      direction: activeSort.desc ? "descending" : "ascending",
    };
  });

  const handleTableSortChange = (descriptor: TableSortDescriptor) => {
    setSorting([
      {
        id: descriptor.column,
        desc: descriptor.direction === "descending",
      },
    ]);
  };

  const [tanstackScrollElement, setTanstackScrollElement] = createSignal<HTMLDivElement | null>(null);

  const tanstackVirtualizer = useVirtualRows<HTMLDivElement, HTMLTableRowElement>({
    get count() {
      return sortedRows().length;
    },
    getScrollElement: () => tanstackScrollElement(),
    estimateSize: () => 48,
    get initialRect() {
      return { width: 960, height: viewportHeight() };
    },
    overscan: 10,
  });

  createEffect(() => {
    sorting();
    tanstackVirtualizer.virtualizer.measure();
  });

  const tanstackPaddingTop = createMemo(() => {
    const firstItem = tanstackVirtualizer.virtualItems()[0];
    return firstItem ? firstItem.start : 0;
  });

  const tanstackPaddingBottom = createMemo(() => {
    const items = tanstackVirtualizer.virtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return 0;
    return tanstackVirtualizer.totalSize() - lastItem.end;
  });

  return (
    <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
      <div class="space-y-2">
        <h2 class="text-sm font-semibold">Table Virtualized Rows</h2>
        <p class="text-xs opacity-70">
          External composition pattern: fixed header outside a scrollable body,
          with row virtualization via `useVirtualRows`.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium uppercase tracking-wide opacity-70">Viewport</span>
          <For each={VIEWPORT_HEIGHT_OPTIONS}>
            {(height) => (
              <Button
                size="sm"
                variant={viewportHeight() === height ? "primary" : "secondary"}
                onClick={() => setViewportHeight(height)}
              >
                {height}px
              </Button>
            )}
          </For>
          <span class="text-xs opacity-60">
            Prefer either pagination or virtualization as the primary row-windowing strategy.
          </span>
        </div>
      </div>

      <section class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold">1. Static Data + Virtualizer</h3>
          <p class="text-xs opacity-70">
            Minimal HeroUI-style composition using plain data.
          </p>
        </div>

        <Table.Root>
          <div class="overflow-x-auto">
            <Table.Content class="table-fixed">
              <VirtualizedColumnGroup />
              <Table.Header>
                <Table.Row>
                  <Table.Column id="host">Host</Table.Column>
                  <Table.Column id="region">Region</Table.Column>
                  <Table.Column id="queue">Queue</Table.Column>
                  <Table.Column id="status">Status</Table.Column>
                </Table.Row>
              </Table.Header>
            </Table.Content>
          </div>

          <div
            ref={setBasicScrollElement}
            class="overflow-y-auto overflow-x-auto"
            style={{ height: `${viewportHeight()}px` }}
          >
            <Table.Content class="table-fixed">
              <VirtualizedColumnGroup />
              <Table.Body>
                <Show when={basicPaddingTop() > 0}>
                  <Table.Row aria-hidden="true">
                    <Table.Cell
                      colSpan={4}
                      style={{
                        height: `${basicPaddingTop()}px`,
                        padding: "0",
                        border: "0",
                        "background-color": "transparent",
                      }}
                    />
                  </Table.Row>
                </Show>

                <For each={basicVirtualizer.virtualItems()}>
                  {(virtualItem) => {
                    const row = VIRTUALIZED_ROWS[virtualItem.index];

                    return (
                      <Table.Row
                        ref={(element) => basicVirtualizer.virtualizer.measureElement(element)}
                        data-index={virtualItem.index}
                      >
                        <Table.Cell>{row.host}</Table.Cell>
                        <Table.Cell>{row.region}</Table.Cell>
                        <Table.Cell class="font-mono text-xs">{row.queue}</Table.Cell>
                        <Table.Cell class={STATUS_CLASS_MAP[row.status]}>{row.status}</Table.Cell>
                      </Table.Row>
                    );
                  }}
                </For>

                <Show when={basicPaddingBottom() > 0}>
                  <Table.Row aria-hidden="true">
                    <Table.Cell
                      colSpan={4}
                      style={{
                        height: `${basicPaddingBottom()}px`,
                        padding: "0",
                        border: "0",
                        "background-color": "transparent",
                      }}
                    />
                  </Table.Row>
                </Show>
              </Table.Body>
            </Table.Content>
          </div>
        </Table.Root>

        <p class="text-xs opacity-70">
          Rendered rows: {basicVirtualizer.virtualItems().length} / {VIRTUALIZED_ROWS.length} |
          Visible range: {basicVirtualizer.startIndex()}-{basicVirtualizer.endIndex()} |
          Virtual height: {Math.round(basicVirtualizer.totalSize())}px
        </p>
      </section>

      <section class="space-y-3">
        <div>
          <h3 class="text-sm font-semibold">2. TanStack + Virtualizer</h3>
          <p class="text-xs opacity-70">
            Sorted TanStack row model feeding the external virtualized body.
          </p>
        </div>

        <Table.Root>
          <div class="overflow-x-auto">
            <Table.Content
              class="table-fixed"
              sortDescriptor={tanstackSortDescriptor()}
              onSortChange={handleTableSortChange}
            >
              <VirtualizedColumnGroup />
              <Table.Header>
                <For each={tanstackTable.getHeaderGroups()}>
                  {(headerGroup) => (
                    <Table.Row>
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <Table.Column
                            id={header.column.id || header.id}
                            allowsSorting={header.column.getCanSort()}
                          >
                            {({ sortDirection }) => (
                              <span class="flex items-center gap-2">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                                <Show when={header.column.getCanSort()}>
                                  <SortIndicator direction={sortDirection} />
                                </Show>
                              </span>
                            )}
                          </Table.Column>
                        )}
                      </For>
                    </Table.Row>
                  )}
                </For>
              </Table.Header>
            </Table.Content>
          </div>

          <div
            ref={setTanstackScrollElement}
            class="overflow-y-auto overflow-x-auto"
            style={{ height: `${viewportHeight()}px` }}
          >
            <Table.Content class="table-fixed">
              <VirtualizedColumnGroup />
              <Table.Body>
                <Show when={tanstackPaddingTop() > 0}>
                  <Table.Row aria-hidden="true">
                    <Table.Cell
                      colSpan={4}
                      style={{
                        height: `${tanstackPaddingTop()}px`,
                        padding: "0",
                        border: "0",
                        "background-color": "transparent",
                      }}
                    />
                  </Table.Row>
                </Show>

                <For each={tanstackVirtualizer.virtualItems()}>
                  {(virtualItem) => {
                    return (
                      <Show when={sortedRows()[virtualItem.index]}>
                        {(row) => (
                          <Table.Row
                            ref={(element) => tanstackVirtualizer.virtualizer.measureElement(element)}
                            data-index={virtualItem.index}
                          >
                            <For each={row().getVisibleCells()}>
                              {(cell) => (
                                <Table.Cell>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Table.Cell>
                              )}
                            </For>
                          </Table.Row>
                        )}
                      </Show>
                    );
                  }}
                </For>

                <Show when={tanstackPaddingBottom() > 0}>
                  <Table.Row aria-hidden="true">
                    <Table.Cell
                      colSpan={4}
                      style={{
                        height: `${tanstackPaddingBottom()}px`,
                        padding: "0",
                        border: "0",
                        "background-color": "transparent",
                      }}
                    />
                  </Table.Row>
                </Show>
              </Table.Body>
            </Table.Content>
          </div>
        </Table.Root>

        <p class="text-xs opacity-70">
          Rendered rows: {tanstackVirtualizer.virtualItems().length} / {sortedRows().length} |
          Visible range: {tanstackVirtualizer.startIndex()}-{tanstackVirtualizer.endIndex()} |
          Sort: {tanstackSortDescriptor()?.column ?? "none"}/{tanstackSortDescriptor()?.direction ?? "none"}
        </p>
      </section>
    </section>
  );
};
