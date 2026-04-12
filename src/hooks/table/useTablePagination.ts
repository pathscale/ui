import { createSignal, type Accessor } from "solid-js";
import type { OnChangeFn, PaginationState } from "@tanstack/solid-table";
import { resolveUpdater } from "./helpers";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export interface UseTablePaginationOptions {
  pagination?: Accessor<PaginationState>;
  setPagination?: OnChangeFn<PaginationState>;
  initialPagination?: PaginationState;
  pageSizeOptions?: readonly number[];
}

export interface UseTablePaginationResult {
  pagination: Accessor<PaginationState>;
  setPagination: OnChangeFn<PaginationState>;
  pageSizeOptions: Accessor<readonly number[]>;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  firstPage: () => void;
  previousPage: () => void;
  nextPage: (maxPageIndex: number) => void;
  lastPage: (maxPageIndex: number) => void;
}

export const useTablePagination = (
  options: UseTablePaginationOptions = {},
): UseTablePaginationResult => {
  const [internalPagination, setInternalPagination] = createSignal<PaginationState>(
    options.initialPagination ?? { pageIndex: 0, pageSize: 10 },
  );

  const pagination = () => options.pagination?.() ?? internalPagination();
  const pageSizeOptions = () => options.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

  const setPagination: OnChangeFn<PaginationState> = (updater) => {
    if (options.setPagination) {
      options.setPagination(updater);
      return;
    }
    setInternalPagination((prev) => resolveUpdater(prev, updater));
  };

  const setPageIndex = (index: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, index) }));
  };

  const setPageSize = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size }));
  };

  const firstPage = () => setPageIndex(0);
  const previousPage = () => setPageIndex(pagination().pageIndex - 1);
  const nextPage = (maxPageIndex: number) =>
    setPageIndex(Math.min(maxPageIndex, pagination().pageIndex + 1));
  const lastPage = (maxPageIndex: number) => setPageIndex(maxPageIndex);

  return {
    pagination,
    setPagination,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
    firstPage,
    previousPage,
    nextPage,
    lastPage,
  };
};
