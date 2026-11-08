import { type Recipe, recipe } from "../../lib/layouts";

const panelToggleDefinition = {
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
} as const;

export const panelToggle: Recipe<typeof panelToggleDefinition> =
  recipe(panelToggleDefinition);
