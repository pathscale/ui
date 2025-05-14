import { cva } from "@src/lib/style";

export const accordionContainerVariants = cva(
  ["w-full border rounded transition-colors", "bg-white dark:bg-gray-800"],
  {
    variants: {
      expanded: {
        true: "border-blue-500",
        false: "border-gray-300 dark:border-gray-600",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      expanded: false,
      disabled: false,
    },
  }
);

export const accordionHeaderVariants = cva(
  [
    "w-full text-left px-4 py-2 flex items-center justify-between cursor-pointer",
    "transition-colors duration-200",
  ],
  {
    variants: {
      headerIsTrigger: {
        true: "hover:bg-gray-100 dark:hover:bg-gray-700",
        false: "",
      },
    },
    defaultVariants: {
      headerIsTrigger: true,
    },
  }
);

export const accordionContentVariants = cva(
  "px-4 py-2 border-t border-gray-200 dark:border-gray-700"
);
