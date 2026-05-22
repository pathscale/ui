import {
  type JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import { getMotionDriver } from "../driver";
import { resolveEase } from "../easing";
import { prefersReducedMotion } from "../reduced-motion";

export interface AnimatedCollapseProps {
  /** Whether the panel is expanded. */
  open: boolean;
  children: JSX.Element;
  /** Animation duration in seconds. Default 0.24. */
  duration?: number;
  /** Wrapper class (applied to the height-animated container). */
  class?: string;
  /** Inner content class (applied to the measured content wrapper). */
  contentClass?: string;
  /** Cross-fade content during open/close. Default true. */
  animateOpacity?: boolean;
  /** Remove content from the tree when fully closed. Default false. */
  unmountOnExit?: boolean;
  /** Forwarded to the wrapper element. */
  id?: string;
  /** Override for prefers-reduced-motion detection. */
  reduceMotion?: boolean;
}

type CollapsePhase = "closed" | "opening" | "open" | "closing";

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

const DEFAULT_DURATION = 0.24;

export const AnimatedCollapse = (props: AnimatedCollapseProps) => {
  const [phase, setPhase] = createSignal<CollapsePhase>(
    props.open ? "open" : "closed",
  );
  const [heightPx, setHeightPx] = createSignal<number | null>(
    props.open ? null : 0,
  );
  const [opacity, setOpacity] = createSignal<number>(props.open ? 1 : 0);

  let contentEl: HTMLDivElement | undefined;
  let activeControl: { stop: () => void } | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const stopActive = () => {
    activeControl?.stop();
    activeControl = null;
  };

  const measure = (): number => {
    if (!contentEl) return 0;
    return contentEl.scrollHeight;
  };

  const animateOpacity = () => props.animateOpacity !== false;

  const setupObserver = () => {
    if (typeof ResizeObserver === "undefined") return;
    if (!contentEl || resizeObserver) return;
    resizeObserver = new ResizeObserver(() => {
      // While fully open we let layout flow (height: auto via "open" phase),
      // so we don't need to write anything. The observer exists in case a
      // consumer wants to extend behavior later; keeping it minimal avoids
      // layout thrash during the animation itself.
    });
    resizeObserver.observe(contentEl);
  };

  const teardownObserver = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  const runAnimation = (
    target: CollapsePhase,
    fromHeight: number,
    toHeight: number,
  ) => {
    stopActive();
    const reduce = props.reduceMotion ?? prefersReducedMotion();
    if (reduce) {
      setHeightPx(toHeight);
      if (animateOpacity()) setOpacity(target === "opening" ? 1 : 0);
      finish(target);
      return;
    }
    const duration = (props.duration ?? DEFAULT_DURATION) * 1000;
    const ease = resolveEase("ease-out");
    const driver = getMotionDriver();

    const heightControl = driver({
      from: fromHeight,
      to: toHeight,
      duration,
      ease,
      onUpdate: (value) => setHeightPx(value),
      onComplete: () => finish(target),
    });

    if (animateOpacity()) {
      const fromOpacity = target === "opening" ? 0 : 1;
      const toOpacity = target === "opening" ? 1 : 0;
      const opacityControl = driver({
        from: fromOpacity,
        to: toOpacity,
        duration,
        ease,
        onUpdate: (value) => setOpacity(value),
      });
      activeControl = {
        stop: () => {
          heightControl.stop();
          opacityControl.stop();
        },
      };
    } else {
      setOpacity(1);
      activeControl = heightControl;
    }
  };

  const finish = (target: CollapsePhase) => {
    if (target === "opening") {
      setPhase("open");
      setHeightPx(null);
      if (animateOpacity()) setOpacity(1);
    } else if (target === "closing") {
      setPhase("closed");
      setHeightPx(0);
      if (animateOpacity()) setOpacity(0);
      teardownObserver();
    }
  };

  createEffect(() => {
    const open = props.open;
    untrack(() => {
      const target = nextCollapsePhase(phase(), open);
      if (target === phase()) return;
      setPhase(target);

      if (target === "opening") {
        // Defer measurement to next frame so the inner content has been
        // rendered (important when unmountOnExit just remounted it).
        requestAnimationFrame(() => {
          const to = measure();
          setupObserver();
          runAnimation("opening", 0, to);
        });
      } else if (target === "closing") {
        // Capture current measured height before collapsing, commit it,
        // then animate down on the next frame.
        const from = measure();
        setHeightPx(from);
        requestAnimationFrame(() => runAnimation("closing", from, 0));
      }
    });
  });

  onCleanup(() => {
    stopActive();
    teardownObserver();
  });

  const shouldRender = () =>
    props.unmountOnExit ? phase() !== "closed" : true;

  const wrapperStyle = (): JSX.CSSProperties =>
    computeCollapseStyle(phase(), heightPx(), animateOpacity());

  return (
    <Show when={shouldRender()}>
      <div
        id={props.id}
        class={props.class}
        style={{
          ...wrapperStyle(),
          ...(animateOpacity() && phase() !== "open"
            ? { opacity: opacity() }
            : {}),
        }}
        aria-hidden={phase() === "closed" ? true : undefined}
      >
        <div ref={contentEl} class={props.contentClass}>
          {props.children}
        </div>
      </div>
    </Show>
  );
};

export default AnimatedCollapse;
