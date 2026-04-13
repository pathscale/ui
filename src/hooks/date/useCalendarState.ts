import { createMemo, type Accessor } from "solid-js";

import {
  addDays,
  buildCalendarGrid,
  compareDates,
  createPreviewRange,
  getToday,
  isSameDay,
  isSameMonth,
  normalizeRange,
  splitWeeks,
  type DateRangeValue,
} from "./date.utils";

export type CalendarSelectionMode = "single" | "range";

type CalendarStateOptions = {
  selectionMode: Accessor<CalendarSelectionMode>;
  locale: Accessor<string>;
  weekdayFormat: Accessor<"narrow" | "short" | "long">;
  visibleMonth: Accessor<Date>;
  focusedDate: Accessor<Date>;
  selectedDate: Accessor<Date | null>;
  rangeStart: Accessor<Date | null>;
  rangeEnd: Accessor<Date | null>;
  rangePreview: Accessor<Date | null>;
  isDateDisabled: (date: Date) => boolean;
  isDateUnavailable: (date: Date) => boolean;
};

export type CalendarCellState = {
  isOutsideMonth: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInCommittedRange: boolean;
  isInPreviewRange: boolean;
  isInRange: boolean;
  isToday: boolean;
  isUnavailable: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isAriaSelected: boolean;
};

export const useCalendarState = (options: CalendarStateOptions) => {
  const monthFormatter = createMemo(
    () => new Intl.DateTimeFormat(options.locale(), { month: "long", year: "numeric" }),
  );

  const dayLabelFormatter = createMemo(
    () => new Intl.DateTimeFormat(options.locale(), { dateStyle: "full" }),
  );

  const weekdayFormatter = createMemo(
    () => new Intl.DateTimeFormat(options.locale(), { weekday: options.weekdayFormat() }),
  );

  const weekdayLabels = createMemo(() => {
    const firstSunday = new Date(2024, 0, 7, 12, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) =>
      weekdayFormatter().format(addDays(firstSunday, index)),
    );
  });

  const calendarWeeks = createMemo(() =>
    splitWeeks(buildCalendarGrid(options.visibleMonth(), 0)),
  );

  const normalizedRange = createMemo(() =>
    normalizeRange(options.rangeStart(), options.rangeEnd()),
  );

  const previewRange = createMemo(() =>
    createPreviewRange(
      normalizedRange().start,
      normalizedRange().end,
      options.rangePreview(),
    ),
  );

  const todayDate = createMemo(() => getToday());

  const getCellState = (date: Date): CalendarCellState => {
    const mode = options.selectionMode();
    const selectedDate = options.selectedDate();
    const normalized = normalizedRange();
    const preview = previewRange();

    const isOutsideMonth = !isSameMonth(date, options.visibleMonth());
    const isSelected = mode === "single" && selectedDate !== null && isSameDay(date, selectedDate);
    const isRangeStart = mode === "range" && normalized.start !== null && isSameDay(date, normalized.start);
    const isRangeEnd = mode === "range" && normalized.end !== null && isSameDay(date, normalized.end);

    const isInCommittedRange =
      mode === "range" &&
      normalized.start !== null &&
      normalized.end !== null &&
      compareDates(date, normalized.start) >= 0 &&
      compareDates(date, normalized.end) <= 0;

    const isInPreviewRange =
      mode === "range" &&
      preview.start !== null &&
      preview.end !== null &&
      compareDates(date, preview.start) >= 0 &&
      compareDates(date, preview.end) <= 0;

    const isInRange = isInCommittedRange || isInPreviewRange;
    const isToday = isSameDay(date, todayDate());
    const isUnavailable = options.isDateUnavailable(date);
    const isDisabled = options.isDateDisabled(date);
    const isFocused = isSameDay(date, options.focusedDate());

    const isAriaSelected =
      mode === "range" ? isRangeStart || isRangeEnd || isInRange : isSelected;

    return {
      isOutsideMonth,
      isSelected,
      isRangeStart,
      isRangeEnd,
      isInCommittedRange,
      isInPreviewRange,
      isInRange,
      isToday,
      isUnavailable,
      isDisabled,
      isFocused,
      isAriaSelected,
    };
  };

  return {
    monthFormatter,
    dayLabelFormatter,
    weekdayLabels,
    calendarWeeks,
    normalizedRange,
    previewRange,
    getCellState,
  };
};
