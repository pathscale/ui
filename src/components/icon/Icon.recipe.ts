import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "icon",
} as const;
export const icon = recipe({ component: "icon", element: "span", slots: { root: { base: "icon" } }, props: { name: {}, width: {}, height: {} } });
