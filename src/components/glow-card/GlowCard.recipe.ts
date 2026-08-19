import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "glow-card",
  isolate: "glow-card--isolate",
} as const;
export const componentRecipe = recipe({component:"glow-card",slots:{"root":{},},});
