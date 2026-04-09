import { createSignal, type Accessor } from "solid-js";
import type { OnChangeFn } from "@tanstack/solid-table";
import { resolveUpdater } from "./helpers";

export type TableSelectionState = Record<string, boolean>;

export interface UseTableSelectionOptions {
  rowSelection?: Accessor<TableSelectionState>;
  setRowSelection?: OnChangeFn<TableSelectionState>;
  initialRowSelection?: TableSelectionState;
}

export interface UseTableSelectionResult {
  rowSelection: Accessor<TableSelectionState>;
  setRowSelection: OnChangeFn<TableSelectionState>;
  clearSelection: () => void;
}

export const useTableSelection = (
  options: UseTableSelectionOptions = {},
): UseTableSelectionResult => {
  const [internalRowSelection, setInternalRowSelection] =
    createSignal<TableSelectionState>(options.initialRowSelection ?? {});

  const rowSelection = () => options.rowSelection?.() ?? internalRowSelection();

  const setRowSelection: OnChangeFn<TableSelectionState> = (updater) => {
    if (options.setRowSelection) {
      options.setRowSelection(updater);
      return;
    }
    setInternalRowSelection((prev) => resolveUpdater(prev, updater));
  };

  const clearSelection = () => setRowSelection({});

  return {
    rowSelection,
    setRowSelection,
    clearSelection,
  };
};
