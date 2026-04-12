import "./Label.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Label.classes";

export type LabelRootProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "for"> &
  IComponentBaseProps & {
    for?: string;
    htmlFor?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    isInvalid?: boolean;
  };

const LabelRoot: Component<LabelRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "for",
    "htmlFor",
    "isRequired",
    "isDisabled",
    "isInvalid",
  ]);

  return (
    <label
      {...others}
      for={local.for ?? local.htmlFor}
      class={twMerge(
        CLASSES.base,
        local.isRequired && CLASSES.flag.required,
        local.isDisabled && CLASSES.flag.disabled,
        local.isInvalid && CLASSES.flag.invalid,
        local.class,
        local.className,
      )}
      data-slot="label"
      data-required={local.isRequired ? "true" : undefined}
      data-disabled={local.isDisabled ? "true" : undefined}
      data-invalid={local.isInvalid ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      aria-disabled={local.isDisabled ? "true" : undefined}
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
