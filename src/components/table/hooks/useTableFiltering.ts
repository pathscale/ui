import { createMemo, createSignal, type Accessor, type JSX } from "solid-js";
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
  getColumnFilterValue: (columnId: string) => string;
  setColumnFilterValue: (columnId: string, value: string) => void;
  getColumnFilterProps: (
    columnId: string,
    options?: {
      afterChange?: (value: string) => void;
    },
  ) => {
    readonly value: string;
    onInput: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>;
    onChange: JSX.EventHandler<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
      Event
    >;
  };
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

  const getColumnFilterValue = (columnId: string) => {
    const filter = columnFilters().find((entry) => entry.id === columnId);
    return typeof filter?.value === "string" ? filter.value : "";
  };

  const setColumnFilterValue = (columnId: string, value: string) => {
    setColumnFilters((previous) => {
      const next = previous.filter((entry) => entry.id !== columnId);
      if (value.trim().length > 0) {
        next.push({ id: columnId, value });
      }
      return next;
    });
  };

  const getColumnFilterProps = (
    columnId: string,
    bindingOptions?: {
      afterChange?: (value: string) => void;
    },
  ) => {
    const applyValue = (value: string) => {
      setColumnFilterValue(columnId, value);
      bindingOptions?.afterChange?.(value);
    };

    return {
      get value() {
        return getColumnFilterValue(columnId);
      },
      onInput: (event: InputEvent & {
        currentTarget: HTMLInputElement | HTMLTextAreaElement;
        target: Element;
      }) => {
        applyValue(event.currentTarget.value);
      },
      onChange: (event: Event & {
        currentTarget: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        target: Element;
      }) => {
        applyValue(event.currentTarget.value);
      },
    };
  };

  const anyFilterActive = createMemo(() => columnFilters().length > 0);

  return {
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    getColumnFilterValue,
    setColumnFilterValue,
    getColumnFilterProps,
    openFilterFor,
    closeFilter,
    toggleFilter,
    anyFilterActive,
  };
};
