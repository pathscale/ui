import { cva } from "@src/lib/style";

export const timelineWrapperClass = "relative";

export const timelineItemClass = cva(
  "relative flex items-center gap-3 min-h-[48px]",
  {
    variants: {
      state: {
        default: "text-gray-500",
        active: "text-green-500 font-medium",
        error: "text-red-500 font-medium",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export const timelineMarkerWrapperClass =
  "relative w-6 min-h-[48px] flex items-center justify-center";

export const timelineLineClass =
  "absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gray-300 dark:bg-gray-600";

export const timelineMarkerClass =
  "absolute w-3 h-3 rounded-full border-2 border-white bg-gray-400 z-10";

export const timelineNumberClass = cva(
  "absolute -left-4 top-1/2 -translate-y-1/2 text-xs font-semibold",
  {
    variants: {
      state: {
        default: "text-gray-500",
        active: "text-green-500",
        error: "text-red-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export const timelineContentClass = "pt-0.5 text-sm";
