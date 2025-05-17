import { cva } from "@src/lib/style";

export const inputWrapperClass = "relative flex items-center";

export const inputVariants = cva(
  [
    "block w-full appearance-none outline-none bg-transparent",
    "border transition-colors duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      color: {
        danger: "border-red-500 text-red-600",
        success: "border-green-500 text-green-600",
        warning: "border-orange-500 text-orange-600",
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-md",
      },
      expanded: {
        true: "w-full",
        false: "w-fit",
      },
      loading: {
        true: "opacity-50",
        false: "",
      },
      hasLeftIcon: {
        true: "pl-10",
        false: "pl-4",
      },
      hasRightIcon: {
        true: "pr-10",
        false: "pr-4",
      },
    },
    defaultVariants: {
      color: undefined,
      rounded: false,
      expanded: true,
      loading: false,
      hasLeftIcon: false,
      hasRightIcon: false,
    },
  }
);

export const iconLeftClass =
  "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400";
export const iconRightClass =
  "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400";
export const iconButtonClass =
  "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500";
