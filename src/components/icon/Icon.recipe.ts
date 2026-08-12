import { recipe } from "solid-layouts";

export const icon = recipe({
  component: "icon",
  element: "span",
  slots: { root: { base: "icon" } },
});
