import { recipe } from "solid-layouts";

export const form = recipe({
  component: "form",
  element: "form",
  slots: { root: { base: "form" } },
});
