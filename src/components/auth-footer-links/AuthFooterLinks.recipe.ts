import { recipe } from "../../lib/layouts";

export const authFooterLinks = recipe({
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
});
