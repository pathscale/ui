import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  type Accessor,
} from "solid-js";
import {
  EmptyState,
  Icon,
  Table,
  toSortDescriptor,
  toSortingState,
  useStreamingBuffer,
  useStreamingSubscription,
  useTableModel,
  useTableSorting,
  useVirtualRows,
} from "@pathscale/ui";
import { flexRender, type ColumnDef } from "@tanstack/solid-table";

type Side = "BUY" | "SELL";

type AppendRow = {
  id: string;
  timestamp: number;
  symbol: string;
  side: Side;
  price: number;
  size: number;
};

type UpsertRow = {
  symbol: string;
  bid: number;
  ask: number;
  spreadBp: number;
  updatedAt: number;
  status: "LIVE" | "WIDE";
};

type SnapshotRow = {
  metric: string;
  p50: number;
  p95: number;
  p99: number;
  updatedAt: number;
};

const ROW_HEIGHT = 44;

const SORT_ICON_BY_DIRECTION = {
  ascending: "icon-[lucide--arrow-up]",
  descending: "icon-[lucide--arrow-down]",
  none: "icon-[lucide--arrow-down-up]",
} as const;

const getSortIconName = (direction: "ascending" | "descending" | undefined) => {
  if (direction === "ascending") return SORT_ICON_BY_DIRECTION.ascending;
  if (direction === "descending") return SORT_ICON_BY_DIRECTION.descending;
  return SORT_ICON_BY_DIRECTION.none;
};

const formatTime = (value: number) =>
  new Date(value).toLocaleTimeString([], {
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  });

const formatNumber = (value: number, digits = 2) => value.toFixed(digits);

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const pickOne = <T,>(values: readonly T[]) =>
  values[Math.floor(Math.random() * values.length)] ?? values[0]!;

const createAppendBatch = (params: { batchSize: number; sequenceRef: Accessor<number> }) => {
  const now = Date.now();
  const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT"] as const;

  return Array.from({ length: params.batchSize }, (_, index): AppendRow => {
    const seq = params.sequenceRef() + index;
    const symbol = pickOne(symbols);
    const side: Side = Math.random() > 0.5 ? "BUY" : "SELL";
    const base = symbol === "BTCUSDT" ? 70000 : symbol === "ETHUSDT" ? 3500 : 120;

    return {
      id: `evt-${now}-${seq}`,
      timestamp: now + index,
      symbol,
      side,
      price: base + randomBetween(-base * 0.008, base * 0.008),
      size: randomBetween(0.05, 8),
    };
  });
};

const buildSymbols = (size: number) =>
  Array.from({ length: size }, (_, index) => `SYM-${String(index + 1).padStart(4, "0")}`);

const createSnapshotRows = (size: number): SnapshotRow[] =>
  Array.from({ length: size }, (_, index) => {
    const p50 = randomBetween(0.2, 12.5);
    const p95 = p50 * randomBetween(1.1, 1.7);
    const p99 = p95 * randomBetween(1.1, 1.5);

    return {
      metric: `worker.${String(index + 1).padStart(4, "0")}`,
      p50,
      p95,
      p99,
      updatedAt: Date.now(),
    };
  });

const StatusPill = (props: { tone: "success" | "warning"; label: string }) => (
  <span
    class={
      props.tone === "success"
        ? "inline-flex rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success"
        : "inline-flex rounded-full bg-warning/15 px-2 py-1 text-[10px] font-semibold text-warning"
    }
  >
    {props.label}
  </span>
);

