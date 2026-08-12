import { recipe } from "solid-layouts";

export const disclosureGroup = recipe({
  component: "disclosure-group",
  element: "div",
  slots: { root: { base: "disclosure-group" } },
});
