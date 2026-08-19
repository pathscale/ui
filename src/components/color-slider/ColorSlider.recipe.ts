import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "color-slider",
  slot: {
    track: "color-slider__track",
    thumb: "color-slider__thumb",
  },
  flag: {
    alpha: "color-slider--alpha",
    dragging: "color-slider--dragging",
  },
} as const;
export const componentRecipe = recipe({component:"color-slider",slots:{"color-slider":{},"color-slider-thumb":{},"color-slider-track":{},"root":{},},});
