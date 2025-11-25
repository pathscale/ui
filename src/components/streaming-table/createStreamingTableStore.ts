import { createSignal } from "solid-js";
import { createRowStore, type RowStore } from "./createRowStore";

export interface StreamingTableStore<T> {
  rows: () => RowStore<T>[];

  loadInitial: (rows: T[], getId: (row: T) => string) => void;
  upsertRow: (row: T, getId: (row: T) => string) => void;
  upsertRows: (rows: T[], getId: (row: T) => string) => void;
  updateRow: (id: string, patch: Partial<T>) => void;
  removeRow: (id: string) => void;

  // New methods for buffer management
  appendRow: (row: T, getId: (row: T) => string) => void;
  appendRows: (rows: T[], getId: (row: T) => string) => void;
  truncateToSize: (maxSize: number) => void;
}

export function createStreamingTableStore<T>(): StreamingTableStore<T> {
  const [rowStores, setRowStores] = createSignal<RowStore<T>[]>([]);

  function loadInitial(rows: T[], getId: (row: T) => string) {
    const stores = rows.map((r) => createRowStore(getId(r), r));
    setRowStores(stores);
  }

  function upsertRow(row: T, getId: (row: T) => string) {
    const id = getId(row);
    const stores = rowStores();
    const existing = stores.find((s) => s.id === id);

    if (existing) {
      existing.replace(row);
      return;
    }

    setRowStores([...stores, createRowStore(id, row)]);
  }

  function upsertRows(rows: T[], getId: (row: T) => string) {
    rows.forEach((row) => upsertRow(row, getId));
  }

  function appendRow(row: T, getId: (row: T) => string) {
    const id = getId(row);
    const stores = rowStores();
    const existing = stores.find((s) => s.id === id);

    // In append mode, skip if row already exists
    if (existing) return;

    setRowStores([...stores, createRowStore(id, row)]);
  }

  function appendRows(rows: T[], getId: (row: T) => string) {
    const stores = rowStores();
    const existingIds = new Set(stores.map((s) => s.id));

    const newStores = rows
      .filter((row) => !existingIds.has(getId(row)))
      .map((row) => createRowStore(getId(row), row));

    if (newStores.length > 0) {
      setRowStores([...stores, ...newStores]);
    }
  }

  function updateRow(id: string, patch: Partial<T>) {
    const stores = rowStores();
    const existing = stores.find((s) => s.id === id);
    if (existing) {
      existing.patch(patch);
    }
  }

  function removeRow(id: string) {
    const stores = rowStores().filter((s) => s.id !== id);
    setRowStores(stores);
  }

  function truncateToSize(maxSize: number) {
    const stores = rowStores();
    if (stores.length <= maxSize) return;

    // Keep the most recent N records (FIFO - drop oldest)
    const truncated = stores.slice(-maxSize);
    setRowStores(truncated);
  }

  return {
    rows: rowStores,
    loadInitial,
    upsertRow,
    upsertRows,
    updateRow,
    removeRow,
    appendRow,
    appendRows,
    truncateToSize,
  };
}
