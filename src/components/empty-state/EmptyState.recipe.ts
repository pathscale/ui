import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "empty-state",
  slot: {
    icon: "empty-state__icon",
    title: "empty-state__title",
    description: "empty-state__description",
    actions: "empty-state__actions",
  },
} as const;
export const componentRecipe = recipe({component:"empty-state",slots:{"empty-state":{},"empty-state-actions":{},"empty-state-description":{},"empty-state-icon":{},"empty-state-title":{},"root":{},},});
