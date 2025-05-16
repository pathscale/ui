import { cva } from "@src/lib/style";

export const toastWrapperClass = cva(
  "relative flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 w-full",
  {
    variants: {
      type: {
        default: "bg-gray-700 text-white",
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        info: "bg-blue-600 text-white",
        warning: "bg-yellow-400 text-black",
      },
      visible: {
        true: "opacity-100 translate-y-0",
        false: "opacity-0 -translate-y-2 pointer-events-none",
      },
    },
    defaultVariants: {
      type: "default",
      visible: true,
    },
  }
);
