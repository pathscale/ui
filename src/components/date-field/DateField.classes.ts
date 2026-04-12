export const CLASSES = {
  Root: {
    base: "date-field",
    variant: {
      primary: "date-field--primary",
      secondary: "date-field--secondary",
    },
    flag: {
      fullWidth: "date-field--full-width",
    },
  },
  Group: {
    base: "date-input-group",
    variant: {
      primary: "date-input-group--primary",
      secondary: "date-input-group--secondary",
    },
    flag: {
      fullWidth: "date-input-group--full-width",
    },
  },
  Input: {
    base: "date-input-group__input",
  },
  InputContainer: {
    base: "date-input-group__input-container",
  },
  Segment: {
    base: "date-input-group__segment",
  },
  Prefix: {
    base: "date-input-group__prefix",
  },
  Suffix: {
    base: "date-input-group__suffix",
  },
} as const;
