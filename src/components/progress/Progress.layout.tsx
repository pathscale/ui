import "./Progress.css";
import type { JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Flavor, State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Progress.recipe";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type ProgressProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    value?: number;
    minValue?: number;
    maxValue?: number;
    isIndeterminate?: boolean;
    label?: string;
    size?: ProgressSize;
    flavor?: Flavor;
    state?: State;
    formatValue?: (value: number) => string;
    showValue?: boolean;
  };

const Progress: Layout<typeof componentRecipe, ProgressProps> = () => {
  const others = omit(
    props,
    "value",
    "minValue",
    "maxValue",
    "isIndeterminate",
    "label",
    "size",
    "flavor",
    "state",
    "formatValue",
    "showValue",
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

  const shouldShowValue = () => Boolean(props.showValue);

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.size[props.size ?? "md"],
      CLASSES.flavor[
        (props.flavor ?? "accent") as keyof typeof CLASSES.flavor
      ] ?? `progress--flavor-${props.flavor ?? "accent"}`,
      isIndeterminate() && CLASSES.state.indeterminate,
      props.state === "disabled" && CLASSES.state.disabled,
      props.class,
    ),
  );

  return (
    <div
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
      {props.label && <span {...{ class: CLASSES.label }}>{props.label}</span>}
      {shouldShowValue() && (
        <span {...{ class: CLASSES.output }}>{valueText()}</span>
      )}
      <div {...{ class: CLASSES.track }}>
        <div
          {...{ class: CLASSES.indicator }}
          style={isIndeterminate() ? undefined : { width: `${percentage()}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
