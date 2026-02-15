import type { ColumnDef, PaginationState } from "@tanstack/solid-table";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { EnhancedTable } from "../../src/components/table";

type DemoRow = {
  id: number;
  account: string;
  network: string;
  status: "Active" | "Pending" | "Paused";
  volume: number;
};

type ScrollMetrics = {
  viewport: string;
  pageOverflowPx: number;
  tableCanScroll: boolean;
  tableClientHeight: number;
  tableScrollHeight: number;
  tableScrollTop: number;
};

const createRows = (count: number): DemoRow[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const network = id % 2 === 0 ? "Honey" : "NoFilter";
    const status: DemoRow["status"] =
      id % 3 === 0 ? "Paused" : id % 5 === 0 ? "Pending" : "Active";

    return {
      id,
      account: `wallet-${String(id).padStart(4, "0")}`,
      network,
      status,
      volume: id * 73,
    };
  });

const LARGE_DATA = createRows(240);
const SMALL_DATA = createRows(6);

const columns: ColumnDef<DemoRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "account", header: "Account" },
  { accessorKey: "network", header: "Network" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "volume",
    header: "Volume",
    cell: (context) => context.getValue<number>().toLocaleString("en-US"),
  },
];

export default function App() {
  const [datasetMode, setDatasetMode] = createSignal<"large" | "small">("large");
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [metrics, setMetrics] = createSignal<ScrollMetrics>({
    viewport: "-",
    pageOverflowPx: 0,
    tableCanScroll: false,
    tableClientHeight: 0,
    tableScrollHeight: 0,
    tableScrollTop: 0,
  });

  let tableHostRef: HTMLDivElement | undefined;

  const activeData = createMemo(() =>
    datasetMode() === "large" ? LARGE_DATA : SMALL_DATA,
  );

  const collectMetrics = () => {
    const root = document.documentElement;
    const scrollNode = tableHostRef?.querySelector<HTMLDivElement>(
      ".enhanced-table-scroll",
    );

    setMetrics({
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      pageOverflowPx: Math.max(0, root.scrollHeight - window.innerHeight),
      tableCanScroll: !!scrollNode && scrollNode.scrollHeight > scrollNode.clientHeight,
      tableClientHeight: scrollNode?.clientHeight ?? 0,
      tableScrollHeight: scrollNode?.scrollHeight ?? 0,
      tableScrollTop: scrollNode?.scrollTop ?? 0,
    });
  };

  onMount(() => {
    const onViewportChange = () => collectMetrics();

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    const scrollNode = tableHostRef?.querySelector<HTMLDivElement>(
      ".enhanced-table-scroll",
    );
    const onTableScroll = () => collectMetrics();
    scrollNode?.addEventListener("scroll", onTableScroll);

    requestAnimationFrame(collectMetrics);

    onCleanup(() => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
      scrollNode?.removeEventListener("scroll", onTableScroll);
    });
  });

  createEffect(() => {
    datasetMode();
    setPagination({ pageIndex: 0, pageSize: 10 });
    requestAnimationFrame(collectMetrics);
  });

  createEffect(() => {
    pagination();
    requestAnimationFrame(collectMetrics);
  });

  return (
    <div class="h-screen overflow-hidden bg-base-200 text-base-content">
      <header class="fixed inset-x-0 top-0 z-40 h-14 border-b border-base-300 bg-base-100/95 px-6 backdrop-blur">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
          <h1 class="text-sm font-semibold tracking-wide">
            EnhancedTable Vertical Scroll Containment Test
          </h1>
          <span class="text-xs opacity-70">
            Fixed header + fixed footer layout
          </span>
        </div>
      </header>

      <main class="h-full px-6 pb-16 pt-16">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-4">
          <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Dataset</span>
                <button
                  type="button"
                  class={`btn btn-sm ${datasetMode() === "large" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setDatasetMode("large")}
                >
                  Large (overflow)
                </button>
                <button
                  type="button"
                  class={`btn btn-sm ${datasetMode() === "small" ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setDatasetMode("small")}
                >
                  Small (no overflow)
                </button>
              </div>
              <div class="text-xs opacity-70">Viewport: {metrics().viewport}</div>
            </div>

            <div class="mt-3 grid gap-2 text-xs opacity-80 md:grid-cols-2">
              <div>Page overflow px: {metrics().pageOverflowPx}</div>
              <div>Table can scroll: {String(metrics().tableCanScroll)}</div>
              <div>Table client height: {metrics().tableClientHeight}</div>
              <div>Table scroll height: {metrics().tableScrollHeight}</div>
              <div>Table scroll top: {Math.round(metrics().tableScrollTop)}</div>
              <div>
                Footer expectation: visible and stable while table body scrolls
              </div>
            </div>
          </section>

          <section class="flex-1 min-h-0 rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
            <div
              ref={tableHostRef}
              class="h-full min-h-0"
            >
              <EnhancedTable
                class="w-full"
                data={activeData()}
                columns={columns}
                pagination={pagination}
                setPagination={setPagination}
                enablePagination
                paginationPosition="bottomRight"
                filterIcon={<span class="text-xs">F</span>}
                sortAscIcon={<span class="text-xs">↑</span>}
                sortDescIcon={<span class="text-xs">↓</span>}
                sortNeutralIcon={<span class="text-xs opacity-50">↕</span>}
              />
            </div>
          </section>
        </div>
      </main>

      <footer class="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-base-300 bg-base-100/95 px-6 backdrop-blur">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center text-sm opacity-70">
          Fixed footer boundary (dashboard chrome simulation).
        </div>
      </footer>
    </div>
  );
}
