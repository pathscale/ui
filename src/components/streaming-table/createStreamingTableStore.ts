import { createSignal } from "solid-js";
import { createRowStore, type RowStore } from "./createRowStore";

export interface StreamingTableStore<T> {
  rows: () => RowStore<T>[];

  loadInitial: (rows: T[], getId: (row: T) => string) => void;
  upsertRow: (row: T, getId: (row: T) => string) => void;
  upsertRows: (rows: T[], getId: (row: T) => string) => void;
  updateRow: (id: string, patch: Partial<T>) => void;
  removeRow: (id: string) => void;
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

  return {
    rows: rowStores,
    loadInitial,
    upsertRow,
    upsertRows,
    updateRow,
    removeRow,
  };
}
