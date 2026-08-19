import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "input-otp",
    variant: {
      primary: "input-otp--primary",
      secondary: "input-otp--secondary",
    },
  },
  Input: {
    base: "input-otp__input",
  },
  Group: {
    base: "input-otp__group",
  },
  Slot: {
    base: "input-otp__slot",
    value: "input-otp__slot-value",
    caret: "input-otp__caret",
  },
  Separator: {
    base: "input-otp__separator",
  },
} as const;
export const componentRecipe = recipe({
  component: "input-otp",
  slots: {
    "input-otp": {},
    "input-otp-caret": {},
    "input-otp-group": {},
    "input-otp-input": {},
    "input-otp-separator": {},
    "input-otp-slot": {},
    "input-otp-slot-value": {},
    root: {},
  },
});
