import { recipe } from "../../lib/layouts";

export const authSuccessMessage = recipe({
  component: "auth-success-message",
  element: "div",
  slots: { root: { base: "auth-success-message" } },
});
