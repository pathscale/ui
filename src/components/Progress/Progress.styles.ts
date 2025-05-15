import { cva } from "@src/lib/style";

/**
 * The outer flex container.  We don’t apply shape or variant here any more —
 * that all goes on the actual track (`progressWrapper`).
 */
export const progressContainer = cva(
  "relative w-full max-w-md select-none",
  {
    variants: {
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    defaultVariants: { size: "md" },
  }
);

/**
 * The “track” itself: background, height, pill‐shape.
 */
export const progressWrapper = cva("overflow-hidden bg-gray-200", {
  variants: {
    size: {
      sm: "h-2",
      md: "h-4",
      lg: "h-6",
    },
    shape: {
      rounded: "rounded-lg",
      circle: "rounded-full",
    },
  },
  defaultVariants: {
    size: "md",
    shape: "rounded",
  },
});

/**
 * The colored fill bar.
 */
export const progressFill = cva("h-full transition-all duration-300", {
  variants: {
    color: {
      default: "bg-gray-500",
      danger: "bg-red-500",
      success: "bg-green-500",
      info: "bg-blue-500",
      warning: "bg-yellow-500",
    },
    variant: {
      filled: "",
      outlined: "bg-opacity-0 ring-1 ring-gray-300",
      ghost: "bg-opacity-50",
    },
  },
  defaultVariants: {
    color: "default",
    variant: "filled",
  },
});

/**
 * The percentage label, absolutely positioned at the end of the track.
 */
export const progressLabel = cva(
  "absolute top-0 right-0 h-full flex items-center pr-2 text-xs font-medium text-gray-700"
);