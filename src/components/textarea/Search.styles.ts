// components/DevShowcaseField.styles.ts
import { cva } from "@src/lib/style";

export const searchVariants = cva("flex flex-col space-y-4", {
  variants: {
    addons: {
      true: "inline-flex items-stretch",
      false: "flex-col space-y-4",
    },
    position: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
  },
  defaultVariants: {
    addons: false,
    position: "left",
  },
});

export const inputStyles = cva(
  "border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
);

export const selectStyles = cva(
  "border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
);

export const buttonVariants = cva("rounded px-4 py-2 font-medium", {
  variants: {
    type: {
      info: "bg-blue-500 text-white hover:bg-blue-600",
      static: "bg-gray-200 text-gray-700 cursor-default",
      default: "bg-gray-300 text-gray-700 hover:bg-gray-400",
    },
  },
  defaultVariants: {
    type: "default",
  },
});
