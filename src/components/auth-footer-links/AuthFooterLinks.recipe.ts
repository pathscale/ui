import { type Recipe, recipe } from "../../lib/layouts";

const authFooterLinksDefinition = {
  component: "auth-footer-links",
  element: "div",
  slots: {
    root: { base: "auth-footer-links" },
    link: { base: "auth-footer-links__link" },
  },
  props: {
    align: {
      left: "auth-footer-links--left",
      center: "auth-footer-links--center",
      right: "auth-footer-links--right",
    },
  },
  defaults: { align: "center" },
} as const;

export const authFooterLinks: Recipe<typeof authFooterLinksDefinition> =
  recipe(authFooterLinksDefinition);
