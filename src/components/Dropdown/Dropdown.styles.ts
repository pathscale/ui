import { cva } from "@src/lib/style";

export const dropdownVariants = cva(
  [
    "absolute mt-2 shadow-lg z-10",
    "w-max rounded-md bg-white border border-gray-300",
    "transition-all duration-150 ease-in-out",
  ],
  {
    variants: {
      position: {
        "bottom-left": "left-0 top-full text-black",
        "bottom-right": "right-0 top-full text-black",
        "top-left": "left-0 bottom-full text-black",
        "top-right": "right-0 bottom-full text-black",
      },
      open: {
        true: "block",
        false: "hidden",
      },
    },
    defaultVariants: {
      position: "bottom-left",
      open: false,
    },
  }
);

export const dropdownItemVariants = cva(
  "px-4 py-2 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100 text-black",
  {
    variants: {
      hasLink: { true: "p-0 text-blue-600 hover:underline text-black", false: "" },
    },
    defaultVariants: { hasLink: false },
  }
);