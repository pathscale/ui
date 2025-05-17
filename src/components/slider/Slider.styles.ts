import { cva } from "@src/lib/style";

export const sliderTrack = cva(
  "w-full appearance-none h-2 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
      },
      color: {
        default: "bg-gray-200 focus:ring-blue-500",
        primary: "bg-blue-500 focus:ring-blue-500",
        danger: "bg-red-500 focus:ring-red-500",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      color: "default",
      disabled: false,
    },
  }
);

export const sliderThumb = cva("absolute top-0 w-4 h-4 rounded-full", {
  variants: {
    color: {
      default: "bg-white border border-gray-300",
      primary: "bg-blue-500",
      danger: "bg-red-500",
    },
    disabled: {
      true: "opacity-40",
      false: "",
    },
  },
  defaultVariants: {
    color: "default",
    disabled: false,
  },
});

export type SliderTrackVariants = VariantProps<typeof sliderTrack>;
export type SliderThumbVariants = VariantProps<typeof sliderThumb>;
