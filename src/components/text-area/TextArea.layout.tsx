import "./TextArea.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./TextArea.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./TextArea.recipe";

export type TextAreaVariant = "primary" | "secondary";

export type TextAreaRootProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> &
  IComponentBaseProps & {
    variant?: TextAreaVariant;
    fullWidth?: boolean;
    isInvalid?: boolean;
    isDisabled?: boolean;
    disabled?: boolean;
  };

const TextAreaRoot: Layout<typeof componentRecipe, TextAreaRootProps> = () => {
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

  const variant = () => local.variant ?? "primary";
  const fullWidth = () => Boolean(local.fullWidth);
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
