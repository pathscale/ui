import { recipe } from "solid-layouts";

/**
 * `unavailable` is the WebGL fallback: the component sets it when the
 * renderer cannot start. It is state the component computes rather than a
 * choice the caller makes, which is the distinction that matters here,
 * because a caller cannot know whether WebGL will start.
 */
export const metalBorder = recipe({
  component: "metal-border",
  element: "div",
  slots: {
    root: { base: "metal-border" },
    effect: { base: "metal-border__effect" },
    canvas: { base: "metal-border__canvas" },
    glow: { base: "metal-border__glow" },
    content: { base: "metal-border__content" },
  },
  props: {
    kind: {
      pill: "metal-border--pill",
      circle: "metal-border--circle",
    },
  },
  state: {
    enabled: { true: "metal-border--enabled" },
    unavailable: { true: "metal-border--unavailable" },
    paused: { true: "metal-border--paused" },
  },
});
