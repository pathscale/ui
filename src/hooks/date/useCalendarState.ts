import { type Accessor, createMemo } from "solid-js";

import {
  type DateNameWidth,
  type DateNames,
  formatFullDate,
  formatMonthYear,
  weekdayNames,
} from "./date.names";
import {
  buildCalendarGrid,
  compareDates,
  createPreviewRange,
  type DateRangeValue,
  getToday,
  isSameDay,
  isSameMonth,
  normalizeRange,
  splitWeeks,
} from "./date.utils";

export type CalendarSelectionMode = "single" | "range";

type CalendarStateOptions = {
  selectionMode: Accessor<CalendarSelectionMode>;
  /**
   * The names to render with. The owning component resolves these from its
   * `locale` and `dateNames` props through `resolveDateNames`, so there is no
   * `locale` here: this hook formats from a table and has nothing to do with
   * one. See `date.names.ts`.
   */
  dateNames: Accessor<DateNames>;
  weekdayFormat: Accessor<DateNameWidth>;
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
  /** The grid heading, e.g. "June 2025". */
  const monthLabel = createMemo(() =>
    formatMonthYear(options.visibleMonth(), options.dateNames()),
  );

  /** A day button's `aria-label`, e.g. "Sunday, June 15, 2025". */
  const formatDayLabel = (date: Date) =>
    formatFullDate(date, options.dateNames());

  /** The seven column headers, Sunday first. */
  const weekdayLabels = createMemo(() =>
    weekdayNames(options.weekdayFormat(), options.dateNames()),
  );

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
    const isSelected =
      mode === "single" &&
      selectedDate !== null &&
      isSameDay(date, selectedDate);
    const isRangeStart =
      mode === "range" &&
      normalized.start !== null &&
      isSameDay(date, normalized.start);
    const isRangeEnd =
      mode === "range" &&
      normalized.end !== null &&
      isSameDay(date, normalized.end);

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
    monthLabel,
    formatDayLabel,
    weekdayLabels,
    calendarWeeks,
    normalizedRange,
    previewRange,
    getCellState,
  };
};
