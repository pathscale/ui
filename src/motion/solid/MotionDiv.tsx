import {type Component, createSignal, createTrackedEffect, onCleanup, omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { runMotion } from "../engine";
import type { MotionState, MotionTransition } from "../types";

export interface MotionDivProps extends JSX.HTMLAttributes<HTMLDivElement> {
  initial?: MotionState;
  animate?: MotionState;
  exit?: MotionState;
  transition?: MotionTransition;
  isExiting?: boolean;
  onExitComplete?: () => void;
  animateKey?: unknown;
}

export const MotionDiv: Component<MotionDivProps> = (props) => {
  const rest = omit(
    props,
    "initial",
    "animate",
    "exit",
    "transition",
    "isExiting",
    "onExitComplete",
    "animateKey",
    "children",
    "ref",
  );
  const [elementRef, setElementRef] = createSignal<HTMLDivElement | undefined>(
    undefined
  );
  let activeControl: { stop: () => void } | null = null;
  let lastTrigger: unknown;
  let lastIsExiting = false;
  let hasAnimated = false;

  const stopActive = () => {
    activeControl?.stop();
    activeControl = null;
  };

  const runEnter = (
    target: HTMLDivElement,
    from: MotionState | undefined,
    to: MotionState | undefined,
    transition: MotionTransition | undefined
  ) => {
    if (!to) return;
    stopActive();
    activeControl = runMotion(target, from ?? {}, to ?? {}, transition);
  };

  const runExit = (
    target: HTMLDivElement,
    from: MotionState | undefined,
    to: MotionState | undefined,
    transition: MotionTransition | undefined,
    onComplete: (() => void) | undefined
  ) => {
    if (!to) {
      onComplete?.();
      return;
    }
    stopActive();
    activeControl = runMotion(
      target,
      from ?? {},
      to ?? {},
      transition,
      onComplete
    );
  };

  createTrackedEffect(() => {
    const target = elementRef();
    if (!target) return;

    const isExiting = Boolean(props.isExiting);
    const trigger = props.animateKey;
    const initial = props.initial;
    const animate = props.animate;
    const exit = props.exit;
    const transition = props.transition;
    const onComplete = props.onExitComplete;

    if (isExiting) {
      if (!lastIsExiting) {
        lastIsExiting = true;
        hasAnimated = false;
        runExit(target, animate ?? initial, exit, transition, onComplete);
      }
      return;
    }

    lastIsExiting = false;
    if (!hasAnimated || trigger !== lastTrigger) {
      lastTrigger = trigger;
      hasAnimated = true;
      runEnter(target, initial, animate, transition);
    }
  });

  onCleanup(() => {
    stopActive();
  });

  return (
    <div
      ref={(el) => {
        setElementRef(el);
        if (typeof props.ref === "function") {
          props.ref(el);
        }
      }}
      {...rest}
    >
      {props.children}
    </div>
  );
};

export default MotionDiv;
