export {
  type GlowHandles,
  injectGlow,
  resizeGlow,
  updateGlow,
} from "./glow/glow";
export type { PresetName, PresetTheme } from "./presets";
export type { MetalFxInstance } from "./renderer/core";
export {
  createInstance,
  destroyInstance,
  registerGlowInstance,
  setGlowCallback,
  setInstanceVisible,
  unregisterGlowInstance,
  updateInstance,
} from "./renderer/loop";
