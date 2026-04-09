import { For, Show, createMemo } from "solid-js";
import {
  Checkbox,
  Icon,
  Input,
  Pagination,
  Table,
  useTableExpansion,
  useTableFiltering,
  useTableModel,
  useTablePagination,
  useTableSelection,
  useTableSorting,
  type TableSortDescriptor,
} from "@pathscale/ui";
import { flexRender, type ColumnDef } from "@tanstack/solid-table";

type HookTableRow = {
  id: string;
  host: string;
  team: string;
  status: "Live" | "Review" | "Offline";
  sessions: number;
  region: string;
  summary: string;
};

const HOOK_TABLE_ROWS: HookTableRow[] = [
  {
    id: "nf-01",
    host: "Alex Rivera",
    team: "Studio Ops",
    status: "Live",
    sessions: 14,
    region: "Miami",
    summary: "Handling live guest routing and session checks for the morning block.",
  },
  {
    id: "nf-02",
    host: "Mia Chen",
    team: "Broadcast",
    status: "Review",
    sessions: 9,
    region: "Madrid",
    summary: "Reviewing camera preset sync and standby scene transitions.",
  },
  {
    id: "nf-03",
    host: "Noah Patel",
    team: "Studio Ops",
    status: "Live",
    sessions: 11,
    region: "Toronto",
    summary: "Monitoring session quality and guest readiness for remote recordings.",
  },
  {
    id: "nf-04",
    host: "Emma Lewis",
    team: "Support",
    status: "Offline",
    sessions: 4,
    region: "Lima",
    summary: "Offline while preparing help center updates for host onboarding.",
  },
  {
    id: "nf-05",
    host: "Lucas Vega",
    team: "Broadcast",
    status: "Review",
    sessions: 8,
    region: "Quito",
    summary: "Checking audio chain parity before the evening production window.",
  },
  {
    id: "nf-06",
    host: "Sofia Khan",
    team: "Studio Ops",
    status: "Live",
    sessions: 16,
    region: "Bogota",
    summary: "Running active room audits and flagging late join anomalies.",
  },
  {
    id: "nf-07",
    host: "Mateo Ruiz",
    team: "Support",
    status: "Offline",
    sessions: 3,
    region: "Austin",
    summary: "Offline while rotating credentials and support macros.",
  },
  {
    id: "nf-08",
    host: "Grace Kim",
    team: "Broadcast",
    status: "Live",
    sessions: 12,
    region: "Seoul",
    summary: "Managing active streaming cues and remote guest countdown timing.",
  },
];

const STATUS_TONE_CLASS_MAP: Record<HookTableRow["status"], string> = {
  Live: "bg-success/15 text-success",
  Review: "bg-warning/15 text-warning",
  Offline: "bg-base-300 text-base-content/70",
};

const getSortIconName = (direction: TableSortDescriptor["direction"] | undefined) => {
  if (direction === "ascending") return "icon-[lucide--arrow-up]";
  if (direction === "descending") return "icon-[lucide--arrow-down]";
  return "icon-[lucide--arrow-down-up]";
};

