import {
  type JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import { prefersReducedMotion } from "../reduced-motion";

export type PresenceRenderProp = (
  isExiting: () => boolean,
  onExitComplete: () => void,
) => JSX.Element;

export interface PresenceProps {
  /** Controls whether the child should be mounted/visible. */
  when: boolean;
  /**
   * Render function. Receives an `isExiting` accessor (pass through to
   * MotionDiv's `isExiting`) and an `onExitComplete` callback that must be
   * wired to MotionDiv (or invoked manually when the exit animation ends).
   */
  children: PresenceRenderProp;
  /**
   * Fallback timeout (ms) after which Presence force-unmounts the child if
   * `onExitComplete` was never called. Prevents stuck-exit states. Default 800.
   */
  exitTimeout?: number;
  /** Override for prefers-reduced-motion detection. */
  reduceMotion?: boolean;
}

interface PresenceState {
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

const DEFAULT_EXIT_TIMEOUT = 800;

export const Presence = (props: PresenceProps) => {
  const [state, setState] = createSignal<PresenceState>({
    mounted: props.when,
    isExiting: false,
  });

  let exitTimer: ReturnType<typeof setTimeout> | null = null;
  const clearTimer = () => {
    if (exitTimer !== null) {
      clearTimeout(exitTimer);
      exitTimer = null;
    }
  };

  const finishExit = () => {
    clearTimer();
    setState((prev) =>
      prev.isExiting ? { mounted: false, isExiting: false } : prev,
    );
  };

  // Drive state from the `when` prop. createEffect (not memo) because we
  // perform side effects (setState, timers). untrack the state read so the
  // effect only re-runs when `props.when` changes — preventing the self-
  // triggered "potential infinite loop" Solid warns about.
  createEffect(() => {
    const when = props.when;
    untrack(() => {
      const next = nextPresenceState(state(), when);
      if (next === state()) return;
      setState(next);

      if (next.isExiting) {
        const reduce = props.reduceMotion ?? prefersReducedMotion();
        if (reduce) {
          queueMicrotask(finishExit);
          return;
        }
        clearTimer();
        const ms = props.exitTimeout ?? DEFAULT_EXIT_TIMEOUT;
        exitTimer = setTimeout(finishExit, ms);
      } else {
        clearTimer();
      }
    });
  });

  onCleanup(clearTimer);

  const isExiting = () => state().isExiting;

  return (
    <Show when={state().mounted}>{props.children(isExiting, finishExit)}</Show>
  );
};

export default Presence;
