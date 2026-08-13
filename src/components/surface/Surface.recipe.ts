import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "surface",
  variant: {
    default: "surface--default",
    secondary: "surface--secondary",
    tertiary: "surface--tertiary",
    transparent: "surface--transparent",
  },
  material: {
    solid: "surface--solid",
    glass: "surface--glass",
  },
  elevation: {
    base: "surface--base",
    raised: "surface--raised",
  },
  padding: {
    none: "p-0",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
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
  border: {
    none: "surface--border-none",
    subtle: "surface--border-subtle",
    default: "surface--border-default",
  },
  radius: {
    none: "surface--radius-none",
    sm: "surface--radius-sm",
    md: "surface--radius-md",
    lg: "surface--radius-lg",
    xl: "surface--radius-xl",
    full: "surface--radius-full",
  },
} as const;
export const componentRecipe = recipe({
  component: "surface",
  slots: { root: {}, surface: {} },
});
