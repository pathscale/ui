import { recipe } from "solid-layouts";

/**
 * Calendar's cell carries ten pieces of state at once, and every one of them
 * is computed rather than picked: selected, range start, range end, in range,
 * in preview range, today, outside the month, disabled, unavailable, focused.
 *
 * They are all independent, so a cell can be several at the same time, which
 * is why they are ten boolean axes rather than one enumerated one. As state
 * they mirror to `data-*` and a rule can select on any combination without a
 * modifier class existing for each pairing.
 */
export const calendar = recipe({
  component: "calendar",
  element: "div",
  slots: {
    root: { base: "calendar" },
    header: { base: "calendar__header" },
    heading: { base: "calendar__heading" },
    nav: { base: "calendar__nav" },
    navButton: { base: "calendar__nav-button" },
    grid: { base: "calendar__grid" },
    gridHeader: { base: "calendar__grid-header" },
    gridBody: { base: "calendar__grid-body" },
    gridRow: { base: "calendar__grid-row" },
    headerCell: { base: "calendar__header-cell" },
    dayWrapper: { base: "calendar__day-wrapper" },
    dayPlaceholder: { base: "calendar__day-placeholder" },
    cell: { base: "calendar__cell" },
    day: { base: "calendar__day" },
  },
  state: {
    disabled: { true: "calendar--disabled" },
    selected: { true: { cell: "calendar__cell--selected" } },
    rangeStart: { true: { cell: "calendar__cell--range-start" } },
    rangeEnd: { true: { cell: "calendar__cell--range-end" } },
    inRange: { true: { cell: "calendar__cell--in-range" } },
    inPreviewRange: { true: { cell: "calendar__cell--in-preview-range" } },
    today: { true: { cell: "calendar__cell--today" } },
    outsideMonth: { true: { cell: "calendar__cell--outside-month" } },
    cellDisabled: { true: { cell: "calendar__cell--disabled" } },
    unavailable: { true: { cell: "calendar__cell--unavailable" } },
    focused: { true: { cell: "calendar__cell--focused" } },
  },
});
