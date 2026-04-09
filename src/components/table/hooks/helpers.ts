import type { Accessor } from "solid-js";
import type { Updater } from "@tanstack/solid-table";

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
