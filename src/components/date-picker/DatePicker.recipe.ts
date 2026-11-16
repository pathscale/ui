import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "date-picker",
    flag: {
      open: "date-picker--open",
      disabled: "date-picker--disabled",
    },
  },
  Trigger: {
    base: "date-picker__trigger",
  },
  TriggerValue: {
    base: "date-picker__trigger-value",
    flag: {
      placeholder: "date-picker__trigger-value--placeholder",
    },
  },
  TriggerIndicator: {
    base: "date-picker__trigger-indicator",
  },
  TriggerIcon: {
    base: "date-picker__trigger-icon",
  },
  Popover: {
    base: "date-picker__popover",
  },
  Calendar: {
    base: "date-picker__calendar",
  },
} as const;
const recipeDefinition = {component:"date-picker",slots:{"date-picker":{},"date-picker-calendar":{},"date-picker-popover":{},"date-picker-trigger":{},"date-picker-trigger-icon":{},"date-picker-trigger-indicator":{},"date-picker-trigger-value":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
