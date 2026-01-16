import { setMotionDriver } from "./driver";
import type { MotionDriver, MotionDriverOptions } from "./types";

export type PopmotionAnimate = (
  options: MotionDriverOptions
) => { stop: () => void };

export const createPopmotionDriver = (
  animate: PopmotionAnimate
): MotionDriver => {
  return (options) => animate(options);
};

export const enablePopmotion = (animate: PopmotionAnimate) => {
  setMotionDriver(createPopmotionDriver(animate));
};
