import { cva } from "@src/lib/style";

export const tableVariants = cva(
  [
    "min-w-full divide-y",
    "border border-gray-200 shadow overflow-x-auto rounded-lg",
    "text-sm text-left",
  ],
  {
    variants: {
      header: {
        default: "bg-gray-50 font-semibold text-gray-700",
      },
      row: {
        default: "divide-y divide-gray-100",
      },
      cell: {
        default: "px-4 py-2",
      },
    },
    defaultVariants: {
      header: "default",
      row: "default",
      cell: "default",
    },
  }
);

export const tableWrapper = cva(
  "overflow-x-auto rounded-lg border border-gray-200 shadow"
);
// Optional: column divider class for reuse
export const columnDividerClass = "border-r border-gray-200";