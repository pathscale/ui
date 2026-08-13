import { recipe } from "../../lib/layouts";

export const authPoweredBy = recipe({
  component: "auth-powered-by",
  element: "div",
  slots: {
    root: { base: "auth-powered-by" },
    link: { base: "auth-powered-by__link" },
    content: { base: "auth-powered-by__content" },
    logo: { base: "auth-powered-by__logo" },
  },
  props: {
    align: {
      left: "auth-powered-by--left",
      center: "auth-powered-by--center",
      right: "auth-powered-by--right",
    },
    variant: {
      subtle: "auth-powered-by--subtle",
      card: "auth-powered-by--card",
      inline: "auth-powered-by--inline",
    },
  },
  defaults: { align: "center", variant: "subtle" },
});
