import { cva } from "@src/lib/style";

export const fieldWrapper = cva("flex flex-col space-y-1", {
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
    {
      horizontal: true,
      grouped: true,
      class: "items-start", // when horizontal+grouped, align labels top
    },
  ],
  defaultVariants: {
    horizontal: false,
    size: "md",
    type: "default",
    grouped: false,
    groupMultiline: false,
  },
});

export const labelStyles = cva("font-medium", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    type: {
      default: "text-gray-800",
      danger: "text-red-600",
    },
  },
  defaultVariants: {
    size: "md",
    type: "default",
  },
});

export const messageStyles = cva("mt-1 text-sm", {
  variants: {
    type: {
      default: "text-gray-600",
      danger: "text-red-600",
    },
  },
  defaultVariants: {
    type: "default",
  },
});

// Reuse existing inputStyles & buttonStyles if needed

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
