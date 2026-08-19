import type { JSX } from "@solidjs/web";
import {
  type Accessor,
  createMemo,
  createSignal,
  createStore,
  flush,
  getOwner,
} from "solid-js";

/**
 * The imperative grid model.
 *
 * Ported from vue3-ui's `DataGrid` class, keeping its verbs and their
 * positional shapes so a call site moves across unchanged:
 *
 * ```ts
 * const grid = createDataGrid();
 * grid.addColumn("id", "ID", "number");
 * grid.addRow({ id: 1, firstName: "John" });
 * ```
 *
 * Three things are deliberately different, and all three are the same bug.
 * In vue3 `searchColumn`, `sortByColumn` and `switchPage` each rewrite the
 * single `rows` array from `originalRows`, so any two of them compose by
 * destroying each other: paging after a search silently restores the rows the
 * search removed. Here `rows` is the source and everything downstream is
 * derived — `filteredRows` -> `sortedRows` -> `pageRows` — so the three
 * compose, and a search is no longer lost when the reader turns the page.
 *
 * Consequences of that, worth knowing before porting:
 * - `searchColumn` accumulates. Two columns can filter at once; vue3 could
 *   only ever hold the last query. `resetFilters()` clears all of them.
 * - `sortByColumn(name)` toggles and takes a direction rather than vue3's
 *   `ascendant: boolean`, because a bare `true` meaning "ascending" is the
 *   kind of parameter 2.2 spent the release removing.
 * - `switchPage(page)` takes the page. vue3's read a mutable field.
 * - `deleteRow(index)` indexes the source rows, not what is on screen.
 */

export type DataGridDataType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "custom";

export type DataGridRow = Record<string, unknown>;

export type DataGridSortDirection = "ascending" | "descending";

export type DataGridSort = {
  column: string;
  direction: DataGridSortDirection;
};

export type DataGridSelectionMode = "none" | "single" | "multiple";

export type DataGridCellContext<Row extends DataGridRow = DataGridRow> = {
  value: unknown;
  row: Row;
  column: DataGridColumn<Row>;
  index: number;
};

export type DataGridColumn<Row extends DataGridRow = DataGridRow> = {
  /** Key into the row. */
  name: string;
  /** Header text. vue3 called this `caption`, which collides with `<caption>`. */
  label: string;
  dataType: DataGridDataType;
  visible: boolean;
  sortable: boolean;
  searchable: boolean;
  sticky: boolean;
  width?: string;
  align?: "start" | "center" | "end";
  /** Required in practice for `dataType: "custom"`; nothing else reads a custom cell. */
  render?: (context: DataGridCellContext<Row>) => JSX.Element;
  /** Overrides the dataType's ordering. Receives the raw cell values. */
  compare?: (a: unknown, b: unknown) => number;
};

export type DataGridColumnOptions<Row extends DataGridRow = DataGridRow> =
  Partial<Omit<DataGridColumn<Row>, "name" | "label" | "dataType">>;

export type CreateDataGridOptions<Row extends DataGridRow = DataGridRow> = {
  columns?: readonly DataGridColumn<Row>[];
  rows?: readonly Row[];
  /** Stable identity for selection and keyed rendering. Defaults to `row.id`, then the index. */
  getRowId?: (row: Row, index: number) => string;
  /** Omit for no pagination. There is no separate `pagination` flag to disagree with it. */
  pageSize?: number;
  /** Omit for no checkbox column. Likewise no `checkable` flag. */
  selection?: DataGridSelectionMode;
  sort?: DataGridSort | null;
  groupBy?: string | null;
  /** Defaults for columns added later. */
  sortable?: boolean;
  searchable?: boolean;
};

