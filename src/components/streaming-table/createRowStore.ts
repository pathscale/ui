import { createSignal } from "solid-js";

export interface RowStore<T> {
  id: string;
  data: () => T;
  patch: (partial: Partial<T>) => void;
  replace: (newData: T) => void;
}

export function createRowStore<T>(id: string, initial: T): RowStore<T> {
  const [data, setData] = createSignal<T>(initial);

  return {
    id,
    data,
    patch: (partial) => {
      setData((prev) => ({ ...prev, ...partial }));
    },
    replace: (newData) => {
      setData(() => newData);
    },
  };
}
