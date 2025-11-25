import { cva } from "@src/lib/style";

export const dividerStyles = cva(
  "flex items-center whitespace-nowrap relative",
  {
    variants: {
      horizontal: {
        true: "flex-col h-auto w-4 mx-4 my-0 min-h-16",
        false: "flex-row h-4 w-auto mx-0 my-4",
      },
      color: {
        default: "before:bg-base-content/30 after:bg-base-content/30",
        neutral: "before:bg-neutral after:bg-neutral",
        primary: "before:bg-primary after:bg-primary",
        secondary: "before:bg-secondary after:bg-secondary",
        accent: "before:bg-accent after:bg-accent",
        success: "before:bg-success after:bg-success",
        warning: "before:bg-warning after:bg-warning",
        info: "before:bg-info after:bg-info",
        error: "before:bg-error after:bg-error",
      },
      position: {
        center: "",
        start: "before:hidden",
        end: "after:hidden",
      },
    },
    compoundVariants: [
      {
        horizontal: false,
        class:
          "before:content-[''] before:flex-1 before:h-0.5 after:content-[''] after:flex-1 after:h-0.5",
      },
      {
        horizontal: false,
        position: "center",
        class: "[&:not(:empty)]:before:mr-4 [&:not(:empty)]:after:ml-4",
      },
      {
        horizontal: false,
        position: "start",
        class: "[&:not(:empty)]:after:ml-4",
      },
      {
        horizontal: false,
        position: "end",
        class: "[&:not(:empty)]:before:mr-4",
      },
      {
        horizontal: true,
        class:
          "before:content-[''] before:flex-1 before:w-0.5 before:h-auto after:content-[''] after:flex-1 after:w-0.5 after:h-auto",
      },
      {
        horizontal: true,
        position: "center",
        class: "[&:not(:empty)]:before:mb-4 [&:not(:empty)]:after:mt-4",
      },
      {
        horizontal: true,
        position: "start",
        class: "[&:not(:empty)]:after:mt-4",
      },
      {
        horizontal: true,
        position: "end",
        class: "[&:not(:empty)]:before:mb-4",
      },
    ],
    defaultVariants: {
      horizontal: false,
      color: "default",
      position: "center",
    },
  },
);
