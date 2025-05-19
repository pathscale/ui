import { cva } from "@src/lib/style";

export const navbarClass = cva("flex items-center px-4", {
  variants: {
    color: {
      primary: "bg-indigo-600 text-white",
      info: "bg-blue-500 text-white",
      success: "bg-green-500 text-white",
      danger: "bg-red-600 text-white",
      warning: "bg-yellow-500 text-white",
      light: "bg-white text-gray-800",
    },
    spaced: {
      true: "py-4",
      false: "",
    },
    shadow: {
      true: "shadow-md",
      false: "",
    },
    transparent: {
      true: "bg-transparent",
      false: "",
    },
    fixedTop: {
      true: "fixed top-0 left-0 right-0 z-50",
      false: "",
    },
    fixedBottom: {
      true: "fixed bottom-0 left-0 right-0 z-50",
      false: "",
    },
  },
  defaultVariants: {
    color: "primary",
    spaced: false,
    shadow: false,
    transparent: false,
    fixedTop: false,
    fixedBottom: false,
  },
});

export const navbarItemClass = cva(
  "px-4 py-2 rounded transition-colors cursor-pointer",
  {
    variants: {
      active: {
        true: "",
        false: "",
      },
      color: {
        primary: "",
        success: "",
        info: "",
        danger: "",
        warning: "",
        light: "",
      },
    },
    defaultVariants: {
      active: false,
      color: "primary",
    },
    compoundVariants: [
      { color: "primary", active: true, class: "bg-white/20 text-white" },
      {
        color: "primary",
        active: false,
        class: "hover:bg-white/10 text-white",
      },

      { color: "success", active: true, class: "bg-white/20 text-white" },
      {
        color: "success",
        active: false,
        class: "hover:bg-white/10 text-white",
      },

      { color: "info", active: true, class: "bg-white/20 text-white" },
      { color: "info", active: false, class: "hover:bg-white/10 text-white" },

      { color: "danger", active: true, class: "bg-white/20 text-white" },
      { color: "danger", active: false, class: "hover:bg-white/10 text-white" },

      { color: "warning", active: true, class: "bg-white/20 text-white" },
      {
        color: "warning",
        active: false,
        class: "hover:bg-white/10 text-white",
      },

      { color: "light", active: true, class: "bg-gray-300 text-gray-900" },
      {
        color: "light",
        active: false,
        class: "hover:bg-gray-100 text-gray-800",
      },
    ],
  }
);

export const navbarDropdownClass = cva("relative", {
  variants: {
    hoverable: {
      true: "group",
      false: "",
    },
  },
  defaultVariants: {
    hoverable: true,
  },
});

export const dropdownMenuClass = cva(
  "absolute mt-2 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block",
  {
    variants: {
      align: {
        left: "left-0",
        right: "right-0",
      },
    },
    defaultVariants: {
      align: "left",
    },
  }
);
