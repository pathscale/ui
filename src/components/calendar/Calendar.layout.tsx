import "./Calendar.css";
import type { JSX } from "@solidjs/web";
import {For, Show, createEffect, createMemo, createUniqueId, omit} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import {
  DAYS_PER_WEEK,
  addDays,
  compareDates,
  getToday,
  normalizeDate,
  parseDate,
  resolveDateNames,
  shiftDateByMonths,
  toISODate,
  useCalendarNavigation,
  useCalendarState,
  useDateSelection,
  type CalendarSelectionMode,
  type DateNames,
} from "../../hooks/date";
import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Calendar.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Calendar.recipe";

export type CalendarWeekdayFormat = "narrow" | "short" | "long";
export type { CalendarSelectionMode, DateNames };
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
  /**
   * The language to render in. Honoured only when `dateNames` supplies the
   * names to back it; on its own it cannot change what is on screen, because
   * the library carries no locale data beyond `en-US`. Whatever is actually
   * rendered is reported on the root element's `lang`.
   */
  locale?: string;
  /**
   * Month and weekday names for a language other than English.
   *
   * The library ships one table, `en-US`, and no way to derive another: `Intl`
   * is unavailable in the chuzz browser and ICU data is deliberately not
   * shipped. A translated site passes its own names here, from the same i18n
   * catalogue it already uses for the rest of its strings. All five arrays are
   * required. Omit this and the calendar renders English and says `lang="en-US"`
   * regardless of `locale`.
   */
  dateNames?: DateNames;
  weekdayFormat?: CalendarWeekdayFormat;
  showOutsideDays?: boolean;
  state?: State;
  disabled?: boolean;
};

export type CalendarProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> &
  UIBaseProps &
  CalendarBaseProps;

