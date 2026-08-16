import "./Spinner.css";
import type { JSX } from "@solidjs/web";
import {createUniqueId, type Component} from "solid-js";
import type { Flavor, Size, UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { spinner } from "./Spinner.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type SpinnerShape = "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";

export type SpinnerProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps & {
    size?: Size;
    /* No `state`. A spinner is always loading; that is what it is for. */
    flavor?: Flavor;
    shape?: SpinnerShape;
    label?: string;
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
 * Spinner Component
 * -----------------------------------------------------------------------------------------------*/
export const SpinnerLayout: Layout<typeof spinner, SpinnerProps> = () => (
  <span
    {...slot.root}
    role="status"
    aria-label={(label as string | undefined) ?? "Loading"}
    aria-busy="true"
    aria-live="polite"
    style={style}
  >
    {shape === "spinner" ? <SpinnerSVG /> : undefined}
  </span>
);
