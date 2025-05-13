import { cva } from "@src/lib/style";

export const tableWrapper = cva("overflow-x-auto rounded-lg border border-gray-200 shadow");

export const tableVariants = cva(
  [
    "min-w-full",
    "text-sm text-left",
    "divide-y divide-gray-100",
    "border border-gray-200 rounded-lg shadow",
  ],
  {
    variants: {
      header: {
        default: "bg-gray-50 font-semibold text-gray-700",
      },
      row: {
        default: "",
      },
      cell: {
        default: "px-4 py-2",
      },
      // new variant to toggle the right-border divider
      divider: {
        on: "border-r border-gray-200",
        off: "",
      },
    },
    compoundVariants: [
      // combinations
    ],
    defaultVariants: {
      header: "default",
      row: "default",
      cell: "default",
      divider: "on",
    },
  }
);
