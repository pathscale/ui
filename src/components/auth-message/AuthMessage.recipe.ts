import { recipe } from "../../lib/layouts";

export const authMessage = recipe({
  component: "auth-message",
  element: "div",
  slots: { root: { base: "auth-message" } },
});
