import { createMemo, createSignal, type Accessor } from "solid-js";

import { normalizeDate } from "./date.utils";

type DateSelectionOptions = {
  value: Accessor<Date | undefined>;
  defaultValue: Accessor<Date | undefined>;
  onChange: Accessor<((value: Date) => void) | undefined>;
};

export const useDateSelection = (options: DateSelectionOptions) => {
  const [internalValue, setInternalValue] = createSignal<Date | null>(
    normalizeDate(options.defaultValue()),
  );

  const isControlled = createMemo(() => options.value() !== undefined);

  const selectedDate = createMemo(() => {
    if (isControlled()) {
      return normalizeDate(options.value());
    }

    return internalValue();
  });

  const setSelectedDate = (value: Date) => {
    const normalized = normalizeDate(value);
    if (!normalized) return;

    if (!isControlled()) {
      setInternalValue(normalized);
    }

    options.onChange()?.(normalized);
  };

  return {
    isControlled,
    selectedDate,
    setSelectedDate,
  };
};
