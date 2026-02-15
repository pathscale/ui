import type { ColumnDef, PaginationState } from "@tanstack/solid-table";
import { createSignal } from "solid-js";
import { EnhancedTable } from "../../src/components/table";

type DemoRow = {
  id: number;
  account: string;
  network: string;
  status: "Active" | "Pending" | "Paused";
  volume: number;
};

const tableData: DemoRow[] = Array.from({ length: 140 }, (_, index) => {
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

const columns: ColumnDef<DemoRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "network",
    header: "Network",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "volume",
    header: "Volume",
    cell: (context) => context.getValue<number>().toLocaleString("en-US"),
  },
];

export default function App() {
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  return (
    <div class="h-screen overflow-hidden bg-base-200 text-base-content">
      <header class="fixed inset-x-0 top-0 z-40 h-14 border-b border-base-300 bg-base-100/95 px-6 backdrop-blur">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
          <h1 class="text-sm font-semibold tracking-wide">
            EnhancedTable Pagination Overlay Test
          </h1>
          <span class="text-xs opacity-70">Viewport-bottom dropdown check</span>
        </div>
      </header>

      <main class="h-full px-6 pb-16 pt-16">
        <div class="mx-auto flex h-full w-full max-w-6xl flex-col">
          <div class="flex-1" />

          <section class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
            <p class="mb-3 text-sm opacity-80">
              Open the <strong>Rows per page</strong> menu near the fixed footer.
              The page should not gain global scroll and the footer should remain
              stable.
            </p>
            <EnhancedTable
              class="w-full"
              data={tableData}
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
          </section>
        </div>
      </main>

      <footer class="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-base-300 bg-base-100/95 px-6 backdrop-blur">
        <div class="mx-auto flex h-full w-full max-w-6xl items-center text-sm opacity-70">
          Fixed footer boundary (simulates app chrome).
        </div>
      </footer>
    </div>
  );
}
