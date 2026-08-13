import { recipe } from "../../lib/layouts";

export const authErrorMessage = recipe({
  component: "auth-error-message",
  element: "div",
  slots: { root: { base: "auth-error-message" } },
});
