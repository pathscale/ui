import { recipe } from "solid-layouts";

export const datePicker = recipe({
  component: "date-picker",
  element: "div",
  slots: {
    root: { base: "date-picker" },
    trigger: { base: "date-picker__trigger" },
    triggerValue: { base: "date-picker__trigger-value" },
    triggerIndicator: { base: "date-picker__trigger-indicator" },
    triggerIcon: { base: "date-picker__trigger-icon" },
    popover: { base: "date-picker__popover" },
    calendar: { base: "date-picker__calendar" },

  },
  state: {
    open: { true: "date-picker--open" },
    disabled: { true: "date-picker--disabled" },
    placeholder: { true: { triggerValue: "date-picker__trigger-value--placeholder" } },
  },
});
