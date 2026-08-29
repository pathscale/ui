import { recipe } from "../../lib/layouts";

export const panelToggle = recipe({
  component: "panel-toggle",
  element: "button",
  slots: {
    root: { base: "panel-toggle" },
    indicator: { base: "panel-toggle__indicator" },
  },
  props: {
    side: {
      left: "panel-toggle--left",
      right: "panel-toggle--right",
    },
  },
  defaults: {
    side: "right",
  },
});
