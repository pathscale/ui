import { recipe } from "solid-layouts";

export const header = recipe({
  component: "header",
  element: "header",
  slots: { root: { base: "header" } },
});
