import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "empty",
  slot: {
    icon: "empty__icon",
    title: "empty__title",
    description: "empty__description",
    actions: "empty__actions",
  },
} as const;
export const componentRecipe = recipe({
  component: "empty",
  slots: {
    empty: {},
    "empty-actions": {},
    "empty-description": {},
    "empty-icon": {},
    "empty-title": {},
    root: {},
  },
});
