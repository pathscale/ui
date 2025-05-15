import { cva } from "@src/lib/style";

export const progressWrapper = cva("mt-4 w-full max-w-md");

export const progressBar = cva("w-full h-5 relative overflow-hidden rounded-lg bg-gray-200");

export const progressFill = cva("h-full transition-all duration-300", {
  variants: {
    color: {
      danger: "bg-red-500",
      success: "bg-green-500",
      info: "bg-blue-500",
      warning: "bg-yellow-500",
      default: "bg-gray-500",
    },
  },
  defaultVariants: {
    color: "default",
  },
});

export const progressLabel = cva("mt-2 text-right text-sm text-gray-700");

export const progressVariants = cva(
  [
    "flex items-center justify-center mx-1",
    "font-medium outline-none select-none transition active:transition-none",
    "not-disabled:cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-25",
    "aria-busy:cursor-wait",
  ],
  {
    variants: {
      size: {
        sm: "size-8 text-sm",
        md: "size-16 text-base",
        lg: "size-24 text-lg",
      },
      shape: {
        circle: "rounded-full overflow-hidden",
        rounded: "rounded-lg overflow-hidden",
      },
      variant: {
        filled: "text-gray-800",
        outlined: "border-2 border-gray-300 text-gray-800",
        ghost: "text-gray-800",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "rounded",
      variant: "filled",
    },
  }
);
