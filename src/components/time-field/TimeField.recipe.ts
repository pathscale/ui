import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "time-field",
    variant: {
      primary: "time-field--primary",
      secondary: "time-field--secondary",
    },
    flag: {
      fullWidth: "time-field--full-width",
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
export const componentRecipe = recipe({
  component: "time-field",
  slots: {
    "date-input-group": {},
    "date-input-group-input": {},
    "date-input-group-input-container": {},
    "date-input-group-prefix": {},
    "date-input-group-segment": {},
    "date-input-group-suffix": {},
    root: {},
    "time-field": {},
  },
});
