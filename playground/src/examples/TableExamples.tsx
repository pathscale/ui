import { For, Show, createMemo, createSignal, type JSX } from "solid-js";
import {
  Button,
  Icon,
  Loading,
  Pagination,
  Table,
  type TableSortDescriptor,
} from "@pathscale/ui";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Updater,
} from "@tanstack/solid-table";

type DemoRow = {
  id: number;
  name: string;
  role: string;
  status: "Active" | "Idle" | "Offline";
  location: string;
};

const DEMO_ROWS: DemoRow[] = [
  { id: 1, name: "Alex Rivera", role: "Designer", status: "Active", location: "NYC" },
  { id: 2, name: "Sam Carter", role: "Engineer", status: "Idle", location: "Berlin" },
  { id: 3, name: "Mia Chen", role: "Product", status: "Offline", location: "Madrid" },
  { id: 4, name: "Noah Patel", role: "Engineer", status: "Active", location: "Toronto" },
  { id: 5, name: "Emma Lewis", role: "Support", status: "Active", location: "Lima" },
  { id: 6, name: "Lucas Vega", role: "Designer", status: "Idle", location: "Quito" },
  { id: 7, name: "Sofia Khan", role: "Product", status: "Active", location: "Miami" },
  { id: 8, name: "Mateo Ruiz", role: "Support", status: "Offline", location: "Bogota" },
];

const STATUS_CLASS_MAP: Record<DemoRow["status"], string> = {
  Active: "text-success",
  Idle: "text-warning",
  Offline: "opacity-70",
};

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

type ExampleCardProps = {
  title: string;
  description: string;
  children: JSX.Element;
};

const ExampleCard = (props: ExampleCardProps) => (
  <section class="space-y-3 rounded-xl border border-base-300 bg-base-200 p-4">
    <div>
      <h3 class="text-sm font-semibold">{props.title}</h3>
      <p class="text-xs opacity-70">{props.description}</p>
    </div>
    {props.children}
  </section>
);

const BasicTableExample = () => (
  <ExampleCard title="1. Basic Table" description="Static data with header/body only.">
    <Table.Root>
      <Table.ScrollContainer>
        <Table.Content>
          <Table.Header>
            <Table.Row>
              <Table.Column id="name">Name</Table.Column>
              <Table.Column id="role">Role</Table.Column>
              <Table.Column id="status">Status</Table.Column>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <For each={DEMO_ROWS.slice(0, 4)}>
              {(row) => (
                <Table.Row>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.role}</Table.Cell>
                  <Table.Cell>{row.status}</Table.Cell>
                </Table.Row>
              )}
            </For>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  </ExampleCard>
);

