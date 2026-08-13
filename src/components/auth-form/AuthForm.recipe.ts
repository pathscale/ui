import { recipe } from "../../lib/layouts";

export const authForm = recipe({
  component: "auth-form",
  element: "form",
  slots: { root: { base: "auth-form" } },
});
