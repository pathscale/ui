import { recipe } from "solid-layouts";

/**
 * The whole component was one Tailwind utility applied conditionally, so it
 * declares `tailwind: true` and has exactly one state axis. Sixth of the maps
 * emitting utilities rather than BEM.
 */
export const videoPreview = recipe({
  component: "video-preview",
  element: "video",
  tailwind: true,
  slots: { root: { base: "" } },
  state: {
    mirrored: { true: "-scale-x-100" },
  },
});
