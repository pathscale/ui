import { recipe } from "solid-layouts";

export const glowCard = recipe({
  component: "glow-card",
  element: "div",
  slots: { root: { base: "glow-card" } },
  props: {
    isolate: { true: "glow-card--isolate" },
  },
});
