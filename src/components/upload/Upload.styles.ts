import { cva } from "@src/lib/style";

export const uploadWrapperVariants = cva("", {
  variants: {
    style: {
      boxed:
        "flex flex-col items-center justify-center border border-gray-300 rounded-md p-4 bg-white dark:bg-gray-800 text-gray-700 hover:text-gray-900 text-center",
      button:
        "px-4 py-2 rounded inline-flex items-center gap-2 text-white transition-colors",
    },
    color: {
      primary: "bg-blue-500 hover:bg-blue-600",
      success: "bg-green-500 hover:bg-green-600",
      info: "bg-sky-500 hover:bg-sky-600",
      warning: "bg-yellow-500 hover:bg-yellow-600",
      danger: "bg-red-500 hover:bg-red-600",
      gray: "", // usado solo en style="boxed"
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    style: "boxed",
    color: "gray",
    size: "md",
  },
});

export const fileInputClass =
  "absolute inset-0 w-full h-full opacity-0 cursor-pointer";

export const fileIconClass = "w-6 h-6";

export const fileLabelClass = "font-medium";

export const fileNameClass =
  "border border-gray-300 rounded px-3 py-1 text-sm text-gray-700";
