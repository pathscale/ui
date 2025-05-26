import { cva } from "@src/lib/style";

export const tableWrapper = cva(
  "overflow-x-auto rounded-lg border border-[var(--color-base-300)] shadow"
);

export const tableVariants = cva(
  [
    "min-w-full",
    "text-sm text-left",
    "divide-y divide-[var(--color-base-200)]",
  ],
  {
    variants: {
      header: {
        default:
          "bg-[var(--color-base-100)] font-semibold text-[var(--color-fg-secondary)]",
      },
      row: {
        default: "",
      },
      cell: {
        default: "px-4 py-2",
      },
      divider: {
        on: "border-r border-[var(--color-base-300)] last:border-r-0",
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
