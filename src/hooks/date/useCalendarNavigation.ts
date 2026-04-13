import { createMemo, createSignal, type Accessor } from "solid-js";

import {
  addDays,
  addMonths,
  compareMonths,
  isSameMonth,
  shiftDateByMonths,
  startOfMonth,
} from "./date.utils";

type CalendarNavigationOptions = {
  initialFocusedDate: Accessor<Date>;
  minDate: Accessor<Date | null>;
  maxDate: Accessor<Date | null>;
  isDateDisabled: (date: Date) => boolean;
};

export const useCalendarNavigation = (options: CalendarNavigationOptions) => {
  const [visibleMonth, setVisibleMonth] = createSignal(
    startOfMonth(options.initialFocusedDate()),
  );
  const [focusedDate, setFocusedDate] = createSignal(options.initialFocusedDate());

  const clampVisibleMonth = (nextVisibleMonth: Date) => {
    const min = options.minDate();
    const max = options.maxDate();

    if (min && compareMonths(nextVisibleMonth, startOfMonth(min)) < 0) {
      return startOfMonth(min);
    }

    if (max && compareMonths(nextVisibleMonth, startOfMonth(max)) > 0) {
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

  const findNearestEnabledDate = (startDate: Date, direction: 1 | -1) => {
    let current = startDate;

    for (let index = 0; index < 400; index += 1) {
      if (!options.isDateDisabled(current)) {
        return current;
      }

      current = addDays(current, direction);
    }

    return startDate;
  };

  const moveFocusToDate = (date: Date, direction: 1 | -1) => {
    const nextFocus = options.isDateDisabled(date)
      ? findNearestEnabledDate(date, direction)
      : date;

    setFocusedDate(nextFocus);
    setVisibleMonthFromDate(nextFocus);

    return nextFocus;
  };

  const navigateMonth = (direction: -1 | 1) => {
    const nextMonth = clampVisibleMonth(addMonths(visibleMonth(), direction));
    if (isSameMonth(nextMonth, visibleMonth())) {
      return null;
    }

    setVisibleMonth(nextMonth);

    const nextFocus = findNearestEnabledDate(
      shiftDateByMonths(focusedDate(), direction),
      direction,
    );

    setFocusedDate(nextFocus);

    return nextFocus;
  };

  const canNavigatePrevious = createMemo(() => {
    const previousMonth = addMonths(visibleMonth(), -1);
    const min = options.minDate();

    if (!min) return true;

    return compareMonths(previousMonth, startOfMonth(min)) >= 0;
  });

  const canNavigateNext = createMemo(() => {
    const nextMonth = addMonths(visibleMonth(), 1);
    const max = options.maxDate();

    if (!max) return true;

    return compareMonths(nextMonth, startOfMonth(max)) <= 0;
  });

  const syncFocusedDate = (value: Date | null) => {
    if (!value) return;

    setFocusedDate(value);
    setVisibleMonthFromDate(value);
  };

  return {
    visibleMonth,
    focusedDate,
    setFocusedDate,
    clampVisibleMonth,
    setVisibleMonthFromDate,
    findNearestEnabledDate,
    moveFocusToDate,
    navigateMonth,
    canNavigatePrevious,
    canNavigateNext,
    syncFocusedDate,
  };
};
