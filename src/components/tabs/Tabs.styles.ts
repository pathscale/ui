import { cva } from "@src/lib/style";

export const tabsNavVariants = cva(
  "flex text-sm font-medium text-gray-600 dark:text-gray-300",
  {
    variants: {
      type: {
        basic: "",
        boxed: "flex gap-2",
        toggle: "inline-flex rounded-md p-1",
        "toggle-rounded": "inline-flex rounded-full p-1",
      },
      size: {
        sm: "text-xs gap-1",
        md: "text-sm gap-2",
        lg: "text-base gap-3",
      },
      alignment: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      },
      expanded: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      type: "basic",
      size: "md",
      alignment: "left",
      expanded: false,
    },
  }
);

export const tabTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium text-sm transition-colors",
  {
    variants: {
      size: {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-2",
        lg: "text-base px-4 py-3",
      },
      type: {
        basic: "border-b-2 transition-colors hover:text-blue-600",
        boxed: "rounded-t px-4 py-2 hover:text-blue-600",
        toggle:
          "border -ml-px px-4 py-2 transition-colors first:ml-0 first:rounded-l-md last:rounded-r-md",
        "toggle-rounded":
          "border -ml-px first:ml-0 first:rounded-l-full last:rounded-r-full transition-colors",
      },
      active: {
        true: "",
        false: "",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    compoundVariants: [
      {
        type: "basic",
        active: true,
        class: "border-blue-600 text-blue-600",
      },
      {
        type: "basic",
        active: false,
        class: "border-transparent text-gray-500 dark:text-gray-400",
      },
      {
        type: "boxed",
        active: true,
        class:
          "border-x border-t border-b-0 border-gray-400 dark:border-gray-600 text-blue-600",
      },
      {
        type: "boxed",
        active: false,
        class:
          "border-b border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600",
      },
      {
        type: "toggle",
        active: true,
        class: "bg-blue-600 text-white border-blue-600",
      },
      {
        type: "toggle",
        active: false,
        class:
          "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600",
      },
      {
        type: "toggle-rounded",
        active: true,
        class: "bg-blue-600 text-white border-blue-600",
      },
      {
        type: "toggle-rounded",
        active: false,
        class:
          "bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600",
      },
    ],
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
);
