import { recipe } from "../../lib/layouts";

export const componentRecipe = recipe({
  component: "qr-code",
  element: "svg",
  slots: {
    root: { base: "qr-code" },
    modules: { base: "qr-code__modules" },
    "qr-code": {},
    "qr-code-modules": {},
  },
});
