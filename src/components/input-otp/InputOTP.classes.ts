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
