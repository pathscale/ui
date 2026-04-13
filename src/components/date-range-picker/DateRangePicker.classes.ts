export const CLASSES = {
  Root: {
    base: "date-range-picker",
    flag: {
      open: "date-range-picker--open",
      disabled: "date-range-picker--disabled",
    },
  },
  Trigger: {
    base: "date-range-picker__trigger",
  },
  TriggerSegment: {
    base: "date-range-picker__trigger-segment",
    flag: {
      placeholder: "date-range-picker__trigger-segment--placeholder",
    },
  },
  RangeSeparator: {
    base: "date-range-picker__range-separator",
  },
  TriggerIndicator: {
    base: "date-range-picker__trigger-indicator",
  },
  TriggerIcon: {
    base: "date-range-picker__trigger-icon",
  },
  Popover: {
    base: "date-range-picker__popover",
  },
  Calendar: {
    base: "date-range-picker__calendar",
  },
} as const;
