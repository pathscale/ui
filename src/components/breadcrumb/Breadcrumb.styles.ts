import { cva } from "@src/lib/style";

export const breadcrumbContainerVariants = cva(
  ["flex", "items-center", "gap-2", "text-sm"],
  {
    variants: {
      alignment: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      },
      size: {
        sm: "text-xs gap-1",
        md: "text-sm gap-2",
        lg: "text-base gap-3",
      },
      separator: {
        arrow: "breadcrumb-arrow",
        dot: "breadcrumb-dot",
        bullet: "breadcrumb-bullet",
        succeeds: "breadcrumb-succeeds",
      },
    },
    defaultVariants: {
      alignment: "left",
      size: "md",
    },
  }
);

export const breadcrumbItemVariants = cva(
  ["text-gray-600", "dark:text-gray-300"],
  {
    variants: {
      active: {
        true: "text-blue-600 font-semibold cursor-default",
        false: "hover:underline",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
