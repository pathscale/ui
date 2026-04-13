import "./Calendar.css";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Calendar.classes";

const DAYS_PER_WEEK = 7;
const CALENDAR_GRID_DAYS = 42;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number) => String(value).padStart(2, "0");

const createDate = (year: number, monthIndex: number, day: number) =>
  new Date(year, monthIndex, day, 12, 0, 0, 0);

const today = () => {
  const now = new Date();
  return createDate(now.getFullYear(), now.getMonth(), now.getDate());
};

const toISODate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseISODate = (value: string | undefined): Date | null => {
  if (!value) return null;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const parsed = createDate(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const dateKey = (date: Date) =>
  date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate();

const compareDay = (left: Date, right: Date) => dateKey(left) - dateKey(right);

const compareMonth = (left: Date, right: Date) =>
  (left.getFullYear() - right.getFullYear()) * 12 + (left.getMonth() - right.getMonth());

const isSameDay = (left: Date, right: Date) => compareDay(left, right) === 0;

const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const startOfMonth = (date: Date) => createDate(date.getFullYear(), date.getMonth(), 1);

const addDays = (date: Date, amount: number) =>
  createDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const addMonths = (date: Date, amount: number) =>
  createDate(date.getFullYear(), date.getMonth() + amount, 1);

const shiftDateByMonths = (date: Date, amount: number) => {
  const base = createDate(date.getFullYear(), date.getMonth() + amount, 1);
  const maxDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  return createDate(base.getFullYear(), base.getMonth(), Math.min(date.getDate(), maxDay));
};

const buildCalendarGrid = (monthStart: Date, weekStartsOn = 0) => {
  const monthFirstDay = startOfMonth(monthStart);
  const offset = (monthFirstDay.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const gridStart = addDays(monthFirstDay, -offset);

  return Array.from({ length: CALENDAR_GRID_DAYS }, (_, index) =>
    addDays(gridStart, index),
  );
};

const toWeeks = <T,>(items: T[]) => {
  const weeks: T[][] = [];
  for (let index = 0; index < items.length; index += DAYS_PER_WEEK) {
    weeks.push(items.slice(index, index + DAYS_PER_WEEK));
  }
  return weeks;
};

export type CalendarWeekdayFormat = "narrow" | "short" | "long";
export type CalendarSelectionMode = "single" | "range";
export type CalendarDaySelectHandler = (value: string, date: Date) => void;
export type CalendarDayHoverHandler = (value: string | undefined, date?: Date) => void;

type CalendarBaseProps = {
  selectionMode?: CalendarSelectionMode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
  rangePreview?: string;
  onDaySelect?: CalendarDaySelectHandler;
  onDayHover?: CalendarDayHoverHandler;
  minValue?: string;
  maxValue?: string;
  isDateUnavailable?: (date: Date) => boolean;
  locale?: string;
  weekdayFormat?: CalendarWeekdayFormat;
  showOutsideDays?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
};

export type CalendarProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  IComponentBaseProps &
  CalendarBaseProps;

const Calendar = (props: CalendarProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "ref",
    "selectionMode",
    "value",
    "defaultValue",
    "onChange",
    "rangeStart",
    "rangeEnd",
    "rangePreview",
    "onDaySelect",
    "onDayHover",
    "minValue",
    "maxValue",
    "isDateUnavailable",
    "locale",
    "weekdayFormat",
    "showOutsideDays",
    "isDisabled",
    "disabled",
  ]);

  const selectionMode = createMemo<CalendarSelectionMode>(
    () => local.selectionMode ?? "single",
  );

  const defaultReferenceDate = parseISODate(local.defaultValue) ?? today();
  const controlledReferenceDate = parseISODate(local.value);
  const rangeReferenceDate = parseISODate(local.rangeEnd) ?? parseISODate(local.rangeStart);
  const initialFocusedDate =
    controlledReferenceDate ?? rangeReferenceDate ?? defaultReferenceDate;

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? "");
  const [visibleMonth, setVisibleMonth] = createSignal(startOfMonth(initialFocusedDate));
  const [focusedDate, setFocusedDate] = createSignal(initialFocusedDate);

  const selectedValue = createMemo(() =>
    local.value !== undefined ? local.value ?? "" : internalValue(),
  );

  const selectedDate = createMemo(() => parseISODate(selectedValue()));
  const rangeStartDate = createMemo(() => parseISODate(local.rangeStart));
  const rangeEndDate = createMemo(() => parseISODate(local.rangeEnd));
  const rangePreviewDate = createMemo(() => parseISODate(local.rangePreview));
  const todayDate = createMemo(() => today());
  const minDate = createMemo(() => parseISODate(local.minValue));
  const maxDate = createMemo(() => parseISODate(local.maxValue));
  const locale = createMemo(() => local.locale ?? "en-US");
  const weekdayFormat = createMemo<CalendarWeekdayFormat>(
    () => local.weekdayFormat ?? "short",
  );
  const showOutsideDays = createMemo(() => local.showOutsideDays ?? true);
  const isCalendarDisabled = createMemo(
    () => Boolean(local.isDisabled) || Boolean(local.disabled),
  );
  const normalizedRange = createMemo(() => {
    const start = rangeStartDate();
    const end = rangeEndDate();

    if (!start && !end) return { start: null as Date | null, end: null as Date | null };
    if (start && !end) return { start, end: null as Date | null };
    if (!start && end) return { start: end, end };

    if ((start as Date) && (end as Date) && compareDay(start as Date, end as Date) > 0) {
      return { start: end as Date, end: start as Date };
    }

    return { start: start as Date, end: end as Date };
  });
  const normalizedPreviewRange = createMemo(() => {
    const start = normalizedRange().start;
    const end = normalizedRange().end;
    const preview = rangePreviewDate();

    if (!start || end || !preview) {
      return { start: null as Date | null, end: null as Date | null };
    }

    if (compareDay(preview, start) < 0) {
      return { start: preview, end: start };
    }

    return { start, end: preview };
  });

  const monthFormatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric" }),
  );

  const weekdayFormatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { weekday: weekdayFormat() }),
  );

  const dayLabelFormatter = createMemo(
    () => new Intl.DateTimeFormat(locale(), { dateStyle: "full" }),
  );

  const weekdayLabels = createMemo(() => {
    const firstSunday = createDate(2024, 0, 7);
    return Array.from({ length: DAYS_PER_WEEK }, (_, index) =>
      weekdayFormatter().format(addDays(firstSunday, index)),
    );
  });

  const calendarWeeks = createMemo(() => toWeeks(buildCalendarGrid(visibleMonth(), 0)));

  const isDateUnavailable = (date: Date) => Boolean(local.isDateUnavailable?.(date));

  const isDateDisabled = (date: Date) => {
    if (isCalendarDisabled()) return true;

    const min = minDate();
    if (min && compareDay(date, min) < 0) return true;

    const max = maxDate();
    if (max && compareDay(date, max) > 0) return true;

    return isDateUnavailable(date);
  };

  const clampVisibleMonth = (nextVisibleMonth: Date) => {
    const min = minDate();
    const max = maxDate();

    if (min && compareMonth(nextVisibleMonth, startOfMonth(min)) < 0) {
      return startOfMonth(min);
    }

    if (max && compareMonth(nextVisibleMonth, startOfMonth(max)) > 0) {
      return startOfMonth(max);
    }

    return nextVisibleMonth;
  };

  const setVisibleMonthFromDate = (date: Date) => {
    const nextMonth = startOfMonth(date);
    if (!isSameMonth(nextMonth, visibleMonth())) {
      setVisibleMonth(clampVisibleMonth(nextMonth));
    }
  };

  const setValue = (nextValue: string) => {
    if (local.value === undefined) {
      setInternalValue(nextValue);
    }
    local.onChange?.(nextValue);
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;

    const nextValue = toISODate(date);
    if (typeof local.onDaySelect === "function") {
      local.onDaySelect(nextValue, date);
    } else {
      setValue(nextValue);
    }

    setFocusedDate(date);
    setVisibleMonthFromDate(date);
  };

  let rootRef: HTMLDivElement | undefined;

  const focusDateButton = (date: Date) => {
    const dateValue = toISODate(date);
    queueMicrotask(() => {
      const target = rootRef?.querySelector<HTMLButtonElement>(
        `[data-slot=\"calendar-cell\"][data-date=\"${dateValue}\"]`,
      );
      target?.focus();
    });
  };

  const findNearestEnabledDate = (startDate: Date, direction: 1 | -1) => {
    let current = startDate;

    for (let index = 0; index < 400; index += 1) {
      if (!isDateDisabled(current)) {
        return current;
      }
      current = addDays(current, direction);
    }

    return startDate;
  };

  const moveFocusToDate = (date: Date, direction: 1 | -1) => {
    const nextFocus = isDateDisabled(date)
      ? findNearestEnabledDate(date, direction)
      : date;

    setFocusedDate(nextFocus);
    setVisibleMonthFromDate(nextFocus);
    focusDateButton(nextFocus);
  };

  const navigateMonth = (direction: -1 | 1) => {
    if (isCalendarDisabled()) return;

    const nextMonth = clampVisibleMonth(addMonths(visibleMonth(), direction));
    if (isSameMonth(nextMonth, visibleMonth())) return;

    setVisibleMonth(nextMonth);

    const nextFocus = findNearestEnabledDate(
      shiftDateByMonths(focusedDate(), direction),
      direction,
    );

    setFocusedDate(nextFocus);
    focusDateButton(nextFocus);
  };

  const canNavigatePrevious = createMemo(() => {
    if (isCalendarDisabled()) return false;

    const previousMonth = addMonths(visibleMonth(), -1);
    const min = minDate();
    if (!min) return true;

    return compareMonth(previousMonth, startOfMonth(min)) >= 0;
  });

  const canNavigateNext = createMemo(() => {
    if (isCalendarDisabled()) return false;

    const nextMonth = addMonths(visibleMonth(), 1);
    const max = maxDate();
    if (!max) return true;

    return compareMonth(nextMonth, startOfMonth(max)) <= 0;
  });

  const handleCellKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (
    event,
  ) => {
    if (isCalendarDisabled()) return;

    const dateValue = parseISODate(event.currentTarget.dataset.date);
    if (!dateValue) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectDate(dateValue);
      return;
    }

    let nextDate: Date | null = null;
    let direction: 1 | -1 = 1;

    switch (event.key) {
      case "ArrowLeft":
        nextDate = addDays(dateValue, -1);
        direction = -1;
        break;
      case "ArrowRight":
        nextDate = addDays(dateValue, 1);
        direction = 1;
        break;
      case "ArrowUp":
        nextDate = addDays(dateValue, -DAYS_PER_WEEK);
        direction = -1;
        break;
      case "ArrowDown":
        nextDate = addDays(dateValue, DAYS_PER_WEEK);
        direction = 1;
        break;
      case "Home":
        nextDate = addDays(dateValue, -dateValue.getDay());
        direction = -1;
        break;
      case "End":
        nextDate = addDays(dateValue, DAYS_PER_WEEK - 1 - dateValue.getDay());
        direction = 1;
        break;
      case "PageUp":
        nextDate = shiftDateByMonths(dateValue, -1);
        direction = -1;
        break;
      case "PageDown":
        nextDate = shiftDateByMonths(dateValue, 1);
        direction = 1;
        break;
      default:
        return;
    }

    if (!nextDate) return;

    event.preventDefault();
    moveFocusToDate(nextDate, direction);
  };

  createEffect(() => {
    const nextFocusedDate =
      selectionMode() === "range"
        ? normalizedRange().end ?? normalizedRange().start
        : local.value !== undefined
          ? parseISODate(local.value)
          : null;

    if (!nextFocusedDate) return;

    if (!isSameDay(nextFocusedDate, focusedDate())) {
      setFocusedDate(nextFocusedDate);
    }

    if (!isSameMonth(nextFocusedDate, visibleMonth())) {
      setVisibleMonth(clampVisibleMonth(startOfMonth(nextFocusedDate)));
    }
  });

  const uniqueId = createUniqueId();
  const headingId = `calendar-heading-${uniqueId}`;

  return (
    <div
      {...others}
      ref={(node) => {
        rootRef = node;
        if (typeof local.ref === "function") {
          local.ref(node);
        }
      }}
      class={twMerge(
        CLASSES.Root.base,
        isCalendarDisabled() && CLASSES.Root.flag.disabled,
        local.class,
        local.className,
      )}
      data-slot="calendar"
      data-selection-mode={selectionMode()}
      data-disabled={isCalendarDisabled() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={isCalendarDisabled() ? "true" : undefined}
    >
      <div class={CLASSES.Header.base} data-slot="calendar-header">
        <div class={CLASSES.Nav.base} data-slot="calendar-nav">
          <button
            type="button"
            class={CLASSES.NavButton.base}
            data-slot="calendar-nav-button"
            aria-label="Previous month"
            onClick={() => navigateMonth(-1)}
            disabled={!canNavigatePrevious()}
            data-disabled={!canNavigatePrevious() ? "true" : undefined}
          >
            <svg
              class={CLASSES.NavButtonIcon.base}
              data-slot="calendar-nav-button-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>

        <div
          id={headingId}
          class={CLASSES.Heading.base}
          data-slot="calendar-heading"
          aria-live="polite"
        >
          {monthFormatter().format(visibleMonth())}
        </div>

        <div class={CLASSES.Nav.base} data-slot="calendar-nav">
          <button
            type="button"
            class={CLASSES.NavButton.base}
            data-slot="calendar-nav-button"
            aria-label="Next month"
            onClick={() => navigateMonth(1)}
            disabled={!canNavigateNext()}
            data-disabled={!canNavigateNext() ? "true" : undefined}
          >
            <svg
              class={CLASSES.NavButtonIcon.base}
              data-slot="calendar-nav-button-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        class={CLASSES.Grid.base}
        data-slot="calendar-grid"
        role="grid"
        aria-labelledby={headingId}
        aria-readonly={isCalendarDisabled() ? "true" : undefined}
      >
        <div class={CLASSES.GridHeader.base} data-slot="calendar-grid-header" role="rowgroup">
          <div class={CLASSES.GridRow.base} data-slot="calendar-grid-row" role="row">
            <For each={weekdayLabels()}>
              {(label) => (
                <span
                  class={CLASSES.HeaderCell.base}
                  data-slot="calendar-header-cell"
                  role="columnheader"
                >
                  {label}
                </span>
              )}
            </For>
          </div>
        </div>

        <div
          class={CLASSES.GridBody.base}
          data-slot="calendar-grid-body"
          role="rowgroup"
          onMouseLeave={() => local.onDayHover?.(undefined)}
        >
          <For each={calendarWeeks()}>
            {(week) => (
              <div class={CLASSES.GridRow.base} data-slot="calendar-grid-row" role="row">
                <For each={week}>
                  {(date) => {
                    const isoDate = toISODate(date);
                    const isOutsideMonth = !isSameMonth(date, visibleMonth());
                    const selectedDateValue = selectedDate();
                    const rangeStart = normalizedRange().start;
                    const rangeEnd = normalizedRange().end;
                    const previewRange = normalizedPreviewRange();
                    const isRangeStart =
                      selectionMode() === "range" &&
                      rangeStart !== null &&
                      isSameDay(date, rangeStart);
                    const isRangeEnd =
                      selectionMode() === "range" &&
                      rangeEnd !== null &&
                      isSameDay(date, rangeEnd);
                    const isInCommittedRange =
                      selectionMode() === "range" &&
                      rangeStart !== null &&
                      rangeEnd !== null &&
                      compareDay(date, rangeStart) >= 0 &&
                      compareDay(date, rangeEnd) <= 0;
                    const isInPreviewRange =
                      selectionMode() === "range" &&
                      previewRange.start !== null &&
                      previewRange.end !== null &&
                      compareDay(date, previewRange.start) >= 0 &&
                      compareDay(date, previewRange.end) <= 0;
                    const isInRange = isInCommittedRange || isInPreviewRange;
                    const isSelected =
                      selectionMode() === "single" &&
                      selectedDateValue !== null &&
                      isSameDay(date, selectedDateValue);
                    const isToday = isSameDay(date, todayDate());
                    const isUnavailable = isDateUnavailable(date);
                    const isDisabledDate = isDateDisabled(date);
                    const isFocused = isSameDay(date, focusedDate());
                    const isAriaSelected =
                      selectionMode() === "range"
                        ? isRangeStart || isRangeEnd || isInRange
                        : isSelected;

                    return (
                      <div class={CLASSES.DayWrapper.base} data-slot="calendar-day-wrapper" role="presentation">
                        <Show
                          when={showOutsideDays() || !isOutsideMonth}
                          fallback={
                            <span
                              class={CLASSES.DayPlaceholder.base}
                              data-slot="calendar-day-placeholder"
                              aria-hidden="true"
                            />
                          }
                        >
                          <button
                            type="button"
                            class={twMerge(
                              CLASSES.Cell.base,
                              isSelected && CLASSES.Cell.flag.selected,
                              isRangeStart && CLASSES.Cell.flag.rangeStart,
                              isRangeEnd && CLASSES.Cell.flag.rangeEnd,
                              isInCommittedRange && CLASSES.Cell.flag.inRange,
                              isInPreviewRange &&
                                !isInCommittedRange &&
                                CLASSES.Cell.flag.inPreviewRange,
                              isToday && CLASSES.Cell.flag.today,
                              isOutsideMonth && CLASSES.Cell.flag.outsideMonth,
                              isDisabledDate && CLASSES.Cell.flag.disabled,
                              isUnavailable && CLASSES.Cell.flag.unavailable,
                              isFocused && CLASSES.Cell.flag.focused,
                            )}
                            data-slot="calendar-cell"
                            data-date={isoDate}
                            data-selected={isSelected ? "true" : "false"}
                            data-range-start={isRangeStart ? "true" : "false"}
                            data-range-end={isRangeEnd ? "true" : "false"}
                            data-in-range={isInCommittedRange ? "true" : "false"}
                            data-in-preview-range={isInPreviewRange ? "true" : "false"}
                            data-today={isToday ? "true" : "false"}
                            data-outside-month={isOutsideMonth ? "true" : "false"}
                            data-disabled={isDisabledDate ? "true" : "false"}
                            data-unavailable={isUnavailable ? "true" : "false"}
                            role="gridcell"
                            aria-label={dayLabelFormatter().format(date)}
                            aria-selected={isAriaSelected ? "true" : "false"}
                            aria-disabled={isDisabledDate ? "true" : "false"}
                            disabled={isDisabledDate}
                            tabIndex={isFocused ? 0 : -1}
                            onClick={() => selectDate(date)}
                            onFocus={() => setFocusedDate(date)}
                            onMouseEnter={() => {
                              if (isDisabledDate) return;
                              local.onDayHover?.(isoDate, date);
                            }}
                            onKeyDown={handleCellKeyDown}
                          >
                            <span class={CLASSES.Day.base} data-slot="calendar-day">
                              {date.getDate()}
                            </span>
                          </button>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
