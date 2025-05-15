import { cva } from "@src/lib/style";

export const tagVariants = cva(
  [
    "inline-flex items-center gap-2 px-3 py-1 text-sm rounded",
    "transition select-none",
  ],
  {
    variants: {
      size: {
        normal: "text-xs px-2 py-0.5",
        medium: "text-sm px-3 py-1",
        large: "text-base px-4 py-2",
      },
      type: {
        primary: "bg-blue-500 text-white",
        info: "bg-sky-500 text-white",
        success: "bg-green-500 text-white",
        warning: "bg-yellow-500 text-black",
        danger: "bg-red-500 text-white",
        dark: "bg-zinc-800 text-white",
        light: "bg-gray-100 text-black",
      },
      rounded: {
        true: "rounded-full",
        false: "",
      },
      closable: {
        true: "pr-1",
        false: "",
      },
    },
    defaultVariants: {
      size: "normal",
    },
  }
);
