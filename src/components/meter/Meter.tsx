import "./Meter.css";
import {
  createContext,
  createMemo,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Meter.classes";

export type MeterSize = "sm" | "md" | "lg";
export type MeterColor = "default" | "accent" | "success" | "warning" | "danger";

export type MeterRenderState = {
  value: number;
  minValue: number;
  maxValue: number;
  percentage: number;
  valueText: string;
  isDisabled: boolean;
};

export type MeterRootProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: JSX.Element | ((state: MeterRenderState) => JSX.Element);
    value?: number;
    minValue?: number;
    maxValue?: number;
    lowValue?: number;
    highValue?: number;
    optimumValue?: number;
    isDisabled?: boolean;
    size?: MeterSize;
    color?: MeterColor;
    formatOptions?: Intl.NumberFormatOptions;
    formatValue?: (value: number, state: Omit<MeterRenderState, "valueText">) => string;
  };

export type MeterOutputProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLSpanElement>;
export type MeterTrackProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLDivElement>;
export type MeterFillProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLDivElement>;

type MeterContextValue = {
  state: Accessor<MeterRenderState>;
};

const MeterContext = createContext<MeterContextValue>();

const useMeterContext = (): MeterContextValue => {
  const context = useContext(MeterContext);
  if (!context) {
    throw new Error("Meter compound components must be used within <Meter>");
  }
  return context;
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const MeterRoot: Component<MeterRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "value",
    "minValue",
    "maxValue",
    "lowValue",
    "highValue",
    "optimumValue",
    "isDisabled",
    "size",
    "color",
    "formatOptions",
    "formatValue",
  ]);

  const minValue = createMemo(() => local.minValue ?? 0);
  const maxValue = createMemo(() => {
    const resolvedMin = minValue();
    const resolvedMax = local.maxValue ?? 100;
    return resolvedMax > resolvedMin ? resolvedMax : resolvedMin + 1;
  });

  const clampedValue = createMemo(() => clamp(local.value ?? minValue(), minValue(), maxValue()));

  const percentage = createMemo(
    () => ((clampedValue() - minValue()) / (maxValue() - minValue())) * 100,
  );

  const formatter = createMemo(() => {
    if (!local.formatOptions) return undefined;
    try {
      return new Intl.NumberFormat(undefined, local.formatOptions);
    } catch {
      return undefined;
    }
  });

  const state = createMemo<MeterRenderState>(() => {
    const base = {
      value: clampedValue(),
      minValue: minValue(),
      maxValue: maxValue(),
      percentage: percentage(),
      isDisabled: Boolean(local.isDisabled),
    };

    const valueText = local.formatValue
      ? local.formatValue(base.value, base)
      : formatter()?.format(base.value) ?? `${Math.round(base.percentage)}%`;

    return {
      ...base,
      valueText,
    };
  });

  const rootClasses = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.size[local.size ?? "md"],
      CLASSES.color[local.color ?? "accent"],
      local.isDisabled && CLASSES.state.disabled,
      local.class,
      local.className,
    ),
  );

  return (
    <MeterContext.Provider value={{ state }}>
      <div
        {...others}
        role={others.role ?? "meter"}
        aria-valuemin={minValue()}
        aria-valuemax={maxValue()}
        aria-valuenow={state().value}
        aria-valuetext={state().valueText}
        aria-disabled={local.isDisabled ? "true" : undefined}
        data-disabled={local.isDisabled ? "true" : undefined}
        data-slot="meter"
        data-theme={local.dataTheme}
        data-low-value={local.lowValue}
        data-high-value={local.highValue}
        data-optimum-value={local.optimumValue}
        style={local.style}
        {...{ class: rootClasses() }}
      >
        {typeof local.children === "function" ? local.children(state()) : local.children}
      </div>
    </MeterContext.Provider>
  );
};

const MeterOutput: Component<MeterOutputProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);
  const { state } = useMeterContext();

  return (
    <span
      {...others}
      data-slot="meter-output"
      data-theme={local.dataTheme}
      style={local.style}
      {...{ class: twMerge(CLASSES.output, local.class, local.className) }}
    >
      {local.children ?? state().valueText}
    </span>
  );
};

const MeterTrack: Component<MeterTrackProps> = (props) => {
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
      data-slot="meter-track"
      data-theme={local.dataTheme}
      style={local.style}
      {...{ class: twMerge(CLASSES.track, local.class, local.className) }}
    >
      {local.children}
    </div>
  );
};

const MeterFill: Component<MeterFillProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style"]);
  const { state } = useMeterContext();

  const style = createMemo<JSX.CSSProperties | string>(() => {
    if (typeof local.style === "string") {
      const trimmed = local.style.trim();
      const suffix = trimmed.length > 0 && !trimmed.endsWith(";") ? ";" : "";
      return `${trimmed}${suffix} width: ${state().percentage}%;`;
    }

    return {
      ...(local.style ?? {}),
      width: `${state().percentage}%`,
    } as JSX.CSSProperties;
  });

  return (
    <div
      {...others}
      data-slot="meter-fill"
      data-theme={local.dataTheme}
      style={style()}
      {...{ class: twMerge(CLASSES.fill, local.class, local.className) }}
    />
  );
};

const Meter = Object.assign(MeterRoot, {
  Root: MeterRoot,
  Output: MeterOutput,
  Track: MeterTrack,
  Fill: MeterFill,
});

export default Meter;
export { Meter, MeterRoot, MeterOutput, MeterTrack, MeterFill };
export type { MeterRootProps as MeterProps };

