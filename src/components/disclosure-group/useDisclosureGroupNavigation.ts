import { createMemo } from "solid-js";

export type UseDisclosureGroupNavigationProps = {
  expandedKeys: () => Set<string | number>;
  itemIds: () => string[];
  onExpandedChange: (keys: Set<string | number>) => void;
  allowsMultipleExpanded?: boolean;
};

export type UseDisclosureGroupNavigationReturn = {
  currentIndex: () => number;
  isPrevDisabled: () => boolean;
  isNextDisabled: () => boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const normalizeKeys = (keys: Set<string | number>) =>
  new Set(Array.from(keys).map((key) => String(key)));

export const useDisclosureGroupNavigation = (
  props: UseDisclosureGroupNavigationProps,
): UseDisclosureGroupNavigationReturn => {
  const currentIndex = createMemo(() => {
    const ids = props.itemIds();
    const expanded = Array.from(normalizeKeys(props.expandedKeys())).filter((id) =>
      ids.includes(id),
    );
    const current = expanded.length > 0 ? expanded[0] : ids[0];
    if (!current) return -1;
    return ids.indexOf(current);
  });

  const setExpanded = (id: string) => {
    if (!id) return;
    const allowsMultiple = Boolean(props.allowsMultipleExpanded);
    if (allowsMultiple) {
      const next = new Set(props.expandedKeys());
      next.add(id);
      props.onExpandedChange(next);
      return;
    }
    props.onExpandedChange(new Set([id]));
  };

  const onPrevious = () => {
    const ids = props.itemIds();
    const index = currentIndex();
    if (index <= 0) return;
    const prev = ids[index - 1];
    if (!prev) return;
    setExpanded(prev);
  };

  const onNext = () => {
    const ids = props.itemIds();
    const index = currentIndex();
    if (index >= ids.length - 1) return;
    const next = ids[index + 1];
    if (!next) return;
    setExpanded(next);
  };

  const isPrevDisabled = createMemo(() => currentIndex() <= 0);
  const isNextDisabled = createMemo(() => {
    const index = currentIndex();
    const ids = props.itemIds();
    return index < 0 || index >= ids.length - 1;
  });

  return {
    currentIndex,
    isPrevDisabled,
    isNextDisabled,
    onPrevious,
    onNext,
  };
};
