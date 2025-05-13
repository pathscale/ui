import { cva } from "@src/lib/style";

export const searchWrapper = cva("flex gap-2 items-center", {
  variants: {
    fullWidth: {
      true: "w-full",
      false: "w-auto",
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

export const inputStyles = cva(
  "border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const buttonStyles = cva(
  "rounded px-4 py-2 font-medium transition-colors",
  {
    variants: {
      color: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-300 text-gray-700 hover:bg-gray-400",
      },
      loading: {
        true: "opacity-60 cursor-not-allowed",
        false: "",
      },
    },
    compoundVariants: [
      {
        color: "primary",
        loading: true,
        class: "bg-blue-400",
      },
    ],
    defaultVariants: {
      color: "primary",
      loading: false,
    },
  }
);
