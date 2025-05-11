import { cva } from "@src/lib/style";

export const checkboxVariants = cva(
  [
    "relative inline-flex items-center gap-2 cursor-pointer",
    "select-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      color: {
        primary: "text-primary",
        success: "text-green-600",
        warning: "text-yellow-600",
        danger: "text-red-600",
      },
      checked: {
        true: "",
        false: "",
      },
      indeterminate: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
      checked: false,
      indeterminate: false,
    },
  }
);
