import type { MotionEasing, MotionTokens, MotionTokenOverrides } from "./types";

export const motionDurations: Record<string, number> = {
  route: 0.18,
  routeAuth: 0.35,
  fast: 0.2,
  base: 0.3,
  slow: 0.45,
};

export const motionEasings: Record<string, MotionEasing> = {
  out: "ease-out",
  inOut: "ease-in-out",
};

export const motionDistances: Record<string, number> = {
  sm: 6,
  md: 12,
  lg: 20,
  slideIn: 40,
};

export const defaultMotionTokens: MotionTokens = {
  durations: { ...motionDurations },
  easings: { ...motionEasings },
  distances: { ...motionDistances },
};

const mergeDefined = <T extends Record<string, unknown>>(
  base: T,
  overrides?: Partial<T>
): T => {
  const next = { ...base };
  if (!overrides) return next;
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      next[key as keyof T] = value as T[keyof T];
    }
  }
  return next;
};

export const mergeMotionTokens = (
  base: MotionTokens,
  overrides?: MotionTokenOverrides
): MotionTokens => {
  return {
    durations: mergeDefined(base.durations, overrides?.durations),
    easings: mergeDefined(base.easings, overrides?.easings),
    distances: mergeDefined(base.distances, overrides?.distances),
  };
};
