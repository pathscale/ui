import { cva } from "@src/lib/style";

export const inputVariants = cva(
  [
    "block w-full appearance-none outline-none bg-transparent",
    "border transition-colors duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      color: {
        danger: "border-red-500 text-red-600",
        success: "border-green-500 text-green-600",
        warning: "border-orange-500 text-orange-600",
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-md",
      },
      expanded: {
        true: "w-full",
        false: "w-fit",
      },
      loading: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      color: undefined,
      rounded: false,
      expanded: true,
      loading: false,
    },
  }
);
