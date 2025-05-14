import { cva } from "@src/lib/style";

export const tabsNavVariants = cva(
  ["flex border-b", "text-sm font-medium text-gray-600 dark:text-gray-300"],
  {
    variants: {
      type: {
        boxed: "border border-gray-300 rounded",
        toggle: "bg-gray-100 dark:bg-gray-700",
        "toggle-rounded": "bg-gray-100 dark:bg-gray-700 rounded-full",
      },
      size: {
        sm: "text-xs gap-1",
        md: "text-sm gap-2",
        lg: "text-base gap-3",
      },
      alignment: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      },
      expanded: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      alignment: "left",
      expanded: false,
    },
  }
);

export const tabTriggerVariants = cva(
  [
    "px-3 py-2 cursor-pointer border-b-2 transition-colors",
    "hover:text-blue-600",
  ],
  {
    variants: {
      active: {
        true: "border-blue-500 text-blue-600",
        false: "border-transparent",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
);
