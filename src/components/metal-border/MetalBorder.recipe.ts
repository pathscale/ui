import { type Recipe, recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "metal-border",
    kind: {
      pill: "metal-border--pill",
      circle: "metal-border--circle",
    },
    flag: {
      enabled: "metal-border--enabled",
      unavailable: "metal-border--unavailable",
      paused: "metal-border--paused",
    },
  },
  Effect: {
    base: "metal-border__effect",
  },
  Canvas: {
    base: "metal-border__canvas",
  },
  Glow: {
    base: "metal-border__glow",
  },
  Content: {
    base: "metal-border__content",
  },
} as const;
const recipeDefinition = {component:"metal-border",slots:{"root":{},},} as const;
export const componentRecipe: Recipe<typeof recipeDefinition> = recipe(recipeDefinition);
