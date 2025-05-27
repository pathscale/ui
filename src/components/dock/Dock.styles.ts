import { cva } from "~/lib/style";

export const dockClass = cva("flex items-center justify-center", {
  variants: {
    size: {
      xs: "gap-0.5 p-0.5",
      sm: "gap-1 p-1",
      md: "gap-2 p-2",
      lg: "gap-4 p-4",
    },
    position: {
      top: "",
      bottom: "",
      left: "flex-col",
      right: "flex-col",
    },
    variant: {
      default: "rounded-lg bg-gray-200",
      floating: "shadow-lg rounded-full border bg-white border-gray-300",
      minimal: "bg-transparent",
    },
  },
  defaultVariants: {
    size: "md",
    position: "bottom",
    variant: "default",
  },
  compoundVariants: [
    {
      variant: "floating",
      position: "bottom",
      class: "fixed bottom-4 left-1/2 -translate-x-1/2",
    },
    {
      variant: "floating",
      position: "top",
      class: "fixed top-4 left-1/2 -translate-x-1/2",
    },
    {
      variant: "floating",
      position: "left",
      class: "fixed left-4 top-1/2 -translate-y-1/2",
    },
    {
      variant: "floating",
      position: "right",
      class: "fixed right-4 top-1/2 -translate-y-1/2",
    },
  ],
});

export const dockItemClass = cva(
  "flex items-center justify-center transition-all duration-200 cursor-pointer rounded-md",
  {
    variants: {
      active: {
        true: "scale-110",
        false: "hover:scale-105",
      },
      color: {
        neutral: "text-gray-700",
        primary: "text-blue-600",
        secondary: "text-purple-600",
        accent: "text-pink-600",
        info: "text-cyan-600",
        success: "text-green-600",
        warning: "text-yellow-600",
        error: "text-red-600",
        ghost: "text-gray-500 hover:text-gray-700",
      },
      size: {
        xs: "p-1 text-xs",
        sm: "p-2 text-sm",
        md: "p-3 text-base",
        lg: "p-4 text-lg",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      color: "neutral",
      size: "md",
      disabled: false,
    },
    compoundVariants: [
      {
        active: true,
        color: "neutral",
        class: "bg-gray-100",
      },
      {
        active: true,
        color: "primary",
        class: "bg-blue-100 text-blue-700",
      },
      {
        active: true,
        color: "secondary",
        class: "bg-purple-100 text-purple-700",
      },
      {
        active: true,
        color: "accent",
        class: "bg-pink-100 text-pink-700",
      },
      {
        active: true,
        color: "info",
        class: "bg-cyan-100 text-cyan-700",
      },
      {
        active: true,
        color: "success",
        class: "bg-green-100 text-green-700",
      },
      {
        active: true,
        color: "warning",
        class: "bg-yellow-100 text-yellow-700",
      },
      {
        active: true,
        color: "error",
        class: "bg-red-100 text-red-700",
      },
      {
        active: true,
        color: "ghost",
        class: "bg-gray-100 text-gray-700",
      },
      {
        active: false,
        disabled: false,
        class: "hover:bg-gray-50",
      },
      {
        disabled: true,
        class: "hover:scale-100 hover:bg-transparent",
      },
      {
        disabled: true,
        active: true,
        class: "scale-100 bg-gray-100/50",
      },
    ],
  }
);

export const dockLabelClass = cva(
  "text-xs font-medium transition-all duration-200",
  {
    variants: {
      position: {
        top: "mb-1",
        bottom: "mt-1",
        left: "mr-2",
        right: "ml-2",
      },
      color: {
        neutral: "text-gray-600",
        primary: "text-blue-600",
        secondary: "text-purple-600",
        accent: "text-pink-600",
        info: "text-cyan-600",
        success: "text-green-600",
        warning: "text-yellow-600",
        error: "text-red-600",
        ghost: "text-gray-500",
      },
      size: {
        xs: "text-xs",
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      variant: {
        default: "opacity-80 hover:opacity-100",
        tooltip:
          "absolute z-10 px-2 py-1 bg-gray-900 text-white rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200",
        badge: "px-1.5 py-0.5 bg-gray-100 rounded-full",
      },
    },
    defaultVariants: {
      position: "bottom",
      color: "neutral",
      size: "md",
      variant: "default",
    },
    compoundVariants: [
      {
        variant: "tooltip",
        position: "top",
        class: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      },
      {
        variant: "tooltip",
        position: "bottom",
        class: "top-full left-1/2 -translate-x-1/2 mt-2",
      },
      {
        variant: "tooltip",
        position: "left",
        class: "right-full top-1/2 -translate-y-1/2 mr-2",
      },
      {
        variant: "tooltip",
        position: "right",
        class: "left-full top-1/2 -translate-y-1/2 ml-2",
      },
      {
        variant: "badge",
        color: "primary",
        class: "bg-blue-100 text-blue-700",
      },
      {
        variant: "badge",
        color: "secondary",
        class: "bg-purple-100 text-purple-700",
      },
      {
        variant: "badge",
        color: "accent",
        class: "bg-pink-100 text-pink-700",
      },
      {
        variant: "badge",
        color: "success",
        class: "bg-green-100 text-green-700",
      },
      {
        variant: "badge",
        color: "warning",
        class: "bg-yellow-100 text-yellow-700",
      },
      {
        variant: "badge",
        color: "error",
        class: "bg-red-100 text-red-700",
      },
    ],
  }
);
