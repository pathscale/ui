import { cva } from "@src/lib/style";

// Outer container: scroll + border + shadow
export const tableWrapper = cva(
  "overflow-x-auto rounded-lg border border-gray-200 shadow"
);

export const tableVariants = cva(
  [
    "min-w-full",
    "text-sm text-left",
    "divide-y divide-gray-100",
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
      divider: {
        on: "border-r border-gray-200 last:border-r-0",
        off: "",
      },
    },
    defaultVariants: {
      header: "default",
      row: "default",
      cell: "default",
      divider: "on",
    },
  }
);
