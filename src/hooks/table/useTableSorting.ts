import { createMemo, createSignal, type Accessor } from "solid-js";
import type { OnChangeFn, SortingState } from "@tanstack/solid-table";
import { resolveUpdater, toSortDescriptor, toSortingState } from "./helpers";

export type HookSortDirection = "ascending" | "descending";

export type HookSortDescriptor = {
  column: string;
  direction: HookSortDirection;
};

export interface UseTableSortingOptions {
  sorting?: Accessor<SortingState>;
  setSorting?: OnChangeFn<SortingState>;
  initialSorting?: SortingState;
}

export interface UseTableSortingResult {
  sorting: Accessor<SortingState>;
  setSorting: OnChangeFn<SortingState>;
  sortDescriptor: Accessor<HookSortDescriptor | undefined>;
  setSortDescriptor: (descriptor: HookSortDescriptor) => void;
}

export const useTableSorting = (
  options: UseTableSortingOptions = {},
): UseTableSortingResult => {
  const [internalSorting, setInternalSorting] = createSignal<SortingState>(
    options.initialSorting ?? [],
  );

  const sorting = () => options.sorting?.() ?? internalSorting();

  const setSorting: OnChangeFn<SortingState> = (updater) => {
    if (options.setSorting) {
      options.setSorting(updater);
      return;
    }
    setInternalSorting((prev) => resolveUpdater(prev, updater));
  };

  const sortDescriptor = createMemo<HookSortDescriptor | undefined>(() => {
    return toSortDescriptor(sorting());
  });

  const setSortDescriptor = (descriptor: HookSortDescriptor) => {
    setSorting(toSortingState(descriptor));
  };

  return {
    sorting,
    setSorting,
    sortDescriptor,
    setSortDescriptor,
  };
};
