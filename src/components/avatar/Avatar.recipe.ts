import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "avatar",
  slot: {
    image: "avatar__image",
    fallback: "avatar__fallback",
  },
  size: {
    sm: "avatar--sm",
    md: "",
    lg: "avatar--lg",
  },
  variant: {
    default: "",
    soft: "avatar--soft",
  },
  flavor: {
    neutral: "avatar__fallback--flavor-neutral",
    primary: "avatar__fallback--flavor-primary",
    secondary: "avatar__fallback--flavor-secondary",
    accent: "avatar__fallback--flavor-accent",
    destructive: "avatar__fallback--flavor-destructive",
    success: "avatar__fallback--flavor-success",
    warning: "avatar__fallback--flavor-warning",
    info: "avatar__fallback--flavor-info",
  },
  group: {
    base: "avatar-group",
    overlap: "-space-x-6",
  },
} as const;
export const componentRecipe = recipe({
  component: "avatar",
  slots: {
    "avatar-fallback": {},
    "avatar-image": {},
    "avatar-root": {},
    root: {},
  },
});
