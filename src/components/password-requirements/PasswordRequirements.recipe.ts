import { type Recipe, recipe } from "../../lib/layouts";

const passwordRequirementsDefinition = {
  component: "password-requirements",
  element: "div",
  slots: {
    root: { base: "password-requirements" },
    title: { base: "password-requirements__title" },
    list: { base: "password-requirements__list" },
    item: { base: "password-requirements__item" },
    icon: { base: "password-requirements__icon" },
    message: { base: "password-requirements__message" },
  },
} as const;

export const passwordRequirements: Recipe<typeof passwordRequirementsDefinition> =
  recipe(passwordRequirementsDefinition);
