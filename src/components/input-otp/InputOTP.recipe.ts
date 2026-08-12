import { recipe } from "solid-layouts";

export const inputOtp = recipe({
  component: "input-otp",
  element: "div",
  slots: {
    root: { base: "input-otp" },
    input: { base: "input-otp__input" },
    group: { base: "input-otp__group" },
    slot: { base: "input-otp__slot" },
    slotValue: { base: "input-otp__slot-value" },
    caret: { base: "input-otp__caret" },
  },
  props: {
    variant: {
      primary: "input-otp--primary",
      secondary: "input-otp--secondary",
    },
  },
});
