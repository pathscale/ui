import { cva } from "@src/lib/style";

export const avatarVariants = cva(
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
        sm: "w-8 h-8 text-sm",
        md: "w-16 h-16 text-base",
        lg: "w-24 h-24 text-lg",
      },
      shape: {
        circle: "rounded-full overflow-hidden",
        rounded: "rounded-lg overflow-hidden",
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
