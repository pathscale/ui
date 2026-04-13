export const CLASSES = {
  Root: {
    base: "calendar",
    flag: {
      disabled: "calendar--disabled",
    },
  },
  Header: {
    base: "calendar__header",
  },
  Heading: {
    base: "calendar__heading",
  },
  Nav: {
    base: "calendar__nav",
  },
  NavButton: {
    base: "calendar__nav-button",
  },
  NavButtonIcon: {
    base: "calendar__nav-button-icon",
  },
  Grid: {
    base: "calendar__grid",
  },
  GridHeader: {
    base: "calendar__grid-header",
  },
  GridBody: {
    base: "calendar__grid-body",
  },
  GridRow: {
    base: "calendar__grid-row",
  },
  HeaderCell: {
    base: "calendar__header-cell",
  },
  DayWrapper: {
    base: "calendar__day-wrapper",
  },
  DayPlaceholder: {
    base: "calendar__day-placeholder",
  },
  Cell: {
    base: "calendar__cell",
    flag: {
      selected: "calendar__cell--selected",
      today: "calendar__cell--today",
      outsideMonth: "calendar__cell--outside-month",
      disabled: "calendar__cell--disabled",
      unavailable: "calendar__cell--unavailable",
      focused: "calendar__cell--focused",
    },
  },
  Day: {
    base: "calendar__day",
  },
} as const;
