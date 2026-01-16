import { prefersReducedMotion } from "./reduced-motion";
import { motionPresets, noMotion, routeTransition } from "./presets";
import type { MotionPreset } from "./types";

export type RouteTransitionRuleResult =
  | MotionPreset
  | string
  | null
  | undefined;

export type RouteTransitionRule = (
  from: string,
  to: string
) => RouteTransitionRuleResult;

export type RouteTransitionResolverOptions = {
  rules: RouteTransitionRule[];
  fallback?: MotionPreset;
  resolvePreset?: (name: string) => MotionPreset | undefined;
  reduceMotion?: () => boolean;
  reduceMotionPreset?: MotionPreset;
};

export const createRouteTransitionResolver = (
  options: RouteTransitionResolverOptions
) => {
  const resolvePreset =
    options.resolvePreset ?? ((name: string) => motionPresets[name]);
  const reduceMotion = options.reduceMotion ?? prefersReducedMotion;
  const fallback = options.fallback ?? routeTransition;
  const reduceMotionPreset = options.reduceMotionPreset ?? noMotion;

  return (from: string, to: string): MotionPreset => {
    if (reduceMotion()) return reduceMotionPreset;

    for (const rule of options.rules) {
      const result = rule(from, to);
      if (!result) continue;
      if (typeof result === "string") {
        const resolved = resolvePreset(result);
        if (resolved) return resolved;
        continue;
      }
      return result;
    }

    return fallback ?? noMotion;
  };
};
