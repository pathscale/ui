import { cva } from "@src/lib/style";

export const stepsContainer = cva("flex flex-col", {
  variants: {
    animated: {
      true: "transition-all duration-300 ease-in-out",
      false: "",
    },
  },
  defaultVariants: { animated: false },
});

export const navBar = cva("flex items-center justify-between mb-6");

export const navItem = cva(
  "relative flex-1 flex flex-col items-center",
  {
    variants: {
      clickable: {
        true: "cursor-pointer",
        false: "pointer-events-none",
      },
      disabled: {
        true: "opacity-50 pointer-events-none",
        false: "",
      },
    },
    defaultVariants: { clickable: false, disabled: false },
  }
);

export const marker = cva(
  "w-8 h-8 flex items-center justify-center rounded-full border-2",
  {
    variants: {
      active: {
        true: "bg-blue-500 border-blue-500 text-white",
        false: "bg-white border-gray-300 text-gray-600",
      },
    },
    defaultVariants: { active: false },
  }
);

export const line = cva("absolute top-1/2 left-full w-full h-0.5", {
  variants: {
    active: {
      true: "bg-blue-500",
      false: "bg-gray-300",
    },
  },
  defaultVariants: { active: false },
});

export const title = cva("mt-2 text-sm", {
  variants: {
    active: {
      true: "text-blue-600 font-medium",
      false: "text-gray-600",
    },
  },
  defaultVariants: { active: false },
});

export const subtitle = cva("text-xs mt-1", {
  variants: {
    color: {
      default: "text-blue-500",
      muted: "text-gray-500",
      accent: "text-green-500",
    },
  },
  defaultVariants: { color: "default" },
});

export const buttonSteps = cva("px-4 py-2 bg-blue-600 text-white rounded");
