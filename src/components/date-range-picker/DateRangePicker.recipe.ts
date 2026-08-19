import { recipe } from "../../lib/layouts";
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
export const componentRecipe = recipe({
  component: "date-range-picker",
  slots: {
    "date-range-picker": {},
    "date-range-picker-calendar": {},
    "date-range-picker-end": {},
    "date-range-picker-popover": {},
    "date-range-picker-range-separator": {},
    "date-range-picker-start": {},
    "date-range-picker-trigger": {},
    "date-range-picker-trigger-icon": {},
    "date-range-picker-trigger-indicator": {},
    root: {},
  },
});
