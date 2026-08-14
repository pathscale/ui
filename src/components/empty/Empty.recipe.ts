import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "empty",
  slot: {
    icon: "empty-state__icon",
    title: "empty-state__title",
    description: "empty-state__description",
    actions: "empty-state__actions",
  },
} as const;
export const componentRecipe = recipe({component:"empty",slots:{"empty":{},"empty-actions":{},"empty-description":{},"empty-icon":{},"empty-title":{},"root":{},},});
