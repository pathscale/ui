import { recipe } from "solid-layouts";

export const tag = recipe({
  component: "tag",
  element: "span",
  slots: {
    root: { base: "tag" },
    icon: { base: "tag__icon" },
    iconStart: { base: "tag__icon--start" },
    iconEnd: { base: "tag__icon--end" },
    removeButton: { base: "tag__remove-button" },
  },
  props: {
    size: { sm: "tag--sm", md: "tag--md", lg: "tag--lg" },
    variant: { default: "tag--default", surface: "tag--surface" },
  },
});
