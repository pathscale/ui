import "./Progress.css";
import {
  createContext,
  createMemo,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

/* -------------------------------------------------------------------------------------------------
 * Progress Context
 * -----------------------------------------------------------------------------------------------*/
export type ProgressSize = "sm" | "md" | "lg";
export type ProgressColor = "default" | "accent" | "success" | "warning" | "danger";

type ProgressContextValue = {
  percentage: () => number;
  isIndeterminate: () => boolean;
  valueText: () => string;
};

const ProgressContext = createContext<ProgressContextValue>();

const useProgressContext = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("Progress compound components must be used within <Progress>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type ProgressRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    value?: number;
    minValue?: number;
    maxValue?: number;
    isIndeterminate?: boolean;
    label?: string;
    size?: ProgressSize;
    color?: ProgressColor;
    isDisabled?: boolean;
    formatValue?: (value: number) => string;
  };

export type ProgressOutputProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type ProgressTrackProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ProgressFillProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

/* -------------------------------------------------------------------------------------------------
 * Progress Root
 * -----------------------------------------------------------------------------------------------*/
const SIZE_CLASS_MAP: Record<ProgressSize, string> = {
  sm: "progress-bar--sm",
  md: "",
  lg: "progress-bar--lg",
};

const COLOR_CLASS_MAP: Record<ProgressColor, string> = {
  default: "progress-bar--default",
  accent: "progress-bar--accent",
  success: "progress-bar--success",
  warning: "progress-bar--warning",
  danger: "progress-bar--danger",
};

const ProgressRoot: ParentComponent<ProgressRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "value",
    "minValue",
    "maxValue",
    "isIndeterminate",
    "label",
    "size",
    "color",
    "isDisabled",
    "formatValue",
    "dataTheme",
    "style",
  ]);

  const min = () => local.minValue ?? 0;
  const max = () => local.maxValue ?? 100;
  const isIndeterminate = () => Boolean(local.isIndeterminate);

  const percentage = createMemo(() => {
    if (isIndeterminate() || local.value === undefined) return 0;
    const clamped = Math.min(Math.max(local.value, min()), max());
    return ((clamped - min()) / (max() - min())) * 100;
  });

  const valueText = createMemo(() => {
    if (isIndeterminate()) return "";
    if (local.formatValue && local.value !== undefined) return local.formatValue(local.value);
    return `${Math.round(percentage())}%`;
  });

  const ctx: ProgressContextValue = { percentage, isIndeterminate, valueText };

  return (
    <ProgressContext.Provider value={ctx}>
      <div
        {...others}
        role="progressbar"
        class={twMerge(
          "progress-bar",
          SIZE_CLASS_MAP[local.size ?? "md"],
          COLOR_CLASS_MAP[local.color ?? "accent"],
          local.class,
          local.className,
        )}
        data-slot="progress-bar"
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
        {local.label && <span data-slot="label">{local.label}</span>}
        {local.children}
      </div>
    </ProgressContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Progress Output
 * -----------------------------------------------------------------------------------------------*/
const ProgressOutput: Component<ProgressOutputProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const ctx = useProgressContext();

  return (
    <span
      {...others}
      class={twMerge("progress-bar__output", local.class, local.className)}
      data-slot="progress-bar-output"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children ?? ctx.valueText()}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Progress Track
 * -----------------------------------------------------------------------------------------------*/
const ProgressTrack: ParentComponent<ProgressTrackProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      class={twMerge("progress-bar__track", local.class, local.className)}
      data-slot="progress-bar-track"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Progress Fill
 * -----------------------------------------------------------------------------------------------*/
const ProgressFill: Component<ProgressFillProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const ctx = useProgressContext();

  return (
    <div
      {...others}
      class={twMerge("progress-bar__fill", local.class, local.className)}
      data-slot="progress-bar-fill"
      data-theme={local.dataTheme}
      style={Object.assign(
        {},
        local.style,
        ctx.isIndeterminate() ? undefined : { width: `${ctx.percentage()}%` },
      )}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Progress = Object.assign(ProgressRoot, {
  Root: ProgressRoot,
  Output: ProgressOutput,
  Track: ProgressTrack,
  Fill: ProgressFill,
});

export default Progress;
export { ProgressRoot, ProgressOutput, ProgressTrack, ProgressFill };
