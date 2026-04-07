import "./Loading.css";
import { splitProps, createUniqueId, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerColor = "current" | "accent" | "success" | "warning" | "danger";
export type SpinnerVariant = "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";

export type LoadingProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    size?: SpinnerSize;
    color?: SpinnerColor;
    variant?: SpinnerVariant;
    label?: string;
  };

/* -------------------------------------------------------------------------------------------------
 * Class maps
 * -----------------------------------------------------------------------------------------------*/
const SIZE_CLASS_MAP: Record<SpinnerSize, string> = {
  xs: "spinner--xs",
  sm: "spinner--sm",
  md: "",
  lg: "spinner--lg",
  xl: "spinner--xl",
};

const COLOR_CLASS_MAP: Record<SpinnerColor, string> = {
  current: "spinner--current",
  accent: "spinner--accent",
  success: "spinner--success",
  warning: "spinner--warning",
  danger: "spinner--danger",
};

const VARIANT_CLASS_MAP: Record<SpinnerVariant, string> = {
  spinner: "spinner--spinner",
  dots: "spinner--dots",
  ring: "spinner--ring",
  ball: "spinner--ball",
  bars: "spinner--bars",
  infinity: "spinner--infinity",
};

/* -------------------------------------------------------------------------------------------------
 * SVG Spinner (HeroUI-style gradient arc)
 * -----------------------------------------------------------------------------------------------*/
const SpinnerSVG: Component = () => {
  const id = createUniqueId();

  return (
    <svg
      aria-hidden="true"
      data-slot="spinner-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <defs>
        <linearGradient id={`spinner-grad1-${id}`} x1="50%" x2="50%" y1="5.271%" y2="91.793%">
          <stop offset="0%" stop-color="currentColor" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.55" />
        </linearGradient>
        <linearGradient id={`spinner-grad2-${id}`} x1="50%" x2="50%" y1="15.24%" y2="87.15%">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <g fill="none">
        <path
          d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021"
          fill={`url(#spinner-grad1-${id})`}
          transform="translate(1.5 1.625)"
        />
        <path
          d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118"
          fill={`url(#spinner-grad2-${id})`}
          transform="translate(1.5 1.625)"
        />
      </g>
    </svg>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Loading Component
 * -----------------------------------------------------------------------------------------------*/
const Loading: Component<LoadingProps> = (props) => {
  const [local, others] = splitProps(props, [
    "size",
    "color",
    "variant",
    "label",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const size = () => local.size ?? "md";
  const color = () => local.color ?? "current";
  const variant = () => local.variant ?? "spinner";

  return (
    <span
      {...others}
      role="status"
      aria-label={local.label ?? "Loading"}
      aria-busy="true"
      aria-live="polite"
      class={twMerge(
        "spinner",
        SIZE_CLASS_MAP[size()],
        COLOR_CLASS_MAP[color()],
        VARIANT_CLASS_MAP[variant()],
        local.class,
        local.className,
      )}
      data-slot="spinner"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {variant() === "spinner" ? <SpinnerSVG /> : undefined}
    </span>
  );
};

export default Loading;