export type DataGridModel<Row extends DataGridRow = DataGridRow> = {
  /* Builder. */
  addColumn(
    name: string,
    label: string,
    dataType?: DataGridDataType,
    options?: DataGridColumnOptions<Row>,
  ): void;
  removeColumn(name: string): void;
  addRow(row: Row, index?: number): void;
  deleteRow(index: number): void;
  setRows(rows: readonly Row[]): void;

  /* Columns. */
  columns: Accessor<DataGridColumn<Row>[]>;
  visibleColumns: Accessor<DataGridColumn<Row>[]>;
  columnsByName: Accessor<Record<string, DataGridColumn<Row>>>;
  toggleColumn(name: string, visible?: boolean): void;

  /* Rows, and the derivation over them. */
  rows: Accessor<Row[]>;
  filteredRows: Accessor<Row[]>;
  sortedRows: Accessor<Row[]>;
  pageRows: Accessor<Row[]>;
  rowId(row: Row, index: number): string;

  /* Sorting. */
  sort: Accessor<DataGridSort | null>;
  setSort(sort: DataGridSort | null): void;
  sortByColumn(name: string, direction?: DataGridSortDirection): void;

  /* Searching. */
  queries: Accessor<Record<string, string>>;
  searchColumn(name: string, query: string): void;
  resetFilters(): void;
  filterRows(name: string, value: unknown): Row[];

  /* Pagination. */
  page: Accessor<number>;
  pageSize: Accessor<number>;
  pageCount: Accessor<number>;
  total: Accessor<number>;
  switchPage(page: number): void;
  setPageSize(size: number): void;

  /* Selection. */
  selectionMode: Accessor<DataGridSelectionMode>;
  selectedIds: Accessor<ReadonlySet<string>>;
  selectedRows: Accessor<Row[]>;
  isSelected(row: Row, index: number): boolean;
  toggleCheck(row: Row, index: number, selected?: boolean): void;
  toggleCheckAll(selected: boolean): void;

  /* Grouping. */
  groupBy: Accessor<string | null>;
  setGroupBy(name: string | null): void;
  /** Distinct values in a column, in first-seen order. vue3 returned an unordered Set. */
  groups(name: string): unknown[];
  groupedRows: Accessor<{ value: unknown; rows: Row[] }[]>;
};

/* A memo needs an owner. `const grid = createDataGrid()` at module scope has
   none, and Solid warns rather than failing, so the grid would keep working
   while logging on every import. Falling back to the raw thunk keeps it quiet
   and correct; only the caching is lost. */
const derive = <T>(fn: () => T): Accessor<T> =>
  getOwner() ? createMemo(fn) : fn;

const compareValues = (
  a: unknown,
  b: unknown,
  dataType: DataGridDataType,
): number => {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;

  if (dataType === "number") return Number(a) - Number(b);
  if (dataType === "boolean") return Number(Boolean(a)) - Number(Boolean(b));
  if (dataType === "date") {
    return (
      new Date(a as string | number | Date).getTime() -
      new Date(b as string).getTime()
    );
  }
  return String(a).localeCompare(String(b));
};

const matches = (value: unknown, query: string): boolean => {
  if (value === null || value === undefined) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
};

