import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-picker",
  slot: {
    area: "color-picker__area",
    slider: "color-picker__slider",
    field: "color-picker__field",
  },
} as const;
export const componentRecipe = recipe({component:"color-picker",slots:{"color-picker":{},"root":{},},});
