import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "chip",
  slot: {
    icon: "chip__icon",
    iconStart: "chip__icon--start",
    iconEnd: "chip__icon--end",
    label: "chip__label",
    remove: "chip__remove",
    removeIcon: "chip__remove-icon",
  },
  variant: {
    solid: "chip--solid",
    flat: "chip--flat",
    bordered: "chip--bordered",
  },
  flavor: {
    neutral: "chip--flavor-neutral",
    primary: "chip--flavor-primary",
    secondary: "chip--flavor-secondary",
    accent: "chip--flavor-accent",
    destructive: "chip--flavor-destructive",
    success: "chip--flavor-success",
    warning: "chip--flavor-warning",
    info: "chip--flavor-info",
  },
  size: {
    sm: "chip--sm",
    md: "chip--md",
    lg: "chip--lg",
  },
} as const;
const recipeDefinition = {component:"chip",slots:{"chip":{},"chip-end-icon":{},"chip-label":{},"chip-remove":{},"chip-remove-icon":{},"chip-start-icon":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
