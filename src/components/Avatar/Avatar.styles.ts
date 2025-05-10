import { cva } from "@src/lib/style";

export const avatarVariants = cva(
  [
    "inline-flex items-center justify-center font-medium outline-none select-none",
    "not-disabled:cursor-pointer",
    "disabled:cursor-not-allowed disabled:opacity-25",
    "aria-busy:cursor-wait",
    "transition active:transition-none",
  ],
  {
    variants: {
      size: {
        sm: "w-8 h-8 text-sm",
        md: "w-16 h-16 text-base",
        lg: "w-24 h-24 text-lg",
      },
      shape: {
        circle: "rounded-full",
        rounded: "rounded-lg",
      },
      variant: {
        filled: "bg-gray-200 text-gray-800",
        outlined: "border-2 border-gray-300 text-gray-800",
        ghost: "text-gray-800",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      variant: "filled",
    },
  }
);