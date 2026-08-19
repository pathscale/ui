import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "link",
  variant: {
    default: "link--default",
  },
  underline: {
    always: "link--underline-always",
    hover: "link--underline-hover",
    none: "link--underline-none",
  },
  flag: {
    external: "link--external",
    disabled: "link--disabled",
  },
  slot: {
    icon: "link__icon",
    iconDefault: "link__icon-default",
  },
} as const;
export const componentRecipe = recipe({
  component: "link",
  slots: { link: {}, "link-default-icon": {}, "link-icon": {}, root: {} },
});
