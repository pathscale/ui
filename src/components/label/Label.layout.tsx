import "./Label.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps, State, Issue } from "../vocabulary";
import { CLASSES } from "./Label.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Label.recipe";
import { resolveState } from "../vocabulary";

export type LabelRootProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "for"> &
  UIBaseProps & {
    for?: string;
    htmlFor?: string;
    required?: boolean;
    state?: State;
    issues?: Issue[];
  };

const LabelRoot: Layout<typeof componentRecipe, LabelRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "for",
    "htmlFor",
    "required",
    "state",
    "issues",
  ]);

  return (
    <label
      {...others}
      for={local.for ?? local.htmlFor}
      class={twMerge(
        CLASSES.base,
        local.required && CLASSES.flag.required,
        (local.state === "disabled") && CLASSES.flag.disabled,
        (resolveState(local.state, local.issues) === "invalid") && CLASSES.flag.invalid,
        local.class,
      )}
      data-slot="label"
      data-required={local.required ? "true" : undefined}
      data-disabled={(local.state === "disabled") ? "true" : undefined}
      data-invalid={(resolveState(local.state, local.issues) === "invalid") ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={(local.state === "disabled") ? "true" : undefined}
      aria-invalid={(resolveState(local.state, local.issues) === "invalid") ? "true" : undefined}
    >
      {local.children}
    </label>
  );
};

const Label = Object.assign(LabelRoot, {
  Root: LabelRoot,
});

export default Label;
export { Label, LabelRoot };
export type { LabelRootProps as LabelProps };
