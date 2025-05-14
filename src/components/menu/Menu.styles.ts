import { cva } from "@src/lib/style";

export const menuWrapper = cva("bg-white border border-gray-200 rounded shadow", {
  variants: {
    inline: {
      true: "flex space-x-4",
      false: "block",
    },
  },
  defaultVariants: {
    inline: false,
  },
});

// Shared for each list
export const listWrapper = cva("px-4 py-2", {
  variants: {
    label: {
      true: "pt-6",
      false: "",
    },
  },
  defaultVariants: {
    label: false,
  },
});

// Individual item
export const itemVariants = cva(
  "px-4 py-2 cursor-pointer select-none transition-colors",
  {
    variants: {
      active: {
        true: "bg-blue-100 font-semibold",
        false: "hover:bg-blue-500",
      },
      expanded: {
        true: "bg-gray-50 text-black",
        false: "",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed text-gray-700",
        false: "",
      },
    },
    compoundVariants: [
      {
        active: true,
        expanded: true,
        class: "bg-blue-200",
      },
    ],
    defaultVariants: {
      active: false,
      expanded: false,
      disabled: false,
    },
  }
);
