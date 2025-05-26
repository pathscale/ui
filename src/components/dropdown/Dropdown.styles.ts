import { cva } from "@src/lib/style";

export const dropdownMenuClass = cva(
  "absolute z-10 w-max bg-[var(--color-base-100)] rounded shadow border border-[var(--color-base-300)] flex flex-col",
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
        true: "text-[var(--color-fg-secondary)] cursor-not-allowed",
        false:
          "hover:bg-[var(--color-base-200)] text-[var(--color-fg-primary)]",
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
