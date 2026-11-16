import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "link",
  variant: {
    default: "link--default",
  },
  underline: {
    always: "link--underline-always",
    hover: "link--underline-hover",
    none: "link--underline-none",
  },
  flag: {
    external: "link--external",
    disabled: "link--disabled",
  },
  slot: {
    icon: "link__icon",
    iconDefault: "link__icon-default",
  },
} as const;
const recipeDefinition = {component:"link",slots:{"link":{},"link-default-icon":{},"link-icon":{},"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
