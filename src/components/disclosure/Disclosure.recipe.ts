import { recipe } from "solid-layouts";

export const disclosure = recipe({
  component: "disclosure",
  element: "div",
  slots: {
    root: { base: "disclosure" },
    heading: { base: "disclosure__heading" },
    trigger: { base: "disclosure__trigger" },
    indicator: { base: "disclosure__indicator" },
    content: { base: "disclosure__content" },
    body: { base: "disclosure__body" },
    bodyInner: { base: "disclosure__body-inner" },
  },
  state: {
    expanded: { true: "disclosure--expanded" },
    disabled: { true: "disclosure--disabled" },
  },
});
