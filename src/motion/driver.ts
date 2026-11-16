import type { MotionDriver } from "./types";

// Default driver applies the final value immediately without animation.
const immediateDriver: MotionDriver = ({ to, onUpdate, onComplete }) => {
  onUpdate(to);
  onComplete?.();
  return {
    stop: () => {},
  };
};

let activeDriver: MotionDriver = immediateDriver;

export const setMotionDriver = (driver: MotionDriver): void => {
  activeDriver = driver;
};

export const getMotionDriver = (): MotionDriver => activeDriver;

export { immediateDriver };
