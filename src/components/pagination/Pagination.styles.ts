import { cva } from "@src/lib/style";

export const paginationItemVariants = cva(
  [
    "inline-flex items-center justify-center font-medium transition-colors",
    "select-none border border-transparent", // border shown only when needed
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      active: {
        true: "bg-blue-500 text-white hover:bg-blue-600",
        false:
          "bg-transparent text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700",
      },
      rounded: {
        true: "rounded-full",
        false: "rounded",
      },
      simple: {
        true: "border-none bg-transparent hover:bg-transparent text-gray-700 dark:text-gray-300",
        false: "",
      },
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2",
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      rounded: false,
      simple: false,
      size: "md",
      disabled: false,
    },
  }
);
