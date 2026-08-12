import { recipe } from "solid-layouts";

/**
 * `outer` and `inner` were written twice, once for the ring shell and once
 * for the ring itself. One axis, two slots.
 */
export const colorWheelFlower = recipe({
  component: "color-wheel-flower",
  element: "div",
  slots: {
    root: { base: "color-wheel-flower" },
    rings: { base: "color-wheel-flower__rings" },
    ringShell: { base: "color-wheel-flower__ring-shell" },
    ring: { base: "color-wheel-flower__ring" },
    picker: { base: "color-wheel-flower__picker" },
    dot: { base: "color-wheel-flower__dot" },
    dotFrame: { base: "color-wheel-flower__dot-frame" },
    dotMotion: { base: "color-wheel-flower__dot-motion" },
    halo: { base: "color-wheel-flower__halo" },
    swatch: { base: "color-wheel-flower__swatch" },
    highlight: { base: "color-wheel-flower__highlight" },
  },
  props: {
    ringDepth: {
      outer: {
        ringShell: "color-wheel-flower__ring-shell--outer",
        ring: "color-wheel-flower__ring--outer",
      },
      inner: {
        ringShell: "color-wheel-flower__ring-shell--inner",
        ring: "color-wheel-flower__ring--inner",
      },
    },
    center: { true: { swatch: "color-wheel-flower__swatch--center" } },
  },
  state: {
    disabled: { true: "color-wheel-flower--disabled" },
    hovered: { true: { highlight: "color-wheel-flower__highlight--hovered" } },
    pulsing: { true: { highlight: "color-wheel-flower__highlight--pulsing" } },
  },
});
