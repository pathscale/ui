import "./TextArea.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import { useTextFieldContext, type TextFieldVariant } from "../text-field";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./TextArea.classes";

export type TextAreaVariant = TextFieldVariant;

export type TextAreaRootProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> &
  IComponentBaseProps & {
    variant?: TextAreaVariant;
    fullWidth?: boolean;
    isInvalid?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
  };

const TextAreaRoot: Component<TextAreaRootProps> = (props) => {
  const textFieldContext = useTextFieldContext();
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "fullWidth",
    "isInvalid",
    "isDisabled",
    "disabled",
  ]);

  const variant = () => local.variant ?? textFieldContext?.variant() ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth) || Boolean(textFieldContext?.fullWidth());
  const isInvalid = () => Boolean(local.isInvalid);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);

  return (
    <textarea
      {...others}
      class={twMerge(
        CLASSES.base,
        CLASSES.variant[variant()],
        fullWidth() && CLASSES.flag.fullWidth,
        local.class,
        local.className,
      )}
      data-slot="textarea"
      data-invalid={isInvalid() ? "true" : undefined}
      data-disabled={isDisabled() ? "true" : undefined}
      aria-invalid={isInvalid() ? "true" : undefined}
      aria-disabled={isDisabled() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      disabled={isDisabled()}
    />
  );
};

const TextArea = Object.assign(TextAreaRoot, {
  Root: TextAreaRoot,
});

export default TextArea;
export { TextArea, TextAreaRoot };
export type { TextAreaRootProps as TextAreaProps };
