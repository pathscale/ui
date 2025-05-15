import { cva } from "@src/lib/style";

export const switchVariants = cva(
  "switch inline-flex items-center gap-2 select-none",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
      rounded: {
        true: "",
        false: "",
      },
      outlined: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      disabled: false,
      rounded: true,
      outlined: false,
    },
  }
);

export const checkVariants = cva(
  [
    "relative transition-colors duration-200",
    "after:content-[''] after:absolute after:bg-white after:transition-transform after:duration-700 after:ease-in-out",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "w-8 h-4 after:w-3 after:h-3 after:left-0.5 after:top-0.5 peer-checked:after:translate-x-4",
        md: "w-10 h-6 after:w-4 after:h-4 after:left-1 after:top-1 peer-checked:after:translate-x-4",
        lg: "w-12 h-7 after:w-5 after:h-5 after:left-1 after:top-1 peer-checked:after:translate-x-5",
      },
      color: {
        blue: "peer-checked:bg-blue-500",
        green: "peer-checked:bg-green-500",
        red: "peer-checked:bg-red-500",
        yellow: "peer-checked:bg-yellow-400",
        gray: "peer-checked:bg-gray-500",
      },
      passiveColor: {
        blue: "bg-blue-200",
        green: "bg-green-200",
        red: "bg-red-200",
        yellow: "bg-yellow-200",
        gray: "bg-gray-300",
      },
      rounded: {
        true: "rounded-full after:rounded-full",
        false: "rounded-md after:rounded-sm",
      },
      outlined: {
        true: "ring-2 ring-inset ring-white",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      color: "blue",
      passiveColor: "gray",
      rounded: true,
      outlined: false,
    },
  }
);