export const StreamingComposableExample = () => {
  // Scenario A: append/event stream
  const [appendEnabled, setAppendEnabled] = createSignal(true);
  const [appendAutoFollow, setAppendAutoFollow] = createSignal(true);
  const [appendScrollElement, setAppendScrollElement] =
    createSignal<HTMLDivElement | null>(null);
  const [appendSequence, setAppendSequence] = createSignal(0);
  const [lastAppendBatchSize, setLastAppendBatchSize] = createSignal(0);
  const [appendAtTop, setAppendAtTop] = createSignal(true);

  const appendBuffer = useStreamingBuffer<AppendRow>({
    strategy: "append",
    maxSize: 500,
    getKey: (row) => row.id,
  });

  const appendSubscription = useStreamingSubscription<AppendRow[]>({
    enabled: appendEnabled,
    subscribe: (observer) => {
      observer.open();

      const emitBatch = (size: number) => {
        if (observer.isStopped) return;
        const batch = createAppendBatch({
          batchSize: size,
          sequenceRef: appendSequence,
        });
        setAppendSequence((current) => current + batch.length);
        observer.next(batch);
      };

      emitBatch(20);

      const fastTimer = setInterval(() => {
        emitBatch(3 + Math.floor(Math.random() * 4));
      }, 120);

      const burstTimer = setInterval(() => {
        emitBatch(28 + Math.floor(Math.random() * 10));
      }, 2400);

      return () => {
        clearInterval(fastTimer);
        clearInterval(burstTimer);
        observer.close();
      };
    },
    onData: (batch) => {
      setLastAppendBatchSize(batch.length);
      appendBuffer.set(batch);
    },
  });

  const appendSorting = useTableSorting({
    initialSorting: [{ id: "timestamp", desc: true }],
  });

  const appendColumns = createMemo<ColumnDef<AppendRow>[]>(() => [
    {
      id: "timestamp",
      header: "Time",
      accessorFn: (row) => row.timestamp,
      cell: (ctx) => formatTime(ctx.row.original.timestamp),
    },
    {
      id: "symbol",
      header: "Symbol",
      accessorKey: "symbol",
      cell: (ctx) => <span class="font-mono text-xs">{ctx.getValue<string>()}</span>,
    },
    {
      id: "side",
      header: "Side",
      accessorKey: "side",
      cell: (ctx) =>
        ctx.row.original.side === "BUY" ? (
          <StatusPill tone="success" label="BUY" />
        ) : (
          <StatusPill tone="warning" label="SELL" />
        ),
    },
    {
      id: "price",
      header: "Price",
      accessorFn: (row) => row.price,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 2),
    },
    {
      id: "size",
      header: "Size",
      accessorFn: (row) => row.size,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 4),
    },
  ]);

  const appendTable = useTableModel({
    data: appendBuffer.rows,
    columns: appendColumns,
    getRowId: (row) => row.id,
    sorting: appendSorting.sorting,
    setSorting: appendSorting.setSorting,
    enableSorting: true,
    enablePagination: false,
  });

  const appendRows = createMemo(() => {
    appendBuffer.rows();
    appendSorting.sorting();
    return appendTable.getRowModel().rows.slice();
  });

  const appendVisibleColumns = createMemo(
    () => appendTable.getVisibleLeafColumns().length,
  );

  const appendVirtualizer = useVirtualRows<HTMLDivElement, HTMLTableRowElement>({
    get count() {
      return appendRows().length;
    },
    getScrollElement: () => appendScrollElement(),
    estimateSize: () => ROW_HEIGHT,
    overscan: 14,
    initialRect: {
      width: 980,
      height: 300,
    },
  });

  createEffect(() => {
    appendRows();
    appendVirtualizer.virtualizer.measure();
  });

  createEffect(() => {
    appendRows().length;

    const viewport = appendScrollElement();
    const batchSize = lastAppendBatchSize();
    if (!viewport || batchSize <= 0) return;

    if (appendAutoFollow() && appendAtTop()) {
      viewport.scrollTop = 0;
      setLastAppendBatchSize(0);
      return;
    }

    if (!appendAtTop()) {
      viewport.scrollTop += batchSize * ROW_HEIGHT;
    }

    setLastAppendBatchSize(0);
  });

  const appendPaddingTop = createMemo(() => {
    const firstItem = appendVirtualizer.virtualItems()[0];
    return firstItem ? firstItem.start : 0;
  });

  const appendPaddingBottom = createMemo(() => {
    const items = appendVirtualizer.virtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return 0;
    return appendVirtualizer.totalSize() - lastItem.end;
  });

  // Scenario B: upsert/keyed state
  const [upsertEnabled, setUpsertEnabled] = createSignal(true);
  const [upsertScrollElement, setUpsertScrollElement] =
    createSignal<HTMLDivElement | null>(null);
  const symbols = buildSymbols(1200);

  const upsertBuffer = useStreamingBuffer<UpsertRow>({
    strategy: "upsert",
    maxSize: 1200,
    getKey: (row) => row.symbol,
    initialData: symbols.map((symbol) => ({
      symbol,
      bid: randomBetween(20, 400),
      ask: randomBetween(20, 400),
      spreadBp: 0,
      updatedAt: Date.now(),
      status: "LIVE",
    })),
  });

  const upsertSubscription = useStreamingSubscription<UpsertRow[]>({
    enabled: upsertEnabled,
    subscribe: (observer) => {
      observer.open();

      const emitBatch = (size: number) => {
        if (observer.isStopped) return;

        const batch = Array.from({ length: size }, () => {
          const symbol = pickOne(symbols);
          const mid = randomBetween(20, 400);
          const spread = randomBetween(0.00005, 0.0025);
          const bid = mid * (1 - spread / 2);
          const ask = mid * (1 + spread / 2);
          const spreadBp = ((ask - bid) / Math.max(1e-9, bid)) * 10000;

          return {
            symbol,
            bid,
            ask,
            spreadBp,
            updatedAt: Date.now(),
            status: spreadBp > 12 ? "WIDE" : "LIVE",
          } as UpsertRow;
        });

        observer.next(batch);
      };

      emitBatch(80);

      const fastTimer = setInterval(() => emitBatch(45), 150);
      const burstTimer = setInterval(() => emitBatch(220), 2600);

      return () => {
        clearInterval(fastTimer);
        clearInterval(burstTimer);
        observer.close();
      };
    },
    onData: (batch) => {
      upsertBuffer.set(batch);
    },
  });

  const upsertSorting = useTableSorting({
    initialSorting: [{ id: "updatedAt", desc: true }],
  });

  const upsertColumns = createMemo<ColumnDef<UpsertRow>[]>(() => [
    {
      id: "updatedAt",
      header: "Updated",
      accessorFn: (row) => row.updatedAt,
      cell: (ctx) => formatTime(ctx.row.original.updatedAt),
    },
    {
      id: "symbol",
      header: "Symbol",
      accessorKey: "symbol",
      cell: (ctx) => <span class="font-mono text-xs">{ctx.getValue<string>()}</span>,
    },
    {
      id: "bid",
      header: "Bid",
      accessorFn: (row) => row.bid,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 4),
    },
    {
      id: "ask",
      header: "Ask",
      accessorFn: (row) => row.ask,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 4),
    },
    {
      id: "spreadBp",
      header: "Spread (bp)",
      accessorFn: (row) => row.spreadBp,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 2),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (ctx) =>
        ctx.row.original.status === "LIVE" ? (
          <StatusPill tone="success" label="LIVE" />
        ) : (
          <StatusPill tone="warning" label="WIDE" />
        ),
    },
  ]);

  const upsertTable = useTableModel({
    data: upsertBuffer.rows,
    columns: upsertColumns,
    getRowId: (row) => row.symbol,
    sorting: upsertSorting.sorting,
    setSorting: upsertSorting.setSorting,
    enableSorting: true,
    enablePagination: false,
  });

  const upsertRows = createMemo(() => {
    upsertBuffer.rows();
    upsertSorting.sorting();
    return upsertTable.getRowModel().rows.slice();
  });

  const upsertVisibleColumns = createMemo(
    () => upsertTable.getVisibleLeafColumns().length,
  );

  const upsertVirtualizer = useVirtualRows<HTMLDivElement, HTMLTableRowElement>({
    get count() {
      return upsertRows().length;
    },
    getScrollElement: () => upsertScrollElement(),
    estimateSize: () => ROW_HEIGHT,
    overscan: 14,
    initialRect: {
      width: 980,
      height: 300,
    },
  });

  createEffect(() => {
    upsertRows();
    upsertVirtualizer.virtualizer.measure();
  });

  const upsertPaddingTop = createMemo(() => {
    const firstItem = upsertVirtualizer.virtualItems()[0];
    return firstItem ? firstItem.start : 0;
  });

  const upsertPaddingBottom = createMemo(() => {
    const items = upsertVirtualizer.virtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return 0;
    return upsertVirtualizer.totalSize() - lastItem.end;
  });

  // Scenario C: replace snapshot
  const [replaceEnabled, setReplaceEnabled] = createSignal(true);
  const [replaceScrollElement, setReplaceScrollElement] =
    createSignal<HTMLDivElement | null>(null);

  const replaceBuffer = useStreamingBuffer<SnapshotRow>({
    strategy: "replace",
    maxSize: 1000,
    getKey: (row) => row.metric,
    initialData: createSnapshotRows(800),
  });

  const replaceSubscription = useStreamingSubscription<SnapshotRow[]>({
    enabled: replaceEnabled,
    subscribe: (observer) => {
      observer.open();

      const emitSnapshot = () => {
        if (observer.isStopped) return;
        observer.next(createSnapshotRows(800));
      };

      emitSnapshot();

      const snapshotTimer = setInterval(emitSnapshot, 850);
      const burstTimer = setInterval(() => {
        emitSnapshot();
        setTimeout(emitSnapshot, 120);
        setTimeout(emitSnapshot, 240);
      }, 5000);

      return () => {
        clearInterval(snapshotTimer);
        clearInterval(burstTimer);
        observer.close();
      };
    },
    onData: (rows) => {
      replaceBuffer.set(rows);
    },
  });

  const replaceSorting = useTableSorting({
    initialSorting: [{ id: "p99", desc: true }],
  });

  const replaceColumns = createMemo<ColumnDef<SnapshotRow>[]>(() => [
    {
      id: "metric",
      header: "Metric",
      accessorKey: "metric",
      cell: (ctx) => <span class="font-mono text-xs">{ctx.getValue<string>()}</span>,
    },
    {
      id: "p50",
      header: "p50 (ms)",
      accessorFn: (row) => row.p50,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 2),
    },
    {
      id: "p95",
      header: "p95 (ms)",
      accessorFn: (row) => row.p95,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 2),
    },
    {
      id: "p99",
      header: "p99 (ms)",
      accessorFn: (row) => row.p99,
      cell: (ctx) => formatNumber(ctx.getValue<number>(), 2),
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessorFn: (row) => row.updatedAt,
      cell: (ctx) => formatTime(ctx.row.original.updatedAt),
    },
  ]);

  const replaceTable = useTableModel({
    data: replaceBuffer.rows,
    columns: replaceColumns,
    getRowId: (row) => row.metric,
    sorting: replaceSorting.sorting,
    setSorting: replaceSorting.setSorting,
    enableSorting: true,
    enablePagination: false,
  });

  const replaceRows = createMemo(() => {
    replaceBuffer.rows();
    replaceSorting.sorting();
    return replaceTable.getRowModel().rows.slice();
  });

  const replaceVisibleColumns = createMemo(
    () => replaceTable.getVisibleLeafColumns().length,
  );

  const replaceVirtualizer = useVirtualRows<HTMLDivElement, HTMLTableRowElement>({
    get count() {
      return replaceRows().length;
    },
    getScrollElement: () => replaceScrollElement(),
    estimateSize: () => ROW_HEIGHT,
    overscan: 14,
    initialRect: {
      width: 980,
      height: 300,
    },
  });

  createEffect(() => {
    replaceRows();
    replaceVirtualizer.virtualizer.measure();
  });

  const replacePaddingTop = createMemo(() => {
    const firstItem = replaceVirtualizer.virtualItems()[0];
    return firstItem ? firstItem.start : 0;
  });

  const replacePaddingBottom = createMemo(() => {
    const items = replaceVirtualizer.virtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return 0;
    return replaceVirtualizer.totalSize() - lastItem.end;
  });

  return (
    <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
      <div class="space-y-1">
        <h2 class="text-sm font-semibold">Streaming Composable System</h2>
        <p class="text-xs opacity-70">
          `useStreamingSubscription` handles event lifecycle, `useStreamingBuffer` handles state,
          and `Table + hooks + virtualizer` handles rendering.
        </p>
      </div>

      <section class="space-y-3 rounded-lg border border-base-300 bg-base-100 p-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold">A. Append Stream (events)</h3>
            <p class="text-xs opacity-70">High-frequency + burst inserts with capped buffer (500 rows).</p>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <label class="inline-flex items-center gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={appendEnabled()}
                onChange={(event) => setAppendEnabled(event.currentTarget.checked)}
              />
              stream
            </label>
            <label class="inline-flex items-center gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={appendAutoFollow()}
                onChange={(event) => setAppendAutoFollow(event.currentTarget.checked)}
              />
              auto-follow top
            </label>
            <span class="rounded bg-base-200 px-2 py-1">live: {String(appendSubscription.isLive())}</span>
            <span class="rounded bg-base-200 px-2 py-1">rows: {appendBuffer.rows().length}</span>
            <span class="rounded bg-base-200 px-2 py-1">events: {appendSubscription.eventCount()}</span>
            <span class="rounded bg-base-200 px-2 py-1">view: {appendAtTop() ? "top" : "reading older"}</span>
          </div>
        </div>

        <Table.Root class="w-full min-h-0">
          <div class="overflow-x-auto">
            <Table.Content
              class="table-fixed"
              sortDescriptor={toSortDescriptor(appendSorting.sorting())}
              onSortChange={(descriptor) =>
                appendSorting.setSorting(toSortingState(descriptor))
              }
            >
              <Table.Header class="z-20">
                <For each={appendTable.getHeaderGroups()}>
                  {(headerGroup) => (
                    <Table.Row>
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <Table.Column
                            class="sticky top-0 z-20 bg-base-200"
                            id={header.column.id}
                            allowsSorting={header.column.getCanSort()}
                          >
                            {({ sortDirection }) => (
                              <div class="flex items-center justify-between gap-2">
                                <span>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                                <Icon name={getSortIconName(sortDirection)} width={14} height={14} />
                              </div>
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
            ref={setAppendScrollElement}
            class="max-h-[20rem] overflow-y-auto overflow-x-auto overscroll-contain"
            onScroll={(event) => {
              setAppendAtTop(event.currentTarget.scrollTop <= 8);
            }}
          >
            <Table.Content class="table-fixed">
              <Table.Body>
                <Show
                  when={appendRows().length > 0}
                  fallback={
                    <Table.Row>
                      <Table.Cell colSpan={appendVisibleColumns()} class="py-8 text-center">
                        <EmptyState>
                          <EmptyState.Icon>
                            <Icon name="icon-[lucide--inbox]" width={20} height={20} />
                          </EmptyState.Icon>
                          <EmptyState.Title>No stream rows</EmptyState.Title>
                        </EmptyState>
                      </Table.Cell>
                    </Table.Row>
                  }
                >
                  <Show when={appendPaddingTop() > 0}>
                    <Table.Row aria-hidden="true">
                      <Table.Cell
                        colSpan={appendVisibleColumns()}
                        style={{
                          height: `${appendPaddingTop()}px`,
                          padding: "0",
                          border: "0",
                          "background-color": "transparent",
                        }}
                      />
                    </Table.Row>
                  </Show>

                  <For each={appendVirtualizer.virtualItems()}>
                    {(virtualItem) => (
                      <Show when={appendRows()[virtualItem.index]}>
                        {(row) => (
                          <Table.Row
                            ref={(element) =>
                              appendVirtualizer.virtualizer.measureElement(element)
                            }
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
                    )}
                  </For>

                  <Show when={appendPaddingBottom() > 0}>
                    <Table.Row aria-hidden="true">
                      <Table.Cell
                        colSpan={appendVisibleColumns()}
                        style={{
                          height: `${appendPaddingBottom()}px`,
                          padding: "0",
                          border: "0",
                          "background-color": "transparent",
                        }}
                      />
                    </Table.Row>
                  </Show>
                </Show>
              </Table.Body>
            </Table.Content>
          </div>
        </Table.Root>
      </section>

      <section class="space-y-3 rounded-lg border border-base-300 bg-base-100 p-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold">B. Upsert Stream (keyed state)</h3>
            <p class="text-xs opacity-70">1,200 symbols with continuous keyed updates.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <label class="inline-flex items-center gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={upsertEnabled()}
                onChange={(event) => setUpsertEnabled(event.currentTarget.checked)}
              />
              stream
            </label>
            <span class="rounded bg-base-200 px-2 py-1">live: {String(upsertSubscription.isLive())}</span>
            <span class="rounded bg-base-200 px-2 py-1">rows: {upsertBuffer.rows().length}</span>
            <span class="rounded bg-base-200 px-2 py-1">events: {upsertSubscription.eventCount()}</span>
          </div>
        </div>

        <Table.Root class="w-full min-h-0">
          <div class="overflow-x-auto">
            <Table.Content
              class="table-fixed"
              sortDescriptor={toSortDescriptor(upsertSorting.sorting())}
              onSortChange={(descriptor) =>
                upsertSorting.setSorting(toSortingState(descriptor))
              }
            >
              <Table.Header class="z-20">
                <For each={upsertTable.getHeaderGroups()}>
                  {(headerGroup) => (
                    <Table.Row>
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <Table.Column
                            class="sticky top-0 z-20 bg-base-200"
                            id={header.column.id}
                            allowsSorting={header.column.getCanSort()}
                          >
                            {({ sortDirection }) => (
                              <div class="flex items-center justify-between gap-2">
                                <span>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                                <Icon name={getSortIconName(sortDirection)} width={14} height={14} />
                              </div>
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
            ref={setUpsertScrollElement}
            class="max-h-[20rem] overflow-y-auto overflow-x-auto overscroll-contain"
          >
            <Table.Content class="table-fixed">
              <Table.Body>
                <Show
                  when={upsertRows().length > 0}
                  fallback={
                    <Table.Row>
                      <Table.Cell colSpan={upsertVisibleColumns()} class="py-8 text-center">
                        <EmptyState>
                          <EmptyState.Icon>
                            <Icon name="icon-[lucide--inbox]" width={20} height={20} />
                          </EmptyState.Icon>
                          <EmptyState.Title>No keyed rows</EmptyState.Title>
                        </EmptyState>
                      </Table.Cell>
                    </Table.Row>
                  }
                >
                  <Show when={upsertPaddingTop() > 0}>
                    <Table.Row aria-hidden="true">
                      <Table.Cell
                        colSpan={upsertVisibleColumns()}
                        style={{
                          height: `${upsertPaddingTop()}px`,
                          padding: "0",
                          border: "0",
                          "background-color": "transparent",
                        }}
                      />
                    </Table.Row>
                  </Show>

                  <For each={upsertVirtualizer.virtualItems()}>
                    {(virtualItem) => (
                      <Show when={upsertRows()[virtualItem.index]}>
                        {(row) => (
                          <Table.Row
                            ref={(element) =>
                              upsertVirtualizer.virtualizer.measureElement(element)
                            }
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
                    )}
                  </For>

                  <Show when={upsertPaddingBottom() > 0}>
                    <Table.Row aria-hidden="true">
                      <Table.Cell
                        colSpan={upsertVisibleColumns()}
                        style={{
                          height: `${upsertPaddingBottom()}px`,
                          padding: "0",
                          border: "0",
                          "background-color": "transparent",
                        }}
                      />
                    </Table.Row>
                  </Show>
                </Show>
              </Table.Body>
            </Table.Content>
          </div>
        </Table.Root>
      </section>

      <section class="space-y-3 rounded-lg border border-base-300 bg-base-100 p-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold">C. Snapshot Replace Stream</h3>
            <p class="text-xs opacity-70">Full dataset swaps (800 rows) with periodic burst refreshes.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <label class="inline-flex items-center gap-2">
              <input
                type="checkbox"
                class="checkbox checkbox-sm"
                checked={replaceEnabled()}
                onChange={(event) => setReplaceEnabled(event.currentTarget.checked)}
              />
              stream
            </label>
            <span class="rounded bg-base-200 px-2 py-1">live: {String(replaceSubscription.isLive())}</span>
            <span class="rounded bg-base-200 px-2 py-1">rows: {replaceBuffer.rows().length}</span>
            <span class="rounded bg-base-200 px-2 py-1">events: {replaceSubscription.eventCount()}</span>
          </div>
        </div>

        <Table.Root class="w-full min-h-0">
          <div class="overflow-x-auto">
            <Table.Content
              class="table-fixed"
              sortDescriptor={toSortDescriptor(replaceSorting.sorting())}
              onSortChange={(descriptor) =>
                replaceSorting.setSorting(toSortingState(descriptor))
              }
            >
              <Table.Header class="z-20">
                <For each={replaceTable.getHeaderGroups()}>
                  {(headerGroup) => (
                    <Table.Row>
                      <For each={headerGroup.headers}>
                        {(header) => (
                          <Table.Column
                            class="sticky top-0 z-20 bg-base-200"
                            id={header.column.id}
                            allowsSorting={header.column.getCanSort()}
                          >
                            {({ sortDirection }) => (
                              <div class="flex items-center justify-between gap-2">
                                <span>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                                <Icon name={getSortIconName(sortDirection)} width={14} height={14} />
                              </div>
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
            ref={setReplaceScrollElement}
            class="max-h-[20rem] overflow-y-auto overflow-x-auto overscroll-contain"
          >
            <Table.Content class="table-fixed">
              <Table.Body>
                <Show
                  when={replaceRows().length > 0}
                  fallback={
                    <Table.Row>
                      <Table.Cell colSpan={replaceVisibleColumns()} class="py-8 text-center">
                        <EmptyState>
                          <EmptyState.Icon>
                            <Icon name="icon-[lucide--inbox]" width={20} height={20} />
                          </EmptyState.Icon>
                          <EmptyState.Title>No snapshot rows</EmptyState.Title>
                        </EmptyState>
                      </Table.Cell>
                    </Table.Row>
                  }
                >
                  <Show when={replacePaddingTop() > 0}>
                    <Table.Row aria-hidden="true">
                      <Table.Cell
                        colSpan={replaceVisibleColumns()}
                        style={{
                          height: `${replacePaddingTop()}px`,
                          padding: "0",
                          border: "0",
                          "background-color": "transparent",
                        }}
                      />
                    </Table.Row>
                  </Show>

                  <For each={replaceVirtualizer.virtualItems()}>
                    {(virtualItem) => (
                      <Show when={replaceRows()[virtualItem.index]}>
                        {(row) => (
                          <Table.Row
                            ref={(element) =>
                              replaceVirtualizer.virtualizer.measureElement(element)
                            }
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
                    )}
                  </For>

                  <Show when={replacePaddingBottom() > 0}>
                    <Table.Row aria-hidden="true">
                      <Table.Cell
                        colSpan={replaceVisibleColumns()}
                        style={{
                          height: `${replacePaddingBottom()}px`,
                          padding: "0",
                          border: "0",
                          "background-color": "transparent",
                        }}
                      />
                    </Table.Row>
                  </Show>
                </Show>
              </Table.Body>
            </Table.Content>
          </div>
        </Table.Root>
      </section>
    </section>
  );
};
