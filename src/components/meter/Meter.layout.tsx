import "./Meter.css";
import type { JSX } from "@solidjs/web";
import {
  type Accessor,
  type Component,
  createContext,
  createMemo,
  omit,
  useContext,
} from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Flavor, State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Meter.recipe";

export type MeterSize = "sm" | "md" | "lg";
export type MeterColor =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger";

export type MeterRenderState = {
  value: number;
  minValue: number;
  maxValue: number;
  percentage: number;
  valueText: string;
  isDisabled: boolean;
};

export type MeterRootProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: JSX.Element | ((state: MeterRenderState) => JSX.Element);
    value?: number;
    minValue?: number;
    maxValue?: number;
    lowValue?: number;
    highValue?: number;
    optimumValue?: number;
    state?: State;
    size?: MeterSize;
    flavor?: Flavor;
    formatOptions?: Intl.NumberFormatOptions;
    formatValue?: (
      value: number,
      state: Omit<MeterRenderState, "valueText">,
    ) => string;
  };

export type MeterOutputProps = UIBaseProps &
  JSX.HTMLAttributes<HTMLSpanElement>;
export type MeterTrackProps = UIBaseProps & JSX.HTMLAttributes<HTMLDivElement>;
export type MeterFillProps = UIBaseProps & JSX.HTMLAttributes<HTMLDivElement>;

type MeterContextValue = {
  state: Accessor<MeterRenderState>;
};

/*
 * Defaulted to `null`: this context is optional by construction.
 *
 * Consumers either optional-chain it or guard on it, so the component works
 * standalone without its root, which is a supported shape. Solid 2 made that
 * throw: `getContext` raises `ContextNotFoundError` when the resolved value is
 * `undefined`, and it throws before the optional chain can run. `null` is a
 * value, so the lookup succeeds and the existing reads behave as they always
 * have.
 *
 * A truthy default such as `{}` would silence the throw and be worse: the
 * optional chain would then call methods that do not exist.
 */
const MeterContext = createContext<MeterContextValue | null>(null);

const useMeterContext = (): MeterContextValue => {
  const context = useContext(MeterContext);
  if (!context) {
    throw new Error("Meter compound components must be used within <Meter>");
  }
  return context;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const MeterRoot: Layout<typeof componentRecipe, MeterRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "value",
    "minValue",
    "maxValue",
    "lowValue",
    "highValue",
    "optimumValue",
    "state",
    "size",
    "flavor",
    "formatOptions",
    "formatValue",
  );

  const minValue = createMemo(() => props.minValue ?? 0);
  const maxValue = createMemo(() => {
    const resolvedMin = minValue();
    const resolvedMax = props.maxValue ?? 100;
    return resolvedMax > resolvedMin ? resolvedMax : resolvedMin + 1;
  });

  const clampedValue = createMemo(() =>
    clamp(props.value ?? minValue(), minValue(), maxValue()),
  );

  const percentage = createMemo(
    () => ((clampedValue() - minValue()) / (maxValue() - minValue())) * 100,
  );

  const formatter = createMemo(() => {
    if (!props.formatOptions) return undefined;
    try {
      return new Intl.NumberFormat(undefined, props.formatOptions);
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
      isDisabled: Boolean(props.state === "disabled"),
    };

    const valueText = props.formatValue
      ? props.formatValue(base.value, base)
      : (formatter()?.format(base.value) ?? `${Math.round(base.percentage)}%`);

    return {
      ...base,
      valueText,
    };
  });

  const rootClasses = createMemo(() =>
    twMerge(
      CLASSES.base,
      CLASSES.size[props.size ?? "md"],
      CLASSES.flavor[
        (props.flavor ?? "accent") as keyof typeof CLASSES.flavor
      ] ?? `meter--flavor-${props.flavor ?? "accent"}`,
      props.state === "disabled" && CLASSES.state.disabled,
      props.class,
    ),
  );

  return (
    <MeterContext value={{ state }}>
      <div
        {...others}
        role={others.role ?? "meter"}
        aria-valuemin={minValue()}
        aria-valuemax={maxValue()}
        aria-valuenow={state().value}
        aria-valuetext={state().valueText}
        aria-disabled={props.state === "disabled" ? "true" : undefined}
        data-disabled={props.state === "disabled" ? "true" : undefined}
        data-slot="meter"
        data-theme={props.dataTheme}
        data-low-value={props.lowValue}
        data-high-value={props.highValue}
        data-optimum-value={props.optimumValue}
        style={props.style}
        {...{ class: rootClasses() }}
      >
        {typeof props.children === "function"
          ? props.children(state())
          : props.children}
      </div>
    </MeterContext>
  );
};

const MeterOutput: Layout<typeof componentRecipe, MeterOutputProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");
  const { state } = useMeterContext();

  return (
    <span
      {...others}
      data-slot="meter-output"
      data-theme={props.dataTheme}
      style={props.style}
      {...{ class: twMerge(CLASSES.output, props.class) }}
    >
      {props.children ?? state().valueText}
    </span>
  );
};

const MeterTrack: Layout<typeof componentRecipe, MeterTrackProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      data-slot="meter-track"
      data-theme={props.dataTheme}
      style={props.style}
      {...{ class: twMerge(CLASSES.track, props.class) }}
    >
      {props.children}
    </div>
  );
};

const MeterFill: Layout<typeof componentRecipe, MeterFillProps> = () => {
  const others = omit(props, "class", "dataTheme", "style");
  const { state } = useMeterContext();

  const style = createMemo<JSX.CSSProperties | string>(() => {
    if (typeof props.style === "string") {
      const trimmed = props.style.trim();
      const suffix = trimmed.length > 0 && !trimmed.endsWith(";") ? ";" : "";
      return `${trimmed}${suffix} width: ${state().percentage}%;`;
    }

    return {
      ...(props.style ?? {}),
      width: `${state().percentage}%`,
    } as JSX.CSSProperties;
  });

  return (
    <div
      {...others}
      data-slot="meter-fill"
      data-theme={props.dataTheme}
      style={style()}
      {...{ class: twMerge(CLASSES.fill, props.class) }}
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
export type { MeterRootProps as MeterProps };
export { Meter, MeterFill, MeterOutput, MeterRoot, MeterTrack };
