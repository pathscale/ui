import { recipe } from "solid-layouts";

export const tagGroup = recipe({
  component: "tag-group",
  element: "div",
  slots: {
    root: { base: "tag-group" },
    list: { base: "tag-group__list" },
  },
});
