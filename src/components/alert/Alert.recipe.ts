import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "alert",
  slot: {
    indicator: "alert__indicator",
    content: "alert__content",
    title: "alert__title",
    description: "alert__description",
  },
  status: {
    default: "alert--default",
    accent: "alert--accent",
    success: "alert--success",
    warning: "alert--warning",
    danger: "alert--danger",
  },
} as const;
export const componentRecipe = recipe({component:"alert",slots:{"alert-content":{},"alert-default-icon":{},"alert-description":{},"alert-indicator":{},"alert-root":{},"alert-title":{},"root":{},},});
