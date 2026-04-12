import "./Label.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type LabelState = "required" | "disabled" | "invalid";

const LABEL_STATE_CLASS_MAP: Record<LabelState, string> = {
  required: "label--required",
  disabled: "label--disabled",
  invalid: "label--invalid",
};

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
        "label",
        local.isRequired && LABEL_STATE_CLASS_MAP.required,
        local.isDisabled && LABEL_STATE_CLASS_MAP.disabled,
        local.isInvalid && LABEL_STATE_CLASS_MAP.invalid,
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
