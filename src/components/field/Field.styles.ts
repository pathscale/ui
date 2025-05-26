import { cva } from "@src/lib/style";

export const fieldWrapper = cva("flex flex-col space-y-1", {
  variants: {
    horizontal: {
      true: "flex-row items-center space-x-2 space-y-0",
      false: "flex-col",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    type: {
      default: "",
      danger: "text-[var(--color-error)]",
    },
    grouped: {
      true: "flex flex-wrap gap-2",
      false: "",
    },
    groupMultiline: {
      true: "flex-col",
      false: "flex-row",
    },
  },
  compoundVariants: [{ horizontal: true, grouped: true, class: "items-start" }],
  defaultVariants: {
    horizontal: false,
    size: "md",
    type: "default",
    grouped: false,
    groupMultiline: false,
  },
});

export const labelStyles = cva("font-medium", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    type: {
      default: "text-[var(--color-fg-primary)]",
      danger: "text-[var(--color-error)]",
    },
  },
  defaultVariants: {
    size: "md",
    type: "default",
  },
});

export const messageStyles = cva("mt-1 text-sm", {
  variants: {
    type: {
      default: "text-[var(--color-fg-secondary)]",
      danger: "text-[var(--color-error)]",
    },
  },
  defaultVariants: {
    type: "default",
  },
});
