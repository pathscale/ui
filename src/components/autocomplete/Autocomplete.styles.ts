import { cva } from "@src/lib/style";

export const autocompleteWrapperClass = "relative w-full";

export const inputBoxClass = cva(
  "w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none transition-colors",
  {
    variants: {
      state: {
        default:
          "bg-white text-gray-800 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
        disabled: "bg-gray-100 text-gray-400 cursor-not-allowed",
      },
      size: {
        sm: "text-sm py-1 px-2",
        md: "text-sm py-2 px-4",
        lg: "text-base py-3 px-4",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
    },
  }
);

export const dropdownMenuClass = cva(
  "absolute left-0 right-0 z-10 mt-1 rounded-md border border-gray-200 bg-white shadow-md max-h-60 overflow-auto text-sm",
  {
    variants: {
      isOpen: {
        true: "block",
        false: "hidden",
      },
    },
    defaultVariants: {
      isOpen: true,
    },
  }
);

export const dropdownItemClass = cva(
  "w-full text-left px-4 py-2 cursor-pointer transition-colors",
  {
    variants: {
      active: {
        true: "bg-blue-500 text-white",
        false: "hover:bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const dropdownEmptyClass = "px-4 py-2 text-sm text-gray-500";

export const labelClass = "block text-sm font-medium text-gray-700 mb-1";
