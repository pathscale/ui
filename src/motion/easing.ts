import type { MotionEasing } from "./types";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const resolveEase = (easing?: MotionEasing) => {
  if (typeof easing === "function") return easing;
  switch (easing) {
    case "ease-in":
      return easeInCubic;
    case "ease-in-out":
      return easeInOutCubic;
    case "linear":
      return (t: number) => t;
    case "ease-out":
    default:
      return easeOutCubic;
  }
};