const VariantExample = () => (
  <ExampleCard
    title="2. Variants"
    description="Primary + secondary variants, including selected rows and usage-level striped rows."
  >
    <div class="space-y-4">
      <Table.Root variant="primary">
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Row>
                <Table.Column id="name">Name</Table.Column>
                <Table.Column id="role">Role</Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={DEMO_ROWS.slice(0, 3)}>
                {(row) => (
                  <Table.Row data-selected={row.id === 2 ? "true" : undefined}>
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell>{row.role}</Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>

      <Table.Root variant="secondary">
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Row>
                <Table.Column id="name">Name</Table.Column>
                <Table.Column id="location">Location</Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={DEMO_ROWS.slice(3, 6)}>
                {(row) => (
                  <Table.Row data-selected={row.id === 4 ? "true" : undefined}>
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell>{row.location}</Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>

      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Row>
                <Table.Column id="name">Name</Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="status">Status</Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={DEMO_ROWS.slice(0, 4)}>
                {(row, index) => (
                  <Table.Row class={index() % 2 === 1 ? "bg-base-200/60" : undefined}>
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell>{row.role}</Table.Cell>
                    <Table.Cell>{row.status}</Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>
    </div>
  </ExampleCard>
);

const SelectableRowsExample = () => {
  const [selectedId, setSelectedId] = createSignal<number | null>(null);

  return (
    <ExampleCard
      title="3. Selectable Rows"
      description="Single selection managed in usage; clicking a row toggles selected state."
    >
      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Row>
                <Table.Column id="name">Name</Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="status">Status</Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={DEMO_ROWS.slice(0, 5)}>
                {(row) => {
                  const isSelected = () => selectedId() === row.id;

                  return (
                    <Table.Row
                      data-selected={isSelected() ? "true" : undefined}
                      onClick={() => setSelectedId((prev) => (prev === row.id ? null : row.id))}
                      class="cursor-pointer"
                    >
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>{row.role}</Table.Cell>
                      <Table.Cell class={STATUS_CLASS_MAP[row.status]}>{row.status}</Table.Cell>
                    </Table.Row>
                  );
                }}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>
      <p class="text-xs opacity-70">Selected row id: {selectedId() ?? "none"}</p>
    </ExampleCard>
  );
};

const ControlledSelectionExample = () => {
  const [selectedIds, setSelectedIds] = createSignal<Set<number>>(new Set([2, 4]));

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedText = createMemo(() => {
    const values = [...selectedIds()].sort((a, b) => a - b);
    return values.length ? values.join(", ") : "none";
  });

  return (
    <ExampleCard
      title="4. Controlled Selection"
      description="Selection state is controlled externally and reflected by the table."
    >
      <div class="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setSelectedIds(new Set([1, 3, 5]))}>
          Apply Preset
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setSelectedIds(new Set())}>
          Clear Selection
        </Button>
      </div>
      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Row>
                <Table.Column id="name">Name</Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="location">Location</Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={DEMO_ROWS}>
                {(row) => (
                  <Table.Row
                    data-selected={selectedIds().has(row.id) ? "true" : undefined}
                    onClick={() => toggleSelection(row.id)}
                    class="cursor-pointer"
                  >
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell>{row.role}</Table.Cell>
                    <Table.Cell>{row.location}</Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>
      <p class="text-xs opacity-70">Externally selected ids: {selectedText()}</p>
    </ExampleCard>
  );
};

const ManualSortingExample = () => {
  const [sortDescriptor, setSortDescriptor] = createSignal<TableSortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const sortedRows = createMemo(() => {
    const { column, direction } = sortDescriptor();
    const order = direction === "ascending" ? 1 : -1;
    return [...DEMO_ROWS].sort((a, b) => {
      const left = String(a[column]).toLowerCase();
      const right = String(b[column]).toLowerCase();
      if (left < right) return -1 * order;
      if (left > right) return 1 * order;
      return 0;
    });
  });

  return (
    <ExampleCard
      title="5. Sorting (Manual)"
      description="Sorting state is managed outside the Table component; headers are clickable usage-level controls."
    >
      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content
            sortDescriptor={sortDescriptor()}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              <Table.Row>
                <Table.Column
                  id="name"
                  allowsSorting
                >
                  {({ sortDirection }) => (
                    <span class="flex items-center gap-2">
                      Name <SortIndicator direction={sortDirection} />
                    </span>
                  )}
                </Table.Column>
                <Table.Column
                  id="role"
                  allowsSorting
                >
                  {({ sortDirection }) => (
                    <span class="flex items-center gap-2">
                      Role <SortIndicator direction={sortDirection} />
                    </span>
                  )}
                </Table.Column>
                <Table.Column
                  id="status"
                  allowsSorting
                >
                  {({ sortDirection }) => (
                    <span class="flex items-center gap-2">
                      Status <SortIndicator direction={sortDirection} />
                    </span>
                  )}
                </Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <For each={sortedRows()}>
                {(row) => (
                  <Table.Row>
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell>{row.role}</Table.Cell>
                    <Table.Cell>{row.status}</Table.Cell>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>
    </ExampleCard>
  );
};

const LoadingStateExample = () => {
  const [isLoading, setIsLoading] = createSignal(false);

  const simulateLoad = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
    }, 900);
  };

  return (
    <ExampleCard
      title="6. Loading State"
      description="Usage-level loading handling with a loading row while data is fetching."
    >
      <Button size="sm" variant="secondary" onClick={simulateLoad}>
        Simulate Loading
      </Button>
      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content>
            <Table.Header>
              <Table.Row>
                <Table.Column id="name">Name</Table.Column>
                <Table.Column id="role">Role</Table.Column>
                <Table.Column id="status">Status</Table.Column>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Show
                when={isLoading()}
                fallback={
                  <For each={DEMO_ROWS.slice(0, 3)}>
                    {(row) => (
                      <Table.Row>
                        <Table.Cell>{row.name}</Table.Cell>
                        <Table.Cell>{row.role}</Table.Cell>
                        <Table.Cell>{row.status}</Table.Cell>
                      </Table.Row>
                    )}
                  </For>
                }
              >
                <Table.Row>
                  <Table.Cell colSpan={3}>
                    <div class="flex items-center justify-center gap-2 py-2">
                      <Loading variant="spinner" size="md" color="accent" />
                      <span class="text-sm opacity-70">Loading rows...</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              </Show>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table.Root>
    </ExampleCard>
  );
};

const EmptyStateExample = () => (
  <ExampleCard
    title="7. Empty State"
    description="No data case rendered directly in the table body."
  >
    <Table.Root>
      <Table.ScrollContainer>
        <Table.Content>
          <Table.Header>
            <Table.Row>
              <Table.Column id="name">Name</Table.Column>
              <Table.Column id="role">Role</Table.Column>
              <Table.Column id="status">Status</Table.Column>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={3}>
                <div class="py-2 text-center text-sm opacity-70">
                  No records found.
                </div>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  </ExampleCard>
);

const LoadMoreExample = () => {
  const [visibleCount, setVisibleCount] = createSignal(3);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [pageIndex, setPageIndex] = createSignal(0);
  const pageSize = 3;

  const visibleRows = createMemo(() => DEMO_ROWS.slice(0, visibleCount()));
  const pageCount = createMemo(() => Math.max(1, Math.ceil(DEMO_ROWS.length / pageSize)));
  const paginatedRows = createMemo(() => {
    const start = pageIndex() * pageSize;
    return DEMO_ROWS.slice(start, start + pageSize);
  });
  const hasMore = () => visibleCount() < DEMO_ROWS.length;

  const loadMoreRows = () => {
    if (!hasMore() || loadingMore()) return;
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 2, DEMO_ROWS.length));
      setLoadingMore(false);
    }, 700);
  };

  return (
    <ExampleCard
      title="8. Pagination + Load More"
      description="Manual pagination and load-more patterns implemented externally while Table stays UI-only."
    >
      <div class="space-y-4">
        <Table.Root>
          <Table.ScrollContainer>
            <Table.Content>
              <Table.Header>
                <Table.Row>
                  <Table.Column id="name">Name</Table.Column>
                  <Table.Column id="role">Role</Table.Column>
                  <Table.Column id="location">Location</Table.Column>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <For each={paginatedRows()}>
                  {(row) => (
                    <Table.Row>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>{row.role}</Table.Cell>
                      <Table.Cell>{row.location}</Table.Cell>
                    </Table.Row>
                  )}
                </For>
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer class="justify-between">
            <Pagination
              page={pageIndex() + 1}
              total={pageCount()}
              onChange={(page) => setPageIndex(page - 1)}
            />
          </Table.Footer>
        </Table.Root>

        <Table.Root>
          <Table.ScrollContainer>
            <Table.Content>
              <Table.Header>
                <Table.Row>
                  <Table.Column id="name">Name</Table.Column>
                  <Table.Column id="role">Role</Table.Column>
                  <Table.Column id="location">Location</Table.Column>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <For each={visibleRows()}>
                  {(row) => (
                    <Table.Row>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>{row.role}</Table.Cell>
                      <Table.Cell>{row.location}</Table.Cell>
                    </Table.Row>
                  )}
                </For>
                <Show when={hasMore()}>
                  <Table.LoadMore>
                    <Table.Cell colSpan={3}>
                      <Table.LoadMoreContent>
                        <Button size="sm" variant="secondary" onClick={loadMoreRows} isPending={loadingMore()}>
                          {loadingMore() ? "Loading..." : "Load more"}
                        </Button>
                      </Table.LoadMoreContent>
                    </Table.Cell>
                  </Table.LoadMore>
                </Show>
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table.Root>
      </div>
      <p class="text-xs opacity-70">Load more: {visibleRows().length} / {DEMO_ROWS.length} rows</p>
    </ExampleCard>
  );
};

const TanStackIntegrationExample = () => {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });

  const columns: ColumnDef<DemoRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const value = info.getValue() as DemoRow["status"];
        return <span class={STATUS_CLASS_MAP[value]}>{value}</span>;
      },
    },
  ];

  const onSortingChange = (updater: Updater<SortingState>) => {
    setSorting((prev) => (typeof updater === "function" ? updater(prev) : updater));
  };

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((prev) => (typeof updater === "function" ? updater(prev) : updater));
  };

  const tanStackSortDescriptor = createMemo<TableSortDescriptor | undefined>(() => {
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
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const table = createSolidTable({
    get data() {
      return DEMO_ROWS;
    },
    get columns() {
      return columns;
    },
    state: {
      get sorting() {
        return sorting();
      },
      get pagination() {
        return pagination();
      },
    },
    onSortingChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <ExampleCard
      title="9. TanStack Integration"
      description="TanStack is used as the data layer and mapped into Table slots at usage level."
    >
      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content
            sortDescriptor={tanStackSortDescriptor()}
            onSortChange={handleTableSortChange}
          >
            <Table.Header>
              <For each={table.getHeaderGroups()}>
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
            <Table.Body>
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <Table.Row>
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <Table.Cell>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Table.Cell>
                      )}
                    </For>
                  </Table.Row>
                )}
              </For>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer class="justify-between">
          <Pagination
            page={pagination().pageIndex + 1}
            total={Math.max(1, table.getPageCount())}
            onChange={(page) =>
              setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
            }
          />
        </Table.Footer>
      </Table.Root>
      <p class="text-xs opacity-70">
        Sorting state: {JSON.stringify(sorting())} | Page: {pagination().pageIndex + 1}
      </p>
    </ExampleCard>
  );
};

