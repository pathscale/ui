import { cva } from "@src/lib/style";

export const autocompleteWrapperClass = "relative w-full";

export const inputBoxClass = cva(
  "w-full rounded-md border border-[var(--color-base-300)] px-4 py-2 text-sm outline-none transition-colors",
  {
    variants: {
      state: {
        default:
          "bg-[var(--color-base-100)] text-[var(--color-fg-primary)] hover:border-[var(--color-base-400)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]",
        disabled:
          "bg-[var(--color-base-200)] text-[var(--color-fg-secondary)] cursor-not-allowed",
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
  "absolute left-0 right-0 z-10 mt-1 rounded-md border border-[var(--color-base-300)] bg-[var(--color-base-100)] shadow-md max-h-60 overflow-auto text-sm",
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
        true: "bg-[var(--color-primary)] text-[var(--color-primary-content)]",
        false:
          "hover:bg-[var(--color-base-200)] text-[var(--color-fg-primary)]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export const dropdownEmptyClass =
  "px-4 py-2 text-sm text-[var(--color-fg-secondary)]";

export const labelClass =
  "block text-sm font-medium text-[var(--color-fg-primary)] mb-1";
