import { recipe } from "../../lib/layouts";

export const authSubmitButton = recipe({
  component: "auth-submit-button",
  element: "button",
  slots: { root: { base: "auth-submit-button" } },
});
