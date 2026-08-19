import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "flex-layout",
  direction: {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse",
  },
  justify: {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  },
  align: {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  },
  wrap: {
    wrap: "flex-wrap",
    nowrap: "flex-nowrap",
    "wrap-reverse": "flex-wrap-reverse",
  },
  gap: {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  },
  gapX: {
    none: "gap-x-0",
    sm: "gap-x-2",
    md: "gap-x-4",
    lg: "gap-x-6",
    xl: "gap-x-8",
  },
  gapY: {
    none: "gap-y-0",
    sm: "gap-y-2",
    md: "gap-y-4",
    lg: "gap-y-6",
    xl: "gap-y-8",
  },
  paddingInline: {
    none: "px-0",
    sm: "px-2",
    md: "px-4",
    lg: "px-6",
    xl: "px-8",
  },
  paddingBlock: {
    none: "py-0",
    sm: "py-2",
    md: "py-4",
    lg: "py-6",
    xl: "py-8",
  },
  width: {
    full: "w-full",
  },
  height: {
    full: "h-full",
  },
  minWidth: {
    zero: "min-w-0",
  },
  minHeight: {
    zero: "min-h-0",
  },
  grow: {
    true: "flex-grow",
    false: "flex-grow-0",
  },
  shrink: {
    true: "flex-shrink",
    false: "flex-shrink-0",
  },
  basis: {
    none: "basis-0",
    sm: "basis-8",
    md: "basis-16",
    lg: "basis-24",
    xl: "basis-32",
  },
} as const;
export const componentRecipe = recipe({component:"flex",slots:{"root":{},},});
