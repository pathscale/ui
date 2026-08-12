import { recipe } from "solid-layouts";

export const link = recipe({
  component: "link",
  element: "a",
  slots: {
    root: { base: "link" },
    icon: { base: "link__icon" },
    iconDefault: { base: "link__icon-default" },
  },
  props: {
    variant: { default: "link--default" },
    underline: {
      always: "link--underline-always",
      hover: "link--underline-hover",
      none: "link--underline-none",
    },
  },
  state: {
    external: { true: "link--external" },
    disabled: { true: "link--disabled" },
  },
});
