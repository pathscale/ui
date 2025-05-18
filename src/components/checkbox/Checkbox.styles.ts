import { cva } from "@src/lib/style";

export const checkboxVariants = cva(
  [
    "relative inline-flex items-center gap-2 select-none",
    "cursor-pointer disabled:cursor-default peer-disabled:cursor-default",
    "peer-disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      color: {
        primary: "text-blue-600",
        success: "text-green-600",
        warning: "text-yellow-600",
        danger: "text-red-600",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
    },
  }
);

export const checkboxMarkerVariants = cva(
  [
    "inline-flex items-center justify-center rounded-sm border",
    "transition-colors duration-200",
    "peer-disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "w-4 h-4 text-sm",
        md: "w-5 h-5 text-base",
        lg: "w-6 h-6 text-lg",
      },
      color: {
        primary: "bg-blue-600 border-blue-600",
        success: "bg-green-600 border-green-600",
        warning: "bg-yellow-400 border-yellow-400",
        danger: "bg-red-600 border-red-600",
      },
      variant: {
        colored: "text-white",
        default:
          "border-gray-400 text-gray-800 dark:text-gray-200 bg-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export const checkboxInputClass = "peer absolute opacity-0 w-4 h-4";

export const checkboxLabelClass = "ml-2 text-gray-800 dark:text-gray-200";
