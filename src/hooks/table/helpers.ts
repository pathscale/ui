import type { Accessor } from "solid-js";
import type { SortingState, Updater } from "@tanstack/solid-table";
import type { HookSortDescriptor } from "./useTableSorting";

export const resolveUpdater = <T>(previous: T, updater: Updater<T>): T => {
  if (typeof updater === "function") {
    return (updater as (prev: T) => T)(previous);
  }
  return updater;
};

export const asAccessor = <T>(value: Accessor<T> | T): Accessor<T> => {
  if (typeof value === "function") {
    return value as Accessor<T>;
  }
  return () => value;
};

export const toSortDescriptor = (
  sorting: SortingState,
): HookSortDescriptor | undefined => {
  const activeSort = sorting[0];
  if (!activeSort) return undefined;

  return {
    column: activeSort.id,
    direction: activeSort.desc ? "descending" : "ascending",
  };
};

export const toSortingState = (
  descriptor: HookSortDescriptor | undefined,
): SortingState => {
  if (!descriptor) return [];

  return [
    {
      id: descriptor.column,
      desc: descriptor.direction === "descending",
    },
  ];
};
