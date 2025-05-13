import { cva } from "@src/lib/style";

export const tooltipVariants = cva(
  [
    "absolute z-10 px-3 py-1 text-white text-sm",
    "opacity-0 group-hover:opacity-100",
    "pointer-events-none transition-opacity duration-200",
    "max-w-xs break-words",
  ].join(" "),
  {
    variants: {
      type: {
        info: "bg-blue-500",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
        primary: "bg-indigo-500",
        gray: "bg-gray-700",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      rounded: {
        true: "rounded",
        false: "rounded-none",
      },
      dashed: {
        true: "border border-white border-dashed",
        false: "",
      },
      multilined: {
        true: "whitespace-pre-wrap",
        false: "whitespace-nowrap",
      },
      animated: {
        true: "transition-opacity duration-300 ease-in-out",
        false: "",
      },
      position: {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
      },
    },
    defaultVariants: {
      type: "primary",
      size: "md",
      rounded: true,
      dashed: false,
      multilined: false,
      animated: true,
      position: "top",
    },
  }
);
