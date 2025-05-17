import { cva } from "@src/lib/style";

export const fieldWrapper = cva(
  "flex flex-col space-y-1",
  {
    variants: {
      horizontal: {
        true: "flex-row items-center space-x-2 space-y-0",
        false: "flex-col",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      type: {
        default: "",
        danger: "text-red-600",
      },
      grouped: {
        true: "flex flex-wrap gap-2",
        false: "",
      },
      groupMultiline: {
        true: "flex-col",
        false: "flex-row",
      },
    },
    compoundVariants: [
      { horizontal: true, grouped: true, class: "items-start" },
    ],
    defaultVariants: {
      horizontal: false,
      size: "md",
      type: "default",
      grouped: false,
      groupMultiline: false,
    },
  }
);

export const labelStyles = cva("font-medium", {
  variants: {
    size: { sm: "text-sm", md: "text-base", lg: "text-lg" },
    type: { default: "text-gray-800", danger: "text-red-600" },
  },
  defaultVariants: { size: "md", type: "default" },
});

export const messageStyles = cva("mt-1 text-sm", {
  variants: {
    type: { default: "text-gray-600", danger: "text-red-600" },
  },
  defaultVariants: { type: "default" },
});