const Calendar: Layout<typeof componentRecipe, CalendarProps> = () => {
  const others = omit(
    props,
    "class",
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
    "dateNames",
    "weekdayFormat",
    "showOutsideDays",
    "state",
    "disabled",
  );

  const selectionMode = createMemo<CalendarSelectionMode>(
    () => props.selectionMode ?? "single",
  );

  const dateSelection = useDateSelection({
    value: () => props.value,
    defaultValue: () => props.defaultValue,
    onChange: () => props.onChange,
  });

  const selectedDate = createMemo(() =>
    selectionMode() === "single" ? dateSelection.selectedDate() : null,
  );

  const rangeStart = createMemo(() => normalizeDate(props.rangeStart));
  const rangeEnd = createMemo(() => normalizeDate(props.rangeEnd));
  const rangePreview = createMemo(() => normalizeDate(props.rangePreview));

  const defaultReferenceDate = createMemo(
    () => normalizeDate(props.defaultValue) ?? getToday(),
  );

  const focusReferenceDate = createMemo(
    () =>
      selectedDate() ??
      rangeEnd() ??
      rangeStart() ??
      normalizeDate(props.value) ??
      defaultReferenceDate(),
  );

  const minDate = createMemo(() => normalizeDate(props.minValue));
  const maxDate = createMemo(() => normalizeDate(props.maxValue));
  /**
   * The names on screen, and the locale they honestly are. A `locale` with no
   * `dateNames` behind it resolves back to `en-US` rather than mislabelling
   * English text as the language that was asked for.
   */
  const resolvedNames = createMemo(() =>
    resolveDateNames(props.locale, props.dateNames),
  );
  const dateNames = createMemo(() => resolvedNames().names);
  const renderedLocale = createMemo(() => resolvedNames().locale);
  const weekdayFormat = createMemo<CalendarWeekdayFormat>(
    () => props.weekdayFormat ?? "short",
  );
  const showOutsideDays = createMemo(() => props.showOutsideDays ?? true);
  const isCalendarDisabled = createMemo(
    () => Boolean((props.state === "disabled")) || Boolean(props.disabled),
  );

  const isDateUnavailable = (date: Date) => Boolean(props.isDateUnavailable?.(date));

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

  // Track only the external reference date. Tracking the sync function itself
  // also subscribed this effect to `visibleMonth`, so every navigation click
  // changed the month and immediately reset it to the selected date's month.
  createEffect(
    () => focusReferenceDate(),
    (value) => navigation.syncFocusedDate(value),
  );

  const calendarState = useCalendarState({
    selectionMode: () => selectionMode(),
    dateNames,
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
        `[data-slot="calendar-cell"][data-date="${dateValue}"]`,
      );
      target?.focus();
    });
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (typeof props.onDaySelect === "function") {
      props.onDaySelect(date);
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
  const headingId =
    typeof props.id === "string" && props.id.trim()
      ? `${props.id}--heading`
      : `calendar-heading-${uniqueId}`;

  return (
    <div
      {...others}
      ref={(node) => {
        rootRef = node;
        if (typeof props.ref === "function") {
          props.ref(node);
        }
      }}
      {...{ class: twMerge(
        CLASSES.Root.base,
        isCalendarDisabled() && CLASSES.Root.flag.disabled,
        props.class,
      ) }}
      data-slot="calendar"
      data-selection-mode={selectionMode()}
      data-disabled={isCalendarDisabled() ? "true" : "false"}
      /* The language actually on screen, which is not always the one asked
         for. See `resolveDateNames`. */
      lang={renderedLocale()}
      data-theme={props.dataTheme}
      style={props.style}
      aria-disabled={isCalendarDisabled() ? "true" : undefined}
    >
      <div {...{ class: CLASSES.Header.base }} data-slot="calendar-header">
        <div {...{ class: CLASSES.Nav.base }} data-slot="calendar-nav">
          <button
            id={typeof props.id === "string" ? `${props.id}--previous-month` : undefined}
            type="button"
            {...{ class: CLASSES.NavButton.base }}
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
              {...{ class: CLASSES.NavButtonIcon.base }}
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

        {/* biome-ignore lint/a11y/useSemanticElements: an h2 brings the user agent's default margin into every consumer that does not reset it, which moves the header; the role names the month in the accessibility tree and changes no box. */}
        <div
          id={headingId}
          {...{ class: CLASSES.Heading.base }}
          data-slot="calendar-heading"
          role="heading"
          aria-level="2"
          aria-live="polite"
        >
          {calendarState.monthLabel()}
        </div>

        <div {...{ class: CLASSES.Nav.base }} data-slot="calendar-nav">
          <button
            id={typeof props.id === "string" ? `${props.id}--next-month` : undefined}
            type="button"
            {...{ class: CLASSES.NavButton.base }}
            data-slot="calendar-nav-button"
            aria-label="Next month"
            onClick={() => navigateMonth(1)}
            disabled={isCalendarDisabled() || !navigation.canNavigateNext()}
            data-disabled={
              isCalendarDisabled() || !navigation.canNavigateNext() ? "true" : undefined
            }
          >
            <svg
              {...{ class: CLASSES.NavButtonIcon.base }}
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
        {...{ class: CLASSES.Grid.base }}
        data-slot="calendar-grid"
        role="grid"
        aria-labelledby={headingId}
        aria-readonly={isCalendarDisabled() ? "true" : undefined}
      >
        <div {...{ class: CLASSES.GridHeader.base }} data-slot="calendar-grid-header" role="rowgroup">
          <div {...{ class: CLASSES.GridRow.base }} data-slot="calendar-grid-row" role="row">
            <For each={calendarState.weekdayLabels()}>
              {(label) => (
                <span
                  {...{ class: CLASSES.HeaderCell.base }}
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
          {...{ class: CLASSES.GridBody.base }}
          data-slot="calendar-grid-body"
          role="rowgroup"
          onMouseLeave={() => props.onDayHover?.(undefined)}
        >
          <For each={calendarState.calendarWeeks()}>
            {(week) => (
              <div {...{ class: CLASSES.GridRow.base }} data-slot="calendar-grid-row" role="row">
                <For each={week}>
                  {(date) => {
                    const cellState = createMemo(() => calendarState.getCellState(date));
                    const isoDate = toISODate(date);

                    return (
                      <div {...{ class: CLASSES.DayWrapper.base }} data-slot="calendar-day-wrapper" role="presentation">
                        <Show
                          when={showOutsideDays() || !cellState().isOutsideMonth}
                          fallback={
                            <span
                              {...{ class: CLASSES.DayPlaceholder.base }}
                              data-slot="calendar-day-placeholder"
                              aria-hidden="true"
                            />
                          }
                        >
                          <button
                            id={
                              typeof props.id === "string"
                                ? `${props.id}--${isoDate}`
                                : undefined
                            }
                            type="button"
                            {...{ class: twMerge(
                              CLASSES.Cell.base,
                              cellState().isSelected && CLASSES.Cell.flag.selected,
                              cellState().isRangeStart && CLASSES.Cell.flag.rangeStart,
                              cellState().isRangeEnd && CLASSES.Cell.flag.rangeEnd,
                              cellState().isInCommittedRange && CLASSES.Cell.flag.inRange,
                              cellState().isInPreviewRange &&
                                !cellState().isInCommittedRange &&
                                CLASSES.Cell.flag.inPreviewRange,
                              cellState().isToday && CLASSES.Cell.flag.today,
                              cellState().isOutsideMonth && CLASSES.Cell.flag.outsideMonth,
                              cellState().isDisabled && CLASSES.Cell.flag.disabled,
                              cellState().isUnavailable && CLASSES.Cell.flag.unavailable,
                              cellState().isFocused && CLASSES.Cell.flag.focused,
                            ) }}
                            data-slot="calendar-cell"
                            data-date={isoDate}
                            data-selected={cellState().isSelected ? "true" : "false"}
                            data-range-start={cellState().isRangeStart ? "true" : "false"}
                            data-range-end={cellState().isRangeEnd ? "true" : "false"}
                            data-in-range={cellState().isInCommittedRange ? "true" : "false"}
                            data-in-preview-range={
                              cellState().isInPreviewRange ? "true" : "false"
                            }
                            data-today={cellState().isToday ? "true" : "false"}
                            data-outside-month={cellState().isOutsideMonth ? "true" : "false"}
                            data-disabled={cellState().isDisabled ? "true" : "false"}
                            data-unavailable={cellState().isUnavailable ? "true" : "false"}
                            role="gridcell"
                            aria-label={calendarState.formatDayLabel(date)}
                            aria-selected={cellState().isAriaSelected ? "true" : "false"}
                            aria-disabled={cellState().isDisabled ? "true" : "false"}
                            disabled={cellState().isDisabled}
                            tabindex={cellState().isFocused ? 0 : -1}
                            onClick={() => selectDate(date)}
                            onFocus={() => navigation.setFocusedDate(date)}
                            onMouseEnter={() => {
                              if (cellState().isDisabled) return;
                              props.onDayHover?.(date);
                            }}
                            onKeyDown={handleCellKeyDown}
                          >
                            <span {...{ class: CLASSES.Day.base }} data-slot="calendar-day">
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
