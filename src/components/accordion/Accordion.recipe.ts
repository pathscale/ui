import { recipe } from "solid-layouts";

/**
 * The component the whole design came from, in its final form.
 *
 * `expanded` reaches three elements: the item's modifier, the indicator's
 * rotation, and the content's grid-row expansion. That requirement is what
 * slot-keyed variants exist for, and it was found by writing this recipe
 * rather than by specifying it.
 */
export const accordion = recipe({
  component: "accordion",
  element: "div",
  slots: {
    root: { base: "accordion" },
    item: { base: "accordion__item" },
    trigger: { base: "accordion__trigger" },
    indicator: { base: "accordion__indicator" },
    content: { base: "accordion__content" },
    body: { base: "accordion__body" },
    bodyInner: { base: "accordion__body-inner" },
  },
  props: {
    variant: {
      default: "accordion--default",
      surface: "accordion--surface",
    },
    hideSeparator: { true: { item: "accordion__item--hide-separator" } },
  },
  state: {
    expanded: {
      true: {
        item: "accordion__item--expanded",
        indicator: "accordion__indicator--expanded",
        content: "accordion__content--expanded",
      },
    },
    disabled: { true: { item: "accordion__item--disabled" } },
  },
});
