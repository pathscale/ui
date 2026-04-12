export const CLASSES = {
  Root: {
    base: "combo-box",
    variant: {
      primary: "combo-box--primary",
      secondary: "combo-box--secondary",
    },
    flag: {
      fullWidth: "combo-box--full-width",
    },
  },
  InputGroup: {
    base: "combo-box__input-group",
    flag: {
      fullWidth: "combo-box__input-group--full-width",
    },
  },
  Input: {
    base: "combo-box__input",
  },
  Trigger: {
    base: "combo-box__trigger",
    icon: "combo-box__trigger-icon",
  },
  Popover: {
    base: "combo-box__popover",
  },
  List: {
    base: "combo-box__list",
    empty: "combo-box__empty",
  },
  Option: {
    base: "combo-box__option",
    label: "combo-box__option-label",
    indicator: "combo-box__option-indicator",
  },
  Icon: {
    base: "combo-box__icon",
    start: "combo-box__icon--start",
    end: "combo-box__icon--end",
  },
} as const;
