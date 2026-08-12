import { recipe } from "solid-layouts";

export const toolbar = recipe({
  component: "toolbar",
  element: "div",
  slots: { root: { base: "toolbar" } },
  props: {
    orientation: {
      horizontal: "toolbar--horizontal",
      vertical: "toolbar--vertical",
    },
    attached: { true: "toolbar--attached" },
  },
});
