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
        true: "opacity-50",
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
    "after:content-[''] after:absolute after:bg-white after:transition-transform after:duration-700 after:ease-in-out after:shadow-sm",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "w-8 h-4 after:w-3 after:h-3 after:left-0.5 after:top-0.5 peer-checked:after:translate-x-4",
        md: "w-10 h-6 after:w-4 after:h-4 after:left-1 after:top-1 peer-checked:after:translate-x-4",
        lg: "w-12 h-7 after:w-5 after:h-5 after:left-1 after:top-1 peer-checked:after:translate-x-5",
      },

      color: {
        primary: "peer-checked:bg-blue-500",
        success: "peer-checked:bg-green-500",
        danger: "peer-checked:bg-red-500",
        warning: "peer-checked:bg-yellow-400",
        gray: "peer-checked:bg-gray-400",
      },

      passiveColor: {
        primary: "bg-blue-500",
        success: "bg-green-500",
        danger: "bg-red-500",
        warning: "bg-yellow-400",
        gray: "bg-gray-400",
      },

      rounded: {
        true: "rounded-full after:rounded-full",
        false: "rounded-md after:rounded-sm",
      },

      outlined: {
        true: "bg-transparent ring border-current",
        false: "",
      },

      disabled: {
        true: "bg-gray-200 border border-gray-300 after:bg-gray-100",
        false: "",
      },
    },

    defaultVariants: {
      size: "md",
      color: "primary",
      passiveColor: "gray",
      rounded: true,
      outlined: false,
    },
  }
);

export const switchLabelClass = cva("control-label", {
  variants: {
    disabled: {
      true: "text-gray-400 dark:text-gray-500",
      false: "text-gray-800 dark:text-gray-200",
    },
  },
  defaultVariants: {
    disabled: false,
  },
});
