export const CLASSES = {
  base: "input-root",
  slot: {
    control: "input-control",
    field: "input-field",
    label: "input-label",
    helper: "input-helper",
    icon: "input__icon",
    iconStart: "input__icon--start",
    iconEnd: "input__icon--end",
  },
  size: {
    sm: "input-control--sm",
    md: "input-control--md",
    lg: "input-control--lg",
  },
  flag: {
    fullWidthRoot: "input-root--full-width",
    fullWidthControl: "input-control--full-width",
    invalid: "input-control--invalid",
    disabled: "input-control--disabled",
    helperInvalid: "input-helper--invalid",
  },
} as const;
