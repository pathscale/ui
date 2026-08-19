import "./Label.css";
import type { JSX } from "@solidjs/web";
import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { Issue, State, UIBaseProps } from "../vocabulary";
import { resolveState } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Label.recipe";

export type LabelRootProps = Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "for"
> &
  UIBaseProps & {
    for?: string;
    htmlFor?: string;
    required?: boolean;
    state?: State;
    issues?: Issue[];
  };

const LabelRoot: Layout<typeof componentRecipe, LabelRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "for",
    "htmlFor",
    "required",
    "state",
    "issues",
  );

  return (
    <label
      {...others}
      for={props.for ?? props.htmlFor}
      class={twMerge(
        CLASSES.base,
        props.required && CLASSES.flag.required,
        props.state === "disabled" && CLASSES.flag.disabled,
        resolveState(props.state, props.issues) === "invalid" &&
          CLASSES.flag.invalid,
        props.class,
      )}
      data-slot="label"
      data-required={props.required ? "true" : undefined}
      data-disabled={props.state === "disabled" ? "true" : undefined}
      data-invalid={
        resolveState(props.state, props.issues) === "invalid"
          ? "true"
          : undefined
      }
      data-theme={props.dataTheme}
      style={props.style}
      aria-disabled={props.state === "disabled" ? "true" : undefined}
      aria-invalid={
        resolveState(props.state, props.issues) === "invalid"
          ? "true"
          : undefined
      }
    >
      {props.children}
    </label>
  );
};

const Label = Object.assign(LabelRoot, {
  Root: LabelRoot,
});

export default Label;
export type { LabelRootProps as LabelProps };
export { Label, LabelRoot };
