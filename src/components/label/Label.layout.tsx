import "./Label.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Label.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Label.recipe";

export type LabelRootProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "for"> &
  UIBaseProps & {
    for?: string;
    htmlFor?: string;
    isRequired?: boolean;
    state?: State;
    isInvalid?: boolean;
  };

const LabelRoot: Layout<typeof componentRecipe, LabelRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "for",
    "htmlFor",
    "isRequired",
    "state",
    "isInvalid",
  ]);

  return (
    <label
      {...others}
      for={local.for ?? local.htmlFor}
      class={twMerge(
        CLASSES.base,
        local.isRequired && CLASSES.flag.required,
        (local.state === "disabled") && CLASSES.flag.disabled,
        local.isInvalid && CLASSES.flag.invalid,
        local.class,
      )}
      data-slot="label"
      data-required={local.isRequired ? "true" : undefined}
      data-disabled={(local.state === "disabled") ? "true" : undefined}
      data-invalid={local.isInvalid ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={(local.state === "disabled") ? "true" : undefined}
      aria-invalid={local.isInvalid ? "true" : undefined}
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
