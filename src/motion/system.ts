import { prefersReducedMotion } from "./reduced-motion";
import { createMotionPresets, noMotion } from "./presets";
import { defaultMotionTokens, mergeMotionTokens } from "./tokens";
import type {
  MotionPreset,
  MotionTokenOverrides,
  MotionTokens,
} from "./types";

export type MotionSystemConfig = {
  tokens?: MotionTokenOverrides;
  presets?: Record<string, MotionPreset>;
  reduceMotion?: () => boolean;
  noMotionPreset?: MotionPreset;
};

export const createMotionSystem = (config?: MotionSystemConfig) => {
  let tokens: MotionTokens = mergeMotionTokens(
    defaultMotionTokens,
    config?.tokens
  );
  let customPresets = { ...(config?.presets ?? {}) };
  let basePresets = createMotionPresets(tokens);
  let presets = { ...basePresets, ...customPresets };
  const reduceMotion = config?.reduceMotion ?? prefersReducedMotion;
  let noMotionPreset = config?.noMotionPreset ?? noMotion;

  const rebuildPresets = () => {
    basePresets = createMotionPresets(tokens);
    presets = { ...basePresets, ...customPresets };
  };

  const getTokens = () => tokens;
  const getPresets = () => presets;
  const getPreset = (name: string) => presets[name];

  const registerPreset = (name: string, preset: MotionPreset) => {
    customPresets = { ...customPresets, [name]: preset };
    presets = { ...basePresets, ...customPresets };
  };

  const overrideTokens = (overrides: MotionTokenOverrides) => {
    tokens = mergeMotionTokens(tokens, overrides);
    rebuildPresets();
    return tokens;
  };

  const resolvePreset = (
    name: string,
    options?: { reduceMotion?: boolean }
  ) => {
    const reduce = options?.reduceMotion ?? reduceMotion();
    if (reduce) return noMotionPreset;
    return presets[name] ?? noMotionPreset;
  };

  const setNoMotionPreset = (preset: MotionPreset) => {
    noMotionPreset = preset;
  };

  return {
    getTokens,
    getPresets,
    getPreset,
    registerPreset,
    overrideTokens,
    resolvePreset,
    setNoMotionPreset,
  };
};