export function createDataGrid<Row extends DataGridRow = DataGridRow>(
  options: CreateDataGridOptions<Row> = {},
): DataGridModel<Row> {
  const columnDefaults = {
    sortable: options.sortable ?? true,
    searchable: options.searchable ?? false,
  };

  /*
   * Every write below is followed by a flush, and that is the model's contract
   * rather than a workaround.
   *
   * Solid 2 batches signal writes and flushes them on a microtask, so a read in
   * the same tick still sees the previous value. This grid is imperative by
   * design - `addColumn(...)` then `columns()`, `sortByColumn(...)` then
   * `sort()` - and its whole API is call-then-read. Deferring that by a tick
   * would make `grid.addRow(r)` followed by `grid.rows()` return the rows from
   * before the call, which is not a thing a caller can reason about.
   *
   * Wrapped once here so no individual method has to remember.
   */
  const settled =
    <A extends unknown[]>(write: (...args: A) => void) =>
    (...args: A): void => {
      write(...args);
      flush();
    };

  const [columnStore, writeColumnStore] = createStore<{
    items: DataGridColumn<Row>[];
  }>({
    items: [...(options.columns ?? [])],
  });
  const setColumnStore = settled(writeColumnStore);

  const [rowStore, writeRowStore] = createStore<{ items: Row[] }>({
    items: [...(options.rows ?? [])],
  });
  const setRowStore = settled(writeRowStore);

  const [sort, writeSortSignal] = createSignal<DataGridSort | null>(
    options.sort ?? null,
  );
  const writeSort = settled(writeSortSignal);
  const [queries, writeQueries] = createSignal<Record<string, string>>({});
  const setQueries = settled(writeQueries);
  const [page, writePage] = createSignal(0);
  const setPage = settled(writePage);
  const [pageSize, writePageSize] = createSignal(options.pageSize ?? 0);
  const setPageSize = settled(writePageSize);
  const [selectedIds, writeSelectedIds] = createSignal<ReadonlySet<string>>(
    new Set<string>(),
  );
  const setSelectedIds = settled(writeSelectedIds);
  const [groupBy, writeGroupBy] = createSignal<string | null>(
    options.groupBy ?? null,
  );
  const setGroupBy = settled(writeGroupBy);

  const selectionMode = () => options.selection ?? "none";

  const identify = (row: Row, index: number): string => {
    if (options.getRowId) return options.getRowId(row, index);
    const own = row.id;
    return own === null || own === undefined ? String(index) : String(own);
  };

  /* Identity has to be assigned from the *source* order. Deriving it from the
     index a row happens to sit at on screen means the second page reuses the
     first page's ids, and a selection made before a sort belongs to different
     rows after it. */
  const idByRow = derive(() => {
    const map = new Map<Row, string>();
    rowStore.items.forEach((row, index) => map.set(row, identify(row, index)));
    return map;
  });

  const rowId = (row: Row, index: number): string =>
    idByRow().get(row) ?? identify(row, index);

  const columns = derive(() => columnStore.items);
  const visibleColumns = derive(() =>
    columnStore.items.filter((column) => column.visible),
  );
  const columnsByName = derive(() =>
    Object.fromEntries(
      columnStore.items.map((column) => [column.name, column]),
    ),
  );

  const rows = derive(() => rowStore.items);

  const filteredRows = derive(() => {
    const active = Object.entries(queries()).filter(
      ([, query]) => query.length > 0,
    );
    if (active.length === 0) return rowStore.items;
    return rowStore.items.filter((row) =>
      active.every(([name, query]) => matches(row[name], query)),
    );
  });

  const sortedRows = derive(() => {
    const descriptor = sort();
    if (!descriptor) return filteredRows();
    const column = columnStore.items.find(
      (item) => item.name === descriptor.column,
    );
    if (!column) return filteredRows();
    const sign = descriptor.direction === "ascending" ? 1 : -1;
    const compare =
      column.compare ??
      ((a: unknown, b: unknown) => compareValues(a, b, column.dataType));
    /* Copy first: `filteredRows` may be the store's own array when nothing is
       filtered, and sorting in place would mutate it outside a setter. */
    return [...filteredRows()].sort(
      (a, b) => sign * compare(a[column.name], b[column.name]),
    );
  });

  const total = derive(() => filteredRows().length);

  const pageCount = derive(() => {
    const size = pageSize();
    if (size <= 0) return 1;
    return Math.max(1, Math.ceil(total() / size));
  });

  const pageRows = derive(() => {
    const size = pageSize();
    if (size <= 0) return sortedRows();
    const start = page() * size;
    return sortedRows().slice(start, start + size);
  });

  const selectedRows = derive(() => {
    const ids = selectedIds();
    return rowStore.items.filter((row, index) => ids.has(rowId(row, index)));
  });

  const groupedRows = derive(() => {
    const name = groupBy();
    if (!name) return [{ value: undefined, rows: pageRows() }];
    const buckets = new Map<unknown, Row[]>();
    for (const row of pageRows()) {
      const value = row[name];
      const bucket = buckets.get(value);
      if (bucket) bucket.push(row);
      else buckets.set(value, [row]);
    }
    return [...buckets].map(([value, groupRows]) => ({
      value,
      rows: groupRows,
    }));
  });

  return {
    addColumn(name, label, dataType = "string", columnOptions = {}) {
      setColumnStore((store) => {
        store.items.push({
          name,
          label,
          dataType,
          visible: true,
          sticky: false,
          ...columnDefaults,
          ...columnOptions,
        } as DataGridColumn<Row>);
      });
    },

    removeColumn(name) {
      setColumnStore((store) => {
        store.items = store.items.filter((column) => column.name !== name);
      });
    },

    addRow(row, index) {
      setRowStore((store) => {
        if (index === undefined) store.items.push(row);
        else store.items.splice(index, 0, row);
      });
    },

    deleteRow(index) {
      setRowStore((store) => {
        store.items.splice(index, 1);
      });
    },

    setRows(next) {
      setRowStore((store) => {
        store.items = [...next];
      });
    },

    columns,
    visibleColumns,
    columnsByName,

    toggleColumn(name, visible) {
      setColumnStore((store) => {
        store.items = store.items.map((column) =>
          column.name === name
            ? { ...column, visible: visible ?? !column.visible }
            : column,
        );
      });
    },

    rows,
    filteredRows,
    sortedRows,
    pageRows,
    rowId,

    sort,

    /* Re-sorting returns the reader to the first page. The total has not
       changed, so the page still exists, but "sort by age" means "show me the
       youngest" and leaving them on page three shows them the middle. */
    setSort(next) {
      writeSort(next);
      setPage(0);
    },

    sortByColumn(name, direction) {
      const current = sort();
      const apply = (next: DataGridSort | null) => {
        writeSort(next);
        setPage(0);
      };
      if (direction) {
        apply({ column: name, direction });
        return;
      }
      /* No direction given: cycle ascending -> descending -> unsorted, so the
         same header click can put the grid back the way it was found. */
      if (!current || current.column !== name) {
        apply({ column: name, direction: "ascending" });
        return;
      }
      apply(
        current.direction === "ascending"
          ? { column: name, direction: "descending" }
          : null,
      );
    },

    queries,

    searchColumn(name, query) {
      setQueries((previous) => ({ ...previous, [name]: query }));
      setPage(0);
    },

    resetFilters() {
      setQueries({});
      setPage(0);
    },

    filterRows(name, value) {
      return rowStore.items.filter((row) => row[name] === value);
    },

    page,
    pageSize,
    pageCount,
    total,

    switchPage(next) {
      setPage(Math.min(Math.max(next, 0), pageCount() - 1));
    },

    setPageSize(size) {
      setPageSize(size);
      setPage(0);
    },

    selectionMode,
    selectedIds,
    selectedRows,

    isSelected(row, index) {
      return selectedIds().has(rowId(row, index));
    },

    toggleCheck(row, index, selected) {
      const id = rowId(row, index);
      setSelectedIds((previous) => {
        const shouldSelect = selected ?? !previous.has(id);
        if (selectionMode() === "single") {
          return shouldSelect ? new Set([id]) : new Set<string>();
        }
        const next = new Set(previous);
        if (shouldSelect) next.add(id);
        else next.delete(id);
        return next;
      });
    },

    toggleCheckAll(selected) {
      if (!selected) {
        setSelectedIds(new Set<string>());
        return;
      }
      /* Every row the reader can currently see, not every row in the grid: a
         "select all" that quietly takes filtered-out rows with it is how you
         delete records nobody looked at. */
      setSelectedIds(
        new Set(pageRows().map((row, index) => rowId(row, index))),
      );
    },

    groupBy,
    setGroupBy,

    groups(name) {
      const seen: unknown[] = [];
      const known = new Set<unknown>();
      for (const row of rowStore.items) {
        const value = row[name];
        if (value === null || value === undefined) continue;
        if (known.has(value)) continue;
        known.add(value);
        seen.push(value);
      }
      return seen;
    },

    groupedRows,
  };
}
