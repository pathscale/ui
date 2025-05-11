import { cva } from "@src/lib/style";

export const selectVariants = cva(
  [
    "relative inline-flex items-center appearance-none",
    "border outline-none",
    "transition bg-white text-black",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-3 py-2",
        lg: "text-lg px-4 py-2",
      },
      color: {
        primary: "border-gray-300 focus:border-primary",
        info: "border-blue-300 focus:border-blue-500",
        success: "border-green-300 focus:border-green-500",
        warning: "border-yellow-300 focus:border-yellow-500",
        danger: "border-red-300 focus:border-red-500",
      },
      loading: {
        true: "cursor-wait opacity-75",
        false: "",
      },
      expanded: {
        true: "w-full",
        false: "w-fit",
      },
      rounded: {
        true: "rounded",
        false: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
      loading: false,
      expanded: false,
      rounded: false,
    },
  }
);
