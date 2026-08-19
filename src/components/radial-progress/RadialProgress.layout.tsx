import "./RadialProgress.css";
import type { JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Flavor, State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./RadialProgress.recipe";

export type RadialProgressSize = "sm" | "md" | "lg";
export type RadialProgressColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type RadialProgressProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
    value?: number;
    minValue?: number;
    maxValue?: number;
    isIndeterminate?: boolean;
    size?: RadialProgressSize;
    flavor?: Flavor;
    state?: State;
    formatValue?: (value: number) => string;
    label?: string;
  };

const STROKE_WIDTH = 4;
const CENTER = 18;
const RADIUS = CENTER - STROKE_WIDTH / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RadialProgress: Layout<
  typeof componentRecipe,
  RadialProgressProps
> = () => {
  const others = omit(
    props,
    "value",
    "minValue",
    "maxValue",
    "isIndeterminate",
    "size",
    "flavor",
    "state",
    "formatValue",
    "label",
    "class",
    "dataTheme",
    "style",
  );

  const min = () => props.minValue ?? 0;
  const max = () => props.maxValue ?? 100;
  const isIndeterminate = () =>
    Boolean(props.isIndeterminate) || props.value === undefined;

  const percentage = createMemo(() => {
    if (isIndeterminate()) return 0;
    const clamped = Math.min(Math.max(props.value ?? 0, min()), max());
    return ((clamped - min()) / (max() - min())) * 100;
  });

  const valueText = createMemo(() => {
    if (isIndeterminate()) return "";
    if (props.formatValue && props.value !== undefined) {
      return props.formatValue(props.value);
    }
    return `${Math.round(percentage())}%`;
  });

  const strokeDashoffset = createMemo(
    () => CIRCUMFERENCE - (percentage() / 100) * CIRCUMFERENCE,
  );

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.size[props.size ?? "md"],
      CLASSES.flavor[
        (props.flavor ?? "accent") as keyof typeof CLASSES.flavor
      ] ?? `radial-progress--flavor-${props.flavor ?? "accent"}`,
      isIndeterminate() && CLASSES.state.indeterminate,
      props.state === "disabled" && CLASSES.state.disabled,
      props.class,
    ),
  );

  return (
    <span
      {...others}
      role="progressbar"
      {...{ class: classes() }}
      data-theme={props.dataTheme}
      style={props.style}
      aria-valuenow={isIndeterminate() ? undefined : props.value}
      aria-valuemin={min()}
      aria-valuemax={max()}
      aria-valuetext={isIndeterminate() ? undefined : valueText()}
      aria-label={props.label}
      aria-disabled={props.state === "disabled" ? "true" : undefined}
      data-disabled={props.state === "disabled" ? "true" : undefined}
    >
      <svg
        {...{ class: CLASSES.svg }}
        fill="none"
        viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
      >
        <circle
          {...{ class: CLASSES.trackCircle }}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke-width={STROKE_WIDTH}
        />
        <circle
          {...{ class: CLASSES.indicator }}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke-dasharray={`${CIRCUMFERENCE}`}
          stroke-dashoffset={`${isIndeterminate() ? CIRCUMFERENCE * 0.75 : strokeDashoffset()}`}
          stroke-linecap="round"
          stroke-width={STROKE_WIDTH}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
      </svg>
    </span>
  );
};

export default RadialProgress;
