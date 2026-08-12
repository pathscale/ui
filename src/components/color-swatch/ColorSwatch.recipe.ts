import { recipe } from "solid-layouts";

export const colorSwatch = recipe({
  component: "color-swatch",
  element: "div",
  slots: { root: { base: "color-swatch" } },
  props: {
    shape: {
      circle: "color-swatch--circle",
      square: "color-swatch--square",
    },
    size: {
      xs: "color-swatch--xs",
      sm: "color-swatch--sm",
      md: "color-swatch--md",
      lg: "color-swatch--lg",
      xl: "color-swatch--xl",
    },
  },
});
