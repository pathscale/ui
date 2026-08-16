/*
 * Presence's state machine, split out of the component.
 *
 * It was always pure and always marked "exposed for unit testing"; it lives in
 * a `.ts` now so a test can reach it without loading a `.tsx`. That matters
 * under Solid 2: neither `solid-js@2.0.0-rc.0` nor `@solidjs/web@2.0.0-rc.0`
 * ships the JSX runtime its `./jsx-dev-runtime` export advertises, so compiling
 * any `.tsx` under the test runner fails on a missing `jsxDEV`. Testing a pure
 * function should not require a JSX transform in the first place.
 */
export interface PresenceState {
  mounted: boolean;
  isExiting: boolean;
}

/**
 * Pure state transition for Presence. Given the previous state and the next
 * `when` value, returns the next state. Exposed for unit testing.
 */
export const nextPresenceState = (
  prev: PresenceState,
  when: boolean,
): PresenceState => {
  if (when) {
    return { mounted: true, isExiting: false };
  }
  if (prev.mounted && !prev.isExiting) {
    return { mounted: true, isExiting: true };
  }
  return prev.mounted ? prev : { mounted: false, isExiting: false };
};
