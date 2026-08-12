import { recipe } from "solid-layouts";

/**
 * `responsive` is two classes, `join-vertical lg:join-horizontal`, so this
 * axis emits Tailwind and declares `tailwind: true`.
 */
export const join = recipe({
  component: "join",
  element: "div",
  tailwind: true,
  slots: { root: { base: "join" } },
  props: {
    direction: {
      vertical: "join-vertical",
      horizontal: "join-horizontal",
      responsive: "join-vertical lg:join-horizontal",
    },
  },
});
