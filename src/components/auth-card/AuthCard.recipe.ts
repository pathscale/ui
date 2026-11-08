import { type Recipe, recipe } from "../../lib/layouts";

const authCardDefinition = {
  component: "auth-card",
  element: "div",
  slots: {
    root: { base: "auth-card" },
    body: { base: "auth-card__body" },
    header: { base: "auth-card__header" },
    headings: { base: "auth-card__headings" },
    title: { base: "auth-card__title" },
    description: { base: "auth-card__description" },
    branding: { base: "auth-card__branding" },
    footer: { base: "auth-card__footer" },
  },
} as const;

export const authCard: Recipe<typeof authCardDefinition> = recipe(authCardDefinition);
