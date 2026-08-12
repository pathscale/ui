import { recipe } from "solid-layouts";

/**
 * `fullWidth` was two entries again, `ui-select--full-width` on the root and
 * `ui-select__trigger--full-width` filed under `slot`. The second was not a
 * slot at all, it was the same choice reaching a second element, sitting in
 * the map that had room for it.
 */
export const select = recipe({
  component: "ui-select",
  element: "div",
  slots: {
    root: { base: "ui-select" },
    trigger: { base: "ui-select__trigger" },
    value: { base: "ui-select__value" },
    indicator: { base: "ui-select__indicator" },
    icon: { base: "ui-select__icon" },
    iconStart: { base: "ui-select__icon--start" },
    iconEnd: { base: "ui-select__icon--end" },
    popover: { base: "ui-select__popover" },
    listbox: { base: "ui-select__listbox" },
    option: { base: "ui-select__option" },
    optionLabel: { base: "ui-select__option-label" },
    optionIndicator: { base: "ui-select__option-indicator" },
  },
  props: {
    variant: {
      primary: "ui-select--primary",
      secondary: "ui-select--secondary",
    },
    fullWidth: {
      true: {
        root: "ui-select--full-width",
        trigger: "ui-select__trigger--full-width",
      },
    },
  },
});
