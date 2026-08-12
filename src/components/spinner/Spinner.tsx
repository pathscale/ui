import "./Spinner.css";
import type { JSX } from "solid-js";
import { defineComponent } from "solid-layouts";

import type { IComponentBaseProps } from "../types";
import { SpinnerLayout } from "./Spinner.layout";
import { spinner } from "./Spinner.recipe";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerColor =
  | "current"
  | "accent"
  | "success"
  | "warning"
  | "danger";
export type SpinnerVariant =
  | "spinner"
  | "dots"
  | "ring"
  | "ball"
  | "bars"
  | "infinity";

export type SpinnerProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "children"
> &
  IComponentBaseProps & {
    size?: SpinnerSize;
    color?: SpinnerColor;
    variant?: SpinnerVariant;
    /** The accessible name. Defaults to "Loading". */
    label?: string;
  };

/**
 * `label` is behaviour rather than presentation: it names the element for a
 * screen reader and decides nothing about how it looks.
 */
const Spinner = defineComponent({
  recipe: spinner,
  name: "Spinner",
  defaults: { size: "md", color: "current", variant: "spinner" },
  behaviour: ["label"],
  setup: (behaviour) => ({ label: behaviour.label }),
  layout: SpinnerLayout,
}) as unknown as (props: SpinnerProps) => JSX.Element;

export default Spinner;
export { Spinner };
