import "./ProgressCircle.css";
import { createMemo, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ProgressCircle.classes";

export type ProgressCircleSize = "sm" | "md" | "lg";
export type ProgressCircleColor = "default" | "accent" | "success" | "warning" | "danger";

export type ProgressCircleProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
    value?: number;
    minValue?: number;
    maxValue?: number;
    isIndeterminate?: boolean;
    size?: ProgressCircleSize;
    color?: ProgressCircleColor;
    isDisabled?: boolean;
    formatValue?: (value: number) => string;
    label?: string;
  };

const STROKE_WIDTH = 4;
const CENTER = 18;
const RADIUS = CENTER - STROKE_WIDTH / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressCircle = (props: ProgressCircleProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "value",
    "minValue",
    "maxValue",
    "isIndeterminate",
    "size",
    "color",
    "isDisabled",
    "formatValue",
    "label",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const min = () => local.minValue ?? 0;
  const max = () => local.maxValue ?? 100;
  const isIndeterminate = () => Boolean(local.isIndeterminate) || local.value === undefined;

  const percentage = createMemo(() => {
    if (isIndeterminate()) return 0;
    const clamped = Math.min(Math.max(local.value ?? 0, min()), max());
    return ((clamped - min()) / (max() - min())) * 100;
  });

  const valueText = createMemo(() => {
    if (isIndeterminate()) return "";
    if (local.formatValue && local.value !== undefined) {
      return local.formatValue(local.value);
    }
    return `${Math.round(percentage())}%`;
  });

  const strokeDashoffset = createMemo(() =>
    CIRCUMFERENCE - (percentage() / 100) * CIRCUMFERENCE,
  );

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.size[local.size ?? "md"],
      CLASSES.color[local.color ?? "accent"],
      isIndeterminate() && CLASSES.state.indeterminate,
      local.isDisabled && CLASSES.state.disabled,
      local.class,
      local.className,
    ),
  );

  return (
    <span
      {...others}
      role="progressbar"
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
      aria-valuenow={isIndeterminate() ? undefined : local.value}
      aria-valuemin={min()}
      aria-valuemax={max()}
      aria-valuetext={isIndeterminate() ? undefined : valueText()}
      aria-label={local.label}
      aria-disabled={local.isDisabled ? "true" : undefined}
      data-disabled={local.isDisabled ? "true" : undefined}
    >
      <svg
        class={CLASSES.svg}
        fill="none"
        viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
      >
        <circle
          class={CLASSES.trackCircle}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke-width={STROKE_WIDTH}
        />
        <circle
          class={CLASSES.indicator}
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

export default ProgressCircle;
