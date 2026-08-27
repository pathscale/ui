import { recipe } from "../../lib/layouts";
export const CLASSES = {
  // `ui-overlay-host` is the shared containing block every non-portaled overlay
  // needs; see `_shared/overlayHost.css`.
  base: "ui-select ui-overlay-host",
  flag: {
    fullWidth: "ui-select--full-width",
  },
  variant: {
    primary: "ui-select--primary",
    secondary: "ui-select--secondary",
  },
  slot: {
    trigger: "ui-select__trigger",
    triggerFullWidth: "ui-select__trigger--full-width",
    value: "ui-select__value",
    indicator: "ui-select__indicator",
    icon: "ui-select__icon",
    iconStart: "ui-select__icon--start",
    iconEnd: "ui-select__icon--end",
    popover: "ui-select__popover",
    listbox: "ui-select__listbox",
    option: "ui-select__option",
    optionLabel: "ui-select__option-label",
    optionIndicator: "ui-select__option-indicator",
  },
} as const;
export const componentRecipe = recipe({component:"select",slots:{"root":{},"ui-select":{},"ui-select-indicator":{},"ui-select-indicator-end-icon":{},"ui-select-indicator-start-icon":{},"ui-select-listbox":{},"ui-select-option":{},"ui-select-option-end-icon":{},"ui-select-option-indicator":{},"ui-select-option-label":{},"ui-select-option-start-icon":{},"ui-select-popover":{},"ui-select-trigger":{},"ui-select-trigger-end-icon":{},"ui-select-trigger-start-icon":{},"ui-select-value":{},},});
