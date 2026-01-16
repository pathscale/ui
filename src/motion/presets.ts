import type { MotionPreset, MotionTokens } from "./types";
import { prefersReducedMotion } from "./reduced-motion";
import { defaultMotionTokens } from "./tokens";

export const createMotionPresets = (
  tokens: MotionTokens
): Record<string, MotionPreset> => {
  const durations = tokens.durations;
  const easings = tokens.easings;
  const distances = tokens.distances;

  return {
    route: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: durations.route,
        easing: easings.out,
      },
    },
    routeAuth: {
      initial: { opacity: 0, x: distances.slideIn },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -distances.slideIn },
      transition: {
        duration: durations.routeAuth,
        easing: easings.inOut,
      },
    },
    routeAuthBack: {
      initial: { opacity: 0, x: -distances.slideIn },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: distances.slideIn },
      transition: {
        duration: durations.routeAuth,
        easing: easings.inOut,
      },
    },
    authSwap: {
      initial: { opacity: 0.92 },
      animate: { opacity: 1 },
      exit: { opacity: 0.92 },
      transition: {
        duration: durations.fast,
        easing: easings.out,
      },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: durations.base,
        easing: easings.out,
        delay: 0.08,
      },
    },
    fadeUp: {
      initial: { opacity: 0, y: distances.sm },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -distances.sm },
      transition: {
        duration: durations.base,
        easing: easings.out,
        delay: 0.08,
      },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
      transition: {
        duration: durations.fast,
        easing: easings.out,
        delay: 0.08,
      },
    },
    routeDashboard: {
      initial: { opacity: 0, y: distances.md, scale: 0.985 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -distances.sm, scale: 0.985 },
      transition: {
        duration: durations.route,
        easing: easings.out,
      },
    },
  };
};

export const motionPresets: Record<string, MotionPreset> =
  createMotionPresets(defaultMotionTokens);

export const routeTransition = motionPresets.route;

export const noMotion: MotionPreset = {
  initial: { opacity: 1, y: 0, x: 0, scale: 1 },
  animate: { opacity: 1, y: 0, x: 0, scale: 1 },
  exit: { opacity: 1, y: 0, x: 0, scale: 1 },
  transition: { duration: 0 },
};

export const getPreset = (name: string) => motionPresets[name];

export const registerPreset = (name: string, preset: MotionPreset) => {
  motionPresets[name] = preset;
};

export const resolvePreset = (
  name: string,
  options?: { reduceMotion?: boolean }
) => {
  const reduce = options?.reduceMotion ?? prefersReducedMotion();
  if (reduce) return noMotion;
  return motionPresets[name] ?? noMotion;
};