export const TableHooksExample = () => {
  const sorting = useTableSorting({
    initialSorting: [{ id: "sessions", desc: true }],
  });
  const pagination = useTablePagination({
    initialPagination: { pageIndex: 0, pageSize: 4 },
    pageSizeOptions: [4, 6, 8],
  });
  const selection = useTableSelection();
  const filtering = useTableFiltering();
  const expansion = useTableExpansion();

  const hostFilterValue = createMemo(() => {
    const filter = filtering.columnFilters().find((entry) => entry.id === "host");
    return typeof filter?.value === "string" ? filter.value : "";
  });

  const columns = createMemo<ColumnDef<HookTableRow>[]>(() => [
    {
      id: "select",
      enableSorting: false,
      enableColumnFilter: false,
      header: () => (
        <div class="flex justify-center">
          <Checkbox
            aria-label="Select all visible rows"
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
              table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              table.toggleAllPageRowsSelected(event.currentTarget.checked)
            }
          />
        </div>
      ),
      cell: ({ row }) => (
        <div class="flex justify-center">
          <Checkbox
            aria-label={`Select ${row.original.host}`}
            checked={row.getIsSelected()}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => row.toggleSelected(event.currentTarget.checked)}
          />
        </div>
      ),
    },
    {
      accessorKey: "host",
      id: "host",
      header: "Host",
      filterFn: "includesString",
      cell: ({ row }) => (
        <div class="space-y-1">
          <div class="font-medium">{row.original.host}</div>
          <div class="text-xs opacity-70">{row.original.region}</div>
        </div>
      ),
    },
    {
      accessorKey: "team",
      id: "team",
      header: "Team",
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          class={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE_CLASS_MAP[row.original.status]}`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "sessions",
      id: "sessions",
      header: "Sessions",
      cell: ({ getValue }) => <span class="font-mono text-sm">{getValue<number>()}</span>,
    },
    {
      id: "expand",
      enableSorting: false,
      enableColumnFilter: false,
      header: "",
      cell: ({ row }) => (
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-medium opacity-80 transition-opacity hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            row.toggleExpanded();
          }}
        >
          <Icon
            name={row.getIsExpanded() ? "icon-[lucide--chevron-up]" : "icon-[lucide--chevron-down]"}
            width={14}
            height={14}
          />
          {row.getIsExpanded() ? "Hide" : "Open"}
        </button>
      ),
    },
  ]);

  const table = useTableModel({
    data: HOOK_TABLE_ROWS,
    columns,
    sorting: sorting.sorting,
    setSorting: sorting.setSorting,
    columnFilters: filtering.columnFilters,
    setColumnFilters: filtering.setColumnFilters,
    pagination: pagination.pagination,
    setPagination: pagination.setPagination,
    rowSelection: selection.rowSelection,
    setRowSelection: selection.setRowSelection,
    expanded: expansion.expanded,
    setExpanded: expansion.setExpanded,
    enableSorting: true,
    enableFilters: true,
    enablePagination: true,
    enableRowSelection: true,
    enableExpanding: true,
    getRowCanExpand: () => true,
  });

  const filteredRowsCount = createMemo(() => table.getFilteredRowModel().rows.length);
  const currentRows = createMemo(() => table.getRowModel().rows);
  const pageCount = createMemo(() => Math.max(1, table.getPageCount()));
  const visibleColumnCount = createMemo(() => table.getVisibleLeafColumns().length);
  const selectedRowsCount = createMemo(() => table.getSelectedRowModel().rows.length);

  const rangeLabel = createMemo(() => {
    const total = filteredRowsCount();
    if (total === 0) return "No matching rows";

    const pageIndex = pagination.pagination().pageIndex;
    const pageSize = pagination.pagination().pageSize;
    const start = pageIndex * pageSize + 1;
    const end = start + currentRows().length - 1;
    return `Showing ${start}-${end} of ${total}`;
  });

  const handleSortChange = (descriptor: TableSortDescriptor) => {
    sorting.setSortDescriptor(descriptor);
  };

  const updateHostFilter = (value: string) => {
    filtering.setColumnFilters((previous) => {
      const next = previous.filter((entry) => entry.id !== "host");
      if (value.trim().length > 0) {
        next.push({ id: "host", value });
      }
      return next;
    });
    pagination.firstPage();
  };

  return (
    <section class="space-y-4 rounded-xl border border-base-300 bg-base-200 p-4">
      <div class="space-y-1">
        <h2 class="text-sm font-semibold">Table Hooks Example</h2>
        <p class="text-xs opacity-70">
          Direct usage of `useTable*` hooks with `Table` and `Pagination`, without
          `EnhancedTable`.
        </p>
      </div>

      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
        <Input
          label="Filter by host"
          value={hostFilterValue()}
          onInput={(event) => updateHostFilter(event.currentTarget.value)}
          placeholder="Search host name"
          helperText="Filtering is wired manually through useTableFiltering."
        />

        <label class="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] opacity-70">
          Rows
          <select
            class="rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm normal-case text-base-content"
            value={pagination.pagination().pageSize}
            onChange={(event) => {
              pagination.setPageSize(Number(event.currentTarget.value));
              pagination.firstPage();
            }}
          >
            <For each={pagination.pageSizeOptions()}>
              {(size) => <option value={size}>{size}</option>}
            </For>
          </select>
        </label>

        <div class="rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs">
          <div>{rangeLabel()}</div>
          <div class="opacity-70">{selectedRowsCount()} selected</div>
        </div>
      </div>

      <Table.Root>
        <Table.ScrollContainer>
          <Table.Content
            sortDescriptor={sorting.sortDescriptor()}
            onSortChange={handleSortChange}
          >
            <Table.Header>
              <For each={table.getHeaderGroups()}>
                {(headerGroup) => (
                  <Table.Row>
                    <For each={headerGroup.headers}>
                      {(header) => (
                        <Table.Column
                          id={header.column.id}
                          allowsSorting={header.column.getCanSort()}
                          style={{
                            width:
                              header.getSize() > 0 ? `${header.getSize()}px` : undefined,
                          }}
                        >
                          {({ sortDirection }) => {
                            if (header.isPlaceholder) return null;

                            return (
                              <div
                                class={
                                  header.column.getCanSort()
                                    ? "flex items-center justify-between gap-2"
                                    : "flex items-center gap-2"
                                }
                              >
                                <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                <Show when={header.column.getCanSort()}>
                                  <Icon
                                    name={getSortIconName(sortDirection)}
                                    width={14}
                                    height={14}
                                    class={sortDirection ? "opacity-80" : "opacity-45"}
                                  />
                                </Show>
                              </div>
                            );
                          }}
                        </Table.Column>
                      )}
                    </For>
                  </Table.Row>
                )}
              </For>
            </Table.Header>

            <Table.Body>
              <Show
                when={currentRows().length > 0}
                fallback={
                  <Table.Row>
                    <Table.Cell colSpan={visibleColumnCount()} class="py-10 text-center text-sm opacity-70">
                      No rows match the current filter.
                    </Table.Cell>
                  </Table.Row>
                }
              >
                <For each={currentRows()}>
                  {(row) => (
                    <>
                      <Table.Row
                        data-selected={row.getIsSelected() ? "true" : undefined}
                        class="cursor-pointer"
                        onClick={() => row.toggleSelected()}
                      >
                        <For each={row.getVisibleCells()}>
                          {(cell) => (
                            <Table.Cell>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>
                          )}
                        </For>
                      </Table.Row>

                      <Show when={row.getIsExpanded()}>
                        <Table.Row class="bg-base-200/50">
                          <Table.Cell colSpan={visibleColumnCount()}>
                            <div class="space-y-2 py-2">
                              <div class="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">
                                Expanded row content
                              </div>
                              <p class="text-sm">{row.original.summary}</p>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      </Show>
                    </>
                  )}
                </For>
              </Show>
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>

        <Table.Footer class="items-center justify-between gap-3">
          <div class="text-xs opacity-70">
            Sort: {sorting.sortDescriptor()?.column ?? "none"} /{" "}
            {sorting.sortDescriptor()?.direction ?? "none"}
          </div>

          <Pagination
            page={pagination.pagination().pageIndex + 1}
            total={pageCount()}
            onChange={(page) => pagination.setPageIndex(page - 1)}
          />
        </Table.Footer>
      </Table.Root>
    </section>
  );
};

