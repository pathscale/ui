import { For, Show, createMemo, createSignal } from "solid-js";
import { Table, useVirtualRows } from "@pathscale/ui";

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

const VirtualizedColumnGroup = () => (
  <colgroup>
    <col style={{ width: "32%" }} />
    <col style={{ width: "24%" }} />
    <col style={{ width: "24%" }} />
    <col style={{ width: "20%" }} />
  </colgroup>
);

export const TableVirtualizedExample = () => {
  const [bodyScrollElement, setBodyScrollElement] = createSignal<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualRows<HTMLDivElement, HTMLTableRowElement>({
    get count() {
      return VIRTUALIZED_ROWS.length;
    },
    getScrollElement: () => bodyScrollElement(),
    estimateSize: () => 48,
    initialRect: { width: 960, height: 352 },
    overscan: 10,
  });

  const paddingTop = createMemo(() => {
    const firstItem = rowVirtualizer.virtualItems()[0];
    return firstItem ? firstItem.start : 0;
  });

  const paddingBottom = createMemo(() => {
    const items = rowVirtualizer.virtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return 0;
    return rowVirtualizer.totalSize() - lastItem.end;
  });

  return (
    <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
      <div class="space-y-1">
        <h2 class="text-sm font-semibold">Table Virtualized Rows</h2>
        <p class="text-xs opacity-70">
          HeroUI-style composition: fixed header table outside the scrollable body,
          with row virtualization composed externally via `useVirtualRows`.
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
          ref={setBodyScrollElement}
          class="overflow-y-auto overflow-x-auto"
          style={{ height: "22rem" }}
        >
          <Table.Content class="table-fixed">
            <VirtualizedColumnGroup />
            <Table.Body>
              <Show when={paddingTop() > 0}>
                <Table.Row aria-hidden="true">
                  <Table.Cell
                    colSpan={4}
                    style={{
                      height: `${paddingTop()}px`,
                      padding: "0",
                      border: "0",
                      "background-color": "transparent",
                    }}
                  />
                </Table.Row>
              </Show>

              <For each={rowVirtualizer.virtualItems()}>
                {(virtualItem) => {
                  const row = VIRTUALIZED_ROWS[virtualItem.index];

                  return (
                    <Table.Row
                      ref={(element) => rowVirtualizer.virtualizer.measureElement(element)}
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

              <Show when={paddingBottom() > 0}>
                <Table.Row aria-hidden="true">
                  <Table.Cell
                    colSpan={4}
                    style={{
                      height: `${paddingBottom()}px`,
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
        Rendered rows: {rowVirtualizer.virtualItems().length} / {VIRTUALIZED_ROWS.length} |
        Visible range: {rowVirtualizer.startIndex()}-{rowVirtualizer.endIndex()} |
        Virtual height: {Math.round(rowVirtualizer.totalSize())}px
      </p>
    </section>
  );
};