const GapAnalysis = () => (
  <section class="space-y-2 rounded-xl border border-base-300 bg-base-200 p-4">
    <h3 class="text-sm font-semibold">Current Gaps vs HeroUI</h3>
    <ul class="list-disc space-y-1 pl-5 text-xs opacity-80">
      <li>Keyboard navigation and focus management are usage-level today, not built into Table.</li>
      <li>Selection helpers and selection behavior are external state patterns, not first-class Table APIs.</li>
      <li>Sorting is now controlled via Table.Content, but multi-column sort orchestration remains external.</li>
      <li>Column resizing has visual primitives but no built-in drag/resizing behavior yet.</li>
      <li>Pagination and load-more are composed manually; no native helper API exists in Table.</li>
    </ul>
  </section>
);

export const TableExamples = () => (
  <section class="space-y-4 rounded-xl border border-base-300 bg-base-100 p-4">
    <div class="space-y-1">
      <h2 class="text-lg font-semibold">Table Examples</h2>
      <p class="text-sm opacity-70">
        HeroUI-inspired usage scenarios implemented in playground with Table as UI layer.
      </p>
    </div>

    <BasicTableExample />
    <VariantExample />
    <SelectableRowsExample />
    <ControlledSelectionExample />
    <ManualSortingExample />
    <LoadingStateExample />
    <EmptyStateExample />
    <LoadMoreExample />
    <TanStackIntegrationExample />
    <GapAnalysis />
  </section>
);
