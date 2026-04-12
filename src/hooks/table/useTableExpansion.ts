import { createSignal, type Accessor } from "solid-js";
import type { ExpandedState, OnChangeFn } from "@tanstack/solid-table";
import { resolveUpdater } from "./helpers";

export interface UseTableExpansionOptions {
  expanded?: Accessor<ExpandedState>;
  setExpanded?: OnChangeFn<ExpandedState>;
  initialExpanded?: ExpandedState;
}

export interface UseTableExpansionResult {
  expanded: Accessor<ExpandedState>;
  setExpanded: OnChangeFn<ExpandedState>;
  collapseAll: () => void;
}

export const useTableExpansion = (
  options: UseTableExpansionOptions = {},
): UseTableExpansionResult => {
  const [internalExpanded, setInternalExpanded] = createSignal<ExpandedState>(
    options.initialExpanded ?? {},
  );

  const expanded = () => options.expanded?.() ?? internalExpanded();

  const setExpanded: OnChangeFn<ExpandedState> = (updater) => {
    if (options.setExpanded) {
      options.setExpanded(updater);
      return;
    }
    setInternalExpanded((prev) => resolveUpdater(prev, updater));
  };

  const collapseAll = () => setExpanded({});

  return {
    expanded,
    setExpanded,
    collapseAll,
  };
};
