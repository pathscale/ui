export {
  type AnimateElementOptions,
  animateElement,
  type ElementAnimation,
} from "./animate-element";
export { getMotionDriver, immediateDriver, setMotionDriver } from "./driver";
export { resolveEase } from "./easing";
export { runMotion } from "./engine";
export { createInView, type InViewOptions } from "./in-view";
export {
  createPopmotionDriver,
  enablePopmotion,
  type PopmotionAnimate,
} from "./popmotion";
export {
  createMotionPresets,
  getPreset,
  motionPresets,
  noMotion,
  registerPreset,
  resolvePreset,
  routeTransition,
} from "./presets";
export { prefersReducedMotion } from "./reduced-motion";
export {
  createRouteTransitionResolver,
  type RouteTransitionResolverOptions,
  type RouteTransitionRule,
  type RouteTransitionRuleResult,
} from "./route";
export {
  createScrollProgress,
  type ScrollProgress,
  type ScrollProgressOptions,
  type ScrollProgressRange,
  supportsViewTimeline,
} from "./scroll-progress";
export {
  AnimatedCollapse,
  type AnimatedCollapseProps,
  computeCollapseStyle,
  MotionDiv,
  type MotionDivProps,
  nextCollapsePhase,
  nextPresenceState,
  Presence,
  type PresenceProps,
  type PresenceRenderProp,
} from "./solid";
export {
  type SpringKeyframeOptions,
  springKeyframes,
} from "./spring-keyframes";
export { stagger } from "./stagger";
export { createMotionSystem, type MotionSystemConfig } from "./system";
export {
  defaultMotionTokens,
  mergeMotionTokens,
  motionDistances,
  motionDurations,
  motionEasings,
} from "./tokens";
export type {
  MotionDriver,
  MotionDriverOptions,
  MotionEasing,
  MotionPreset,
  MotionState,
  MotionTokenOverrides,
  MotionTokens,
  MotionTransition,
} from "./types";
