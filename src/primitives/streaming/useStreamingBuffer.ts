import { createSignal, type Accessor } from "solid-js";

export type StreamingBufferStrategy = "append" | "upsert" | "replace";

export interface UseStreamingBufferOptions<T> {
  strategy: StreamingBufferStrategy;
  maxSize?: number;
  getKey: (row: T) => string;
  initialData?: T[];
}

export interface UseStreamingBufferResult<T> {
  rows: Accessor<T[]>;
  add: (row: T) => void;
  set: (rows: T[]) => void;
  reset: () => void;
}

const normalizeMaxSize = (value?: number): number | undefined => {
  if (value == null || !Number.isFinite(value)) return undefined;
  if (value <= 0) return undefined;
  return Math.floor(value);
};

const buildKeyIndex = <T>(rows: T[], getKey: (row: T) => string) => {
  const index = new Map<string, number>();
  rows.forEach((row, rowIndex) => {
    index.set(getKey(row), rowIndex);
  });
  return index;
};

export const useStreamingBuffer = <T>(
  options: UseStreamingBufferOptions<T>,
): UseStreamingBufferResult<T> => {
  const maxSize = normalizeMaxSize(options.maxSize);
  let keyToIndex = new Map<string, number>();

  const capRows = (rows: T[]) => {
    if (maxSize == null || rows.length <= maxSize) return rows;
    return rows.slice(rows.length - maxSize);
  };

  const applyAppendBatch = (prev: T[], incoming: T[]): T[] => {
    if (incoming.length === 0) return prev;

    let next = prev;
    let changed = false;

    for (const row of incoming) {
      const key = options.getKey(row);
      if (keyToIndex.has(key)) continue;

      if (!changed) {
        next = prev.slice();
      }

      keyToIndex.set(key, next.length);
      next.push(row);
      changed = true;
    }

    if (!changed) return prev;

    const capped = capRows(next);
    keyToIndex = buildKeyIndex(capped, options.getKey);
    return capped;
  };

  const applyUpsertBatch = (prev: T[], incoming: T[]): T[] => {
    if (incoming.length === 0) return prev;

    let next = prev;
    let changed = false;

    for (const row of incoming) {
      const key = options.getKey(row);
      const existingIndex = keyToIndex.get(key);

      if (existingIndex == null) {
        if (!changed) {
          next = prev.slice();
        }
        keyToIndex.set(key, next.length);
        next.push(row);
        changed = true;
        continue;
      }

      if (next[existingIndex] === row) continue;

      if (!changed) {
        next = prev.slice();
      }
      next[existingIndex] = row;
      changed = true;
    }

    if (!changed) return prev;

    const capped = capRows(next);
    keyToIndex = buildKeyIndex(capped, options.getKey);
    return capped;
  };

  const normalizeReplaceRows = (incoming: T[]): T[] => {
    const deduped: T[] = [];
    const dedupeIndex = new Map<string, number>();

    for (const row of incoming) {
      const key = options.getKey(row);
      const existingIndex = dedupeIndex.get(key);

      if (existingIndex == null) {
        dedupeIndex.set(key, deduped.length);
        deduped.push(row);
        continue;
      }

      deduped[existingIndex] = row;
    }

    return capRows(deduped);
  };

  const seedInitialRows = () => {
    const initialData = options.initialData ?? [];
    if (initialData.length === 0) return [] as T[];

    if (options.strategy === "replace") {
      return normalizeReplaceRows(initialData);
    }

    return applyUpsertBatch([], initialData);
  };

  const initialRows = seedInitialRows();
  keyToIndex = buildKeyIndex(initialRows, options.getKey);

  const [rows, setRows] = createSignal<T[]>(initialRows);

  const set = (incomingRows: T[]) => {
    setRows((prev) => {
      if (options.strategy === "replace") {
        const next = normalizeReplaceRows(incomingRows);
        keyToIndex = buildKeyIndex(next, options.getKey);
        return next;
      }

      if (options.strategy === "append") {
        return applyAppendBatch(prev, incomingRows);
      }

      return applyUpsertBatch(prev, incomingRows);
    });
  };

  const add = (row: T) => {
    set([row]);
  };

  const reset = () => {
    keyToIndex = new Map<string, number>();
    setRows([]);
  };

  return {
    rows,
    add,
    set,
    reset,
  };
};
