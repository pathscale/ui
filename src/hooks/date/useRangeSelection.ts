import { createMemo, createSignal, type Accessor } from "solid-js";

import { compareDates, createPreviewRange, normalizeDate, normalizeRange, type DateRangeValue } from "./date.utils";

export type ControlledDateRangeValue = DateRangeValue | null;

type RangeSelectionOptions = {
  value: Accessor<ControlledDateRangeValue | undefined>;
  defaultValue: Accessor<ControlledDateRangeValue | undefined>;
  onChange: Accessor<((value: ControlledDateRangeValue) => void) | undefined>;
};

const normalizeCompleteRange = (value: ControlledDateRangeValue | undefined) => {
  if (!value) return null;

  const normalized = normalizeRange(value.start, value.end);
  if (!normalized.start || !normalized.end) {
    return null;
  }

  return {
    start: normalized.start,
    end: normalized.end,
  };
};

export const useRangeSelection = (options: RangeSelectionOptions) => {
  const [internalCommittedRange, setInternalCommittedRange] =
    createSignal<ControlledDateRangeValue>(normalizeCompleteRange(options.defaultValue()));
  const [pendingStartDate, setPendingStartDate] = createSignal<Date | null>(null);
  const [hoveredDate, setHoveredDate] = createSignal<Date | null>(null);

  const isControlled = createMemo(() => options.value() !== undefined);

  const committedRange = createMemo(() => {
    if (isControlled()) {
      return normalizeCompleteRange(options.value());
    }

    return internalCommittedRange();
  });

  const isSelectingEnd = createMemo(() => pendingStartDate() !== null);

  const rangeStart = createMemo(() => pendingStartDate() ?? committedRange()?.start ?? null);

  const rangeEnd = createMemo(() =>
    pendingStartDate() ? null : committedRange()?.end ?? null,
  );

  const previewRange = createMemo(() =>
    createPreviewRange(rangeStart(), rangeEnd(), hoveredDate()),
  );

  const focusDate = createMemo(() => rangeEnd() ?? rangeStart() ?? null);

  const setCommittedRange = (nextValue: ControlledDateRangeValue) => {
    const normalized = normalizeCompleteRange(nextValue);

    if (!isControlled()) {
      setInternalCommittedRange(normalized);
    }

    options.onChange()?.(normalized);
  };

  const clearPendingSelection = () => {
    setPendingStartDate(null);
    setHoveredDate(null);
  };

  const setHoverDate = (value: Date | undefined) => {
    if (!isSelectingEnd()) {
      setHoveredDate(null);
      return;
    }

    setHoveredDate(normalizeDate(value));
  };

  const selectDate = (value: Date) => {
    const normalized = normalizeDate(value);
    if (!normalized) return;

    const pendingStart = pendingStartDate();

    if (!pendingStart) {
      setPendingStartDate(normalized);
      setHoveredDate(null);
      return;
    }

    if (compareDates(normalized, pendingStart) < 0) {
      setPendingStartDate(normalized);
      setHoveredDate(null);
      return;
    }

    setCommittedRange({
      start: pendingStart,
      end: normalized,
    });

    clearPendingSelection();
  };

  return {
    isControlled,
    isSelectingEnd,
    committedRange,
    hoveredDate,
    rangeStart,
    rangeEnd,
    previewRange,
    focusDate,
    selectDate,
    setCommittedRange,
    setHoverDate,
    clearPendingSelection,
  };
};
