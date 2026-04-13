import "./Calendar.css";
import {
  For,
  Show,
  createEffect,
  createMemo,
  createUniqueId,
  splitProps,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import {
  DAYS_PER_WEEK,
  addDays,
  compareDates,
  getToday,
  normalizeDate,
  parseDate,
  shiftDateByMonths,
  toISODate,
  useCalendarNavigation,
  useCalendarState,
  useDateSelection,
  type CalendarSelectionMode,
} from "../../hooks/date";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Calendar.classes";

export type CalendarWeekdayFormat = "narrow" | "short" | "long";
export type { CalendarSelectionMode };
export type CalendarDaySelectHandler = (date: Date) => void;
export type CalendarDayHoverHandler = (date?: Date) => void;

type CalendarBaseProps = {
  selectionMode?: CalendarSelectionMode;
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date) => void;
  rangeStart?: Date;
  rangeEnd?: Date;
  rangePreview?: Date;
  onDaySelect?: CalendarDaySelectHandler;
  onDayHover?: CalendarDayHoverHandler;
  minValue?: Date;
  maxValue?: Date;
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

  const dateSelection = useDateSelection({
    value: () => local.value,
    defaultValue: () => local.defaultValue,
    onChange: () => local.onChange,
  });

  const selectedDate = createMemo(() =>
    selectionMode() === "single" ? dateSelection.selectedDate() : null,
  );

  const rangeStart = createMemo(() => normalizeDate(local.rangeStart));
  const rangeEnd = createMemo(() => normalizeDate(local.rangeEnd));
  const rangePreview = createMemo(() => normalizeDate(local.rangePreview));

  const defaultReferenceDate = createMemo(
    () => normalizeDate(local.defaultValue) ?? getToday(),
  );

  const focusReferenceDate = createMemo(
    () =>
      selectedDate() ??
      rangeEnd() ??
      rangeStart() ??
      normalizeDate(local.value) ??
      defaultReferenceDate(),
  );

  const minDate = createMemo(() => normalizeDate(local.minValue));
  const maxDate = createMemo(() => normalizeDate(local.maxValue));
  const locale = createMemo(() => local.locale ?? "en-US");
  const weekdayFormat = createMemo<CalendarWeekdayFormat>(
    () => local.weekdayFormat ?? "short",
  );
  const showOutsideDays = createMemo(() => local.showOutsideDays ?? true);
  const isCalendarDisabled = createMemo(
    () => Boolean(local.isDisabled) || Boolean(local.disabled),
  );

  const isDateUnavailable = (date: Date) => Boolean(local.isDateUnavailable?.(date));

  const isDateDisabled = (date: Date) => {
    if (isCalendarDisabled()) return true;

    const min = minDate();
    if (min && compareDates(date, min) < 0) return true;

    const max = maxDate();
    if (max && compareDates(date, max) > 0) return true;

    return isDateUnavailable(date);
  };

  const navigation = useCalendarNavigation({
    initialFocusedDate: () => focusReferenceDate(),
    minDate,
    maxDate,
    isDateDisabled,
  });

  createEffect(() => {
    navigation.syncFocusedDate(focusReferenceDate());
  });

  const calendarState = useCalendarState({
    selectionMode: () => selectionMode(),
    locale,
    weekdayFormat,
    visibleMonth: navigation.visibleMonth,
    focusedDate: navigation.focusedDate,
    selectedDate,
    rangeStart,
    rangeEnd,
    rangePreview,
    isDateDisabled,
    isDateUnavailable,
  });

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

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (typeof local.onDaySelect === "function") {
      local.onDaySelect(date);
    } else if (selectionMode() === "single") {
      dateSelection.setSelectedDate(date);
    }

    navigation.setFocusedDate(date);
    navigation.setVisibleMonthFromDate(date);
  };

  const navigateMonth = (direction: -1 | 1) => {
    if (isCalendarDisabled()) return;

    const nextFocus = navigation.navigateMonth(direction);
    if (nextFocus) {
      focusDateButton(nextFocus);
    }
  };

  const handleCellKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (
    event,
  ) => {
    if (isCalendarDisabled()) return;

    const dateValue = parseDate(event.currentTarget.dataset.date);
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

    const nextFocus = navigation.moveFocusToDate(nextDate, direction);
    focusDateButton(nextFocus);
  };

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
            disabled={isCalendarDisabled() || !navigation.canNavigatePrevious()}
            data-disabled={
              isCalendarDisabled() || !navigation.canNavigatePrevious()
                ? "true"
                : undefined
            }
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
          {calendarState.monthFormatter().format(navigation.visibleMonth())}
        </div>

        <div class={CLASSES.Nav.base} data-slot="calendar-nav">
          <button
            type="button"
            class={CLASSES.NavButton.base}
            data-slot="calendar-nav-button"
            aria-label="Next month"
            onClick={() => navigateMonth(1)}
            disabled={isCalendarDisabled() || !navigation.canNavigateNext()}
            data-disabled={
              isCalendarDisabled() || !navigation.canNavigateNext() ? "true" : undefined
            }
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
            <For each={calendarState.weekdayLabels()}>
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
          <For each={calendarState.calendarWeeks()}>
            {(week) => (
              <div class={CLASSES.GridRow.base} data-slot="calendar-grid-row" role="row">
                <For each={week}>
                  {(date) => {
                    const cellState = calendarState.getCellState(date);
                    const isoDate = toISODate(date);

                    return (
                      <div class={CLASSES.DayWrapper.base} data-slot="calendar-day-wrapper" role="presentation">
                        <Show
                          when={showOutsideDays() || !cellState.isOutsideMonth}
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
                              cellState.isSelected && CLASSES.Cell.flag.selected,
                              cellState.isRangeStart && CLASSES.Cell.flag.rangeStart,
                              cellState.isRangeEnd && CLASSES.Cell.flag.rangeEnd,
                              cellState.isInCommittedRange && CLASSES.Cell.flag.inRange,
                              cellState.isInPreviewRange &&
                                !cellState.isInCommittedRange &&
                                CLASSES.Cell.flag.inPreviewRange,
                              cellState.isToday && CLASSES.Cell.flag.today,
                              cellState.isOutsideMonth && CLASSES.Cell.flag.outsideMonth,
                              cellState.isDisabled && CLASSES.Cell.flag.disabled,
                              cellState.isUnavailable && CLASSES.Cell.flag.unavailable,
                              cellState.isFocused && CLASSES.Cell.flag.focused,
                            )}
                            data-slot="calendar-cell"
                            data-date={isoDate}
                            data-selected={cellState.isSelected ? "true" : "false"}
                            data-range-start={cellState.isRangeStart ? "true" : "false"}
                            data-range-end={cellState.isRangeEnd ? "true" : "false"}
                            data-in-range={cellState.isInCommittedRange ? "true" : "false"}
                            data-in-preview-range={
                              cellState.isInPreviewRange ? "true" : "false"
                            }
                            data-today={cellState.isToday ? "true" : "false"}
                            data-outside-month={cellState.isOutsideMonth ? "true" : "false"}
                            data-disabled={cellState.isDisabled ? "true" : "false"}
                            data-unavailable={cellState.isUnavailable ? "true" : "false"}
                            role="gridcell"
                            aria-label={calendarState.dayLabelFormatter().format(date)}
                            aria-selected={cellState.isAriaSelected ? "true" : "false"}
                            aria-disabled={cellState.isDisabled ? "true" : "false"}
                            disabled={cellState.isDisabled}
                            tabIndex={cellState.isFocused ? 0 : -1}
                            onClick={() => selectDate(date)}
                            onFocus={() => navigation.setFocusedDate(date)}
                            onMouseEnter={() => {
                              if (cellState.isDisabled) return;
                              local.onDayHover?.(date);
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
