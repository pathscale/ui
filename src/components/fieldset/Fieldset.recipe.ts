import { recipe } from "solid-layouts";

export const fieldset = recipe({
  component: "fieldset",
  element: "fieldset",
  slots: {
    root: { base: "fieldset" },
    legend: { base: "fieldset__legend" },
    group: { base: "fieldset__group" },
    actions: { base: "fieldset__actions" },
  },
});
