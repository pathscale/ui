import { cva } from "@src/lib/style";

export const progressContainer = cva("relative w-full max-w-md select-none", {
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: { size: "md" },
});

export const progressWrapper = cva(
  "overflow-hidden bg-[var(--color-base-300)]",
  {
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
  }
);

export const progressFill = cva("h-full transition-all duration-300", {
  variants: {
    color: {
      default: "bg-[var(--color-neutral)]",
      danger: "bg-[var(--color-error)]",
      success: "bg-[var(--color-success)]",
      info: "bg-[var(--color-info)]",
      warning: "bg-[var(--color-warning)]",
    },
    variant: {
      filled: "",
      outlined: "bg-opacity-0 ring-1 ring-[var(--color-base-300)]",
      ghost: "bg-opacity-50",
    },
  },
  defaultVariants: {
    color: "default",
    variant: "filled",
  },
});

export const progressLabel = cva(
  "absolute top-0 right-0 h-full flex items-center pr-2 text-xs font-medium text-[var(--color-fg-secondary)]"
);
