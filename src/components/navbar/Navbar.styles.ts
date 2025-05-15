// src/components/navbar/Navbar.styles.ts
import { cva } from "@src/lib/style";

export const navbarStyles = cva("flex items-center px-4", {
  variants: {
    color: {
      info:    "bg-blue-500 text-white",
      primary: "bg-indigo-600 text-white",
      success: "bg-green-500 text-white",
      light:   "bg-white text-gray-800",
    },
  },
  defaultVariants: {
    color: "info",
  },
});

export const navbarItemStyles = cva(
  "px-3 py-2 rounded transition-colors",
  {
    variants: {
      active: {
        true:  "font-semibold border-b-2 border-current",
        false: "hover:bg-gray-200",
      },
      tag: {
        div: "",
        a:   "",
      },
    },
    defaultVariants: {
      active: false,
      tag: "div",
    },
  }
);

export const navbarDropdownStyles = cva("relative", {
  variants: {
    hoverable: {
      true:  "group",
      false: "",
    },
  },
  defaultVariants: {
    hoverable: false,
  },
});

export const dropdownMenuStyles = cva(
  "absolute mt-2 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block",
  {
    variants: {
      align: {
        left:  "left-0",
        right: "right-0",
      },
    },
    defaultVariants: {
      align: "left",
    },
  }
);

// -- NEW: imageStyles for logos, avatars, etc. --
export const imageStyles = cva("", {
  variants: {
    rounded: {
      true:  "rounded-full",
      false: "",
    },
    size: {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
    },
    bordered: {
      true: "border border-gray-200",
      false: "",
    },
  },
  defaultVariants: {
    rounded: false,
    size: "md",
    bordered: false,
  },
});
