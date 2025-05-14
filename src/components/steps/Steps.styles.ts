import { cva } from "@src/lib/style";

export const stepsContainer = cva("space-y-4", {
  variants: {
    animated: {
      true: "transition-all duration-300 ease-in-out",
      false: "",
    },
  },
});

export const stepItemStyles = cva("p-6 rounded border shadow-sm bg-white", {
  variants: {
    class: {
      centered: "text-center",
    },
  },
});
