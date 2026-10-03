# Motion primitive exports

The integration lane should add these exports to `src/motion/index.ts`; this
lane intentionally leaves the existing barrel unchanged.

```ts
export {
  createScrollProgress,
  supportsViewTimeline,
  type ScrollProgress,
  type ScrollProgressOptions,
  type ScrollProgressRange,
} from "./scroll-progress";
export {
  animateElement,
  type AnimateElementOptions,
  type ElementAnimation,
} from "./animate-element";
export { createInView, type InViewOptions } from "./in-view";
export { stagger } from "./stagger";
export { springKeyframes, type SpringKeyframeOptions } from "./spring-keyframes";
```

## Contracts

- `createScrollProgress(() => section, { range: "start-start/end-end" })` returns a
  Solid accessor, so read `progress()` for the current value. The helper writes
  `--scroll-progress` on the section and restores its prior inline value on cleanup.
  It installs browser listeners only after mount, measures section and viewport
  heights on mount and resize, and samples section position at most once per animation
  frame. The supported range maps the section top at viewport top to its bottom at
  viewport bottom. `supportsViewTimeline()` checks named view timeline, block axis,
  animation timeline, and the `contain 0%` through `contain 100%` attachment range used
  by the CSS path.
- `animateElement(element, keyframes, options)` uses WAAPI when available and applies
  the final keyframe immediately when it is unavailable. `duration` and `delay` follow
  WAAPI milliseconds; the default duration comes from `motionDurations.base` and the
  default easing comes from `motionEasings.out`. Its `finished` promise resolves on
  completion or cancellation. Live reduced-motion changes finish the active animation.
- `createInView(() => element, options)` returns a Solid accessor. It starts visible,
  remains visible when `IntersectionObserver` is unavailable, and disconnects after
  the first intersection when `once` is true.
- `stagger(index, interval)` returns a nonnegative delay in milliseconds; the default
  interval is 50 ms.
- `springKeyframes({ stiffness, damping, mass })` returns normalized numeric values
  sampled at 60 Hz. Use the values for one property in `PropertyIndexedKeyframes` and
  set the animation duration to `(values.length - 1) / 60 * 1000` ms to preserve the
  sample rate.
