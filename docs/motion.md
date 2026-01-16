# @pathscale/ui/motion

A shared motion system for PathScale consumer apps. It provides:

- A Popmotion-compatible animation engine with an injectable driver.
- Solid components (`MotionDiv`) that match existing PopmotionDiv usage.
- Shared tokens and presets for consistent timing/easing.
- Helpers for route transitions and per-app motion configuration.

This guide covers both migration from app-local Popmotion helpers and ongoing usage.

---

## Install and setup

`@pathscale/ui` ships motion primitives. Popmotion is an optional peer dependency.

If your app should animate, install Popmotion:

```bash
bun add popmotion
```

Enable Popmotion once in your app entry point:

```ts
import { enablePopmotion } from "@pathscale/ui";
import { animate } from "popmotion";

enablePopmotion(animate);
```

If you do not call `enablePopmotion`, the module falls back to a no-op driver
and animations complete immediately.

---

## Quick start

### MotionDiv

`MotionDiv` is a drop-in replacement for existing PopmotionDiv usage.

```tsx
import { MotionDiv, motionPresets } from "@pathscale/ui";

const preset = motionPresets.fadeUp;

<MotionDiv
  initial={preset.initial}
  animate={preset.animate}
  exit={preset.exit}
  transition={preset.transition}
>
  <div>Animated content</div>
</MotionDiv>
```

### Reduced motion

```ts
import { prefersReducedMotion, resolvePreset } from "@pathscale/ui";

const preset = resolvePreset("fadeUp", { reduceMotion: prefersReducedMotion() });
```

---

## Migration guide

This mirrors the patterns used in existing consumer apps.

### 1) Replace local PopmotionDiv with MotionDiv

Before:

```tsx
import PopmotionDiv from "~/components/animation/PopmotionDiv";
import { motionPresets } from "~/lib/motion";

<PopmotionDiv
  initial={motionPresets.fade.initial}
  animate={motionPresets.fade.animate}
  exit={motionPresets.fade.exit}
  transition={motionPresets.fade.transition}
/>
```

After:

```tsx
import { MotionDiv, motionPresets } from "@pathscale/ui";

<MotionDiv
  initial={motionPresets.fade.initial}
  animate={motionPresets.fade.animate}
  exit={motionPresets.fade.exit}
  transition={motionPresets.fade.transition}
/>
```

### 2) Replace local popmotion runner

If you used `runPopmotion` directly, switch to `runMotion` and enable Popmotion:

```ts
import { enablePopmotion, runMotion } from "@pathscale/ui";
import { animate } from "popmotion";

enablePopmotion(animate);

const control = runMotion(el, from, to, transition, onComplete);
```

### 3) Replace app-local motion tokens and presets

Use the shared tokens or create a per-app motion system (recommended if you
need to customize durations or distances).

```ts
import { createMotionSystem } from "@pathscale/ui";

const motion = createMotionSystem({
  tokens: {
    durations: { route: 0.22 },
    distances: { slideIn: 48 },
  },
});

const preset = motion.resolvePreset("routeAuth");
```

### 4) Route transitions

The helper `createRouteTransitionResolver` lets each app define its own rules
without duplicating wrapper logic.

```ts
import { createRouteTransitionResolver } from "@pathscale/ui";

const resolveRouteTransition = createRouteTransitionResolver({
  rules: [
    (from, to) => (isAuth(from) && isAuth(to) ? "authSwap" : undefined),
    (from, to) => (isAuth(from) ? "routeAuth" : undefined),
  ],
  fallback: motion.resolvePreset("route"),
  resolvePreset: (name) => motion.getPreset(name),
});
```

Use the result in your route wrapper (same pattern as today):

```tsx
const preset = resolveRouteTransition(currentPath, nextPath);

<MotionDiv
  initial={preset.initial}
  animate={preset.animate}
  exit={preset.exit}
  transition={preset.transition}
  isExiting={isExiting}
  onExitComplete={handleExit}
/>
```

---

## Usage guide

### Tokens

Tokens are shared defaults for durations, easings, and distances.

```ts
import { motionDurations, motionEasings, motionDistances } from "@pathscale/ui";
```

To customize tokens per app:

```ts
import { createMotionSystem } from "@pathscale/ui";

const motion = createMotionSystem({
  tokens: {
    durations: { base: 0.32 },
    easings: { out: "ease-out" },
    distances: { sm: 8 },
  },
});
```

You can also update tokens later:

```ts
motion.overrideTokens({ durations: { fast: 0.16 } });
```

### Presets

Presets are named motion patterns built from tokens.

```ts
import { motionPresets } from "@pathscale/ui";

const preset = motionPresets.scaleIn;
```

Define custom presets without mutating global defaults:

```ts
const motion = createMotionSystem({
  presets: {
    heroReveal: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.24, easing: "ease-out" },
    },
  },
});
```

### Popmotion driver

The motion engine is driver-based. Enable Popmotion like this:

```ts
import { enablePopmotion } from "@pathscale/ui";
import { animate } from "popmotion";

enablePopmotion(animate);
```

You can swap drivers for testing or special cases:

```ts
import { setMotionDriver } from "@pathscale/ui";

setMotionDriver(({ to, onUpdate, onComplete }) => {
  onUpdate(to);
  onComplete?.();
  return { stop: () => {} };
});
```

### Reduced motion

Use `resolvePreset` or your app-level `resolvePreset` to honor reduced motion.

```ts
const preset = motion.resolvePreset("fadeUp");
```

### SSR and hydration

`prefersReducedMotion` uses `matchMedia`, so it should only run in the browser.
If you need SSR safety, pass `reduceMotion: true` on the server or provide a
custom `reduceMotion` function in `createMotionSystem`.

---

## API summary

Core exports:

- `MotionDiv`
- `runMotion`
- `setMotionDriver`, `enablePopmotion`
- `motionDurations`, `motionEasings`, `motionDistances`
- `motionPresets`, `resolvePreset`, `registerPreset`
- `createMotionSystem`
- `createRouteTransitionResolver`

Types:

- `MotionState`, `MotionTransition`, `MotionPreset`
- `MotionTokens`, `MotionTokenOverrides`
- `RouteTransitionRule`, `RouteTransitionResolverOptions`

---

## Recommended adoption checklist

1. Install Popmotion and enable the driver in your app entry.
2. Replace app-local `PopmotionDiv` with `MotionDiv`.
3. Replace local presets/tokens with shared ones or a per-app motion system.
4. Replace route transition logic with `createRouteTransitionResolver`.
5. Verify reduced-motion behavior on all key flows.

---

## Notes

- This module focuses on transform and opacity animations for performance.
- For gesture-heavy or bespoke choreography, build on top of the primitives
  at the app level.
- If you need new shared patterns (Tabs indicator, Modal transitions), build
  them as UI components in `@pathscale/ui` using these primitives.
