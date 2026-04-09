import { createMemo, createSignal, type Accessor } from "solid-js";
import type {
  ColumnFiltersState,
  OnChangeFn,
} from "@tanstack/solid-table";
import { resolveUpdater } from "./helpers";

export interface UseTableFilteringOptions {
  columnFilters?: Accessor<ColumnFiltersState>;
  setColumnFilters?: OnChangeFn<ColumnFiltersState>;
  initialColumnFilters?: ColumnFiltersState;
  globalFilter?: Accessor<string>;
  setGlobalFilter?: OnChangeFn<string>;
  initialGlobalFilter?: string;
}

export interface UseTableFilteringResult {
  columnFilters: Accessor<ColumnFiltersState>;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  globalFilter: Accessor<string>;
  setGlobalFilter: OnChangeFn<string>;
  openFilterFor: Accessor<string | null>;
  closeFilter: () => void;
  toggleFilter: (columnId: string) => void;
  anyFilterActive: Accessor<boolean>;
}

export const useTableFiltering = (
  options: UseTableFilteringOptions = {},
): UseTableFilteringResult => {
  const [internalColumnFilters, setInternalColumnFilters] =
    createSignal<ColumnFiltersState>(options.initialColumnFilters ?? []);
  const [internalGlobalFilter, setInternalGlobalFilter] = createSignal(
    options.initialGlobalFilter ?? "",
  );
  const [openFilterFor, setOpenFilterFor] = createSignal<string | null>(null);

  const columnFilters = () =>
    options.columnFilters?.() ?? internalColumnFilters();
  const globalFilter = () => options.globalFilter?.() ?? internalGlobalFilter();

  const setColumnFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    if (options.setColumnFilters) {
      options.setColumnFilters(updater);
      return;
    }
    setInternalColumnFilters((prev) => resolveUpdater(prev, updater));
  };

  const setGlobalFilter: OnChangeFn<string> = (updater) => {
    if (options.setGlobalFilter) {
      options.setGlobalFilter(updater);
      return;
    }
    setInternalGlobalFilter((prev) => resolveUpdater(prev, updater));
  };

  const closeFilter = () => setOpenFilterFor(null);
  const toggleFilter = (columnId: string) => {
    setOpenFilterFor((current) => (current === columnId ? null : columnId));
  };

  const anyFilterActive = createMemo(() => columnFilters().length > 0);

  return {
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    openFilterFor,
    closeFilter,
    toggleFilter,
    anyFilterActive,
  };
};
