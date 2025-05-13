import { cva } from "@src/lib/style";

export const textareaVariants = cva(
  [
    "block w-full rounded-md border bg-white px-3 py-2 text-sm",
    "text-gray-900 placeholder-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "text-sm py-1.5",
        md: "text-base py-2",
        lg: "text-lg py-3",
      },
      color: {
        primary: "border-blue-500",
        info: "border-cyan-500",
        success: "border-green-500",
        warning: "border-yellow-500",
        danger: "border-red-500",
      },
      loading: {
        true: "opacity-50 cursor-wait",
        false: "",
      },
      resize: {
        none: "resize-none",
        both: "resize",
        x: "resize-x",
        y: "resize-y",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
      loading: false,
      resize: "y",
    },
  }
);
