import "./Progress.css";
import { createMemo, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Progress.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Progress.recipe";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressColor = "default" | "accent" | "success" | "warning" | "danger";

export type ProgressProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    value?: number;
    minValue?: number;
    maxValue?: number;
    isIndeterminate?: boolean;
    label?: string;
    size?: ProgressSize;
    color?: ProgressColor;
    isDisabled?: boolean;
    formatValue?: (value: number) => string;
    showValue?: boolean;
  };

const Progress: Layout<typeof componentRecipe, ProgressProps> = () => {
  const [local, others] = splitProps(props, [
    "value",
    "minValue",
    "maxValue",
    "isIndeterminate",
    "label",
    "size",
    "color",
    "isDisabled",
    "formatValue",
    "showValue",
    "class",
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

  const shouldShowValue = () => Boolean(local.showValue);

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.size[local.size ?? "md"],
      CLASSES.color[local.color ?? "accent"],
      isIndeterminate() && CLASSES.state.indeterminate,
      local.isDisabled && CLASSES.state.disabled,
      local.class,
    ),
  );

  return (
    <div
      {...others}
      role="progressbar"
      {...{ class: classes() }}
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
      {local.label && <span {...{ class: CLASSES.label }}>{local.label}</span>}
      {shouldShowValue() && <span {...{ class: CLASSES.output }}>{valueText()}</span>}
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
