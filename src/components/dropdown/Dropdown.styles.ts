import { cva } from "@src/lib/style";

export const dropdownMenuClass = cva(
  "absolute z-10 w-max bg-white rounded shadow border border-gray-200 flex flex-col",
  {
    variants: {
      position: {
        "top-left": "bottom-full left-0 mb-2",
        "top-right": "bottom-full right-0 mb-2",
        left: "right-full top-0 mr-2",
        right: "left-full top-0 ml-2",
        "bottom-left": "top-full left-0 mt-2",
        "bottom-right": "top-full right-0 mt-2",
      },
    },
    defaultVariants: {
      position: "bottom-left",
    },
  }
);

export const dropdownItemClass = cva(
  "px-4 py-2 text-sm cursor-pointer transition-colors",
  {
    variants: {
      disabled: {
        true: "text-gray-400 cursor-not-allowed",
        false: "hover:bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

export const dropdownRootClass = cva("relative inline-block");

export const dropdownTriggerClass = cva("cursor-pointer w-fit", {
  variants: {
    disabled: {
      true: "pointer-events-none opacity-50",
      false: "",
    },
    hoverable: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    disabled: false,
    hoverable: false,
  },
});
