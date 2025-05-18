import { cva } from "@src/lib/style";

export const selectVariants = cva(
  [
    "flex items-center appearance-none",
    "border outline-none",
    "transition bg-white text-gray-700",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "pl-3", // margen izquierdo por defecto
  ],
  {
    variants: {
      size: {
        sm: "text-sm py-1 px-2",
        md: "text-base py-2 px-3",
        lg: "text-lg py-2 px-4",
      },
      color: {
        primary: "border border-gray-300 focus:border-primary",
        info: "border border-blue-500 focus:border-blue-600",
        success: "border border-green-500 focus:border-green-600",
        warning: "border border-yellow-500 focus:border-yellow-600",
        danger: "border border-red-500 focus:border-red-600",
      },
      loading: {
        true: "cursor-wait opacity-75",
        false: "",
      },
      expanded: {
        true: "w-full",
        false: "w-fit",
      },
      rounded: {
        true: "rounded",
        false: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      color: "primary",
      loading: false,
      expanded: false,
      rounded: false,
    },
  }
);

export const wrapperClass = "relative w-full group cursor-pointer";

export const selectPaddingClass = "w-full pr-8";

export const caretIconBaseClass =
  "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors";

export const spinnerIconBaseClass =
  "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin pointer-events-none";

export const getIconColor = (color?: string) => {
  switch (color) {
    case "success":
      return "text-green-500 group-hover:text-green-600";
    case "danger":
      return "text-red-500 group-hover:text-red-600";
    case "warning":
      return "text-yellow-500 group-hover:text-yellow-600";
    case "info":
      return "text-blue-500 group-hover:text-blue-600";
    case "primary":
    default:
      return "text-gray-500 group-hover:text-gray-700";
  }
};

export const getSpinnerColor = (color?: string) => {
  switch (color) {
    case "success":
      return "text-green-500";
    case "danger":
      return "text-red-500";
    case "warning":
      return "text-yellow-500";
    case "info":
      return "text-blue-500";
    case "primary":
    default:
      return "text-gray-500";
  }
};
