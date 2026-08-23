import { recipe } from "../../lib/layouts";

export const colorWheel = recipe({
  component: "color-wheel",
  element: "fieldset",
  slots: {
    root: { base: "color-wheel" },
  },
});
