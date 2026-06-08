export {
  createInstance,
  destroyInstance,
  updateInstance,
  setInstanceVisible,
  registerGlowInstance,
  unregisterGlowInstance,
  setGlowCallback,
} from "./renderer/loop";
export {
  injectGlow,
  updateGlow,
  resizeGlow,
  type GlowHandles,
} from "./glow/glow";
export type { MetalFxInstance } from "./renderer/core";
export type { PresetName, PresetTheme } from "./presets";
