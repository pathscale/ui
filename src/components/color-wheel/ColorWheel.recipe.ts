import { type Recipe, recipe } from "../../lib/layouts";

const colorWheelDefinition = {
  component: "color-wheel",
  element: "fieldset",
  slots: {
    root: { base: "color-wheel" },
  },
} as const;

export const colorWheel: Recipe<typeof colorWheelDefinition> =
  recipe(colorWheelDefinition);
