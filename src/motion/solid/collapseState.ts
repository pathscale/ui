import type { JSX } from "@solidjs/web";

/*
 * AnimatedCollapse's phase machine and style computation, split out of the
 * component for the same reason as `presenceState.ts`: both were already pure
 * and marked "exposed for unit testing", and a test for a pure function should
 * not need a JSX transform to reach it.
 *
 * Under Solid 2 that stopped being a preference. Neither `solid-js@2.0.0-rc.0`
 * nor `@solidjs/web@2.0.0-rc.0` ships the JSX runtime its `./jsx-dev-runtime`
 * export advertises, so compiling any `.tsx` under the test runner fails on a
 * missing `jsxDEV`.
 */
export type CollapsePhase = "closed" | "opening" | "open" | "closing";

/**
 * Pure: returns the next collapse phase given the previous phase and target
 * `open`. Exposed for unit testing.
 */
export const nextCollapsePhase = (
  prev: CollapsePhase,
  open: boolean,
): CollapsePhase => {
  if (open) {
    return prev === "open" || prev === "opening" ? prev : "opening";
  }
  return prev === "closed" || prev === "closing" ? prev : "closing";
};

/**
 * Pure: computes the inline style for the collapse wrapper based on phase,
 * measured height (px), and opacity preference. `null` means "no inline
 * height — let layout flow" (used while fully open with dynamic content).
 * Exposed for unit testing.
 */
export const computeCollapseStyle = (
  phase: CollapsePhase,
  heightPx: number | null,
  animateOpacity: boolean,
): JSX.CSSProperties => {
  const style: JSX.CSSProperties = { overflow: "hidden" };
  if (phase === "closed") {
    style.height = "0px";
    if (animateOpacity) style.opacity = 0;
    return style;
  }
  if (phase === "open") {
    // Let height flow naturally so dynamic content can grow.
    if (animateOpacity) style.opacity = 1;
    style.overflow = "visible";
    return style;
  }
  // opening or closing — drive height from JS animation
  if (heightPx !== null) {
    style.height = `${heightPx}px`;
  }
  return style;
};
